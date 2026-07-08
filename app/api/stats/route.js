import { auth } from '@/lib/auth';
import { getFormStats, getAllFormStats, getLatestSyncTimestamp } from '@/lib/statsQuery';

function defaultDateRange() {
  const dateTo = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 29);
  const dateFrom = fromDate.toISOString().slice(0, 10);
  return { dateFrom, dateTo };
}

export async function GET(request) {
  const session = await auth();

  if (!session || session.user?.status === 'pending' || session.user?.status === 'paused') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  const defaults = defaultDateRange();
  const dateFrom = searchParams.get('dateFrom') || defaults.dateFrom;
  const dateTo = searchParams.get('dateTo') || defaults.dateTo;

  try {
    const forms = formId
      ? [await getFormStats(formId, dateFrom, dateTo)]
      : await getAllFormStats(dateFrom, dateTo);

    const fetchedAt = new Date().toISOString();
    const errors = forms.filter((f) => f.error).map((f) => f.formId);

    const responseForms = forms.map(({ error, ...rest }) => rest);

    const payload = {
      forms: responseForms,
      fetchedAt,
    };

    if (errors.length > 0) {
      payload.errors = errors;
    }

    return Response.json(payload, { status: 200 });
  } catch (error) {
    console.error('Stats API error:', error);
    return Response.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}
