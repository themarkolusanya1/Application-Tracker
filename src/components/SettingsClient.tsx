'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, User, Shield, HelpCircle, 
  RotateCcw, Sparkles, Check, CheckCircle2
} from 'lucide-react';

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReplayTour = () => {
    // Reset walkthrough onboarding tour flag in localStorage
    localStorage.removeItem('apptracker_onboarding_completed');
    
    setSuccessMsg('Onboarding tour reset! Redirecting to Dashboard to start the tour...');
    
    // Redirect to root dashboard where the tour triggers automatically
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h3 className="text-2xl font-black text-white tracking-tight">Account Settings</h3>
        <p className="text-sm text-gray-400 mt-1">
          Manage your student profile settings and adjust tour guides.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <section className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-indigo" />
            <span>Student Profile</span>
          </h4>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-950/20 border border-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-indigo/15 border border-brand-indigo/35 flex items-center justify-center font-bold text-lg text-brand-indigo">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white text-base leading-snug">{user.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <span className="text-[10px] text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/20 px-2 py-0.5 rounded-full font-bold uppercase select-none">
              Student Role
            </span>
          </div>
        </section>

        {/* Guided Tour Reset Section */}
        <section className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-cyan" />
            <span>Interactive Onboarding Guide</span>
          </h4>

          <div className="space-y-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              Reset the first-time walkthrough tour to review how AppTracker works. Replaying the guide will step you through the primary views, documents, and application forms.
            </p>

            {successMsg && (
              <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleReplayTour}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-md shadow-brand-indigo/15 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Guided Tour</span>
            </button>
          </div>
        </section>

        {/* App Version / License */}
        <section className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-rose" />
            <span>App Status</span>
          </h4>

          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Version</span>
            <span className="font-semibold text-gray-200">v1.2.0 (Student Release)</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-400 border-t border-white/5 pt-3">
            <span>Environment</span>
            <span className="font-semibold text-brand-emerald">Local Development Mode</span>
          </div>
        </section>
      </div>
    </div>
  );
}
