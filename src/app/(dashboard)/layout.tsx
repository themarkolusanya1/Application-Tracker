import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import LogoutButton from '@/components/LogoutButton';
import NotificationPopover from '@/components/NotificationPopover';
import { LayoutDashboard, Briefcase, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  // Safeguard: middleware handles this, but server components should also protect
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 glass-panel border-r border-white/5 flex-shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5 bg-gray-900/20">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-indigo/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight">AppTracker</h1>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Enterprise</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <LayoutDashboard className="w-5 h-5 text-brand-indigo" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* User profile & Logout footer */}
        <div className="p-4 border-t border-white/5 bg-gray-900/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5">
            <div className="w-9 h-9 rounded-full bg-brand-indigo/20 border border-brand-indigo/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-brand-indigo" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{session.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center px-6 h-20 border-b border-white/5 bg-gray-900/10 backdrop-blur-md z-10 flex-shrink-0">
          {/* Section title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle placeholder/brand icon */}
            <div className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">Application Hub</h2>
          </div>

          {/* Right section actions */}
          <div className="flex items-center gap-4">
            <NotificationPopover />
            {/* Mobile User Profile indicator */}
            <div className="md:hidden w-8 h-8 rounded-full bg-brand-indigo/20 border border-brand-indigo/30 flex items-center justify-center">
              <UserIcon className="w-4.5 h-4.5 text-brand-indigo" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-gray-900/10 to-background/90">
          {children}
        </main>
      </div>
    </div>
  );
}
