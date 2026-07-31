'use client';

import { LogOut } from 'lucide-react';
import { logout as serverLogout } from '@/app/actions/auth';
import { useClerk } from '@clerk/nextjs';
import { useState } from 'react';

export default function LogoutButton() {
  const { signOut } = useClerk();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      // 1. Clear any client-side storage (localStorage, sessionStorage)
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // 2. Clear server-side legacy session cookies
      await serverLogout();

      // 3. Sign out of Clerk completely and redirect to homepage
      await signOut({ redirectUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
    >
      <LogOut className="w-5 h-5" />
      <span>{isPending ? 'Logging out...' : 'Log Out'}</span>
    </button>
  );
}

