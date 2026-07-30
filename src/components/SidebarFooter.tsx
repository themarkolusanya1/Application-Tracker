'use client';

import { User as UserIcon } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface SidebarFooterProps {
  userName: string;
  userEmail: string;
  profilePicture?: string | null;
}

export default function SidebarFooter({ userName, userEmail, profilePicture }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
      <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl bg-slate-100 border border-slate-200/60">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-indigo/35 flex items-center justify-center bg-brand-indigo/25 flex-shrink-0">
          {profilePicture ? (
            <img src={profilePicture} className="w-full h-full object-cover" alt={userName} />
          ) : (
            <UserIcon className="w-5 h-5 text-brand-indigo" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate leading-none">{userName}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
}
