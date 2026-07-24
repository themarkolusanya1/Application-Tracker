'use client';

import { useState, useTransition } from 'react';
import { 
  Briefcase, Search, Filter, Kanban, List, Plus, 
  MapPin, DollarSign, Calendar, ExternalLink, Edit2, Trash2, ArrowUpDown
} from 'lucide-react';
import { deleteApplication } from '@/app/actions/applications';
type ApplicationStatus = 'WISH_LIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
type LocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';
import ApplicationForm from './ApplicationForm';

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

  // Layout / view modes
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [tabFilter, setTabFilter] = useState<'combined' | 'job' | 'scholarship'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Helper date references for upcoming deadlines (next 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  // Dynamic stats calculation depending on current active tab
  const getStats = () => {
    const jobs = initialApplications.filter(a => a.applicationType === 'job');
    const scholarships = initialApplications.filter(a => a.applicationType === 'scholarship');

    const upcomingDeadlines = scholarships.filter(s => {
      if (!s.deadline) return false;
      const d = new Date(s.deadline);
      return d >= now && d <= thirtyDaysFromNow;
    }).length;

    if (tabFilter === 'job') {
      return [
        { label: 'Total Jobs', value: jobs.length, colorClass: 'text-white' },
        { label: 'Interviewing', value: jobs.filter(a => a.status === 'INTERVIEWING').length, colorClass: 'text-brand-amber' },
        { label: 'Offers Received', value: jobs.filter(a => a.status === 'OFFERED').length, colorClass: 'text-brand-emerald' },
        { label: 'Rejections', value: jobs.filter(a => a.status === 'REJECTED').length, colorClass: 'text-brand-rose' }
      ];
    } else if (tabFilter === 'scholarship') {
      return [
        { label: 'Total Scholarships', value: scholarships.length, colorClass: 'text-white' },
        { label: 'Submitted', value: scholarships.filter(a => a.status === 'Submitted').length, colorClass: 'text-brand-indigo' },
        { label: 'Admitted', value: scholarships.filter(a => a.status === 'Admitted').length, colorClass: 'text-brand-emerald' },
        { label: 'Upcoming Deadlines', value: upcomingDeadlines, colorClass: 'text-brand-rose' }
      ];
    } else {
      // Combined Mode
      return [
        { label: 'Total Applications', value: initialApplications.length, colorClass: 'text-white' },
        { label: 'Jobs', value: jobs.length, colorClass: 'text-brand-indigo' },
        { label: 'Scholarships', value: scholarships.length, colorClass: 'text-brand-cyan' },
        { label: 'Upcoming Deadlines', value: upcomingDeadlines, colorClass: 'text-brand-rose' }
      ];
    }
  };

  // Filter application list based on active tab and query filters
  const filteredApplications = initialApplications.filter((app) => {
    // 1. Filter by application type tab
    if (tabFilter !== 'combined' && app.applicationType !== tabFilter) {
      return false;
    }

    // 2. Filter by search query
    const matchesSearch = 
      app.organization.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // 3. Filter by status
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    if (!matchesStatus) return false;

    // 4. Filter by location (only applies to jobs, or default pass)
    const matchesLocation = locationFilter === 'ALL' || app.locationType === locationFilter;
    if (!matchesLocation) return false;

    return true;
  });

  // Handler for delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      startTransition(async () => {
        await deleteApplication(id);
      });
    }
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
      return [
        { id: 'WISH_LIST', title: 'Wish List', count: filteredApplications.filter(a => a.status === 'WISH_LIST').length },
        { id: 'APPLIED', title: 'Applied', count: filteredApplications.filter(a => a.status === 'APPLIED').length },
        { id: 'INTERVIEWING', title: 'Interviewing', count: filteredApplications.filter(a => a.status === 'INTERVIEWING').length },
        { id: 'OFFERED', title: 'Offered', count: filteredApplications.filter(a => a.status === 'OFFERED').length },
        { id: 'REJECTED', title: 'Rejected/Withdrawn', count: filteredApplications.filter(a => a.status === 'REJECTED' || a.status === 'WITHDRAWN').length },
      ];
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {getStats().map((stat, idx) => (
          <div key={idx} className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-2xl md:text-3xl font-black ${stat.colorClass} mt-2`}>{stat.value}</span>
          </div>
        ))}
      </section>

      {/* Tabs Navigation */}
      {!hideTabs && (
        <div className="flex border-b border-white/5 space-x-6">
          <button
            onClick={() => { setTabFilter('combined'); setStatusFilter('ALL'); }}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${
              tabFilter === 'combined' ? 'text-white font-extrabold' : 'text-gray-400 hover:text-white'
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
              tabFilter === 'job' ? 'text-white font-extrabold' : 'text-gray-400 hover:text-white'
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
              tabFilter === 'scholarship' ? 'text-white font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Scholarships & Academic Programs
            {tabFilter === 'scholarship' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full animate-pulse" />
            )}
          </button>
        </div>
      )}

      {/* 2. Search & Controls */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/2 backdrop-blur-md p-4 rounded-2xl border border-white/5">
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
              className="w-full sm:w-44 px-3 py-2 glass-input text-sm bg-gray-950/80 pr-8 cursor-pointer appearance-none"
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
                className="w-full sm:w-44 px-3 py-2 glass-input text-sm bg-gray-950/80 pr-8 cursor-pointer appearance-none"
              >
                <option value="ALL">All Locations</option>
                <option value="ON_SITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
              <MapPin className="absolute right-3 top-0 bottom-0 my-auto w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* View toggles & Add action */}
        <div className="flex w-full md:w-auto items-center justify-between sm:justify-end gap-3 flex-shrink-0">
          <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/5">
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
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
          {getBoardColumns().map((col) => {
            const colApps = filteredApplications.filter((app) => {
              if (col.id === 'REJECTED') {
                return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
              }
              if (col.id === 'Rejected') {
                return app.status === 'Rejected' || app.status === 'Withdrawn';
              }
              return app.status === col.id;
            });

            return (
              <div key={col.id} className="flex flex-col max-h-[80vh] bg-white/1 border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h4 className="font-bold text-gray-200 text-sm tracking-wide">{col.title}</h4>
                  <span className="text-xs text-gray-500 font-semibold px-2 py-0.5 rounded-full bg-white/5">
                    {colApps.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colApps.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-600 border border-dashed border-white/5 rounded-xl">
                      Empty column
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="glass-card rounded-xl p-4 space-y-3 text-left relative group border border-white/5"
                      >
                        {tabFilter === 'combined' && (
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            app.applicationType === 'scholarship' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-brand-indigo/20 text-brand-indigo'
                          }`}>
                            {app.applicationType}
                          </span>
                        )}

                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-white text-sm truncate max-w-[140px]" title={app.organization}>
                              {app.organization}
                            </h5>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]" title={app.title}>
                              {app.title}
                            </p>
                          </div>

                          {/* Quick Actions overlay */}
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleEditClick(app)}
                              className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1 rounded text-gray-500 hover:text-brand-rose hover:bg-brand-rose/10 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Middle metadata fields: Conditional based on type */}
                        {app.applicationType === 'scholarship' ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {app.fundingType && (
                                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded ${
                                  app.fundingType === 'fully funded' ? 'bg-brand-emerald/10 text-brand-emerald' :
                                  app.fundingType === 'partial' ? 'bg-brand-indigo/10 text-brand-indigo' : 'bg-white/5 text-gray-400'
                                }`}>
                                  {app.fundingType}
                                </span>
                              )}
                              {app.stipendAmount && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-semibold">
                                  <DollarSign className="w-3 h-3 text-brand-cyan" />
                                  {app.stipendAmount}
                                </span>
                              )}
                            </div>

                            {/* Document checklist icons */}
                            <div className="flex gap-1 items-center bg-white/2 p-1.5 rounded-lg border border-white/5">
                              <span className="text-[9px] font-semibold text-gray-500 mr-1 uppercase">Docs:</span>
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasSop ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="SOP">SOP</span>
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasTranscripts ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Transcripts">TR</span>
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasReferences ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Reference Letters">REF</span>
                              <span className={`px-1 py-0.2 text-[8px] rounded font-bold border ${app.hasTestScores ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Test Scores">TEST</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {getLocationBadge(app.locationType)}
                            {app.salary && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400 font-semibold">
                                <DollarSign className="w-3 h-3 text-brand-cyan" />
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
                            app.applicationType === 'scholarship' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-brand-indigo/20 text-brand-indigo'
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
                            {app.salary ? app.salary : <span className="text-gray-600">—</span>}
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
                            {app.stipendAmount ? app.stipendAmount : <span className="text-gray-600">—</span>}
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
                            <div className="flex gap-1 select-none">
                              <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold border ${app.hasSop ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="SOP">SOP</span>
                              <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold border ${app.hasTranscripts ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Transcripts">TR</span>
                              <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold border ${app.hasReferences ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="References">REF</span>
                              <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold border ${app.hasTestScores ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' : 'bg-white/5 border-white/5 text-gray-500'}`} title="Test Scores">TEST</span>
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
    </div>
  );
}
