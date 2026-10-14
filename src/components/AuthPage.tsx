import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authPrintingBackground from '../assets/auth/auth-printing-background.png';
import './AuthPage.css';

type Mode = 'signIn' | 'signUp';
type Errors = Record<string, string>;

export function AuthPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('signIn');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('alan-auth--to-signup');
  const transitionTimers = useRef<number[]>([]);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemo } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => () => transitionTimers.current.forEach(window.clearTimeout), []);

  if (!isOpen) return null;

  const changeMode = (next: Mode) => {
    if (next === mode || isTransitioning) return;
    setIsTransitioning(true);
    setIsEntering(false);
    setTransitionDirection(next === 'signUp' ? 'alan-auth--to-signup' : 'alan-auth--to-signin');
    setErrors({});
    setMessage('');
    transitionTimers.current = [
      window.setTimeout(() => { setMode(next); setIsEntering(true); }, 190),
      window.setTimeout(() => { setIsTransitioning(false); setIsEntering(false); transitionTimers.current = []; }, 780),
    ];
  };

  const errorFor = (name: string) => errors[name] ? 'alan-auth__bad' : '';

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setMessage('');
    try {
      await signInWithGoogle();
      setIsSuccess(true);
      onClose();
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err);
      setIsSuccess(false);
      setMessage(err?.message || 'Could not complete Google Sign-in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemoSignIn = () => {
    signInAsDemo();
    setIsSuccess(true);
    onClose();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const next: Errors = {};
    if (!email) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    if (mode === 'signUp') {
      const fullName = String(data.get('fullName') ?? '').trim();
      const phone = String(data.get('phone') ?? '').trim();
      const confirm = String(data.get('confirmPassword') ?? '');
      if (!fullName) next.fullName = 'Full name is required.';
      if (!phone) next.phone = 'Phone is required.';
      if (password.length < 6) next.password = 'Use at least 6 characters.';
      if (!confirm) next.confirmPassword = 'Please confirm your password.';
      else if (confirm !== password) next.confirmPassword = 'Passwords do not match.';
    }
    setErrors(next); setMessage('');
    if (Object.keys(next).length) return;
    setBusy(true);

    try {
      if (mode === 'signIn') {
        await signInWithEmail(email, password);
        onClose();
        return;
      }
      const fullName = String(data.get('fullName')).trim();
      const phone = String(data.get('phone')).trim();
      await signUpWithEmail(email, password, fullName, phone);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Auth feedback:', err);
      setIsSuccess(false);
      setMessage(err?.message || 'We could not complete that request. Please try Google Sign-In or Demo login.');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className={`alan-auth${mode === 'signUp' ? ' alan-auth--signup' : ''}${isTransitioning ? ` alan-auth--transition ${transitionDirection}${isEntering ? ' alan-auth--entering' : ''}` : ''}`} role="dialog" aria-modal="true" aria-labelledby="alan-auth-title">
      <button className="alan-auth__close" type="button" onClick={onClose} aria-label="Return to website"><X /></button>
      <section className="alan-auth__shell">
        <div className="alan-auth__canvas" aria-hidden="true">
          <img className="alan-auth__background" src={authPrintingBackground} alt="" />
          <div className="alan-auth__overlay" />
          <div className="alan-auth__light" />
          <div className="alan-auth__brand"><strong>ALAN</strong>Advertisement &amp; Printing</div>
          <div className="alan-auth__copy alan-auth__copy--in">
            <p>Make a lasting impression</p>
            <h1 id="alan-auth-title">Welcome<br />back.</h1>
            <span>Secure Firebase Authentication &amp; Cloud Sync</span>
          </div>
          <div className="alan-auth__copy alan-auth__copy--up">
            <p>Bring your ideas to life</p>
            <h1>Join<br />ALAN.</h1>
            <span>Create, print, and keep track of every order in Firestore.</span>
          </div>
        </div>

        <div className="alan-auth__panel">
          <form key={mode} className={`alan-auth__form${isTransitioning ? isEntering ? ' alan-auth__form--entering' : ' alan-auth__form--leaving' : ''}`} onSubmit={submit} noValidate>
            <p className="alan-auth__eyebrow">{mode === 'signIn' ? 'Welcome back' : 'Start something brilliant'}</p>
            <h2>{mode === 'signIn' ? 'Sign in to ALAN' : 'Create your account'}</h2>
            <p className="alan-auth__intro">{mode === 'signIn' ? 'Access your printing projects, saved designs and order history.' : 'Save details and keep every print project close with Firestore.'}</p>

            {/* Google Sign-in Button */}
            <div className="mt-4 mb-3 space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg font-bold text-xs tracking-wide shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{mode === 'signIn' ? 'Continue with Google' : 'Sign up with Google'}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold text-xs tracking-wide transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Demo Client Login (دخول تجريبي فوري)</span>
              </button>

              <div className="flex items-center pt-2">
                <div className="flex-1 border-t border-neutral-300" />
                <span className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">or with email</span>
                <div className="flex-1 border-t border-neutral-300" />
              </div>
            </div>

            {mode === 'signUp' && (
              <>
                <label className="alan-auth__field">
                  <span>Full name</span>
                  <input className={errorFor('fullName')} name="fullName" autoComplete="name" placeholder="e.g. Sultan Al Nuaimi" />
                  {errors.fullName && <p className="alan-auth__error">{errors.fullName}</p>}
                </label>
                <label className="alan-auth__field">
                  <span>Phone</span>
                  <input className={errorFor('phone')} name="phone" type="tel" autoComplete="tel" placeholder="+971 50 123 4567" />
                  {errors.phone && <p className="alan-auth__error">{errors.phone}</p>}
                </label>
              </>
            )}

            <label className="alan-auth__field">
              <span>Email</span>
              <input className={errorFor('email')} name="email" type="email" autoComplete="email" placeholder="name@company.ae" />
              {errors.email && <p className="alan-auth__error">{errors.email}</p>}
            </label>

            <label className="alan-auth__field">
              <span>Password</span>
              <input className={errorFor('password')} name="password" type="password" autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} />
              {errors.password && <p className="alan-auth__error">{errors.password}</p>}
            </label>

            {mode === 'signUp' && (
              <label className="alan-auth__field">
                <span>Confirm password</span>
                <input className={errorFor('confirmPassword')} name="confirmPassword" type="password" autoComplete="new-password" />
                {errors.confirmPassword && <p className="alan-auth__error">{errors.confirmPassword}</p>}
              </label>
            )}

            {message && (
              <p className={`alan-auth__message ${isSuccess ? 'alan-auth__message--success' : 'alan-auth__message--error'}`} role="status">
                {message}
              </p>
            )}

            <button className="alan-auth__submit" disabled={busy}>
              {busy ? 'Connecting...' : mode === 'signIn' ? 'Sign in' : 'Create account'}
            </button>

            <p className="alan-auth__switch">
              {mode === 'signIn' ? 'New to ALAN?' : 'Already have an account?'}
              <button type="button" onClick={() => changeMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
                {mode === 'signIn' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </section>
    </div>,
    document.body
  );
}
