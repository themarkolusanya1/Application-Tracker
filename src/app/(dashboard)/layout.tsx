import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import NotificationPopover from '@/components/NotificationPopover';
import { Briefcase, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import SidebarNav from '@/components/SidebarNav';
import SidebarFooter from '@/components/SidebarFooter';

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
      <aside className="hidden md:flex md:flex-col md:w-72 glass-panel border-r border-slate-200/80 flex-shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-200/80 bg-slate-50/50">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-brand-indigo/15 border border-slate-200/50 bg-white p-0.5">
            <img src="/images/applyhub_logo.png" alt="ApplyHub logo" className="w-full h-full object-cover select-none" />
          </div>
          <div>
            <h1 className="font-display font-black text-brand-indigo text-lg tracking-tight">MyTraks</h1>
          </div>
        </div>

        {/* Sidebar Nav */}
        <SidebarNav />

        {/* User profile & Logout footer (Client Toggled Theme) */}
        <SidebarFooter userName={session.name} userEmail={session.email} />
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center px-6 h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md z-10 flex-shrink-0">
          {/* Section title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle placeholder/brand icon */}
            <div className="md:hidden w-8 h-8 rounded-lg overflow-hidden shadow border border-slate-200/50 bg-white p-0.5">
              <img src="/images/applyhub_logo.png" alt="ApplyHub logo" className="w-full h-full object-cover select-none" />
            </div>
            <h2 className="text-lg font-display font-bold text-slate-800 tracking-wide">MyTraks</h2>
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
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}
