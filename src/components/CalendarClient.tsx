'use client';

import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Briefcase, GraduationCap, 
  MapPin, Clock, ArrowRight, ExternalLink, CheckCircle2
} from 'lucide-react';

interface CalendarClientProps {
  initialApplications: any[];
}

export default function CalendarClient({ initialApplications }: CalendarClientProps) {
  const [filterType, setFilterType] = useState<'all' | 'job' | 'scholarship'>('all');

  // Build events chronological timeline list
  const events: any[] = [];
  const now = new Date();

  initialApplications.forEach(app => {
    // 1. Scholarship deadlines are forward-looking key events
    if (app.applicationType === 'scholarship' && app.deadline) {
      events.push({
        id: `deadline-${app.id}`,
        appId: app.id,
        applicationType: 'scholarship',
        title: `${app.title} Application Deadline`,
        organization: app.organization,
        date: new Date(app.deadline),
        type: 'deadline',
        status: app.status,
        url: app.url,
      });
    }

    // 2. Applied date is a historical milestone
    if (app.appliedDate) {
      events.push({
        id: `applied-${app.id}`,
        appId: app.id,
        applicationType: app.applicationType,
        title: app.applicationType === 'scholarship' ? 'Program Application Started' : `Applied to ${app.title}`,
        organization: app.organization,
        date: new Date(app.appliedDate),
        type: 'applied',
        status: app.status,
        url: app.url,
      });
    }
  });

  // Filter events
  const filteredEvents = events.filter(e => {
    if (filterType !== 'all' && e.applicationType !== filterType) return false;
    return true;
  });

  // Sort events (future events sorted ascending by date, past events sorted descending)
  const sortedEvents = filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Split into upcoming vs past
  const upcomingEvents = sortedEvents.filter(e => e.date >= now);
  const pastEvents = sortedEvents.filter(e => e.date < now).reverse(); // show most recent past first

  const getDaysDiff = (targetDate: Date) => {
    const timeDiff = targetDate.getTime() - Date.now();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header section controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">Timeline & Deadlines</h3>
          <p className="text-sm text-gray-400 mt-1">
            Track all deadlines, milestones, and status histories chronologically.
          </p>
        </div>

        {/* Filter toggles */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType('job')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'job' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Jobs Only
          </button>
          <button
            onClick={() => setFilterType('scholarship')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'scholarship' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Scholarships Only
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-12">
        {/* ==================== UPCOMING EVENTS ==================== */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span>Upcoming Deadlines & Actions ({upcomingEvents.length})</span>
          </h4>

          {upcomingEvents.length === 0 ? (
            <div className="p-8 text-center bg-white/1 border border-dashed border-white/5 rounded-2xl text-sm text-gray-500">
              No upcoming deadlines found. Add scholarship deadlines to populate this list.
            </div>
          ) : (
            <div className="relative border-l border-white/5 ml-4 pl-8 space-y-8 py-2">
              {upcomingEvents.map((event) => {
                const daysLeft = getDaysDiff(event.date);
                const isUrgent = daysLeft <= 7;

                return (
                  <div key={event.id} className="relative group">
                    {/* Circle Node on line */}
                    <span className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 ${
                      event.applicationType === 'scholarship'
                        ? 'bg-brand-cyan text-gray-900'
                        : 'bg-brand-indigo text-white'
                    }`}>
                      {event.applicationType === 'scholarship' ? (
                        <GraduationCap className="w-3.5 h-3.5" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5" />
                      )}
                    </span>

                    {/* Timeline card wrapper */}
                    <div className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                      {isUrgent && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-rose" />
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            event.applicationType === 'scholarship' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-brand-indigo/20 text-brand-indigo'
                          }`}>
                            {event.applicationType}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">{formatEventDate(event.date)}</span>
                        </div>

                        <h5 className="font-bold text-white text-base leading-snug">{event.title}</h5>
                        <p className="text-sm text-gray-400">{event.organization}</p>
                      </div>

                      <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          isUrgent 
                            ? 'bg-brand-rose/10 border-brand-rose/20 text-brand-rose animate-pulse' 
                            : 'bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo'
                        }`}>
                          {daysLeft === 0 ? 'Due Today!' : daysLeft === 1 ? 'Due Tomorrow!' : `Due in ${daysLeft} days`}
                        </span>
                        
                        {event.url && (
                          <a 
                            href={event.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Application Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================== PAST HISTORY ==================== */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            <span>History & Completed Actions ({pastEvents.length})</span>
          </h4>

          {pastEvents.length === 0 ? (
            <div className="p-8 text-center bg-white/1 border border-dashed border-white/5 rounded-2xl text-sm text-gray-500">
              No historical milestones found.
            </div>
          ) : (
            <div className="relative border-l border-white/5 ml-4 pl-8 space-y-8 py-2">
              {pastEvents.map((event) => {
                const daysAgo = Math.abs(getDaysDiff(event.date));

                return (
                  <div key={event.id} className="relative group opacity-85 hover:opacity-100 transition-opacity">
                    {/* Circle Node on line */}
                    <span className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center bg-white/5 text-gray-400 group-hover:scale-110 transition-transform">
                      {event.applicationType === 'scholarship' ? (
                        <GraduationCap className="w-3.5 h-3.5" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5" />
                      )}
                    </span>

                    {/* Timeline card wrapper */}
                    <div className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-white/5 text-gray-500">
                            {event.applicationType}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">{formatEventDate(event.date)}</span>
                        </div>

                        <h5 className="font-bold text-white text-base leading-snug">{event.title}</h5>
                        <p className="text-sm text-gray-400">{event.organization}</p>
                      </div>

                      <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3">
                        <span className="text-xs text-gray-500 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
