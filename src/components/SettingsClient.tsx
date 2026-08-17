'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, User, Shield, HelpCircle, 
  RotateCcw, Sparkles, CheckCircle2, Bell, Mail, Search,
  Sliders, Cpu, Monitor, Eye, Key, Check, Info
} from 'lucide-react';
import { updateUserProfile, getNotificationPreferences, updateNotificationPreferences } from '@/app/actions/auth';
import { sendSimulatedNotification, generateDailyNotificationSummary } from '@/app/actions/applications';
import { toast } from 'sonner';

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    role: string;
    profilePicture?: string | null;
  };
  initialApplications: any[];
}

export default function SettingsClient({ user, initialApplications }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'ai' | 'notifications' | 'onboarding'>('profile');
  const [searchQuery, setSearchQuery] = useState('');

  // User Profile States
  const [profileName, setProfileName] = useState(user.name);
  const [profileRole, setProfileRole] = useState(user.role);
  const [profilePic, setProfilePic] = useState<string | null>(user.profilePicture || null);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [apiKey, setApiKey] = useState('');

  // Preference Settings States
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(true);
  const [deadlineReminder, setDeadlineReminder] = useState(true);
  const [monthlyNotif, setMonthlyNotif] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(true);
  const [monthlyGoal, setMonthlyGoal] = useState(5);

  // Reminder schedule customisation
  const ALL_REMINDER_DAYS = [30, 15, 10, 5, 4, 3, 2, 1] as const;
  const [selectedReminderDays, setSelectedReminderDays] = useState<Set<number>>(new Set([5, 4, 3, 2, 1]));
  const [reminderLocalTime, setReminderLocalTime] = useState('08:00'); // HH:MM in user's local time
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [, startScheduleTransition] = useTransition();

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
      setDeadlineReminder(localStorage.getItem('applyhub_deadline_reminder') !== 'false');
      setEmailNotifsEnabled(localStorage.getItem('applyhub_email_notifs_enabled') !== 'false');
      setShowOnboardingGuide(localStorage.getItem('apptracker_show_onboarding_guide') !== 'false');
      const savedGoal = localStorage.getItem('applyhub_monthly_goal');
      if (savedGoal) {
        setMonthlyGoal(parseInt(savedGoal, 10));
      }
    }

    // Fetch synced preferences from DB
    getNotificationPreferences().then(res => {
      if (res.success && res.data) {
        setEmailNotifsEnabled(res.data.emailNotificationsEnabled ?? true);
        setDeadlineReminder(res.data.deadlineRemindersEnabled ?? true);
        setDailyReminder(res.data.dailyMotivationEnabled ?? true);
        setMonthlyNotif(res.data.monthlyReportEnabled ?? true);

        // Load reminder schedule
        if (res.data.reminderDays) {
          const days = res.data.reminderDays
            .split(',')
            .map((d: string) => parseInt(d.trim(), 10))
            .filter((d: number) => !isNaN(d));
          setSelectedReminderDays(new Set(days));
        }
        if (res.data.reminderTime) {
          // reminderTime is stored in UTC — convert to user's local time for display
          try {
            const [hStr, mStr] = res.data.reminderTime.split(':');
            const utcDate = new Date();
            utcDate.setUTCHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
            const localH = utcDate.getHours().toString().padStart(2, '0');
            const localM = utcDate.getMinutes().toString().padStart(2, '0');
            setReminderLocalTime(`${localH}:${localM}`);
          } catch {
            setReminderLocalTime(res.data.reminderTime);
          }
        }
      }
    });
  }, []);

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

  const handleToggleEmailNotifsEnabled = (val: boolean) => {
    setEmailNotifsEnabled(val);
    localStorage.setItem('applyhub_email_notifs_enabled', String(val));
    updateNotificationPreferences({ emailNotificationsEnabled: val });
    toast.success(`Email notifications ${val ? 'enabled' : 'disabled'}.`);
  };

  const handleToggleDeadlineReminder = (val: boolean) => {
    setDeadlineReminder(val);
    localStorage.setItem('applyhub_deadline_reminder', String(val));
    updateNotificationPreferences({ deadlineRemindersEnabled: val });
    toast.success(`Deadline reminders (5, 4, 3, 2, 1 days out) ${val ? 'enabled' : 'disabled'}.`);
  };

  const handleToggleMonthlyNotif = (val: boolean) => {
    setMonthlyNotif(val);
    localStorage.setItem('applyhub_monthly_notif', String(val));
    updateNotificationPreferences({ monthlyReportEnabled: val });
    toast.success(`Monthly progress report ${val ? 'enabled' : 'disabled'}.`);
  };

  const handleToggleDailyReminder = (val: boolean) => {
    setDailyReminder(val);
    localStorage.setItem('applyhub_daily_reminder', String(val));
    updateNotificationPreferences({ dailyMotivationEnabled: val });
    toast.success(`Daily motivation emails ${val ? 'enabled' : 'disabled'}.`);
  };

  const handleToggleOnboardingGuide = (val: boolean) => {
    setShowOnboardingGuide(val);
    localStorage.setItem('apptracker_show_onboarding_guide', String(val));
    toast.success(`Onboarding tour guide ${val ? 'enabled' : 'disabled'}.`);
  };

  /**
   * Convert user's locally-chosen time to UTC HH:MM for storage.
   * Detects the browser's IANA timezone automatically.
   */
  const handleSaveReminderSchedule = () => {
    setIsSavingSchedule(true);
    startScheduleTransition(async () => {
      try {
        // Auto-detect browser timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

        // Convert local HH:MM → UTC HH:MM
        let utcTime = reminderLocalTime;
        try {
          const [hStr, mStr] = reminderLocalTime.split(':');
          const now = new Date();
          now.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
          const utcH = now.getUTCHours().toString().padStart(2, '0');
          const utcM = now.getUTCMinutes().toString().padStart(2, '0');
          utcTime = `${utcH}:${utcM}`;
        } catch { /* keep local time as fallback */ }

        const reminderDaysStr = Array.from(selectedReminderDays).sort((a, b) => b - a).join(',');

        const res = await updateNotificationPreferences({
          reminderDays: reminderDaysStr,
          reminderTime: utcTime,
          userTimezone: timezone,
        });

        if (res.success) {
          const daysList = Array.from(selectedReminderDays).sort((a, b) => b - a).join(', ');
          toast.success(`Reminder schedule saved! You'll be reminded at ${reminderLocalTime} on days: ${daysList || 'none'}.`);
        } else {
          toast.error(res.error || 'Failed to save reminder schedule.');
        }
      } finally {
        setIsSavingSchedule(false);
      }
    });
  };

  const getMonthlyReport = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isSubmitted = (a: any) => {
      if (a.applicationType === 'scholarship') {
        return a.status !== 'Researching' && a.status !== 'Documents in Progress';
      }
      return a.status !== 'WISH_LIST';
    };
    
    const monthlySubmittedApps = initialApplications.filter(a => {
      if (!isSubmitted(a)) return false;
      const d = new Date(a.appliedDate || a.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const jobCount = initialApplications.filter(a => (a.applicationType === 'job' || a.applicationType === 'internship' || a.applicationType === 'fellowship') && isSubmitted(a)).length;
    const universityCount = initialApplications.filter(a => a.applicationType === 'scholarship' && isSubmitted(a)).length;
    
    const monthlyInterviews = initialApplications.filter(a => a.status === 'INTERVIEWING' || a.status === 'Interview').length;
    const monthlyOffers = initialApplications.filter(a => a.status === 'OFFERED' || a.status === 'Admitted').length;

    return {
      total: monthlySubmittedApps.length,
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
      const res = await updateUserProfile(profileName, profileRole, profilePic || undefined);
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

  const report = getMonthlyReport();
  const goalProgress = Math.min(100, Math.round((report.total / monthlyGoal) * 100));

  const navItems = [
    { id: 'profile', label: 'User Profile', icon: User, badge: null },
    { id: 'goals', label: 'Goals & Insights', icon: Sparkles, badge: 'Monthly' },
    { id: 'notifications', label: 'Emails & Notifications', icon: Bell, badge: 'Resend' },
    { id: 'ai', label: 'AI Configuration', icon: Cpu, badge: 'Models' },
    { id: 'onboarding', label: 'Appearance & Tour', icon: Monitor, badge: null },
  ] as const;

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Search Settings Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-md">
        <div>
          <h3 className="text-xl font-display font-extrabold text-slate-850 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-brand-indigo" />
            <span>Settings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your account preferences, notification alerts, target goals, and AI models.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/80 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Sidebar Navigation */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1 glass-panel p-3 rounded-2xl border border-slate-200/80 shadow-md sticky top-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2 select-none">
            Categories
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-brand-indigo/15 text-brand-indigo font-bold border-l-4 border-brand-indigo shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-indigo' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    isActive ? 'bg-brand-indigo text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* SECTION 1: User Profile & Account */}
          {(activeTab === 'profile' || searchQuery.length > 0) && (matchesSearch('profile user name email role picture avatar account') || searchQuery === '') && (
            <section id="profile" className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-5 text-left">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-indigo" />
                  <span>User Profile & Account</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                  Account Details
                </span>
              </div>

              {profileErrorMsg && (
                <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold">
                  {profileErrorMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-indigo bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-bold text-xl">
                      {profilePic ? (
                        <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      Change
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo rounded-md">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="profile-name">
                      Full Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs glass-input font-sans bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="profile-role">
                      Primary Target Track
                    </label>
                    <select
                      id="profile-role"
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs glass-input font-sans bg-white"
                    >
                      <option value="STUDENT">Student / Graduate Candidate</option>
                      <option value="PROFESSIONAL">Job Seeker / Working Professional</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-brand-indigo hover:bg-brand-indigo/90 rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isUpdating ? 'Saving Profile...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* SECTION 2: Goals & Performance */}
          {(activeTab === 'goals' || searchQuery.length > 0) && (matchesSearch('goals performance target monthly log stats report slider') || searchQuery === '') && (
            <section id="goals" className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-5 text-left">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-indigo animate-pulse" />
                  <span>{report.monthName} Target Goals & Performance</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo uppercase tracking-wider">
                  Monthly Metrics
                </span>
              </div>

              {monthlyGoal === 5 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <span className="text-sm">💡</span>
                  <span>Default monthly target is set to 5 applications. Adjust your target goal below!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Logged</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{report.total} Applications</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{report.jobs} Jobs &bull; {report.universities} University</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Active Interviews</p>
                  <p className="text-lg font-black text-amber-600 mt-1">{report.interviews} Scheduled</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Move to Interviewing stage</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Offers Secured</p>
                  <p className="text-lg font-black text-emerald-600 mt-1">{report.offers} Secured</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Keep up the momentum!</p>
                </div>
              </div>

              {/* Target Goal Input & Progress Bar */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-600">
                    <span>Monthly Target Goal ({goalProgress}%)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase" htmlFor="settings-goal">
                      Target Count:
                    </label>
                    <input
                      id="settings-goal"
                      type="number"
                      min={1}
                      max={50}
                      value={monthlyGoal}
                      onChange={(e) => handleGoalChange(parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 text-center font-bold text-slate-800 bg-white border border-slate-250 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/30">
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
            </section>
          )}

          {/* SECTION 3: Automated Emails & Notifications */}
          {(activeTab === 'notifications' || searchQuery.length > 0) && (matchesSearch('notifications emails resend deadline daily motivation monthly report alerts') || searchQuery === '') && (
            <section id="notifications" className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-indigo" />
                  <span>Automated Emails & Notifications (Resend)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-wider">
                  Live System
                </span>
              </div>

              <div className="space-y-5">
                {/* Master Email Toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Email Notifications (Resend Integration)</p>
                    <p className="text-xs text-slate-500 leading-normal">
                      Master switch for all automated email notifications sent to <strong>{user.email}</strong>.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={emailNotifsEnabled}
                      onChange={(e) => handleToggleEmailNotifsEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo" />
                  </label>
                </div>

                {/* Deadline Reminder Schedule */}
                <div className="border-t border-slate-100 pt-5 space-y-5">
                  {/* Toggle row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">
                        Deadline Reminders
                        {selectedReminderDays.size > 0 && (
                          <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-brand-indigo bg-brand-indigo/10 px-2 py-0.5 rounded-full">
                            {Array.from(selectedReminderDays).sort((a, b) => b - a).join(', ')} Days Out
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 leading-normal">
                        Get email alerts before application deadlines close. Pick the days and time that work for you.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={deadlineReminder}
                        onChange={(e) => handleToggleDeadlineReminder(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-indigo" />
                    </label>
                  </div>

                  {/* Customise schedule — only visible when reminders are on */}
                  {deadlineReminder && (
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 space-y-5">

                      {/* Day chips */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Remind me this many days before:</p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_REMINDER_DAYS.map((day) => {
                            const active = selectedReminderDays.has(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  setSelectedReminderDays(prev => {
                                    const next = new Set(prev);
                                    if (next.has(day)) next.delete(day);
                                    else next.add(day);
                                    return next;
                                  });
                                }}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                                  active
                                    ? 'bg-brand-indigo text-white border-brand-indigo shadow-sm shadow-brand-indigo/20'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-brand-indigo/40 hover:text-brand-indigo'
                                }`}
                              >
                                {day === 1 ? '1 Day' : `${day} Days`}
                              </button>
                            );
                          })}
                        </div>
                        {selectedReminderDays.size === 0 && (
                          <p className="text-[11px] text-amber-600 font-semibold">⚠ No days selected — no reminders will be sent even if enabled.</p>
                        )}
                      </div>

                      {/* Time picker */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Daily reminder time</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            (your local time · auto-converted to UTC)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={reminderLocalTime}
                            onChange={(e) => setReminderLocalTime(e.target.value)}
                            className="px-3 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 cursor-pointer"
                          />
                          <span className="text-[11px] text-slate-400">
                            Detected timezone: <span className="font-bold text-slate-600">{typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Save button */}
                      <button
                        type="button"
                        onClick={handleSaveReminderSchedule}
                        disabled={isSavingSchedule}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-indigo hover:bg-brand-indigo/90 rounded-xl shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isSavingSchedule ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Save Schedule
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Monthly Report Toggle */}
                <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Monthly Performance Report Email</p>
                    <p className="text-xs text-slate-500 leading-normal">
                      Receive a monthly progress email at the end of each calendar month summarizing logged applications and goal status.
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

                {/* Daily Motivation Toggle */}
                <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Daily Motivational & Focus Email</p>
                    <p className="text-xs text-slate-500 leading-normal">
                      Receive a morning email with an inspiring quote and active pipeline reminder to keep you motivated.
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

                {/* Dev Simulation Triggers */}
                <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleTriggerMonthlyReport}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-250 transition-all cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Simulate Monthly Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerDailyMotivation}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-250 transition-all cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Simulate Daily Motivation Email</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: AI Models & API Keys */}
          {(activeTab === 'ai' || searchQuery.length > 0) && (matchesSearch('ai models gemini openai groq api key configuration provider') || searchQuery === '') && (
            <section id="ai" className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-5 text-left">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-indigo" />
                  <span>AI Models & API Configuration</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo uppercase tracking-wider">
                  AI Integration
                </span>
              </div>

              <form onSubmit={handleSaveAiConfig} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="ai-provider">
                    Primary AI Model Provider
                  </label>
                  <select
                    id="ai-provider"
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full px-3 py-2 text-xs glass-input font-sans bg-white"
                  >
                    <option value="gemini">Google Gemini AI (Recommended - Free Tier)</option>
                    <option value="groq">Groq (Llama-3 70B - High Speed)</option>
                    <option value="openai">OpenAI (GPT-4o Mini)</option>
                  </select>
                </div>

                {aiProvider === 'gemini' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="gemini-key">
                      Google Gemini API Key (Optional custom key)
                    </label>
                    <input
                      id="gemini-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 text-xs glass-input font-sans bg-white"
                    />
                  </div>
                )}

                {aiProvider === 'groq' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="groq-key">
                      Groq API Key
                    </label>
                    <input
                      id="groq-key"
                      type="password"
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full px-3 py-2 text-xs glass-input font-sans bg-white"
                    />
                  </div>
                )}

                {aiProvider === 'openai' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="openai-key">
                      OpenAI API Key
                    </label>
                    <input
                      id="openai-key"
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 text-xs glass-input font-sans bg-white"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-brand-indigo hover:bg-brand-indigo/90 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Save AI Configuration
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* SECTION 5: Appearance & Tour Options */}
          {(activeTab === 'onboarding' || searchQuery.length > 0) && (matchesSearch('appearance onboarding guide tour reset replay theme') || searchQuery === '') && (
            <section id="onboarding" className="glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-xl space-y-5 text-left">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-brand-indigo" />
                  <span>Appearance & Tour Guide Options</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                  Interface
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Onboarding Interactive Tour</p>
                    <p className="text-xs text-slate-500 leading-normal">
                      Enable or disable the instant popup guide for new users across the dashboard.
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

                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleReplayTour}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-250 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-brand-indigo" />
                    <span>Replay Onboarding Guide Tour</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
