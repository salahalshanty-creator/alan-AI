import { createClient, type SupabaseClient, type Session, type User, type AuthChangeEvent } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create in-memory/localStorage mock when Supabase credentials are not configured
function createMockSupabaseClient() {
  const STORAGE_KEY_SESSION = 'alan_mock_supabase_session';
  const STORAGE_KEY_USERS = 'alan_mock_supabase_users';
  const STORAGE_KEY_PROFILES = 'alan_mock_supabase_profiles';

  const listeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

  const getStoredSession = (): Session | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const setStoredSession = (session: Session | null) => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } catch {
      // ignore storage errors
    }
    const event: AuthChangeEvent = session ? 'SIGNED_IN' : 'SIGNED_OUT';
    listeners.forEach((listener) => listener(event, session));
  };

  const getStoredUsers = (): Record<string, { email: string; password: string; name: string; phone: string; id: string }> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  return {
    auth: {
      async getSession() {
        return { data: { session: getStoredSession() }, error: null };
      },
      onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              },
            },
          },
        };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const users = getStoredUsers();
        const existing = Object.values(users).find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );

        if (!existing) {
          // If no user exists yet, allow sign in and create session for convenience in preview
          const id = 'user_' + Math.random().toString(36).substring(2, 9);
          const user: User = {
            id,
            app_metadata: {},
            user_metadata: { full_name: email.split('@')[0], phone: '' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email,
          };
          const session: Session = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user,
          };
          setStoredSession(session);
          return { data: { user, session }, error: null };
        }

        if (existing.password !== password) {
          return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
        }

        const user: User = {
          id: existing.id,
          app_metadata: {},
          user_metadata: { full_name: existing.name, phone: existing.phone },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: existing.email,
        };
        const session: Session = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user,
        };
        setStoredSession(session);
        return { data: { user, session }, error: null };
      },
      async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string; phone?: string } } }) {
        const users = getStoredUsers();
        const fullName = options?.data?.full_name || email.split('@')[0];
        const phone = options?.data?.phone || '';
        const id = 'user_' + Math.random().toString(36).substring(2, 9);

        users[id] = { id, email, password, name: fullName, phone };
        try {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        } catch {
          // ignore
        }

        const user: User = {
          id,
          app_metadata: {},
          user_metadata: { full_name: fullName, phone },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email,
        };
        const session: Session = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user,
        };
        setStoredSession(session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        setStoredSession(null);
        return { error: null };
      },
    },
    from(table: string) {
      return {
        async upsert(record: Record<string, unknown>) {
          try {
            const raw = localStorage.getItem(`${STORAGE_KEY_PROFILES}_${table}`);
            const data = raw ? JSON.parse(raw) : [];
            data.push(record);
            localStorage.setItem(`${STORAGE_KEY_PROFILES}_${table}`, JSON.stringify(data));
          } catch {
            // ignore
          }
          return { data: record, error: null };
        },
        async select() {
          try {
            const raw = localStorage.getItem(`${STORAGE_KEY_PROFILES}_${table}`);
            return { data: raw ? JSON.parse(raw) : [], error: null };
          } catch {
            return { data: [], error: null };
          }
        },
        async insert(record: Record<string, unknown>) {
          return { data: record, error: null };
        },
      };
    },
  };
}

export const supabase: SupabaseClient = (supabaseUrl && supabasePublishableKey)
  ? createClient(supabaseUrl, supabasePublishableKey)
  : (createMockSupabaseClient() as unknown as SupabaseClient);
