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
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

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
    <div className="space-y-8 animate-fade-in text-left">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
        <p className="text-slate-500 text-sm font-medium">Get started by filling out the details below</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-2xl animate-fade-in font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-brand-rose" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 ml-1" htmlFor="name">
            Full Name
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-indigo transition-colors">
              <User className="w-4 h-4" />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="block w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo transition-all outline-none text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>

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
          <label className="block text-xs font-bold text-gray-700 ml-1" htmlFor="password">
            Password
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-indigo transition-colors">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo transition-all outline-none text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 ml-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-indigo transition-colors">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="block w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo transition-all outline-none text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Account Type Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 ml-1" htmlFor="role">
            Profile Account Type
          </label>
          <select
            id="role"
            name="role"
            required
            className="block w-full px-3 py-3 bg-white/60 border border-slate-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo transition-all outline-none text-sm cursor-pointer appearance-none"
          >
            <option value="STUDENT">Student</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full gradient-button text-white font-bold py-4 px-6 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-indigo/30 transform active:scale-[0.98] transition-all text-sm disabled:opacity-50 cursor-pointer text-center"
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link 
          href="/login" 
          className="text-brand-indigo hover:text-brand-cyan font-bold transition-colors underline decoration-2 underline-offset-4 hover:no-underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
