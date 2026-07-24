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
}

export default function DashboardClient({ initialApplications }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  
  // Modals / forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<any | null>(null);

  // Layout / view modes
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Stats calculation
  const totalCount = initialApplications.length;
  const interviewingCount = initialApplications.filter(a => a.status === 'INTERVIEWING').length;
  const offeredCount = initialApplications.filter(a => a.status === 'OFFERED').length;
  const rejectedCount = initialApplications.filter(a => a.status === 'REJECTED').length;

  // Filter application list
  const filteredApplications = initialApplications.filter((app) => {
    const matchesSearch = 
      app.organization.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesLocation = locationFilter === 'ALL' || app.locationType === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
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
  const getStatusBadge = (status: ApplicationStatus) => {
    const configs: Record<ApplicationStatus, { label: string; bg: string; text: string; glow: string }> = {
      WISH_LIST: { label: 'Wish List', bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' },
      APPLIED: { label: 'Applied', bg: 'bg-brand-indigo/10', text: 'text-brand-indigo', glow: 'bg-brand-indigo glow-indigo' },
      INTERVIEWING: { label: 'Interviewing', bg: 'bg-brand-amber/10', text: 'text-brand-amber', glow: 'bg-brand-amber glow-amber' },
      OFFERED: { label: 'Offered', bg: 'bg-brand-emerald/10', text: 'text-brand-emerald', glow: 'bg-brand-emerald glow-emerald' },
      REJECTED: { label: 'Rejected', bg: 'bg-brand-rose/10', text: 'text-brand-rose', glow: 'bg-brand-rose glow-rose' },
      WITHDRAWN: { label: 'Withdrawn', bg: 'bg-gray-500/10', text: 'text-gray-400', glow: 'bg-gray-500 glow-gray' },
    };

    const config = configs[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.glow}`} />
        {config.label}
      </span>
    );
  };

  // Helper for location badge styling
  const getLocationBadge = (type: LocationType) => {
    const labels: Record<LocationType, string> = {
      ON_SITE: 'On-Site',
      HYBRID: 'Hybrid',
      REMOTE: 'Remote',
    };
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
        <MapPin className="w-3 h-3 text-brand-cyan" />
        {labels[type]}
      </span>
    );
  };

  // Kanban board configuration columns
  const boardColumns: { id: ApplicationStatus; title: string; count: number }[] = [
    { id: 'WISH_LIST', title: 'Wish List', count: filteredApplications.filter(a => a.status === 'WISH_LIST').length },
    { id: 'APPLIED', title: 'Applied', count: filteredApplications.filter(a => a.status === 'APPLIED').length },
    { id: 'INTERVIEWING', title: 'Interviewing', count: filteredApplications.filter(a => a.status === 'INTERVIEWING').length },
    { id: 'OFFERED', title: 'Offered', count: filteredApplications.filter(a => a.status === 'OFFERED').length },
    { id: 'REJECTED', title: 'Rejected/Withdrawn', count: filteredApplications.filter(a => a.status === 'REJECTED' || a.status === 'WITHDRAWN').length },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Applications</span>
          <span className="text-2xl md:text-3xl font-black text-white mt-2">{totalCount}</span>
        </div>
        <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Interviewing</span>
          <span className="text-2xl md:text-3xl font-black text-brand-amber mt-2">{interviewingCount}</span>
        </div>
        <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Offers Received</span>
          <span className="text-2xl md:text-3xl font-black text-brand-emerald mt-2">{offeredCount}</span>
        </div>
        <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rejections</span>
          <span className="text-2xl md:text-3xl font-black text-brand-rose mt-2">{rejectedCount}</span>
        </div>
      </section>

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
              placeholder="Search company or role..."
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
              <option value="WISH_LIST">Wish List</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
            <Filter className="absolute right-3 top-0 bottom-0 my-auto w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>

          {/* Location Filter */}
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
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          {boardColumns.map((col) => {
            const colApps = filteredApplications.filter((app) => {
              if (col.id === 'REJECTED') {
                return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-white text-sm truncate max-w-[120px]" title={app.organization}>
                              {app.organization}
                            </h5>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]" title={app.title}>
                              {app.title}
                            </p>
                          </div>

                          {/* Quick Actions overlay */}
                          <div className="flex items-center gap-1opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

                        {/* Middle metadata fields */}
                        <div className="flex flex-wrap gap-2">
                          {getLocationBadge(app.locationType)}
                          {app.salary && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400 font-semibold">
                              <DollarSign className="w-3 h-3 text-brand-cyan" />
                              {app.salary}
                            </span>
                          )}
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-gray-500 line-clamp-2 bg-gray-950/20 p-2 rounded-lg leading-relaxed">
                            {app.notes}
                          </p>
                        )}

                        {/* Bottom date and link */}
                        <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-brand-indigo" />
                            {new Date(app.appliedDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-cyan hover:underline flex items-center gap-0.5"
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
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Title / Program</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No applications match the filters.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/2 transition-colors duration-150">
                      <td className="px-6 py-4 font-bold text-white">{app.organization}</td>
                      <td className="px-6 py-4">{app.title}</td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4">{getLocationBadge(app.locationType)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-200">
                        {app.salary ? app.salary : <span className="text-gray-600">—</span>}
                      </td>
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
