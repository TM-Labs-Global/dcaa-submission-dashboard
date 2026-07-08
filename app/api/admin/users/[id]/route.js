import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { action } = await request.json();

  if (!action) {
    return Response.json({ message: 'Action is required' }, { status: 400 });
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user.length) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    let newStatus;

    switch (action) {
      case 'approve':
        newStatus = 'active';
        break;
      case 'pause':
        newStatus = 'paused';
        break;
      case 'resume':
        newStatus = 'active';
        break;
      case 'remove':
        await db.delete(users).where(eq(users.id, id));
        return Response.json({ message: 'User removed' });
      default:
        return Response.json({ message: 'Invalid action' }, { status: 400 });
    }

    await db.update(users).set({ status: newStatus }).where(eq(users.id, id));

    return Response.json({ message: `User ${action}ed` });
  } catch (error) {
    console.error('Failed to update user:', error);
    return Response.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
