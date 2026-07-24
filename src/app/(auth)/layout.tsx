import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-indigo/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-brand-cyan/10 blur-3xl" />

      {/* Auth Card Shell */}
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-indigo/25 mb-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">AppTracker</h1>
          <p className="text-sm text-gray-400 mt-1">Organize your applications, land your dream career.</p>
        </div>

        <div className="glass-panel border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
