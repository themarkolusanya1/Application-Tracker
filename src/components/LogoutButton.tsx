'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const res = await logout();
      if (res.success) {
        router.push('/login');
        router.refresh();
      } else {
        alert('Failed to log out.');
      }
    });
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
