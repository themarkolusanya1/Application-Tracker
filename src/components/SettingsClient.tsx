'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, User, Shield, HelpCircle, 
  RotateCcw, Sparkles, CheckCircle2, Bell, Mail
} from 'lucide-react';
import { updateUserProfile } from '@/app/actions/auth';
import { sendSimulatedNotification } from '@/app/actions/applications';

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  initialApplications: any[];
}

export default function SettingsClient({ user, initialApplications }: SettingsClientProps) {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(user.name);
  const [profileRole, setProfileRole] = useState(user.role);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState('');
  const [apiKeySuccess, setApiKeySuccess] = useState(false);

  // Preference Settings States
  const [monthlyNotif, setMonthlyNotif] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [notifTriggerMsg, setNotifTriggerMsg] = useState<string | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState(5);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('applyhub_api_key') || '');
      setMonthlyNotif(localStorage.getItem('applyhub_monthly_notif') !== 'false');
      setDailyReminder(localStorage.getItem('applyhub_daily_reminder') !== 'false');
      const savedGoal = localStorage.getItem('applyhub_monthly_goal');
      if (savedGoal) {
        setMonthlyGoal(parseInt(savedGoal, 10));
      }
    }
  }, []);

  const handleToggleMonthlyNotif = (val: boolean) => {
    setMonthlyNotif(val);
    localStorage.setItem('applyhub_monthly_notif', String(val));
  };

  const handleGoalChange = (val: number) => {
    setMonthlyGoal(val);
    localStorage.setItem('applyhub_monthly_goal', String(val));
  };

  const handleToggleDailyReminder = (val: boolean) => {
    setDailyReminder(val);
    localStorage.setItem('applyhub_daily_reminder', String(val));
  };

  const getMonthlyReport = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyApps = initialApplications.filter(a => {
      const d = new Date(a.appliedDate || a.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const jobCount = monthlyApps.filter(a => a.applicationType === 'job' || a.applicationType === 'internship').length;
    const universityCount = monthlyApps.filter(a => a.applicationType === 'scholarship').length;
    
    const monthlyInterviews = monthlyApps.filter(a => a.status === 'INTERVIEWING' || a.status === 'Interview').length;
    const monthlyOffers = monthlyApps.filter(a => a.status === 'OFFERED' || a.status === 'Admitted').length;

    return {
      total: monthlyApps.length,
      jobs: jobCount,
      universities: universityCount,
      interviews: monthlyInterviews,
      offers: monthlyOffers,
      monthName: now.toLocaleString('default', { month: 'long' })
    };
  };

  const handleTriggerMonthlyReport = () => {
    const report = getMonthlyReport();
    const message = `📊 Progress Report for ${report.monthName}: You logged ${report.total} new applications (${report.jobs} Job/Internship tracks and ${report.universities} University tracks) toward your monthly target of ${monthlyGoal} applications. Milestones: ${report.interviews} interviews and ${report.offers} offers secured. Keep up the great work!`;
    
    startUpdateTransition(async () => {
      const res = await sendSimulatedNotification(message);
      if (res.success) {
        setNotifTriggerMsg('Monthly progress report generated & logged in your notification inbox!');
        setTimeout(() => setNotifTriggerMsg(null), 4000);
      }
    });
  };

  const handleTriggerDailyMotivation = () => {
    const quotes = [
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "Opportunity does not waste time with those who are unprepared. - K.S. Lew",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Your limitation—it's only your imagination. Keep submitting those applications!",
      "Great things take time. Every application is one step closer to your dream program or career.",
      "Push yourself, because no one else is going to do it for you. Log a new tracker card today!"
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const message = `✉️ [Daily Email Reminder] Motivation: "${quote}" Keep applying and updating your checklist items!`;
    
    startUpdateTransition(async () => {
      const res = await sendSimulatedNotification(message);
      if (res.success) {
        setNotifTriggerMsg('Daily motivational reminder email triggered & logged in your inbox notifications!');
        setTimeout(() => setNotifTriggerMsg(null), 4000);
      }
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    startUpdateTransition(async () => {
      const res = await updateUserProfile(profileName, profileRole);
      if (res.success) {
        setProfileSuccessMsg('Profile updated successfully!');
        router.refresh();
        setTimeout(() => setProfileSuccessMsg(null), 3000);
      } else {
        setProfileErrorMsg(res.error || 'Failed to update profile.');
      }
    });
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('applyhub_api_key', apiKey);
    setApiKeySuccess(true);
    setTimeout(() => setApiKeySuccess(false), 2500);
  };

  const handleReplayTour = () => {
    localStorage.removeItem('apptracker_onboarding_completed');
    setSuccessMsg('Onboarding tour reset! Redirecting to Dashboard to start the tour...');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h3 className="text-xl font-display font-extrabold text-slate-850 tracking-tight">Account Settings</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your user profile settings, toggle light/dark theme, and adjust tour guides.
        </p>
      </div>

      <div className="space-y-6">
        {/* Monthly Progress Report Card */}
        {(() => {
          const report = getMonthlyReport();
          const goalProgress = Math.min(100, Math.round((report.total / monthlyGoal) * 100));
          
          return (
            <section className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-5 text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-indigo animate-pulse" />
                  <span>{report.monthName} Progress Report & Goals</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo uppercase tracking-wider select-none">
                  Monthly Insights
                </span>
              </div>

              {/* Set Target reminder banner */}
              {monthlyGoal === 5 && (
                <div className="p-3 bg-brand-amber/10 border border-brand-amber/20 text-brand-amber text-xs rounded-lg flex items-center gap-2 font-semibold animate-pulse">
                  <span className="text-sm">⚠️</span>
                  <span>Reminder: You are using the default target of 5 applications. Use the input field in the goal section below to set your custom monthly goal!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Logged</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{report.total} Applications</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{report.jobs} Jobs &bull; {report.universities} University</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Active Interviews</p>
                  <p className="text-lg font-black text-brand-amber mt-1">{report.interviews} Scheduled</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Move to Interviewing stage</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Offers Secured</p>
                  <p className="text-lg font-black text-brand-emerald mt-1">{report.offers} Secured</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Keep up the momentum!</p>
                </div>
              </div>

              {/* Progress Goal Slider & Input Target */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-600">
                    <span className="tracking-wide">Monthly Application Target ({goalProgress}%)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="settings-goal">
                      Set Target:
                    </label>
                    <input
                      id="settings-goal"
                      type="number"
                      min={1}
                      max={50}
                      value={monthlyGoal}
                      onChange={(e) => handleGoalChange(parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 text-center font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-350/5">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-indigo to-brand-cyan transition-all duration-500" 
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>Progress: {report.total} logged</span>
                  <span>Target: {monthlyGoal} applications</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-4 flex items-start gap-2">
                <span className="font-bold text-brand-indigo shrink-0">AI Insights:</span>
                <span>
                  You are tracking well for this month. Logged {report.total} applications total. Keep submitting applications and updating checklist files.
                </span>
              </div>
            </section>
          );
        })()}

        {/* Progression & Motivation Email Settings */}
        <section className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-6 text-left">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-indigo animate-bounce" />
              <span>Automated Reminders & Progress Reports</span>
            </h4>
          </div>

          {notifTriggerMsg && (
            <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs rounded-lg animate-fade-in flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-brand-emerald" />
              <span>{notifTriggerMsg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Toggle 1: Monthly Reports */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Monthly Progress Notification</p>
                <p className="text-xs text-slate-500 leading-normal">
                  Receive a summary of applications logged, active interviews, and progress stats in your notification inbox at the end of every calendar month.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={monthlyNotif}
                  onChange={(e) => handleToggleMonthlyNotif(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo" />
              </label>
            </div>

            {/* Toggle 2: Daily Reminders */}
            <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-5">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Daily Motivational Email Reminders</p>
                <p className="text-xs text-slate-500 leading-normal">
                  Get a daily email with professional advice, quote, and reminder to log new applications and follow up on interviews.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={dailyReminder}
                  onChange={(e) => handleToggleDailyReminder(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo" />
              </label>
            </div>

            {/* Simulation triggers for dev verification */}
            <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleTriggerMonthlyReport}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg border border-slate-250 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Simulate Monthly Progress Report</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerDailyMotivation}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg border border-slate-250 transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Simulate Daily Motivation Email</span>
              </button>
            </div>
          </div>
        </section>

        {/* Profile Card */}
        <section className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-6">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-indigo" />
            <span>Profile Account Details</span>
          </h4>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-100/50 border border-slate-200/85 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-indigo/15 border border-brand-indigo/35 flex items-center justify-center font-bold text-lg text-brand-indigo uppercase">
                {profileName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base leading-snug">{profileName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <span className="text-[10px] text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/20 px-2.5 py-1 rounded-full font-bold uppercase select-none tracking-wide">
              {profileRole === 'STUDENT' ? 'Student Role' : 'Professional Role'}
            </span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-slate-200/50">
            {profileSuccessMsg && (
              <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs rounded-lg">
                {profileSuccessMsg}
              </div>
            )}
            {profileErrorMsg && (
              <div className="p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg">
                {profileErrorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600" htmlFor="settings-name">
                  Full Name
                </label>
                <input
                  id="settings-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3 py-2 glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600" htmlFor="settings-role">
                  Profile Role Type
                </label>
                <select
                  id="settings-role"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input text-sm bg-white"
                >
                  <option value="STUDENT">Student (Scholarships & Admissions)</option>
                  <option value="PROFESSIONAL">Professional (Job & Internship Seeker)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-md shadow-brand-indigo/15 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUpdating ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </section>



        {/* API Settings */}
        <section className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-cyan" />
            <span>AI Provider Configuration</span>
          </h4>

          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">Gemini API Key</p>
              <p className="text-xs text-slate-500">Provide your Google AI Studio developer key to power actual ATS reviews and mock interviews. Saved locally in your browser.</p>
            </div>

            {apiKeySuccess && (
              <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs rounded-lg animate-fade-in">
                Gemini Developer Key saved successfully!
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2.5 glass-input text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow cursor-pointer transition-colors shrink-0 font-sans"
              >
                Save Key
              </button>
            </div>
          </form>
        </section>

        {/* Guided Tour Reset Section */}
        <section className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-cyan" />
            <span>Interactive Onboarding Guide</span>
          </h4>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Reset the first-time walkthrough tour to review how ApplyHub works. Replaying the guide will step you through the primary views, documents, and application forms.
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
        <section className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-rose" />
            <span>App Status</span>
          </h4>

          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>Version</span>
            <span className="font-semibold text-slate-800">v1.2.0 (Student Release)</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-600 border-t border-slate-200 pt-3">
            <span>Environment</span>
            <span className="font-semibold text-brand-emerald">Local Development Mode</span>
          </div>
        </section>
      </div>
    </div>
  );
}
