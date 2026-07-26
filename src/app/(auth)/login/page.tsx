'use client';

import { useState, useTransition, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertTriangle } from 'lucide-react';
import { login, loginDevTestUser } from '@/app/actions/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
              href="#"
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

      <div className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link 
          href="/register" 
          className="text-brand-indigo hover:text-brand-cyan font-bold transition-colors underline decoration-2 underline-offset-4 hover:no-underline"
        >
          Create Account
        </Link>
      </div>
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
