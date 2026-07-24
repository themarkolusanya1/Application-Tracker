'use client';

import { useState, useTransition } from 'react';
import { 
  FileText, CheckCircle2, AlertCircle, Upload, 
  Trash2, FileDown, ExternalLink, RefreshCw, Eye
} from 'lucide-react';
import { updateApplication } from '@/app/actions/applications';

interface DocumentsClientProps {
  initialApplications: any[];
}

export default function DocumentsClient({ initialApplications }: DocumentsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [applications, setApplications] = useState(initialApplications);
  const [activeTab, setActiveTab] = useState<'manager' | 'applications'>('manager');

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
  const handleToggleChecklist = (appId: string, field: 'hasSop' | 'hasTranscripts' | 'hasReferences' | 'hasTestScores', currentValue: boolean) => {
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
          <h3 className="text-2xl font-black text-white tracking-tight">Documents Workspace</h3>
          <p className="text-sm text-gray-400 mt-1">
            Manage your reusable application materials and check their status across programs.
          </p>
        </div>

        {/* Workspace tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'manager' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Files</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'applications' ? 'bg-brand-indigo text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Checklist Status ({scholarshipApps.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'manager' ? (
        /* ==================== MASTER FILES VIEW ==================== */
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {masterFiles.map((file) => (
            <div 
              key={file.id} 
              className="glass-panel border border-white/5 rounded-2xl p-6 relative group overflow-hidden shadow-xl hover:border-white/10 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Corner accent glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${file.color} opacity-5 blur-xl group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${file.color} bg-opacity-20 flex items-center justify-center shadow-inner`}>
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{file.type}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">PDF Document</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded-full font-bold select-none">
                    Ready
                  </span>
                </div>

                <div className="p-3 bg-gray-950/20 rounded-xl border border-white/5 flex justify-between items-center">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs text-gray-300 font-semibold truncate" title={file.fileName}>{file.fileName}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{file.size} &bull; Uploaded {file.updatedAt}</p>
                  </div>
                  <span title="Reupload new version">
                    <Upload className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-5 border-t border-white/5 mt-5">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 cursor-pointer">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      ) : (
        /* ==================== CHECKLIST STATUS VIEW ==================== */
        <section className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-gray-900/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Institution & Program</th>
                  <th className="px-6 py-4">Statement of Purpose</th>
                  <th className="px-6 py-4">Transcripts</th>
                  <th className="px-6 py-4">References Packet</th>
                  <th className="px-6 py-4">Standardized Tests</th>
                  <th className="px-6 py-4 text-center">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {scholarshipApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No active scholarship applications found. Add a scholarship to track document states!
                    </td>
                  </tr>
                ) : (
                  scholarshipApps.map((app) => {
                    const completedCount = 
                      (app.hasSop ? 1 : 0) + 
                      (app.hasTranscripts ? 1 : 0) + 
                      (app.hasReferences ? 1 : 0) + 
                      (app.hasTestScores ? 1 : 0);
                    const pct = Math.round((completedCount / 4) * 100);

                    return (
                      <tr key={app.id} className="hover:bg-white/2 transition-colors duration-150">
                        {/* Institution Name */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{app.organization}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{app.title}</p>
                        </td>

                        {/* SOP Checkbox */}
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasSop}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasSop', app.hasSop)}
                              className="w-4.5 h-4.5 rounded border-white/10 bg-white/5 text-brand-indigo focus:ring-brand-indigo cursor-pointer transition-colors"
                            />
                            <span className={`text-xs ${app.hasSop ? 'text-brand-emerald font-bold' : 'text-gray-400'}`}>
                              {app.hasSop ? 'Completed' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* Transcripts Checkbox */}
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasTranscripts}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasTranscripts', app.hasTranscripts)}
                              className="w-4.5 h-4.5 rounded border-white/10 bg-white/5 text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasTranscripts ? 'text-brand-emerald font-bold' : 'text-gray-400'}`}>
                              {app.hasTranscripts ? 'Completed' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* References Checkbox */}
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasReferences}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasReferences', app.hasReferences)}
                              className="w-4.5 h-4.5 rounded border-white/10 bg-white/5 text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasReferences ? 'text-brand-emerald font-bold' : 'text-gray-400'}`}>
                              {app.hasReferences ? 'Completed' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* Test Scores Checkbox */}
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={app.hasTestScores}
                              disabled={isPending}
                              onChange={() => handleToggleChecklist(app.id, 'hasTestScores', app.hasTestScores)}
                              className="w-4.5 h-4.5 rounded border-white/10 bg-white/5 text-brand-indigo focus:ring-brand-indigo cursor-pointer"
                            />
                            <span className={`text-xs ${app.hasTestScores ? 'text-brand-emerald font-bold' : 'text-gray-400'}`}>
                              {app.hasTestScores ? 'Completed' : 'Pending'}
                            </span>
                          </label>
                        </td>

                        {/* Completion progress */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center justify-center gap-1.5 min-w-[80px]">
                            <span className="text-xs font-bold text-gray-200">{completedCount} / 4 ({pct}%)</span>
                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
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
    </div>
  );
}
