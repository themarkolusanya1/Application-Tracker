'use client';

import { useTransition, useState, useEffect } from 'react';
import { X, Briefcase, DollarSign, Link as LinkIcon, Calendar, FileText, MapPin } from 'lucide-react';
import { createApplication, updateApplication } from '@/app/actions/applications';
type ApplicationStatus = 'WISH_LIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
type LocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  applicationToEdit?: any; // If editing
}

export default function ApplicationForm({ isOpen, onClose, applicationToEdit }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('WISH_LIST');
  const [locationType, setLocationType] = useState<LocationType>('ON_SITE');
  const [url, setUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');

  // Sync edit data
  useEffect(() => {
    if (applicationToEdit) {
      setOrganization(applicationToEdit.organization || '');
      setTitle(applicationToEdit.title || '');
      setStatus(applicationToEdit.status || 'WISH_LIST');
      setLocationType(applicationToEdit.locationType || 'ON_SITE');
      setUrl(applicationToEdit.url || '');
      setSalary(applicationToEdit.salary || '');
      
      const date = applicationToEdit.appliedDate 
        ? new Date(applicationToEdit.appliedDate).toISOString().substring(0, 10)
        : '';
      setAppliedDate(date);
      setNotes(applicationToEdit.notes || '');
    } else {
      // Reset form
      setOrganization('');
      setTitle('');
      setStatus('WISH_LIST');
      setLocationType('ON_SITE');
      setUrl('');
      setSalary('');
      setAppliedDate(new Date().toISOString().substring(0, 10));
      setNotes('');
    }
    setError(null);
  }, [applicationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organization.trim() || !title.trim()) {
      setError('Organization/Institution and Title/Program are required.');
      return;
    }

    startTransition(async () => {
      let res;
      const payload = {
        organization,
        title,
        status,
        locationType,
        url: url.trim() || undefined,
        salary: salary.trim() || undefined,
        appliedDate: appliedDate || undefined,
        notes: notes.trim() || undefined,
      };

      if (applicationToEdit) {
        res = await updateApplication(applicationToEdit.id, payload);
      } else {
        res = await createApplication(payload);
      }

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save application.');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="glass-panel border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-indigo/25 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-brand-indigo" />
            </div>
            <h3 className="font-bold text-white text-lg">
              {applicationToEdit ? 'Edit Application' : 'Add Application'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Group 1: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="organization">
                Organization / School Name *
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="w-full px-3 py-2 glass-input text-sm"
                placeholder="e.g. Stanford University"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="title">
                Title / Program Role *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 glass-input text-sm"
                placeholder="e.g. MSc Computer Science"
              />
            </div>
          </div>

          {/* Group 2: Status & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 glass-input text-sm bg-gray-900"
              >
                <option value="WISH_LIST">Wish List</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFERED">Offered</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="location">
                Location Type
              </label>
              <select
                id="location"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationType)}
                className="w-full px-3 py-2 glass-input text-sm bg-gray-900"
              >
                <option value="ON_SITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          {/* Group 3: Salary, Link, Applied Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="salary">
                Salary / Comp
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  id="salary"
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                  placeholder="e.g. $120,000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="url">
                Job Posting URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <LinkIcon className="w-4 h-4" />
                </span>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300" htmlFor="appliedDate">
                Applied Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  id="appliedDate"
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Group 4: Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300" htmlFor="notes">
              Notes
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-gray-500">
                <FileText className="w-4 h-4" />
              </span>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 glass-input text-sm resize-none"
                placeholder="Key dates, referrals, interview questions notes..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gray-900/40 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 shadow-md shadow-brand-indigo/15 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
