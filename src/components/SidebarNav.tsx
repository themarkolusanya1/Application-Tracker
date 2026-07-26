'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Briefcase, GraduationCap, 
  FileText, Calendar, Settings 
} from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'text-brand-indigo',
    },
    {
      label: 'Jobs & Internships',
      href: '/jobs',
      icon: Briefcase,
      color: 'text-brand-cyan',
    },
    {
      label: 'University Applications',
      href: '/university',
      icon: GraduationCap,
      color: 'text-brand-amber',
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: FileText,
      color: 'text-brand-indigo',
    },
    {
      label: 'Calendar & Deadlines',
      href: '/calendar',
      icon: Calendar,
      color: 'text-brand-rose',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      color: 'text-gray-400',
    },
  ];

  return (
    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 group border cursor-pointer hover:translate-x-1 ${
              isActive 
                ? 'bg-brand-indigo border-brand-indigo/20 text-white shadow-lg shadow-brand-indigo/20' 
                : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-brand-indigo'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
              isActive ? 'text-white' : item.color
            }`} />
            <span className="font-sans">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
