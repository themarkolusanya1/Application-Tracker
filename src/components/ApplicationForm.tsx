'use client';

import { useTransition, useState, useEffect } from 'react';
import { X, Briefcase, DollarSign, Link as LinkIcon, Calendar, FileText, MapPin, Layers, GraduationCap, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { createApplication, updateApplication, deleteApplication } from '@/app/actions/applications';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  applicationToEdit?: any; // If editing
}

const currencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'CAD', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
];

export default function ApplicationForm({ isOpen, onClose, applicationToEdit }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);



  // Form states
  const [applicationType, setApplicationType] = useState<string>('job');
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string>('WISH_LIST');
  const [locationType, setLocationType] = useState<string>('ON_SITE');
  const [url, setUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');

  // AI Fill states
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiUrl, setAiUrl] = useState('');
  const [aiModeType, setAiModeType] = useState<'text' | 'url'>('text');
  const [isParsing, setIsParsing] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  const handleAiParse = async () => {
    const parsePayload = aiModeType === 'url' ? aiUrl.trim() : aiText.trim();
    if (!parsePayload) return;
    setIsParsing(true);
    setError(null);
    setAiSuccessMsg(null);
    try {
      const provider = typeof window !== 'undefined' ? localStorage.getItem('applyhub_ai_provider') || 'gemini' : 'gemini';
      const apiKey = typeof window !== 'undefined' 
        ? (provider === 'openai' 
            ? localStorage.getItem('applyhub_openai_api_key') || '' 
            : provider === 'groq'
              ? localStorage.getItem('applyhub_groq_api_key') || ''
              : localStorage.getItem('applyhub_api_key') || '') 
        : '';
      const response = await fetch('/api/ai/parse-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider': provider,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ text: parsePayload }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        // Populate standard form fields
        setApplicationType(data.applicationType || 'job');
        setOrganization(data.organization || '');
        setTitle(data.title || '');
        setUrl(data.url || '');
              if (data.applicationType === 'scholarship') {
          setDegreeLevel(data.degreeLevel || 'Masters');
          if (data.location) setLocation(data.location);
          if (data.deadline) setDeadline(data.deadline);
          setFundingType(data.fundingType || 'fully funded');
          setStipendAmount(data.stipendAmount || '');
          setStatus('Researching');
        } else {
          setLocationType(data.locationType || 'ON_SITE');
          if (data.location) setLocation(data.location);
          if (data.deadline) setDeadline(data.deadline);
          setSalary(data.salary || '');
          setCurrency(data.currency || 'USD');
          setStatus('WISH_LIST');
        }
        
        setNotes(data.notes || '');
        
        setAiSuccessMsg(
          result.simulated
            ? '✨ Simulating AI parsing: Filled fields successfully!'
            : '✨ Application details parsed and filled automatically!'
        );
        // Switch back to manual form so they can inspect and confirm
        setTimeout(() => {
          setIsAiMode(false);
          setAiSuccessMsg(null);
        }, 1500);
      } else {
        setError(result.error || 'Failed to parse application details.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to reach AI parsing service.');
    } finally {
      setIsParsing(false);
    }
  };

  // New checklist / currency / location fields
  const [currency, setCurrency] = useState('USD');
  const [fundingType, setFundingType] = useState('fully funded');
  const [stipendAmount, setStipendAmount] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('Masters');
  const [potentialAdvisor, setPotentialAdvisor] = useState('');

  // Checkbox checklists
  const [hasSop, setHasSop] = useState(false);
  const [hasTranscripts, setHasTranscripts] = useState(false);
  const [hasReferences, setHasReferences] = useState(false);
  const [hasTestScores, setHasTestScores] = useState(false);
  const [hasCvResume, setHasCvResume] = useState(false);
  const [hasPersonalStatement, setHasPersonalStatement] = useState(false);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);

  // Update status choices based on type selection to prevent invalid values
  useEffect(() => {
    if (!applicationToEdit) {
      if (applicationType === 'scholarship') {
        setStatus('Researching');
      } else {
        setStatus('WISH_LIST');
      }
    }
  }, [applicationType]);

  // Sync edit data
  useEffect(() => {
    if (applicationToEdit) {
      setApplicationType(applicationToEdit.applicationType || 'job');
      setOrganization(applicationToEdit.organization || '');
      setTitle(applicationToEdit.title || '');
      setStatus(applicationToEdit.status || 'WISH_LIST');
      setLocationType(applicationToEdit.locationType || 'ON_SITE');
      setLocation(applicationToEdit.location || '');
      setUrl(applicationToEdit.url || '');
      setSalary(applicationToEdit.salary || '');
      setCurrency(applicationToEdit.currency || 'USD');
      
      const date = applicationToEdit.appliedDate 
        ? new Date(applicationToEdit.appliedDate).toISOString().substring(0, 10)
        : '';
      setAppliedDate(date);
      setNotes(applicationToEdit.notes || '');

      setFundingType(applicationToEdit.fundingType || 'fully funded');
      setStipendAmount(applicationToEdit.stipendAmount || '');
      
      const deadlineDate = applicationToEdit.deadline 
        ? new Date(applicationToEdit.deadline).toISOString().substring(0, 10)
        : '';
      setDeadline(deadlineDate);

      setDegreeLevel(applicationToEdit.degreeLevel || 'Masters');
      setPotentialAdvisor(applicationToEdit.potentialAdvisor || '');
      setHasSop(applicationToEdit.hasSop || false);
      setHasTranscripts(applicationToEdit.hasTranscripts || false);
      setHasReferences(applicationToEdit.hasReferences || false);
      setHasTestScores(applicationToEdit.hasTestScores || false);
      setHasCvResume(applicationToEdit.hasCvResume || false);
      setHasPersonalStatement(applicationToEdit.hasPersonalStatement || false);
      setHasCoverLetter(applicationToEdit.hasCoverLetter || false);
    } else {
      // Reset form
      setApplicationType('job');
      setOrganization('');
      setTitle('');
      setStatus('WISH_LIST');
      setLocationType('ON_SITE');
      setLocation('');
      setUrl('');
      setSalary('');
      setCurrency('USD');
      setAppliedDate(new Date().toISOString().substring(0, 10));
      setNotes('');

      setFundingType('fully funded');
      setStipendAmount('');
      setDeadline('');
      setDegreeLevel('Masters');
      setPotentialAdvisor('');
      setHasSop(false);
      setHasTranscripts(false);
      setHasReferences(false);
      setHasTestScores(false);
      setHasCvResume(false);
      setHasPersonalStatement(false);
      setHasCoverLetter(false);
    }
    setError(null);
  }, [applicationToEdit, isOpen]);

  const handleTrackChange = (newType: string) => {
    if (newType === applicationType) return;
    setApplicationType(newType);

    if (newType === 'scholarship') {
      const map: Record<string, string> = {
        WISH_LIST: 'Researching',
        APPLIED: 'Submitted',
        INTERVIEWING: 'Interview',
        OFFERED: 'Admitted',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn'
      };
      setStatus(map[status] || 'Researching');
    } else {
      const map: Record<string, string> = {
        Researching: 'WISH_LIST',
        'Documents in Progress': 'WISH_LIST',
        Submitted: 'APPLIED',
        Interview: 'INTERVIEWING',
        Admitted: 'OFFERED',
        Rejected: 'REJECTED',
        Withdrawn: 'WITHDRAWN'
      };
      setStatus(map[status] || 'WISH_LIST');
    }
  };

  if (!isOpen) return null;

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'CA$';
      case 'AUD': return 'A$';
      default: return '$';
    }
  };

  const executeSave = (forceAllowDuplicate = false) => {
    setError(null);
    startTransition(async () => {
      let res;
      const payload: any = {
        applicationType,
        organization,
        title,
        status,
        url: url.trim() || undefined,
        location: location.trim() || undefined,
        appliedDate: appliedDate || undefined,
        deadline: deadline || undefined,
        notes: notes.trim() || undefined,
        currency,
        hasCoverLetter,
        allowDuplicate: forceAllowDuplicate
      };

      if (applicationType === 'scholarship') {
        payload.fundingType = fundingType;
        payload.stipendAmount = stipendAmount.trim() || '0';
        payload.degreeLevel = degreeLevel;
        payload.hasTranscripts = hasTranscripts;
        payload.hasReferences = hasReferences;
        payload.hasTestScores = hasTestScores;

        if (degreeLevel === 'Bachelors') {
          payload.hasPersonalStatement = hasPersonalStatement;
          payload.hasSop = false;
          payload.hasCvResume = false;
          payload.potentialAdvisor = undefined;
        } else if (degreeLevel === 'Masters') {
          payload.hasSop = hasSop;
          payload.hasCvResume = hasCvResume;
          payload.hasPersonalStatement = false;
          payload.potentialAdvisor = undefined;
        } else if (degreeLevel === 'PhD') {
          payload.hasSop = hasSop;
          payload.hasCvResume = hasCvResume;
          payload.hasPersonalStatement = false;
          payload.potentialAdvisor = potentialAdvisor.trim() || undefined;
        }
      } else {
        payload.locationType = locationType;
        payload.salary = salary.trim() || undefined;
        payload.hasCvResume = hasCvResume;
      }

      if (applicationToEdit) {
        res = await updateApplication(applicationToEdit.id, payload);
      } else {
        res = await createApplication(payload);
      }

      if (res.success) {
        toast.success(applicationToEdit ? 'Application updated successfully!' : 'Application logged successfully!');
        onClose();
      } else {
        if (res.error?.includes('Duplicate Entry Detected')) {
          setShowDuplicateAlert(true);
        } else {
          setError(res.error || 'Failed to save application.');
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization.trim() || !title.trim()) {
      setError('Organization/Institution and Title/Program are required.');
      return;
    }
    executeSave(false);
  };

  const handleDelete = () => {
    if (!applicationToEdit) return;
    setShowDeleteAlert(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl w-full p-0 overflow-hidden bg-slate-50 border border-slate-200/85 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-indigo/25 flex items-center justify-center">
              {applicationType === 'scholarship' ? (
                <GraduationCap className="w-5 h-5 text-brand-amber" />
              ) : (
                <Briefcase className="w-5 h-5 text-brand-indigo" />
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-lg">
              {applicationToEdit ? 'Edit Application' : 'Add Application'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
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

          {/* Group 0: Application Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Application Track</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleTrackChange('job')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  applicationType === 'job'
                    ? 'bg-brand-indigo border-brand-indigo/50 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Job</span>
              </button>
              <button
                type="button"
                onClick={() => handleTrackChange('internship')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  applicationType === 'internship'
                    ? 'bg-brand-indigo border-brand-indigo/50 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Internship</span>
              </button>
              <button
                type="button"
                onClick={() => handleTrackChange('scholarship')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  applicationType === 'scholarship'
                    ? 'bg-brand-amber border-brand-amber/50 text-white shadow-md shadow-brand-amber/10'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>University</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          {!applicationToEdit && (
            <div className="flex border-b border-slate-200 gap-4 mb-2">
              <button
                type="button"
                onClick={() => setIsAiMode(false)}
                className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                  !isAiMode ? 'text-brand-indigo font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Manual Entry
                {!isAiMode && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full animate-pulse" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsAiMode(true)}
                className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                  isAiMode ? 'text-brand-indigo font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ✨ AI Auto-Fill
                {isAiMode && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full animate-pulse" />
                )}
              </button>
            </div>
          )}

          {isAiMode ? (
            <div className="space-y-4 text-left">
              {aiSuccessMsg && (
                <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs rounded-lg animate-fade-in flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Selector */}
                <div className="flex gap-2 p-0.5 bg-slate-100 rounded-lg border border-slate-205/60 max-w-[280px]">
                  <button
                    type="button"
                    onClick={() => setAiModeType('text')}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      aiModeType === 'text' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiModeType('url')}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      aiModeType === 'url' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Use Link / URL
                  </button>
                </div>

                {aiModeType === 'text' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="aiText">
                      Application details (Job description, program info, or page copy)
                    </label>
                    <textarea
                      id="aiText"
                      rows={8}
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder="Paste the full job post details, requirements, program overview, or scholarship info here. Our AI will automatically parse the organization/company, position title, degree level, salary estimation, location, deadlines, and requirements for you..."
                      className="w-full px-3 py-2.5 glass-input text-xs leading-relaxed resize-y font-sans bg-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="aiUrl">
                      Job posting or program overview link / URL
                    </label>
                    <input
                      id="aiUrl"
                      type="url"
                      value={aiUrl}
                      onChange={(e) => setAiUrl(e.target.value)}
                      placeholder="https://example.com/jobs/frontend-engineer"
                      className="w-full px-3 py-2.5 glass-input text-xs font-sans bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isParsing || (aiModeType === 'text' ? !aiText.trim() : !aiUrl.trim())}
                onClick={handleAiParse}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer font-sans"
              >
                {isParsing ? (
                  <span>Parsing details with Gemini AI...</span>
                ) : (
                  <>
                    <span>✨ Auto-Fill fields with AI</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Group 1: Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="organization">
                {applicationType === 'scholarship' ? 'Institution / University Name *' : 'Organization / Company Name *'}
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="w-full px-3 py-2 glass-input text-sm"
                placeholder={applicationType === 'scholarship' ? 'e.g. Stanford University' : 'e.g. Google'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="title">
                {applicationType === 'scholarship' ? 'Academic Program / Field *' : 'Position Title / Role *'}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 glass-input text-sm"
                placeholder={applicationType === 'scholarship' ? 'e.g. Computer Science' : 'e.g. Frontend Engineer'}
              />
            </div>
          </div>

          {/* Group 2: Status & Location / Degree Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 glass-input text-sm bg-white"
              >
                {applicationType === 'scholarship' ? (
                  <>
                    <option value="Researching">Researching</option>
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
            </div>

            {applicationType === 'scholarship' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="degreeLevel">
                  Degree Level
                </label>
                <select
                  id="degreeLevel"
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="w-full px-3 py-2 glass-input text-sm bg-white"
                >
                  <option value="Bachelors">Bachelor's Degree</option>
                  <option value="Masters">Master's (MSc/MA/MBA)</option>
                  <option value="PhD">PhD / Doctorate</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="locationType">
                  Location Type
                </label>
                <select
                  id="locationType"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full px-3 py-2 glass-input text-sm bg-white"
                >
                  <option value="ON_SITE">On-Site</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            )}

            {/* Location / Country field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="location">
                Location / Country
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 text-brand-indigo" />
                </span>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                  placeholder="e.g. Zurich, Switzerland"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Financial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="currency">
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 glass-input text-sm bg-white"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {applicationType === 'scholarship' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="stipend">
                  Stipend Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs font-bold">
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    id="stipend"
                    type="text"
                    value={stipendAmount}
                    onChange={(e) => setStipendAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                    placeholder="e.g. 45,000"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="salary">
                  Salary / Compensation
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs font-bold">
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    id="salary"
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                    placeholder="e.g. 120,000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Application Link (URL) - Always available for both Job and Scholarship */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700" htmlFor="url">
              {applicationType === 'scholarship' ? 'University / Scholarship Application Link' : 'Job Posting / Application Link'}
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

          {/* Dates: Applied Date & Application Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="appliedDate">
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="deadline">
                Application Deadline
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 text-brand-indigo" />
                </span>
                <input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 glass-input text-sm"
                />
              </div>
            </div>
          </div>

            {applicationType === 'scholarship' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700" htmlFor="funding">
                  Funding Type
                </label>
                <select
                  id="funding"
                  value={fundingType}
                  onChange={(e) => setFundingType(e.target.value)}
                  className="w-full px-3 py-2 glass-input text-sm bg-white"
                >
                  <option value="fully funded">Fully Funded</option>
                  <option value="partial">Partial Funding</option>
                  <option value="self-funded">Self-Funded</option>
                </select>
              </div>
            )}

          {/* Group 4: PhD Supervisor / Advisor contact */}
          {applicationType === 'scholarship' && degreeLevel === 'PhD' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="potentialAdvisor">
                Potential Advisor / Supervisor Contact Info
              </label>
              <input
                id="potentialAdvisor"
                type="text"
                value={potentialAdvisor}
                onChange={(e) => setPotentialAdvisor(e.target.value)}
                className="w-full px-3 py-2 glass-input text-sm"
                placeholder="e.g. Professor Alex Cho (cho@eecs.mit.edu)"
              />
            </div>
          )}

          {/* Group 5: Document Checklist (Adaptable based on Job vs. Scholarship) */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Required Documents Checklist
            </h4>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              {applicationType === 'job' ? (
                <>
                  {/* CV/Resume (Job) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={hasCvResume}
                      onChange={(e) => setHasCvResume(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                    />
                    <span>Curriculum Vitae (CV) / Resume</span>
                  </label>

                  {/* Cover Letter (Job) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={hasCoverLetter}
                      onChange={(e) => setHasCoverLetter(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                    />
                    <span>Cover Letter</span>
                  </label>
                </>
              ) : (
                <>
                  {/* Transcripts (All) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={hasTranscripts}
                      onChange={(e) => setHasTranscripts(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                    />
                    <span>Official Transcripts</span>
                  </label>

                  {/* References (All) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={hasReferences}
                      onChange={(e) => setHasReferences(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                    />
                    <span>Letters of Recommendation</span>
                  </label>

                  {/* Test Scores (All) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={hasTestScores}
                      onChange={(e) => setHasTestScores(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                    />
                    <span>{degreeLevel === 'Bachelors' ? 'Standardized Tests (SAT/ACT)' : 'Test Scores (GRE/IELTS)'}</span>
                  </label>

                  {/* Personal Statement (Bachelor's only) */}
                  {degreeLevel === 'Bachelors' && (
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                      <input
                        type="checkbox"
                        checked={hasPersonalStatement}
                        onChange={(e) => setHasPersonalStatement(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                      />
                      <span>Personal Statement</span>
                    </label>
                  )}

                  {/* SOP / Research Proposal (Master's / PhD) */}
                  {(degreeLevel === 'Masters' || degreeLevel === 'PhD') && (
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                      <input
                        type="checkbox"
                        checked={hasSop}
                        onChange={(e) => setHasSop(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                      />
                      <span>{degreeLevel === 'PhD' ? 'Research Proposal' : 'Statement of Purpose (SOP)'}</span>
                    </label>
                  )}

                  {/* CV/Resume (Master's / PhD) */}
                  {(degreeLevel === 'Masters' || degreeLevel === 'PhD') && (
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                      <input
                        type="checkbox"
                        checked={hasCvResume}
                        onChange={(e) => setHasCvResume(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                      />
                      <span>Curriculum Vitae (CV)</span>
                    </label>
                  )}

                  {/* Cover Letter (All Scholarships) */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={hasCoverLetter}
                      onChange={(e) => setHasCoverLetter(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                    />
                    <span>Cover Letter</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Group 6: Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700" htmlFor="notes">
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
                placeholder={applicationType === 'scholarship' ? 'Add supervisor discussions, fellowship deadlines, application requirements...' : 'Key dates, referrals, interview questions notes...'}
              />
            </div>
          </div>
          </>
        )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200/80 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
          {applicationToEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="mr-auto px-4 py-2 text-sm font-semibold text-brand-rose hover:bg-brand-rose/10 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Application</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          {!isAiMode && (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 shadow-md shadow-brand-indigo/15 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Saving...' : 'Save Application'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
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
            if (applicationToEdit) {
              startTransition(async () => {
                const res = await deleteApplication(applicationToEdit.id);
                if (res.success) {
                  toast.success('Application deleted successfully!');
                  onClose();
                } else {
                  setError(res.error || 'Failed to delete application.');
                }
              });
            }
            setShowDeleteAlert(false);
          }}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Shadcn Duplicate Alert Dialog */}
    <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
      <AlertDialogContent className="glass-card border-amber-500/40 bg-slate-950 text-white max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            Duplicate Application Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 text-sm leading-relaxed mt-2">
            You already have an existing entry for <strong className="text-white">{organization}</strong> (<em>{title}</em>).
            <br /><br />
            Would you like to add another copy anyway, or cancel?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 mt-4">
          <AlertDialogCancel className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setShowDuplicateAlert(false);
              executeSave(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
          >
            Add Duplicate Copy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
}
