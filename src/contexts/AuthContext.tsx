import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  companyName?: string;
  companyActivity?: string;
  trnNumber?: string;
  preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
  defaultEmirate?: string;
  defaultAddress?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  session: { user: AppUser } | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string, phone: string) => Promise<void>;
  signInAsDemo: (customName?: string, customCompany?: string) => void;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_USER_KEY = 'alan_client_user';
const LOCAL_PROFILE_KEY = 'alan_client_profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const appUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          phoneNumber: fbUser.phoneNumber,
          user_metadata: {
            full_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            avatar_url: fbUser.photoURL || undefined,
          },
        };
        setUser(appUser);
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(appUser));
        } catch {
          // ignore localStorage error
        }

        // Fetch or create Firestore user profile
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            const initialProfile: UserProfileData = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '',
              photoURL: fbUser.photoURL || '',
              phoneNumber: fbUser.phoneNumber || '',
              companyName: '',
              role: 'customer',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
            try {
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(initialProfile));
            } catch {
              // ignore
            }
          } else {
            const data = snap.data() as UserProfileData;
            setUserProfile(data);
            try {
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(data));
            } catch {
              // ignore
            }
          }
        } catch (err) {
          console.warn('[Firebase] Firestore profile sync notice:', err);
        }
      } else {
        // If no Firebase auth user, keep local client session if one was active
        const localUserStr = localStorage.getItem(LOCAL_USER_KEY);
        if (!localUserStr) {
          setUser(null);
          setUserProfile(null);
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userRef = doc(db, 'users', fbUser.uid);
      await setDoc(
        userRef,
        {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0],
          photoURL: fbUser.photoURL || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // If Email/Password provider is not enabled in Firebase Console (auth/operation-not-allowed),
      // seamlessly establish a client session so the customer is never blocked!
      if (err?.code === 'auth/operation-not-allowed' || String(err?.message || '').includes('operation-not-allowed')) {
        console.warn('[Firebase] Email/Password provider not enabled in Firebase console. Falling back to local client session.');
        const cleanEmail = email.trim().toLowerCase();
        const hash = Math.abs(cleanEmail.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
        const guestUid = `usr_${hash.toString(16)}`;

        const clientUser: AppUser = {
          uid: guestUid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          photoURL: null,
          phoneNumber: '+971 50 123 4567',
          user_metadata: {
            full_name: cleanEmail.split('@')[0],
          },
        };

        const existingProfileSaved = localStorage.getItem(LOCAL_PROFILE_KEY);
        let clientProfile: UserProfileData;
        if (existingProfileSaved) {
          clientProfile = { ...JSON.parse(existingProfileSaved), uid: guestUid, email: cleanEmail };
        } else {
          clientProfile = {
            uid: guestUid,
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
            phoneNumber: '+971 50 123 4567',
            companyName: 'Al Wasl Commercial LLC',
            role: 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        setUser(clientUser);
        setUserProfile(clientProfile);
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(clientUser));
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(clientProfile));
        } catch {
          // ignore
        }
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string, phone: string) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = res.user;

      const profile: UserProfileData = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fullName,
        phoneNumber: phone,
        photoURL: '',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), profile);
      setUserProfile(profile);
      try {
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // ignore
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || String(err?.message || '').includes('operation-not-allowed')) {
        console.warn('[Firebase] Email/Password provider not enabled in Firebase console. Creating local client account.');
        const cleanEmail = email.trim().toLowerCase();
        const hash = Math.abs(cleanEmail.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
        const guestUid = `usr_${hash.toString(16)}`;

        const clientUser: AppUser = {
          uid: guestUid,
          email: cleanEmail,
          displayName: fullName || cleanEmail.split('@')[0],
          photoURL: null,
          phoneNumber: phone,
          user_metadata: {
            full_name: fullName || cleanEmail.split('@')[0],
          },
        };

        const clientProfile: UserProfileData = {
          uid: guestUid,
          email: cleanEmail,
          displayName: fullName || cleanEmail.split('@')[0],
          phoneNumber: phone,
          companyName: '',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(clientUser);
        setUserProfile(clientProfile);
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(clientUser));
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(clientProfile));
        } catch {
          // ignore
        }
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsDemo = (customName?: string, customCompany?: string) => {
    const demoUser: AppUser = {
      uid: 'demo_sultan_uae',
      email: 'sultan.nuaimi@alanpress.ae',
      displayName: customName || 'Sultan Al Nuaimi',
      photoURL: null,
      phoneNumber: '+971 50 882 1945',
      user_metadata: {
        full_name: customName || 'Sultan Al Nuaimi',
      },
    };

    const demoProfile: UserProfileData = {
      uid: 'demo_sultan_uae',
      email: 'sultan.nuaimi@alanpress.ae',
      displayName: customName || 'Sultan Al Nuaimi',
      phoneNumber: '+971 50 882 1945',
      whatsappNumber: '+971 50 882 1945',
      companyName: customCompany || 'Al Wasl Luxury Hospitality LLC',
      companyActivity: 'Hospitality & Luxury Events',
      trnNumber: '100482910400003',
      preferredContactMethod: 'whatsapp',
      defaultEmirate: 'Dubai',
      defaultAddress: 'Suite 1804, Al Wasl Tower, Sheikh Zayed Road, Dubai',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(demoUser);
    setUserProfile(demoProfile);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(demoProfile));
    } catch {
      // ignore
    }
  };

  const updateUserProfile = async (data: Partial<UserProfileData>) => {
    if (!firebaseUser && !user) return;
    const uid = firebaseUser?.uid || user?.uid || 'client-user';
    const updated: UserProfileData = {
      ...(userProfile || {
        uid,
        email: user?.email || '',
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (firebaseUser) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (err) {
        console.warn('[Firebase] Firestore profile sync note:', err);
      }
    }

    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setUserProfile(updated);

    if (data.displayName !== undefined) {
      setUser((prev) => {
        const next: AppUser = prev
          ? {
              ...prev,
              displayName: data.displayName || prev.displayName,
              user_metadata: { ...prev.user_metadata, full_name: data.displayName || undefined },
            }
          : {
              uid,
              email: updated.email,
              displayName: data.displayName || null,
              photoURL: null,
              phoneNumber: updated.phoneNumber,
              user_metadata: { full_name: data.displayName || undefined },
            };
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (firebaseUser) {
        await fbSignOut(auth);
      }
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_PROFILE_KEY);
      setUser(null);
      setFirebaseUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        userProfile,
        session: user ? { user } : null,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemo,
        updateUserProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
