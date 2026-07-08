import { auth } from '@/lib/auth';
import { getFormStats } from '@/lib/statsQuery';
import ExcelJS from 'exceljs';

export const maxDuration = 60;

function defaultDateRange() {
  const dateTo = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 29);
  const dateFrom = fromDate.toISOString().slice(0, 10);
  return { dateFrom, dateTo };
}

function toCsv(formName, daily) {
  const headers = ['Date', 'Sign-ups'];
  const rows = daily.map((row) => [row.date, row.signups]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

async function toXlsx(formName, daily) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sign-ups');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Sign-ups', key: 'signups', width: 12 },
  ];

  sheet.getRow(1).font = { bold: true };

  daily.forEach((row) => {
    sheet.addRow({ date: row.date, signups: row.signups });
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
  const defaults = defaultDateRange();
  const dateFrom = searchParams.get('dateFrom') || defaults.dateFrom;
  const dateTo = searchParams.get('dateTo') || defaults.dateTo;
  const format = searchParams.get('format') || 'csv';

  if (!formId) {
    return Response.json({ message: 'formId is required for export' }, { status: 400 });
  }

  try {
    const stats = await getFormStats(formId, dateFrom, dateTo);

    if (stats.error) {
      return Response.json({ message: 'Failed to fetch form data for export' }, { status: 500 });
    }

    const filenameBase = `${stats.formName.replace(/\s+/g, '_')}_${dateFrom}_to_${dateTo}`;

    if (format === 'xlsx') {
      const buffer = await toXlsx(stats.formName, stats.daily);
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }

    const csv = toCsv(stats.formName, stats.daily);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return Response.json({ message: 'Failed to generate export' }, { status: 500 });
  }
}
