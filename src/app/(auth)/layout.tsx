import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-background relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-indigo/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-3xl" />

      {/* Auth Card Shell */}
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-brand-indigo/25 mb-4 border border-slate-200/50 bg-white p-0.5">
            <img src="/images/applyhub_logo.png" alt="ApplyHub logo" className="w-full h-full object-cover select-none" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-brand-indigo">MyTraks</h1>
        </div>

        <div className="glass-panel border border-slate-200/80 rounded-3xl p-8 shadow-2xl animate-fade-in bg-white/80">
          {children}
        </div>
      </div>
    </div>
  );
}
