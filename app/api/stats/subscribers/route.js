import { auth } from '@/lib/auth';
import { getFormSubscribers } from '@/lib/statsQuery';

export async function GET(request) {
  const session = await auth();

  if (!session || session.user?.status === 'pending' || session.user?.status === 'paused') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');

  if (!formId) {
    return Response.json({ message: 'formId is required' }, { status: 400 });
  }

  try {
    const subscribers = await getFormSubscribers(formId);
    return Response.json({ subscribers }, { status: 200 });
  } catch (error) {
    console.error('Subscribers API error:', error);
    return Response.json({ message: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
