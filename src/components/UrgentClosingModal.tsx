'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Calendar, ArrowRight } from 'lucide-react';

interface UrgentClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  urgentClosingApps: any[];
  handleEditClick: (app: any) => void;
}

export default function UrgentClosingModal({
  isOpen,
  onClose,
  urgentClosingApps,
  handleEditClick,
}: UrgentClosingModalProps) {
  const [mounted, setMounted] = useState(false);
  const now = new Date();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div 
        className="relative sm:max-w-xl w-full p-0 overflow-hidden bg-slate-950 border border-rose-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-white z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header with Red Blinking Alert */}
        <div className="p-6 border-b border-rose-500/20 bg-gradient-to-r from-rose-950/80 via-slate-950 to-rose-950/40 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg text-white shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Urgent: High Priority Closing Soon!
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                  {urgentClosingApps.length} Urgent
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                The following application deadlines are closing in the next 7 days. Select an application to work on it immediately!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Closing Applications Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 max-h-[420px] divide-y divide-slate-800/80 pr-3">
          {urgentClosingApps.map((app) => {
            const daysLeft = Math.ceil((new Date(app.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const daysText = daysLeft <= 0 ? 'Closes Today!' : daysLeft === 1 ? 'Closes Tomorrow!' : `Closes in ${daysLeft}d`;

            return (
              <div key={app.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-rose-500/40 transition-colors">
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    {app.organization}
                  </span>
                  <h4 className="text-xs font-black text-white truncate" title={app.title}>
                    {app.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      Deadline: {new Date(app.deadline!).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2.5 shrink-0">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md whitespace-nowrap ${
                    daysLeft <= 1 ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    ⏱️ {daysText}
                  </span>

                  <button
                    onClick={() => {
                      onClose();
                      if (app.url) {
                        window.open(app.url, '_blank', 'noopener,noreferrer');
                      } else {
                        handleEditClick(app);
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer select-none"
                  >
                    <span>I will work on it now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          >
            Remind Me Later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
