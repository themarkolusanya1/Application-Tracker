'use client';

import { useState } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle2, MessageSquare, Award, ArrowRight, RefreshCw } from 'lucide-react';

interface InterviewCoachModalProps {
  application: {
    id: string;
    organization: string;
    title: string;
    applicationType: string;
  };
  onClose: () => void;
}

export default function InterviewCoachModal({ application, onClose }: InterviewCoachModalProps) {
  const [step, setStep] = useState<'welcome' | 'questions' | 'completed'>('welcome');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [sessionReport, setSessionReport] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = localStorage.getItem('applyhub_ai_provider') || 'gemini';
      const apiKey = provider === 'openai' 
        ? localStorage.getItem('applyhub_openai_api_key') || '' 
        : localStorage.getItem('applyhub_api_key') || '';
      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider': provider,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          action: 'get_questions',
          organization: application.organization,
          title: application.title,
          type: application.applicationType,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setQuestions(json.questions);
        setStep('questions');
        setCurrentIdx(0);
      } else {
        setError(json.error || 'Failed to fetch interview questions.');
      }
    } catch (e) {
      setError('Network error occurred starting mock interview.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setSubmittingAnswer(true);
    setError(null);
    try {
      const provider = localStorage.getItem('applyhub_ai_provider') || 'gemini';
      const apiKey = provider === 'openai' 
        ? localStorage.getItem('applyhub_openai_api_key') || '' 
        : localStorage.getItem('applyhub_api_key') || '';
      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider': provider,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          action: 'evaluate_answer',
          organization: application.organization,
          title: application.title,
          type: application.applicationType,
          question: questions[currentIdx],
          answer: userAnswer,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(json.feedback);
        setSessionReport(prev => [
          ...prev,
          {
            question: questions[currentIdx],
            answer: userAnswer,
            feedback: json.feedback,
          }
        ]);
      } else {
        setError(json.error || 'Failed to analyze answer.');
      }
    } catch (e) {
      setError('Network error analyzing response.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const nextQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStep('completed');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-slate-200/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col bg-white animate-fade-in max-h-[90vh]">
        {/* Modal Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-indigo" />
            <div>
              <h4 className="font-display font-black text-slate-800 text-sm tracking-wide">Success Coach Mock Interview</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{application.organization} &bull; {application.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'welcome' && (
            <div className="space-y-6 text-center max-w-md mx-auto py-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-indigo/15 flex items-center justify-center mx-auto text-brand-indigo">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 text-base">Practice makes permanent!</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Prepare for your upcoming meeting with **{application.organization}**. The coach generates realistic prompts and scores your answers using the structured **STAR model** framework.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={startSession}
                disabled={loading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan hover:opacity-95 rounded-lg shadow-md shadow-brand-indigo/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Configuring coach...</span>
                  </>
                ) : (
                  <>
                    <span>Start Practice Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-5">
              {/* Progress info */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl">
                <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
                <span className="text-brand-indigo">Interview Coach Active</span>
              </div>

              {/* Question text */}
              <div className="p-4 bg-brand-indigo/5 border border-brand-indigo/25 rounded-xl">
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  "{questions[currentIdx]}"
                </p>
              </div>

              {!feedback ? (
                /* Textarea input */
                <div className="space-y-3">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2.5 glass-input text-xs resize-none"
                    placeholder="Type your practice response here (try incorporating Situation, Task, Action, and Result details)..."
                  />

                  {error && (
                    <div className="p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose text-xs rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={submitAnswer}
                    disabled={submittingAnswer || !userAnswer.trim()}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-brand-indigo hover:bg-brand-indigo/90 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingAnswer ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating response...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Response</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Feedback cards */
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-3 gap-4 items-center p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-4 border-brand-indigo/10 flex items-center justify-center font-display font-black text-slate-800 text-sm">
                        {feedback.score}%
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Response Evaluation</span>
                      <h6 className="font-bold text-slate-800 text-xs">{feedback.rating}</h6>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${feedback.starCheck.situation ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>S</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${feedback.starCheck.task ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>T</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${feedback.starCheck.action ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>A</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${feedback.starCheck.result ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>R</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h6 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
                        <span>Strengths</span>
                      </h6>
                      <p className="text-xs text-slate-700 leading-normal pl-4">
                        {feedback.strengths}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h6 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-brand-amber" />
                        <span>Suggested Improvements</span>
                      </h6>
                      <p className="text-xs text-slate-700 leading-normal pl-4">
                        {feedback.improvements}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h6 className="text-[10px] font-bold text-brand-indigo uppercase flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-brand-indigo" />
                        <span>Example Model formulation</span>
                      </h6>
                      <p className="text-xs text-slate-800 bg-brand-indigo/5 p-3 rounded-xl border border-brand-indigo/15 leading-relaxed font-medium">
                        "{feedback.modelResponse}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={nextQuestion}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'View Session Report'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'completed' && (
            <div className="space-y-6">
              <div className="text-center max-w-sm mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-emerald/15 flex items-center justify-center mx-auto text-brand-emerald">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-800 text-base">Practice session completed!</h5>
                  <p className="text-xs text-slate-500">
                    Review your comprehensive interview prep report card below.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {sessionReport.map((rep, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">Q{idx + 1}: "{rep.question}"</p>
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-200/50 pt-2 text-slate-500">
                      <span className="font-bold text-slate-700">Answer Score: {rep.feedback.score}%</span>
                      <span>Rating: {rep.feedback.rating}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-white bg-brand-indigo hover:bg-brand-indigo/90 rounded-lg shadow-md transition-all cursor-pointer text-center"
              >
                Done practicing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
