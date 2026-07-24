import { getApplications } from '@/app/actions/applications';
import DashboardClient from '@/components/DashboardClient';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
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
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white tracking-tight">Jobs & Internships</h3>
        <p className="text-sm text-gray-400 mt-1">
          Direct dashboard entry for your corporate job and internship pipelines.
        </p>
      </div>
      
      <DashboardClient initialApplications={applications} initialTab="job" hideTabs={true} />
    </div>
  );
}
