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
      href: '/',
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
      label: 'Scholarships & Programs',
      href: '/scholarships',
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
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group border cursor-pointer ${
              isActive 
                ? 'bg-white/5 border-white/10 text-white shadow-md' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
              isActive ? 'text-brand-indigo font-bold' : item.color
            }`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
