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

  const redirectTarget = searchParams.get('from') || '/';



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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">Welcome back</h2>
        <p className="text-xs text-slate-500 font-medium">Enter your credentials to access your dashboard</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 font-semibold text-sm text-white transition-all shadow-md shadow-brand-indigo/15 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-indigo hover:text-indigo-600 font-semibold hover:underline">
          Sign up
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
