import { getCurrentUser } from '@/app/actions/auth';
import SettingsClient from '@/components/SettingsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const user = {
    name: session.name,
    email: session.email,
  };

  return (
    <div className="animate-fade-in">
      <SettingsClient user={user} />
    </div>
  );
}
