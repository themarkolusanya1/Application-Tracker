'use client';

import { useState, useTransition, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertTriangle, Plus } from 'lucide-react';
import { login, loginDevTestUser, loginWithGoogle } from '@/app/actions/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googlePending, setGooglePending] = useState(false);

  const redirectTarget = searchParams.get('from') || '/dashboard';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await login(formData);
      if (res.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    });
  };

  const handleGoogleLogin = (email: string, name: string) => {
    setGooglePending(true);
    setError(null);
    startTransition(async () => {
      const res = await loginWithGoogle(email, name);
      setGooglePending(false);
      if (res.success) {
        setShowGoogleModal(false);
        router.push(redirectTarget);
        router.refresh();
      } else {
        setError(res.error || 'Failed to authenticate with Google.');
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-slate-500 text-sm font-medium">Securely access your analytics portal</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-2xl animate-fade-in font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-brand-rose" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 ml-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-indigo transition-colors">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo transition-all outline-none text-sm"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="block text-xs font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <Link 
              className="text-xs font-semibold text-brand-indigo hover:text-brand-cyan transition-colors" 
              href="/forgot-password"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-indigo transition-colors">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo transition-all outline-none text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full gradient-button text-white font-bold py-4 px-6 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-indigo/30 transform active:scale-[0.98] transition-all text-sm disabled:opacity-50 cursor-pointer text-center"
        >
          {isPending ? 'Signing in...' : 'Sign In to Dashboard'}
        </button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <button
        type="button"
        onClick={() => setShowGoogleModal(true)}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer text-sm"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        <span>Connect Google Account</span>
      </button>

      <div className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link 
          href="/register" 
          className="text-brand-indigo hover:text-brand-cyan font-bold transition-colors underline decoration-2 underline-offset-4 hover:no-underline"
        >
          Create Account
        </Link>
      </div>

      {showGoogleModal && (
        <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-slate-200">
            <div className="space-y-6 text-left">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Sign in with Google</h3>
                <p className="text-xs text-slate-500">Select an account to automatically sign in or register</p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={googlePending}
                  onClick={() => handleGoogleLogin('alex.student@gmail.com', 'Alex Student')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 text-left transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">Alex Student</p>
                    <p className="text-[11px] text-slate-500">alex.student@gmail.com</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Google Account</span>
                </button>

                <button
                  type="button"
                  disabled={googlePending}
                  onClick={() => handleGoogleLogin('jordan.scholar@gmail.com', 'Jordan Scholar')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 text-left transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">Jordan Scholar</p>
                    <p className="text-[11px] text-slate-500">jordan.scholar@gmail.com</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Google Account</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-slate-450 text-[10px] uppercase font-bold tracking-wider">Use custom mock account</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Google Profile Name</label>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="e.g. Robin Dev"
                    className="block w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Google Account Email</label>
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="e.g. robin.dev@gmail.com"
                    className="block w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 transition-all"
                  />
                </div>

                <button
                  type="button"
                  disabled={googlePending || !customGoogleName || !customGoogleEmail}
                  onClick={() => handleGoogleLogin(customGoogleEmail, customGoogleName)}
                  className="w-full py-3 bg-brand-indigo text-white font-bold rounded-xl text-xs shadow-md shadow-brand-indigo/10 hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40"
                >
                  {googlePending ? 'Connecting...' : 'Authorize Custom Google Account'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-indigo/30 border-t-brand-indigo animate-spin" />
        <span className="text-xs text-gray-500">Loading secure environment...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
