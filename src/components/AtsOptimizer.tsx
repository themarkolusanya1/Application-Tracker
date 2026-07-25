'use client';

import { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AtsOptimizer() {
  const [docText, setDocText] = useState('');
  const [jobText, setJobText] = useState('');
  const [docType, setDocType] = useState('CV/Resume');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!docText.trim() || !jobText.trim()) {
      setError('Please provide both the document text and the job/program description.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = localStorage.getItem('applyhub_api_key') || ''; // Load key if stored locally
      const res = await fetch('/api/ai/ats-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          docText,
          jobText,
          docType,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || 'Failed to complete ATS review.');
      }
    } catch (e: any) {
      setError('A network error occurred during review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-indigo/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand-indigo" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800">AI-Powered ATS Optimizer</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Paste your CV/Resume or Statement of Purpose alongside a target job post or university program syllabus. ApplyHub analyzes matching scores, reveals missing ATS keywords, and suggests bullet-point improvements in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-md space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm tracking-wide">Analysis Inputs</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 glass-input text-xs bg-white"
              >
                <option value="CV/Resume">CV / Resume</option>
                <option value="SOP">Statement of Purpose (SOP)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650">Gemini Key (Optional)</label>
              <input
                type="password"
                placeholder="Saved in settings"
                disabled
                className="w-full px-3 py-2 glass-input text-xs bg-slate-100 opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-650 flex justify-between">
              <span>Your Document Text (CV/Resume/SOP)</span>
              <span className="text-[10px] text-slate-400 font-normal">{docText.length} chars</span>
            </label>
            <textarea
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 glass-input text-xs resize-none"
              placeholder="Paste the plain text content of your resume, transcripts summaries, or Statement of Purpose here..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-650 flex justify-between">
              <span>Target Job / Program Description</span>
              <span className="text-[10px] text-slate-400 font-normal">{jobText.length} chars</span>
            </label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 glass-input text-xs resize-none"
              placeholder="Paste target job descriptions, qualifications, or university admissions requirements here..."
            />
          </div>

          {error && (
            <div className="p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-md shadow-brand-indigo/15 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Analyzing Alignment...' : 'Analyze & Optimize Content'}
          </button>
        </div>

        {/* Output panel */}
        <div className="space-y-6">
          {!result && !loading && (
            <div className="glass-card rounded-2xl border border-slate-200/80 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-800 text-sm">No Analysis Active</h5>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Enter your documents and requirements on the left, then trigger the review to view matching details.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card rounded-2xl border border-slate-200/80 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px] animate-pulse">
              <div className="w-12 h-12 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo mb-3">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h5 className="font-bold text-slate-800 text-sm">AI Optimization Active</h5>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Comparing skills, extracting keyword matches, and drafting tailored bullet rewrites...
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Score card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-md grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-brand-indigo/10">
                    <span className="font-display font-black text-xl text-slate-800">{result.score}%</span>
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">ATS Match Rating</span>
                  <h5 className="font-bold text-slate-850 text-sm leading-snug">
                    {result.score >= 80 ? 'Excellent compatibility!' : result.score >= 60 ? 'Moderate alignment' : 'Critical updates needed'}
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {result.score >= 80 ? 'Your text matches the core skills nicely. You are ready to apply.' : 'Tailor your text by integrating missing key terms listed below.'}
                  </p>
                </div>
              </div>

              {/* Missing keywords */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-md space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-indigo" />
                  <span>Missing Target Keywords</span>
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  These crucial phrases are in the target post but missing from your text. Add them naturally to improve ATS scores:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.missingKeywords.map((k: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-rose/5 border border-brand-rose/25 text-brand-rose">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-md space-y-4">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  <span>Tailored Bullet rewrites</span>
                </h5>

                <div className="space-y-4 divide-y divide-slate-100">
                  {result.bulletRewrites.map((rewrite: any, idx: number) => (
                    <div key={idx} className={`space-y-2.5 ${idx > 0 ? 'pt-4' : ''}`}>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Original document text:</span>
                        <p className="text-[11px] text-slate-650 bg-slate-100/40 p-2 rounded border border-slate-200/50 line-through italic">
                          "{rewrite.original}"
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-brand-emerald uppercase">Suggested tailored rewrite:</span>
                        <p className="text-xs text-slate-800 bg-brand-emerald/5 p-2 rounded.xl border border-brand-emerald/20 font-medium">
                          "{rewrite.rewritten}"
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight pl-1 flex items-start gap-1">
                        <span className="font-bold text-brand-indigo shrink-0">&bull;</span>
                        <span>{rewrite.reason}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
