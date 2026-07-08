import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin — Creator Report Dashboard',
  description: 'Admin dashboard for managing users and access',
};

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
