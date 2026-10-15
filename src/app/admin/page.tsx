import { redirect } from 'next/navigation';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getRepository } from '@/lib/db';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export default async function AdminPage() {
  const isAuth = await isAuthenticatedAdmin();

  if (!isAuth) {
    redirect('/admin/login');
  }

  const repo = getRepository();
  const bookings = await repo.getAllBookings();
  const metrics = await repo.getDashboardMetrics();

  return (
    <AdminDashboardClient
      initialBookings={bookings}
      initialMetrics={metrics}
    />
  );
}
