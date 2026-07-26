import { getApplications } from '@/app/actions/applications';
import DashboardClient from '@/components/DashboardClient';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const response = await getApplications();

  if (!response.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="flex items-center gap-2 p-4 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose rounded-xl max-w-md">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-sm">Error Loading Applications</h3>
            <p className="text-xs opacity-90 mt-0.5">{response.error || 'Failed to fetch application data.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const applications = response.data || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-display font-extrabold text-slate-850 tracking-tight">Dashboard</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Review, filter, and modify your application stages.
        </p>
      </div>
      
      <DashboardClient initialApplications={applications} />
    </div>
  );
}
