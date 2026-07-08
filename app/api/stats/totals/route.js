import { auth } from '@/lib/auth';
import { getAllFormTotals } from '@/lib/statsQuery';

export async function GET() {
  const session = await auth();

  if (!session || session.user?.status === 'pending' || session.user?.status === 'paused') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const forms = await getAllFormTotals();
    const fetchedAt = new Date().toISOString();
    const errors = forms.filter((f) => f.error).map((f) => f.formId);

    const responseForms = forms.map(({ error, ...rest }) => rest);

    const payload = { forms: responseForms, fetchedAt };

    if (errors.length > 0) {
      payload.errors = errors;
    }

    return Response.json(payload, { status: 200 });
  } catch (error) {
    console.error('Totals API error:', error);
    return Response.json({ message: 'Failed to fetch totals' }, { status: 500 });
  }
}
