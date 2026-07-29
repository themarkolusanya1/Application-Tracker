'use client';

import { useState, useTransition, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Joyride = dynamic<any>(() => import('react-joyride').then((mod: any) => ({ default: mod.Joyride })), { ssr: false });
import { 
  Briefcase, Search, Filter, Kanban, List, Plus, 
  MapPin, DollarSign, Calendar, ExternalLink, Edit2, Trash2, ArrowUpDown, Sparkles
} from 'lucide-react';
import { deleteApplication } from '@/app/actions/applications';
type ApplicationStatus = 'WISH_LIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
type LocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';
import ApplicationForm from './ApplicationForm';
import InterviewCoachModal from './InterviewCoachModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DashboardClientProps {
  initialApplications: any[];
  initialTab?: 'combined' | 'job' | 'scholarship';
  hideTabs?: boolean;
}

export default function DashboardClient({ 
  initialApplications, 
  initialTab = 'combined', 
  hideTabs = false 
}: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  
  // Modals / forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<any | null>(null);
  const [activeInterviewApp, setActiveInterviewApp] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [runTour, setRunTour] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(5);

  useEffect(() => {
    setIsMounted(true);
    const showGuide = localStorage.getItem('apptracker_show_onboarding_guide') !== 'false';
    const tourCompleted = localStorage.getItem('apptracker_onboarding_completed');
    if (showGuide && !tourCompleted) {
      setRunTour(true);
    }
    const savedGoal = localStorage.getItem('applyhub_monthly_goal');
    if (savedGoal) {
      setMonthlyGoal(parseInt(savedGoal, 10));
    }
  }, []);

  const tourSteps: any[] = initialTab === 'combined' ? [
    {
      target: '#tour-analytics',
      content: 'Track your application targets here. You can see your progress toward your monthly goal and stats for interviews, offers, and tracks.',
      disableBeacon: true,
    },
    {
      target: '#tour-top-five',
      content: 'Here are your top 5 applications for the current month. You can quickly add new applications or view details directly from here!',
    }
  ] : [
    {
      target: '#tour-stats',
      content: 'Here is your high-level overview. You can see your total active applications, pending interviews, and successful offers at a glance.',
      disableBeacon: true,
    },
    {
      target: '#tour-filters',
      content: 'Search and filter your applications by keywords, status, location, or degree requirements.',
    },
    {
      target: '#tour-board',
      content: 'Visually organize your progress by managing your application cards directly within board columns.',
    }
  ];

  // Layout / view modes
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [tabFilter, setTabFilter] = useState<'combined' | 'job' | 'scholarship'>(initialTab);
  const [jobSubType, setJobSubType] = useState<'all' | 'job' | 'internship'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [degreeFilter, setDegreeFilter] = useState<string>('ALL');

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'CA$';
      case 'AUD': return 'A$';
      default: return '$';
    }
  };

  const getEmptyStateContent = (colId: string) => {
    switch (colId) {
      case 'WISH_LIST':
        return {
          title: 'Wish List is empty',
          desc: 'Found an exciting role? Save it here to apply later.',
          action: 'Add a position'
        };
      case 'APPLIED':
        return {
          title: 'No applications logged',
          desc: 'Keep track of where you have applied to stay organized.',
          action: 'Log application'
        };
      case 'INTERVIEWING':
        return {
          title: 'No interviews yet',
          desc: 'Step closer to your goal! Preparation is key.',
          action: 'Add interview'
        };
      case 'OFFERED':
        return {
          title: 'No offers yet',
          desc: 'Your hard work will pay off soon. Keep applying!',
          action: 'Log offer'
        };
      case 'REJECTED':
        return {
          title: 'No updates here',
          desc: 'Rejected or withdrawn records will appear here.',
          action: null
        };
      case 'Researching':
        return {
          title: 'Wish List is empty',
          desc: 'Found a research topic or school? Track it here.',
          action: 'Add a university'
        };
      case 'Documents in Progress':
        return {
          title: 'No documents active',
          desc: 'Transcripts, SOPs, and recommendation checklist.',
          action: 'Add checklist'
        };
      case 'Submitted':
        return {
          title: 'Nothing submitted yet',
          desc: 'Submit your application files and track them.',
          action: 'Log submission'
        };
      case 'Interview':
        return {
          title: 'No interviews set',
          desc: 'Academic interviews or supervisor chat followups.',
          action: 'Add interview'
        };
      case 'Admitted':
        return {
          title: 'No admissions yet',
          desc: 'Admissions and funding offers will appear here!',
          action: 'Log admission'
        };
      case 'Rejected':
        return {
          title: 'No closures yet',
          desc: 'Closed or withdrawn university applications.',
          action: null
        };
      default:
        return {
          title: 'No items',
          desc: 'This column is empty.',
          action: null
        };
    }
  };

  // Helper date references for upcoming deadlines (next 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  // Unified stats calculation (Total, Deadlines, Active)
  const getStats = () => {
    const totalApps = initialApplications.length;

    const scholarships = initialApplications.filter(a => a.applicationType === 'scholarship');
    const upcomingDeadlines = scholarships.filter(s => {
      if (!s.deadline) return false;
      const d = new Date(s.deadline);
      return d >= now && d <= thirtyDaysFromNow;
    }).length;

    const activeApps = initialApplications.filter(a => 
      a.status !== 'REJECTED' && 
      a.status !== 'WITHDRAWN' && 
      a.status !== 'Rejected' && 
      a.status !== 'Withdrawn'
    ).length;

    return [
      { label: 'Total Applications', value: totalApps, colorClass: 'text-white' },
      { label: 'Upcoming Deadlines', value: upcomingDeadlines, colorClass: 'text-brand-rose' },
      { label: 'Active Applications', value: activeApps, colorClass: 'text-brand-cyan' }
    ];
  };

  const getMonthlyReport = () => {
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
      monthName: now.toLocaleString('default', { month: 'long' }),
      apps: monthlyApps
    };
  };

  // Filter application list based on active tab and query filters
  const filteredApplications = initialApplications.filter((app) => {
    // 1. Filter by application type tab
    if (tabFilter === 'job') {
      if (jobSubType === 'all') {
        if (app.applicationType !== 'job' && app.applicationType !== 'internship') return false;
      } else {
        if (app.applicationType !== jobSubType) return false;
      }
    } else if (tabFilter === 'scholarship') {
      if (app.applicationType !== 'scholarship') return false;
    }

    // 2. Filter by search query
    const matchesSearch = 
      app.organization.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // 3. Filter by status
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    if (!matchesStatus) return false;

    // 4. Filter by location (only applies to jobs/internships, or default pass)
    const matchesLocation = locationFilter === 'ALL' || app.locationType === locationFilter;
    if (!matchesLocation) return false;

    // 5. Filter by degree level (only applies to university/scholarship)
    if (tabFilter === 'scholarship' && degreeFilter !== 'ALL') {
      if (app.degreeLevel !== degreeFilter) return false;
    }

    return true;
  });

  // Handler for delete
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleEditClick = (app: any) => {
    setEditingApplication(app);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingApplication(null);
    setIsFormOpen(true);
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; glow: string }> = {
      // Jobs
      WISH_LIST: { label: 'Wish List', bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' },
      APPLIED: { label: 'Applied', bg: 'bg-brand-indigo/10', text: 'text-brand-indigo', glow: 'bg-brand-indigo glow-indigo' },
      INTERVIEWING: { label: 'Interviewing', bg: 'bg-brand-amber/10', text: 'text-brand-amber', glow: 'bg-brand-amber glow-amber' },
      OFFERED: { label: 'Offered', bg: 'bg-brand-emerald/10', text: 'text-brand-emerald', glow: 'bg-brand-emerald glow-emerald' },
      REJECTED: { label: 'Rejected', bg: 'bg-brand-rose/10', text: 'text-brand-rose', glow: 'bg-brand-rose glow-rose' },
      WITHDRAWN: { label: 'Withdrawn', bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' },
      
      // Scholarships
      'Researching': { label: 'Researching', bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' },
      'Documents in Progress': { label: 'Docs In Progress', bg: 'bg-brand-amber/10', text: 'text-brand-amber', glow: 'bg-brand-amber glow-amber' },
      'Submitted': { label: 'Submitted', bg: 'bg-brand-indigo/10', text: 'text-brand-indigo', glow: 'bg-brand-indigo glow-indigo' },
      'Interview': { label: 'Interview', bg: 'bg-brand-cyan/10', text: 'text-brand-cyan', glow: 'bg-brand-cyan glow-cyan' },
      'Admitted': { label: 'Admitted', bg: 'bg-brand-emerald/10', text: 'text-brand-emerald', glow: 'bg-brand-emerald glow-emerald' },
      'Rejected': { label: 'Rejected', bg: 'bg-brand-rose/10', text: 'text-brand-rose', glow: 'bg-brand-rose glow-rose' },
      'Withdrawn': { label: 'Withdrawn', bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' },
    };

    const config = configs[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.glow}`} />
        {config.label}
      </span>
    );
  };

  // Helper for location badge styling
  const getLocationBadge = (type: string) => {
    const labels: Record<string, string> = {
      ON_SITE: 'On-Site',
      HYBRID: 'Hybrid',
      REMOTE: 'Remote',
    };
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
        <MapPin className="w-3 h-3 text-brand-cyan" />
        {labels[type] || type}
      </span>
    );
  };

  // Dynamic Kanban board configuration columns
  const getBoardColumns = () => {
    if (tabFilter === 'scholarship') {
      return [
        { id: 'Researching', title: 'Researching', count: filteredApplications.filter(a => a.status === 'Researching').length },
        { id: 'Documents in Progress', title: 'Docs in Progress', count: filteredApplications.filter(a => a.status === 'Documents in Progress').length },
        { id: 'Submitted', title: 'Submitted', count: filteredApplications.filter(a => a.status === 'Submitted').length },
        { id: 'Interview', title: 'Interviewing', count: filteredApplications.filter(a => a.status === 'Interview').length },
        { id: 'Admitted', title: 'Admitted', count: filteredApplications.filter(a => a.status === 'Admitted').length },
        { id: 'Rejected', title: 'Rejected/Withdrawn', count: filteredApplications.filter(a => a.status === 'Rejected' || a.status === 'Withdrawn').length },
      ];
    } else {
      // Job or Combined view
      const getCount = (colId: string) => {
        return filteredApplications.filter(a => {
          if (a.applicationType === 'scholarship' && tabFilter === 'combined') {
            switch (colId) {
              case 'WISH_LIST':
                return a.status === 'Researching' || a.status === 'Documents in Progress';
              case 'APPLIED':
                return a.status === 'Submitted';
              case 'INTERVIEWING':
                return a.status === 'Interview';
              case 'OFFERED':
                return a.status === 'Admitted';
              case 'REJECTED':
                return a.status === 'Rejected' || a.status === 'Withdrawn';
              default:
                return false;
            }
          }
          if (colId === 'REJECTED') {
            return a.status === 'REJECTED' || a.status === 'WITHDRAWN';
          }
          return a.status === colId;
        }).length;
      };

      return [
        { id: 'WISH_LIST', title: 'Wish List', count: getCount('WISH_LIST') },
        { id: 'APPLIED', title: 'Applied', count: getCount('APPLIED') },
        { id: 'INTERVIEWING', title: 'Interviewing', count: getCount('INTERVIEWING') },
        { id: 'OFFERED', title: 'Offered', count: getCount('OFFERED') },
        { id: 'REJECTED', title: 'Rejected/Withdrawn', count: getCount('REJECTED') },
      ];
    }
  };

  const getBannerContent = () => {
    switch (tabFilter) {
      case 'job':
        return {
          badge: "Career Momentum",
          title: "Your dream career is built one application at a time!",
          desc: "Keep refining your CV/Resume, tailor your cover letters, network with professionals, and get ready to land your next big career milestone.",
          imgSrc: "/images/job_banner.png"
        };
      case 'scholarship':
        return {
          badge: "Academic Frontier",
          title: "Unlock your global academic potential!",
          desc: "Research fellowships diligently, prepare your letters of recommendation, refine your statement of purpose, and set yourself up for admission success.",
          imgSrc: "/images/university_banner.png"
        };
      default:
        return {
          badge: "Success Trajectory",
          title: "Track your milestones, celebrate your achievements!",
          desc: "Every single application is a step closer to your dream career or university program. Keep tracking, stay consistent, and prepare to succeed!",
          imgSrc: "/images/success_banner.png"
        };
    }
  };

  const monthlyReport = getMonthlyReport();
  const topFiveApps = [...(monthlyReport.apps || [])]
    .sort((a, b) => {
      const dateA = new Date(a.appliedDate || a.createdAt).getTime();
      const dateB = new Date(b.appliedDate || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);
  const goalProgress = monthlyGoal > 0 ? Math.min(100, Math.round((monthlyReport.total / monthlyGoal) * 100)) : 0;

  if (initialTab === 'combined') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Motivational Success Banner */}
        {(() => {
          const banner = getBannerContent();
          return (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col md:flex-row items-center justify-between p-6 bg-white gap-6">
              <div className="flex-1 space-y-2 text-left">
                <span className="text-[10px] uppercase tracking-widest text-brand-indigo font-black">{banner.badge}</span>
                <h4 className="text-base md:text-lg font-display font-bold text-slate-800 tracking-tight leading-tight">
                  {banner.title}
                </h4>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  {banner.desc}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Monthly Overview & Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics of the Month Card */}
          <div id="tour-analytics" className="lg:col-span-1 glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-md bg-white flex flex-col justify-between text-left animate-fade-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Analytics of {monthlyReport.monthName}
                </h4>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-indigo/10 text-brand-indigo uppercase">
                  Insights
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Target Goal</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">
                      {monthlyReport.total} / {monthlyGoal}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand-indigo">{goalProgress}%</span>
                </div>
                
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-indigo to-brand-cyan transition-all duration-500" 
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                  <p className="text-xl font-bold text-brand-amber mt-1">{monthlyReport.interviews}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Offers</span>
                  <p className="text-xl font-bold text-brand-emerald mt-1">{monthlyReport.offers}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Tracks</span>
                  <p className="text-xl font-bold text-slate-700 mt-1">{monthlyReport.jobs}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Uni Tracks</span>
                  <p className="text-xl font-bold text-slate-700 mt-1">{monthlyReport.universities}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Applications for the Month Card */}
          <div id="tour-top-five" className="lg:col-span-2 glass-panel border border-slate-200/80 rounded-2xl p-6 shadow-md bg-white flex flex-col justify-between text-left animate-fade-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-cyan" />
                  <span>Top 5 Applications for {monthlyReport.monthName}</span>
                </h4>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddClick}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-sm cursor-pointer select-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Application</span>
                  </button>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">Recently Updated</span>
                </div>
              </div>

              {topFiveApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 space-y-2">
                  <p className="text-xs">No applications logged in {monthlyReport.monthName} yet.</p>
                  <button 
                    onClick={handleAddClick}
                    className="text-xs font-semibold text-brand-indigo hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Log your first card →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                  {topFiveApps.map((app) => {
                    return (
                      <div key={app.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 select-none">
                            {app.organization.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{app.title}</p>
                            <p className="text-xs text-slate-500 leading-tight mt-1">{app.organization}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-xs shrink-0">
                            {getStatusBadge(app.status)}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(app.appliedDate || app.createdAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <ApplicationForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          applicationToEdit={editingApplication}
        />

        {activeInterviewApp && (
          <InterviewCoachModal
            application={activeInterviewApp}
            onClose={() => setActiveInterviewApp(null)}
          />
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the application.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (deleteId) {
                  startTransition(async () => {
                    const res = await deleteApplication(deleteId);
                    if (res.success) {
                      toast.success('Application deleted successfully!');
                    } else {
                      toast.error(res.error || 'Failed to delete application.');
                    }
                  });
                  setDeleteId(null);
                }
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isMounted && (
          <Joyride
            steps={tourSteps}
            run={runTour}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            styles={{
              options: {
                primaryColor: '#6366f1',
                textColor: '#1e293b',
                backgroundColor: '#ffffff',
                arrowColor: '#ffffff',
              },
            }}
            callback={(data: any) => {
              const { status } = data;
              if (['finished', 'skipped'].includes(status)) {
                localStorage.setItem('apptracker_onboarding_completed', 'true');
                setRunTour(false);
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Motivational Success Banner */}
      {(() => {
        const banner = getBannerContent();
        return (
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col md:flex-row items-center justify-between p-6 bg-white gap-6">
            <div className="flex-1 space-y-2 text-left">
              <span className="text-[10px] uppercase tracking-widest text-brand-indigo font-black">{banner.badge}</span>
              <h4 className="text-base md:text-lg font-display font-bold text-slate-800 tracking-tight leading-tight">
                {banner.title}
              </h4>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                {banner.desc}
              </p>
            </div>
          </div>
        );
      })()}



      {/* 1. Statistics Cards */}
      <section id="tour-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {getStats().map((stat, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            <span className="text-xl md:text-2xl font-display font-bold text-slate-800 mt-2">{stat.value}</span>
          </div>
        ))}
      </section>

      {/* Tabs Navigation */}
      {!hideTabs && (
        <div id="tour-tabs" className="flex border-b border-slate-200/80 space-x-6">
          <button
            onClick={() => { setTabFilter('combined'); setStatusFilter('ALL'); }}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${
              tabFilter === 'combined' ? 'text-brand-indigo font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Combined View
            {tabFilter === 'combined' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => { setTabFilter('job'); setStatusFilter('ALL'); }}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${
              tabFilter === 'job' ? 'text-brand-indigo font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Jobs & Internships
            {tabFilter === 'job' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => { setTabFilter('scholarship'); setStatusFilter('ALL'); }}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${
              tabFilter === 'scholarship' ? 'text-brand-indigo font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            University Applications
            {tabFilter === 'scholarship' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full animate-pulse" />
            )}
          </button>
        </div>
      )}

      {/* 2. Search & Controls */}
      <section id="tour-filters" className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex flex-1 flex-col sm:flex-row w-full gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3 my-auto w-4.5 h-4.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, role, school, or company..."
              className="w-full pl-10 pr-4 py-2 glass-input text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 glass-input text-sm bg-white/90 pr-8 cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              {tabFilter === 'scholarship' ? (
                <>
                  <option value="Researching">Researching</option>
                  <option value="Documents in Progress">Docs in Progress</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Interview">Interview</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </>
              ) : (
                <>
                  <option value="WISH_LIST">Wish List</option>
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFERED">Offered</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </>
              )}
            </select>
            <Filter className="absolute right-3 top-0 bottom-0 my-auto w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>

          {/* Location Filter (only rendered for Jobs/Combined) */}
          {tabFilter !== 'scholarship' && (
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 glass-input text-sm bg-white/90 pr-8 cursor-pointer appearance-none"
              >
                <option value="ALL">All Locations</option>
                <option value="ON_SITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
              <MapPin className="absolute right-3 top-0 bottom-0 my-auto w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Job/Internship Sub-type filter inside Jobs & Internships view */}
          {tabFilter === 'job' && (
            <div className="relative">
              <select
                value={jobSubType}
                onChange={(e) => setJobSubType(e.target.value as any)}
                className="w-full sm:w-44 px-3 py-2 glass-input text-sm bg-white/90 pr-8 cursor-pointer appearance-none"
              >
                <option value="all">All Positions</option>
                <option value="job">Jobs Only</option>
                <option value="internship">Internships Only</option>
              </select>
              <Filter className="absolute right-3 top-0 bottom-0 my-auto w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Degree Level Filter (only for University Applications or Combined) */}
          {(tabFilter === 'scholarship' || tabFilter === 'combined') && (
            <div className="relative">
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 glass-input text-sm bg-white/90 pr-8 cursor-pointer appearance-none"
              >
                <option value="ALL">All Degrees</option>
                <option value="Bachelors">Bachelor's</option>
                <option value="Masters">Master's</option>
                <option value="PhD">PhD</option>
              </select>
              <Filter className="absolute right-3 top-0 bottom-0 my-auto w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* View toggles & Add action */}
        <div className="flex w-full md:w-auto items-center justify-between sm:justify-end gap-3 flex-shrink-0">
          <div id="tour-view-toggle" className="flex items-center bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddClick}
            id="tour-add-btn"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-md shadow-brand-indigo/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </section>

      {/* 3. Main Views Grid/List */}
      {viewMode === 'board' ? (
        /* ==================== KANBAN BOARD VIEW ==================== */
        <section id="tour-board" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
          {getBoardColumns().map((col) => {
            const colApps = filteredApplications.filter((app) => {
              if (app.applicationType === 'scholarship' && tabFilter === 'combined') {
                switch (col.id) {
                  case 'WISH_LIST':
                    return app.status === 'Researching' || app.status === 'Documents in Progress';
                  case 'APPLIED':
                    return app.status === 'Submitted';
                  case 'INTERVIEWING':
                    return app.status === 'Interview';
                  case 'OFFERED':
                    return app.status === 'Admitted';
                  case 'REJECTED':
                    return app.status === 'Rejected' || app.status === 'Withdrawn';
                  default:
                    return false;
                }
              }
              if (col.id === 'REJECTED') {
                return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
              }
              if (col.id === 'Rejected') {
                return app.status === 'Rejected' || app.status === 'Withdrawn';
              }
              return app.status === col.id;
            });

            return (
              <div key={col.id} className="flex flex-col max-h-[80vh] bg-slate-100/50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h4 className="font-display font-bold text-slate-800 text-sm tracking-wide">{col.title}</h4>
                  <span className="text-xs text-brand-indigo font-bold px-2 py-0.5 rounded-full bg-brand-indigo/10">
                    {colApps.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colApps.length === 0 ? (
                    (() => {
                      const state = getEmptyStateContent(col.id);
                      return (
                        <div className="py-6 px-4 text-center border border-dashed border-white/5 rounded-xl space-y-2 select-none flex flex-col justify-center items-center min-h-[120px]">
                          <p className="font-bold text-gray-400 text-[11px] leading-tight">{state.title}</p>
                          <p className="text-[10px] text-gray-500 max-w-[140px] leading-normal">{state.desc}</p>
                          {state.action && (
                            <button
                              onClick={() => {
                                setEditingApplication(null);
                                setIsFormOpen(true);
                              }}
                              className="text-[10px] font-bold text-brand-cyan hover:underline mt-1 bg-transparent border-0 cursor-pointer"
                            >
                              {state.action} &rarr;
                            </button>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="glass-card rounded-xl p-4 space-y-3 text-left relative group border border-slate-200/80 card-lift"
                      >
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {tabFilter === 'combined' && (
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              app.applicationType === 'scholarship' ? 'bg-brand-cyan/20 text-brand-cyan' :
                              app.applicationType === 'internship' ? 'bg-brand-rose/20 text-brand-rose' :
                              'bg-brand-indigo/20 text-brand-indigo'
                            }`}>
                              {app.applicationType}
                            </span>
                          )}
                          {(app.status === 'REJECTED' || app.status === 'WITHDRAWN' || app.status === 'Rejected' || app.status === 'Withdrawn') && (
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              (app.status === 'REJECTED' || app.status === 'Rejected')
                                ? 'bg-brand-rose/20 text-brand-rose'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {app.status === 'REJECTED' || app.status === 'Rejected' ? 'Rejected' : 'Withdrawn'}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-slate-800 text-sm truncate" title={app.organization}>
                              {app.organization}
                            </h5>
                            <p className="text-xs text-slate-500 truncate" title={app.title}>
                              {app.title}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => handleEditClick(app)}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1 rounded text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Middle metadata fields: Conditional based on type */}
                        {app.applicationType === 'scholarship' ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {app.degreeLevel && (
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-brand-amber/10 border border-brand-amber/20 text-brand-amber">
                                  {app.degreeLevel === 'Bachelors' ? "Bachelor's" : app.degreeLevel === 'Masters' ? "Master's" : "PhD"}
                                </span>
                              )}
                              {app.fundingType && (
                                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded ${
                                  app.fundingType === 'fully funded' ? 'bg-brand-emerald/10 text-brand-emerald' :
                                  app.fundingType === 'partial' ? 'bg-brand-indigo/10 text-brand-indigo' : 'bg-white/5 text-gray-400'
                                }`}>
                                  {app.fundingType}
                                </span>
                              )}
                              {app.stipendAmount && app.stipendAmount !== '0' && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-semibold" title="Stipend / Funding">
                                  <span className="text-brand-cyan font-bold mr-0.5">{getCurrencySymbol(app.currency || 'USD')}</span>
                                  {app.stipendAmount}
                                </span>
                              )}
                            </div>

                            {/* Document checklist icons adjusted by degree level */}
                            <div className="flex flex-wrap gap-1 items-center bg-white/2 p-1.5 rounded-lg border border-white/5">
                              <span className="text-[9px] font-semibold text-gray-500 mr-1 uppercase">Docs:</span>
                              
                              {/* Transcripts (All) */}
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasTranscripts ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Transcripts">TR</span>
                              
                              {/* SOP / Proposal (Master's, PhD) */}
                              {(app.degreeLevel === 'Masters' || app.degreeLevel === 'PhD' || !app.degreeLevel) && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasSop ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title={app.degreeLevel === 'PhD' ? "Research Proposal" : "Statement of Purpose"}>
                                  {app.degreeLevel === 'PhD' ? "PROP" : "SOP"}
                                </span>
                              )}
                              
                              {/* Personal Statement (Bachelor's) */}
                              {app.degreeLevel === 'Bachelors' && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasPersonalStatement ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Personal Statement">PS</span>
                              )}
                              
                              {/* References (All) */}
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasReferences ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="References">REF</span>
                              
                              {/* CV/Resume (Master's, PhD) */}
                              {(app.degreeLevel === 'Masters' || app.degreeLevel === 'PhD') && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasCvResume ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="CV/Resume">CV</span>
                              )}
                              
                              {/* Test Scores (All) */}
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasTestScores ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title={app.degreeLevel === 'Bachelors' ? "SAT/ACT Scores" : "GRE/Test Scores"}>TEST</span>
                              
                              {/* Potential Advisor (PhD only) */}
                              {app.degreeLevel === 'PhD' && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.potentialAdvisor ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title={`Potential Advisor: ${app.potentialAdvisor || 'Pending'}`}>ADV</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {getLocationBadge(app.locationType)}
                            {app.salary && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400 font-semibold" title="Salary / Compensation">
                                <span className="text-brand-cyan font-bold mr-0.5">{getCurrencySymbol(app.currency || 'USD')}</span>
                                {app.salary}
                              </span>
                            )}
                          </div>
                        )}

                        {app.notes && (
                          <p className="text-[11px] text-gray-500 line-clamp-2 bg-gray-950/20 p-2 rounded-lg leading-relaxed">
                            {app.notes}
                          </p>
                        )}

                        {/* Bottom date, deadline, and link */}
                        <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
                          {app.applicationType === 'scholarship' && app.deadline ? (
                            (() => {
                              const d = new Date(app.deadline);
                              const isUrgent = d.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                              return (
                                <span className={`inline-flex items-center gap-1 font-bold ${isUrgent ? 'text-brand-rose' : 'text-gray-400'}`}>
                                  <Calendar className="w-3.5 h-3.5" />
                                  Due {d.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              );
                            })()
                          ) : (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-brand-indigo" />
                              {new Date(app.appliedDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}

                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-cyan hover:underline flex items-center gap-0.5 font-semibold"
                            >
                              <span>Apply Post</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        {(app.status === 'INTERVIEWING' || app.status === 'Interview') && (
                          <button
                            type="button"
                            onClick={() => setActiveInterviewApp(app)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-xl shadow-md shadow-brand-indigo/15 transition-all cursor-pointer mt-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            <span>AI Interview Prep</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        /* ==================== LIST / TABLE VIEW ==================== */
        <section className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-gray-900/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {tabFilter === 'combined' && <th className="px-6 py-4">Type</th>}
                  <th className="px-6 py-4">{tabFilter === 'scholarship' ? 'Institution' : 'Organization'}</th>
                  <th className="px-6 py-4">{tabFilter === 'scholarship' ? 'Program Name' : 'Title / Program'}</th>
                  <th className="px-6 py-4">Status</th>
                  
                  {/* Tab Specific Headers */}
                  {tabFilter === 'job' && (
                    <>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Salary</th>
                    </>
                  )}
                  {tabFilter === 'scholarship' && (
                    <>
                      <th className="px-6 py-4">Funding</th>
                      <th className="px-6 py-4">Stipend</th>
                      <th className="px-6 py-4">Deadline</th>
                      <th className="px-6 py-4">Docs Checklist</th>
                    </>
                  )}
                  {tabFilter === 'combined' && (
                    <>
                      <th className="px-6 py-4">Location / Deadline</th>
                    </>
                  )}

                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={tabFilter === 'combined' ? 7 : tabFilter === 'scholarship' ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                      No applications match the active tab and filters.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/2 transition-colors duration-150">
                      {tabFilter === 'combined' && (
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            app.applicationType === 'scholarship' ? 'bg-brand-cyan/20 text-brand-cyan' :
                            app.applicationType === 'internship' ? 'bg-brand-rose/20 text-brand-rose' :
                            'bg-brand-indigo/20 text-brand-indigo'
                          }`}>
                            {app.applicationType}
                          </span>
                        </td>
                      )}
                      
                      <td className="px-6 py-4 font-bold text-white">{app.organization}</td>
                      <td className="px-6 py-4">{app.title}</td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>

                      {/* Tab Specific Cells */}
                      {tabFilter === 'job' && (
                        <>
                          <td className="px-6 py-4">{getLocationBadge(app.locationType)}</td>
                          <td className="px-6 py-4 font-semibold text-gray-200">
                            {app.salary ? `${getCurrencySymbol(app.currency || 'USD')} ${app.salary}` : <span className="text-gray-600">—</span>}
                          </td>
                        </>
                      )}

                      {tabFilter === 'scholarship' && (
                        <>
                          <td className="px-6 py-4">
                            {app.fundingType ? (
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                app.fundingType === 'fully funded' ? 'bg-brand-emerald/10 text-brand-emerald' :
                                app.fundingType === 'partial' ? 'bg-brand-indigo/10 text-brand-indigo' : 'bg-white/5 text-gray-400'
                              }`}>
                                {app.fundingType}
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-200">
                            {app.stipendAmount && app.stipendAmount !== '0' ? `${getCurrencySymbol(app.currency || 'USD')} ${app.stipendAmount}` : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-300">
                            {app.deadline ? (
                              (() => {
                                const d = new Date(app.deadline);
                                const isUrgent = d.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                                return (
                                  <span className={isUrgent ? 'text-brand-rose font-bold' : ''}>
                                    {d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 items-center select-none">
                              {/* Transcripts */}
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasTranscripts ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Transcripts">TR</span>
                              
                              {/* SOP / Proposal */}
                              {(app.degreeLevel === 'Masters' || app.degreeLevel === 'PhD' || !app.degreeLevel) && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasSop ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title={app.degreeLevel === 'PhD' ? "Research Proposal" : "Statement of Purpose"}>
                                  {app.degreeLevel === 'PhD' ? "PROP" : "SOP"}
                                </span>
                              )}
                              
                              {/* Personal Statement */}
                              {app.degreeLevel === 'Bachelors' && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasPersonalStatement ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Personal Statement">PS</span>
                              )}
                              
                              {/* References */}
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasReferences ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="References">REF</span>
                              
                              {/* CV/Resume */}
                              {(app.degreeLevel === 'Masters' || app.degreeLevel === 'PhD') && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasCvResume ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="CV/Resume">CV</span>
                              )}
                              
                              {/* Test Scores */}
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasTestScores ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title={app.degreeLevel === 'Bachelors' ? "SAT/ACT Scores" : "GRE/Test Scores"}>TEST</span>
                              
                              {/* Advisor */}
                              {app.degreeLevel === 'PhD' && (
                                <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.potentialAdvisor ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title={`Advisor: ${app.potentialAdvisor || 'Pending'}`}>ADV</span>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {tabFilter === 'combined' && (
                        <td className="px-6 py-4 text-xs">
                          {app.applicationType === 'scholarship' ? (
                            app.deadline ? (
                              <span className="text-gray-300 font-medium">
                                Deadline: {new Date(app.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )
                          ) : (
                            getLocationBadge(app.locationType)
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(app.appliedDate).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
                              title="Visit posting"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEditClick(app)}
                            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 text-gray-400 hover:text-brand-rose rounded hover:bg-brand-rose/10 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. Shared Application Form Modal */}
      <ApplicationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        applicationToEdit={editingApplication}
      />

      {activeInterviewApp && (
        <InterviewCoachModal
          application={activeInterviewApp}
          onClose={() => setActiveInterviewApp(null)}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteId) {
                startTransition(async () => {
                  const res = await deleteApplication(deleteId);
                  if (res.success) {
                    toast.success('Application deleted successfully!');
                  } else {
                    toast.error(res.error || 'Failed to delete application.');
                  }
                });
                setDeleteId(null);
              }
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isMounted && (
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          styles={{
            options: {
              primaryColor: '#6366f1',
              textColor: '#1e293b',
              backgroundColor: '#ffffff',
              arrowColor: '#ffffff',
            },
          }}
          callback={(data: any) => {
            const { status } = data;
            if (['finished', 'skipped'].includes(status)) {
              localStorage.setItem('apptracker_onboarding_completed', 'true');
              setRunTour(false);
            }
          }}
        />
      )}
    </div>
  );
}
