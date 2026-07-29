'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, User, Shield, HelpCircle, 
  RotateCcw, Sparkles, CheckCircle2, Bell, Mail
} from 'lucide-react';
import { updateUserProfile } from '@/app/actions/auth';
import { sendSimulatedNotification, generateDailyNotificationSummary } from '@/app/actions/applications';
import { toast } from 'sonner';

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
  const [profileName, setProfileName] = useState(user.name);
  const [profileRole, setProfileRole] = useState(user.role);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState('');

  // Preference Settings States
  const [monthlyNotif, setMonthlyNotif] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(true);
  const [monthlyGoal, setMonthlyGoal] = useState(5);

  // AI Configuration States
  const [aiProvider, setAiProvider] = useState('gemini');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('applyhub_api_key') || '');
      setOpenaiApiKey(localStorage.getItem('applyhub_openai_api_key') || '');
      setGroqApiKey(localStorage.getItem('applyhub_groq_api_key') || '');
      setAiProvider(localStorage.getItem('applyhub_ai_provider') || 'gemini');
      setMonthlyNotif(localStorage.getItem('applyhub_monthly_notif') !== 'false');
      setDailyReminder(localStorage.getItem('applyhub_daily_reminder') !== 'false');
      setShowOnboardingGuide(localStorage.getItem('apptracker_show_onboarding_guide') !== 'false');
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

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('applyhub_ai_provider', aiProvider);
    if (aiProvider === 'openai') {
      localStorage.setItem('applyhub_openai_api_key', openaiApiKey);
    } else if (aiProvider === 'groq') {
      localStorage.setItem('applyhub_groq_api_key', groqApiKey);
    } else {
      localStorage.setItem('applyhub_api_key', apiKey);
    }
    toast.success('API Configuration saved successfully!');
  };

  const handleToggleDailyReminder = (val: boolean) => {
    setDailyReminder(val);
    localStorage.setItem('applyhub_daily_reminder', String(val));
  };

  const handleToggleOnboardingGuide = (val: boolean) => {
    setShowOnboardingGuide(val);
    localStorage.setItem('apptracker_show_onboarding_guide', String(val));
    toast.success(`Onboarding tour guide ${val ? 'enabled' : 'disabled'}.`);
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
        toast.success('Monthly progress report generated successfully!');
      }
    });
  };

  const handleTriggerDailyMotivation = () => {
    startUpdateTransition(async () => {
      const res = await generateDailyNotificationSummary();
      if (res.success) {
        toast.success('Daily reminder email & activity summary triggered successfully!');
      } else {
        toast.error(res.error || 'Failed to trigger daily reminder.');
      }
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);

    startUpdateTransition(async () => {
      const res = await updateUserProfile(profileName, profileRole);
      if (res.success) {
        toast.success('Profile updated successfully!');
        router.refresh();
      } else {
        setProfileErrorMsg(res.error || 'Failed to update profile.');
      }
    });
  };

  const handleReplayTour = () => {
    localStorage.removeItem('apptracker_onboarding_completed');
    toast.success('Onboarding tour reset! Redirecting to Dashboard to start the tour...');
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
                  {report.total === 0
                    ? `You haven't logged any applications yet. Set your monthly target and add your first application to start tracking!`
                    : `You are tracking well. Logged ${report.total} applications total this month. Keep submitting applications and updating checklist files.`}
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
                  <option value="STUDENT">Student</option>
                  <option value="PROFESSIONAL">Professional</option>
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

          <form onSubmit={handleSaveAiConfig} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="settings-ai-provider">
                AI Service Provider
              </label>
              <select
                id="settings-ai-provider"
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full px-3 py-2.5 glass-input text-sm bg-white"
              >
                <option value="gemini">Google Gemini AI (default)</option>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
                <option value="groq">Groq AI (Llama 3.3 Superfast)</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">
                {aiProvider === 'openai' ? 'OpenAI API Key' : aiProvider === 'groq' ? 'Groq API Key' : 'Gemini API Key'}
              </p>
              <p className="text-xs text-slate-500">
                {aiProvider === 'openai' 
                  ? 'Provide your OpenAI developer API key to power ATS optimization reviews, mock interviews, and details extraction.'
                  : aiProvider === 'groq'
                    ? 'Provide your Groq developer API key (gsk-...) to power superfast Llama-3 inference matching.'
                    : 'Provide your Google AI Studio developer key to power ATS optimization reviews, mock interviews, and details extraction.'
                } Saved locally in your browser.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={aiProvider === 'openai' ? openaiApiKey : aiProvider === 'groq' ? groqApiKey : apiKey}
                onChange={(e) => {
                  if (aiProvider === 'openai') setOpenaiApiKey(e.target.value);
                  else if (aiProvider === 'groq') setGroqApiKey(e.target.value);
                  else setApiKey(e.target.value);
                }}
                placeholder={aiProvider === 'openai' ? 'sk-proj-...' : aiProvider === 'groq' ? 'gsk-...' : 'AIzaSy...'}
                className="flex-1 px-3 py-2.5 glass-input text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow cursor-pointer transition-colors shrink-0 font-sans"
              >
                Save Config
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

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Show Guided Onboarding Tour</p>
                <p className="text-xs text-slate-500 leading-normal">
                  Automatically show the interactive guided tour when visiting the dashboard for the first time.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showOnboardingGuide}
                  onChange={(e) => handleToggleOnboardingGuide(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo" />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                If you would like to manually trigger and replay the dashboard walkthrough step-by-step, use the button below to clear onboarding progress and start over.
              </p>
              <button
                onClick={handleReplayTour}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-md shadow-brand-indigo/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Guided Tour</span>
              </button>
            </div>
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
