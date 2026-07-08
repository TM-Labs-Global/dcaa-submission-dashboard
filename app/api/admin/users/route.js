import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return Response.json(allUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
