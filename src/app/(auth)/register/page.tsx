'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, AlertTriangle } from 'lucide-react';
import { register } from '@/app/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await register(formData);
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(res.error || 'Failed to register.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">Create an account</h2>
        <p className="text-xs text-slate-500 font-medium">Get started by filling out the details below</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <User className="w-4 h-4" />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>

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
              autoComplete="new-password"
              required
              className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600" htmlFor="role">
            Profile Account Type
          </label>
          <select
            id="role"
            name="role"
            required
            className="w-full px-3 py-2.5 glass-input text-sm bg-white"
          >
            <option value="STUDENT">Student</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 font-semibold text-sm text-white transition-all shadow-md shadow-brand-indigo/15 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-indigo hover:text-indigo-600 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
