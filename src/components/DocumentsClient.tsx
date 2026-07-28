'use client';

import { useState, useTransition } from 'react';
import { 
  FileText, CheckCircle2, AlertCircle, Upload, 
  Trash2, FileDown, ExternalLink, RefreshCw, Eye, Sparkles
} from 'lucide-react';
import { updateApplication } from '@/app/actions/applications';
import AtsOptimizer from './AtsOptimizer';

interface DocumentsClientProps {
  initialApplications: any[];
}

export default function DocumentsClient({ initialApplications }: DocumentsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [applications, setApplications] = useState(initialApplications);
  const [activeTab, setActiveTab] = useState<'manager' | 'applications' | 'ats'>('manager');

  // Hardcoded mock master files state for illustrative file links
  const [masterFiles, setMasterFiles] = useState([
    {
      id: 'sop',
      type: 'Statement of Purpose (SOP)',
      fileName: 'Master_SOP_Academic_Fall2026.pdf',
      size: '842 KB',
      updatedAt: '2 days ago',
      color: 'from-brand-indigo to-indigo-600',
    },
    {
      id: 'transcripts',
      type: 'Official Transcripts',
      fileName: 'Transcripts_Official_AlexDev.pdf',
      size: '2.4 MB',
      updatedAt: '1 week ago',
      color: 'from-brand-cyan to-blue-600',
    },
    {
      id: 'references',
      type: 'Reference Letters Packet',
      fileName: 'Recommendation_Letters_Combined.pdf',
      size: '1.1 MB',
      updatedAt: '3 days ago',
      color: 'from-brand-amber to-amber-600',
    },
    {
      id: 'test_scores',
      type: 'Standardized Test Scores',
      fileName: 'GRE_TOEFL_Reports_Alex.pdf',
      size: '410 KB',
      updatedAt: '2 weeks ago',
      color: 'from-brand-rose to-rose-600',
    },
  ]);

  const scholarshipApps = applications.filter(app => app.applicationType === 'scholarship');

  // Toggle checklist checkbox handler that immediately updates database
  const handleToggleChecklist = (appId: string, field: 'hasSop' | 'hasTranscripts' | 'hasReferences' | 'hasTestScores' | 'hasCvResume' | 'hasPersonalStatement' | 'hasCoverLetter', currentValue: boolean) => {
    startTransition(async () => {
      // Optimistic update
      setApplications(prev => prev.map(app => {
        if (app.id === appId) {
          return { ...app, [field]: !currentValue };
        }
        return app;
      }));

      const res = await updateApplication(appId, {
        [field]: !currentValue
      });

      if (!res.success) {
        alert(res.error || 'Failed to update checklist in database.');
        // Revert on failure
        setApplications(prev => prev.map(app => {
          if (app.id === appId) {
            return { ...app, [field]: currentValue };
          }
          return app;
        }));
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-extrabold text-slate-850 tracking-tight">Documents Workspace</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your reusable application materials and check their status across programs.
          </p>
        </div>

        {/* Workspace tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start">
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'manager' ? 'bg-brand-indigo text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Files</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'applications' ? 'bg-brand-indigo text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Checklist Status ({scholarshipApps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ats')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ats' ? 'bg-brand-indigo text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATS Optimizer</span>
          </button>
        </div>
      </div>

      {activeTab === 'manager' && (
        /* ==================== MASTER FILES VIEW ==================== */
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {masterFiles.map((file) => (
            <div 
              key={file.id} 
              className="glass-card rounded-2xl p-6 relative group overflow-hidden border border-slate-200/80 hover:border-brand-indigo/35 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Corner accent glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${file.color} opacity-5 blur-xl group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${file.color} bg-opacity-20 flex items-center justify-center shadow-inner text-white`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{file.type}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">PDF Document</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded-full font-bold select-none">
                    Ready
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs text-slate-700 font-semibold truncate" title={file.fileName}>{file.fileName}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{file.size} &bull; Uploaded {file.updatedAt}</p>
                  </div>
                  <span title="Reupload new version">
                    <Upload className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-5 border-t border-slate-200/80 mt-5">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/80 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/80 cursor-pointer">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'applications' && (
        /* ==================== CHECKLIST STATUS VIEW ==================== */
         <section className="glass-card border border-slate-200/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50 text-xs font-semibold text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Institution & Program</th>
                  <th className="px-6 py-4 text-center">Degree</th>
                  <th className="px-6 py-4 text-center">SOP / Proposal</th>
                  <th className="px-6 py-4 text-center">Personal Statement</th>
                  <th className="px-6 py-4 text-center">CV / Resume</th>
                  <th className="px-6 py-4 text-center">Transcripts</th>
                  <th className="px-6 py-4 text-center">References</th>
                  <th className="px-6 py-4 text-center">Test Scores</th>
                  <th className="px-6 py-4 text-center">Cover Letter</th>
                  <th className="px-6 py-4 text-center">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-sm text-slate-700">
                {scholarshipApps.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                      No active university applications found. Add a university application to track document states!
                    </td>
                  </tr>
                ) : (
                  scholarshipApps.map((app) => {
                    const totalRequired = app.degreeLevel === 'Bachelors' ? 5 : 6;
                    const completedCount = 
                      (app.hasTranscripts ? 1 : 0) + 
                      (app.hasReferences ? 1 : 0) + 
                      (app.hasTestScores ? 1 : 0) + 
                      (app.hasCoverLetter ? 1 : 0) + 
                      (app.degreeLevel === 'Bachelors' 
                        ? (app.hasPersonalStatement ? 1 : 0) 
                        : ((app.hasSop ? 1 : 0) + (app.hasCvResume ? 1 : 0)));
                    const pct = Math.round((completedCount / totalRequired) * 100);

                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors duration-150">
                        {/* Institution Name */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{app.organization}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{app.title}</p>
                        </td>

                        {/* Degree Level */}
                        <td className="px-6 py-4 text-center text-xs font-bold text-brand-amber">
                          {app.degreeLevel || 'Masters'}
                        </td>

                        {/* SOP Checkbox (Masters/PhD) */}
                        <td className="px-6 py-4 text-center">
                          {app.degreeLevel !== 'Bachelors' ? (
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={app.hasSop}
                                disabled={isPending}
                                onChange={() => handleToggleChecklist(app.id, 'hasSop', app.hasSop)}
                                className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer transition-colors"
                              />
                              <span className={`text-xs ${app.hasSop ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                                {app.hasSop ? 'Done' : 'Pending'}
                              </span>
                            </label>
                          ) : (
                            <span className="text-slate-400 font-semibold">—</span>
                          )}
                        </td>

                        {/* Personal Statement Checkbox (Bachelors) */}
                        <td className="px-6 py-4 text-center">
                          {app.degreeLevel === 'Bachelors' ? (
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={app.hasPersonalStatement}
                                disabled={isPending}
                                onChange={() => handleToggleChecklist(app.id, 'hasPersonalStatement', app.hasPersonalStatement)}
                                className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer transition-colors"
                              />
                              <span className={`text-xs ${app.hasPersonalStatement ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                                {app.hasPersonalStatement ? 'Done' : 'Pending'}
                              </span>
                            </label>
                          ) : (
                            <span className="text-slate-400 font-semibold">—</span>
                          )}
                        </td>

                        {/* CV / Resume Checkbox (Masters/PhD) */}
                        <td className="px-6 py-4 text-center">
                          {app.degreeLevel !== 'Bachelors' ? (
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={app.hasCvResume}
                                disabled={isPending}
                                onChange={() => handleToggleChecklist(app.id, 'hasCvResume', app.hasCvResume)}
                                className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer transition-colors"
                              />
                              <span className={`text-xs ${app.hasCvResume ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                                {app.hasCvResume ? 'Done' : 'Pending'}
                              </span>
                            </label>
                          ) : (
                            <span className="text-slate-400 font-semibold">—</span>
                          )}
                        </td>

                        {/* Transcripts Checkbox (All) */}
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasTranscripts}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasTranscripts', app.hasTranscripts)}
                              className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasTranscripts ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                              {app.hasTranscripts ? 'Done' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* References Checkbox (All) */}
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasReferences}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasReferences', app.hasReferences)}
                              className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasReferences ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                              {app.hasReferences ? 'Done' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* Test Scores Checkbox (All) */}
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasTestScores}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasTestScores', app.hasTestScores)}
                              className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasTestScores ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                              {app.hasTestScores ? 'Done' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* Cover Letter Checkbox (All) */}
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasCoverLetter}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasCoverLetter', app.hasCoverLetter)}
                              className="w-5 h-5 rounded border-slate-300 bg-white text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasCoverLetter ? 'text-brand-emerald font-bold' : 'text-slate-500'}`}>
                              {app.hasCoverLetter ? 'Done' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* Completion progress */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5 min-w-[80px]">
                            <span className="text-xs font-bold text-slate-700">{completedCount} / {totalRequired} ({pct}%)</span>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                              <div 
                                className="h-full bg-gradient-to-r from-brand-indigo to-brand-cyan transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'ats' && (
        /* ==================== ATS OPTIMIZER VIEW ==================== */
        <AtsOptimizer />
      )}
    </div>
  );
}
