import { auth } from '@/lib/auth';
import { getFormSubscribers } from '@/lib/statsQuery';
import { getFormConfig } from '@/config/sites';
import ExcelJS from 'exceljs';

export const maxDuration = 60;

function fullName(row) {
  return [row.firstName, row.lastName].filter(Boolean).join(' ') || '—';
}

function formatJoined(joinedAt) {
  const date = new Date(joinedAt);
  return date.toISOString().slice(0, 16).replace('T', ' ');
}

function filterByDateRange(subscribers, dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return subscribers;

  const from = new Date(dateFrom);
  from.setHours(0, 0, 0, 0);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);

  return subscribers.filter((s) => {
    const joined = new Date(s.joinedAt);
    return joined >= from && joined <= to;
  });
}

function toCsv(subscribers) {
  const headers = ['Name', 'Email', 'Location', 'Joined'];
  const rows = subscribers.map((s) => [fullName(s), s.email, s.location || '', formatJoined(s.joinedAt)]);

  return [headers, ...rows]
    .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

async function toXlsx(subscribers) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Subscribers');

  sheet.columns = [
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Joined', key: 'joined', width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };

  subscribers.forEach((s) => {
    sheet.addRow({ name: fullName(s), email: s.email, location: s.location || '', joined: formatJoined(s.joinedAt) });
  });

  return workbook.xlsx.writeBuffer();
}

export async function GET(request) {
  const session = await auth();

  if (!session || session.user?.status === 'pending' || session.user?.status === 'paused') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const format = searchParams.get('format') || 'csv';

  if (!formId) {
    return Response.json({ message: 'formId is required for export' }, { status: 400 });
  }

  try {
    const form = getFormConfig(formId);
    const allSubscribers = await getFormSubscribers(formId);
    const subscribers = filterByDateRange(allSubscribers, dateFrom, dateTo);

    const rangeSuffix = dateFrom && dateTo ? `_${dateFrom}_to_${dateTo}` : '_all_time';
    const filenameBase = `${form.formName.replace(/\s+/g, '_')}_subscribers${rangeSuffix}`;

    if (format === 'xlsx') {
      const buffer = await toXlsx(subscribers);
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }

    const csv = toCsv(subscribers);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
      },
    });
  } catch (error) {
    console.error('Subscriber export API error:', error);
    return Response.json({ message: 'Failed to generate export' }, { status: 500 });
  }
}
