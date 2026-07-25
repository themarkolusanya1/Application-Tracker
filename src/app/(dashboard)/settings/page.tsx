import { getCurrentUser, getCompleteUserRecord } from '@/app/actions/auth';
import SettingsClient from '@/components/SettingsClient';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const dbUser = await getCompleteUserRecord();

  const user = {
    name: dbUser?.name || session.name,
    email: dbUser?.email || session.email,
    role: dbUser?.role || 'STUDENT',
  };

  const applications = await db.application.findMany({
    where: { userId: session.userId },
  });

  return (
    <div className="animate-fade-in">
      <SettingsClient user={user} initialApplications={applications} />
    </div>
  );
}
