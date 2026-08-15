'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, CheckSquare, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getApplications } from '@/app/actions/applications';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [urgentApps, setUrgentApps] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const res = await getNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }

    const appsRes = await getApplications();
    if (appsRes.success && appsRes.data) {
      const now = new Date();
      const closing = appsRes.data.filter((a: any) => {
        if (!a.deadline) return false;
        const status = a.status || '';
        if (status === 'REJECTED' || status === 'WITHDRAWN' || status === 'Rejected' || status === 'Withdrawn' || status === 'OFFERED' || status === 'Admitted') return false;
        const d = new Date(a.deadline);
        const diffMs = d.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      
      setUrgentApps(closing);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors duration-200 focus:outline-none rounded-lg hover:bg-slate-100 cursor-pointer"
        aria-label="Notifications & Urgent Deadlines"
      >
        <Bell className={`w-6 h-6 ${urgentApps.length > 0 ? 'text-rose-500 animate-bounce' : ''}`} />
        {urgentApps.length > 0 ? (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full border-2 border-white shadow-md animate-pulse">
            {urgentApps.length}
          </span>
        ) : unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-cyan rounded-full glow-cyan animate-pulse" />
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-88 max-h-[520px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col border border-slate-200/80 animate-fade-in text-left">
          <div className="p-4 border-b border-slate-200/85 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Notifications & Alerts</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-brand-indigo hover:text-indigo-600 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[440px]">
            {/* Urgent Closing Soon Section */}
            {urgentApps.length > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border-b border-rose-500/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                    High Priority: Closing Soon
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                    {urgentApps.length} Urgent
                  </span>
                </div>

                <div className="space-y-2">
                  {urgentApps.map((app) => {
                    const daysLeft = Math.ceil((new Date(app.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const daysText = daysLeft <= 0 ? 'Closes Today!' : daysLeft === 1 ? 'Closes Tomorrow!' : `Closes in ${daysLeft}d`;

                    return (
                      <div key={app.id} className="p-3 bg-white rounded-lg border border-rose-200 shadow-sm flex items-center justify-between gap-2.5 hover:border-rose-400 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{app.organization}</p>
                          <p className="text-xs font-extrabold text-slate-800 truncate" title={app.title}>{app.title}</p>
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-rose-500" />
                            Deadline: {new Date(app.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded whitespace-nowrap ${
                            daysLeft <= 1 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                          }`}>
                            ⏱️ {daysText}
                          </span>
                          <a
                            href={app.applicationType === 'scholarship' ? '/university' : '/jobs'}
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] font-bold text-brand-indigo hover:text-brand-cyan flex items-center gap-0.5 transition-colors"
                          >
                            <span>Action</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Notifications */}
            {notifications.length === 0 && urgentApps.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors duration-200 flex gap-3 ${
                      notification.isRead ? 'bg-transparent' : 'bg-brand-indigo/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${
                        notification.isRead ? 'text-slate-400' : 'text-slate-700 font-medium'
                      }`}>
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="self-center p-1 text-slate-400 hover:text-brand-cyan transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
