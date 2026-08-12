import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function formatLinks(userInputs) {
  return Object.entries(userInputs)
    .filter(([key, val]) => key.startsWith('url') && val)
    .map(([_, val]) => val)
    .join(" | ");
}

function toCsv(applications) {
  const headers = [
    "Name",
    "Email",
    "Country",
    "Phone",
    "Stream",
    "Status",
    "Occupation",
    "Have you acted in vertical/mobile video format before?",
    "Years of Acting Experience",
    "Submission Date",
    "Links / Portfolios",
    "Image Upload"
  ];

  const rows = applications.map((app) => {
    const raw = app.raw_data || {};
    const userInputs = raw.__submission?.user_inputs || {};
    
    let name = "N/A";
    if (userInputs.names) {
      name = userInputs.names;
    } else if (raw.names) {
      name = `${raw.names.first_name || ''} ${raw.names.last_name || ''}`.trim();
    } else if (raw.first_name) {
      name = raw.first_name;
    }

    const email = app.email || raw.email || "N/A";
    const country = userInputs['country-list'] || raw['country-list'] || "N/A";
    const phone = userInputs.phone_1 || raw.phone_1 || "N/A";
    const occupation = userInputs.input_text || raw.input_text || "N/A";
    const stream = userInputs.input_radio || raw.input_radio || "N/A";
    const status = app.status || "pending";
    
    const actedBefore = userInputs.input_radio_1 || "N/A";
    const actingExperience = userInputs.input_text_1 || "N/A";
    const created_at = app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : "N/A";

    const submittedLinks = formatLinks(userInputs);
    const imageUpload = userInputs['image-upload'] || "N/A";

    return [
      name,
      email,
      country,
      phone,
      stream,
      status,
      occupation,
      actedBefore,
      actingExperience,
      created_at,
      submittedLinks,
      imageUpload
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

async function toXlsx(applications) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('DCAA Applications');

  sheet.columns = [
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Country', key: 'country', width: 15 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Stream', key: 'stream', width: 25 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Occupation', key: 'occupation', width: 20 },
    { header: 'Have you acted in vertical/mobile video format before?', key: 'actedBefore', width: 45 },
    { header: 'Years of Acting Experience', key: 'actingExperience', width: 25 },
    { header: 'Submission Date', key: 'submissionDate', width: 18 },
    { header: 'Links / Portfolios', key: 'links', width: 40 },
    { header: 'Image Upload', key: 'imageUpload', width: 40 },
  ];

  sheet.getRow(1).font = { bold: true };

  applications.forEach((app) => {
    const raw = app.raw_data || {};
    const userInputs = raw.__submission?.user_inputs || {};
    
    let name = "N/A";
    if (userInputs.names) {
      name = userInputs.names;
    } else if (raw.names) {
      name = `${raw.names.first_name || ''} ${raw.names.last_name || ''}`.trim();
    } else if (raw.first_name) {
      name = raw.first_name;
    }

    const email = app.email || raw.email || "N/A";
    const country = userInputs['country-list'] || raw['country-list'] || "N/A";
    const phone = userInputs.phone_1 || raw.phone_1 || "N/A";
    const occupation = userInputs.input_text || raw.input_text || "N/A";
    const stream = userInputs.input_radio || raw.input_radio || "N/A";
    const status = app.status || "pending";
    
    const actedBefore = userInputs.input_radio_1 || "N/A";
    const actingExperience = userInputs.input_text_1 || "N/A";
    const created_at = app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : "N/A";

    const submittedLinks = formatLinks(userInputs);
    const imageUpload = userInputs['image-upload'] || "N/A";

    sheet.addRow({
      name,
      email,
      country,
      phone,
      stream,
      status,
      occupation,
      actedBefore,
      actingExperience,
      submissionDate: created_at,
      links: submittedLinks,
      imageUpload: imageUpload
    });
  });

  return workbook.xlsx.writeBuffer();
}

export async function GET(request) {
  const session = await auth();

  if (!session || session.user?.status === 'pending' || session.user?.status === 'paused') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stream = searchParams.get('stream') || 'all';
  const format = searchParams.get('format') || 'csv';
  const subStream = searchParams.get('subStream') || 'all';
  const statusParam = searchParams.get('status') || 'all';
  const searchQuery = searchParams.get('searchQuery');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  try {
    const { data: allApplications, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let filteredApplications = allApplications;

    // Filter by main stream
    if (stream !== 'all') {
      filteredApplications = filteredApplications.filter((app) => {
        const raw = app.raw_data || {};
        const userInputs = raw.__submission?.user_inputs || {};
        const s = userInputs.input_radio || raw.input_radio;
        return s === stream;
      });
    }

    // Filter by subStream (only when in "all" streams view)
    if (stream === 'all' && subStream !== 'all') {
      filteredApplications = filteredApplications.filter((app) => {
        const raw = app.raw_data || {};
        const userInputs = raw.__submission?.user_inputs || {};
        const s = userInputs.input_radio || raw.input_radio;
        return s === subStream;
      });
    }

    // Filter by Name (Search)
    if (stream === 'all' && searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredApplications = filteredApplications.filter((app) => {
        const raw = app.raw_data || {};
        const userInputs = raw.__submission?.user_inputs || {};
        let name = "N/A";
        if (userInputs.names) {
          name = userInputs.names;
        } else if (raw.names) {
          name = `${raw.names.first_name || ''} ${raw.names.last_name || ''}`.trim();
        } else if (raw.first_name) {
          name = raw.first_name;
        }
        return name.toLowerCase().includes(query);
      });
    }

    // Filter by Date Range
    if (dateFrom) {
      const start = new Date(dateFrom).setHours(0, 0, 0, 0);
      const end = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : new Date(dateFrom).setHours(23, 59, 59, 999);
      
      filteredApplications = filteredApplications.filter((app) => {
        const appDate = new Date(app.created_at).getTime();
        return appDate >= start && appDate <= end;
      });
    }

    // Filter by Status
    if (statusParam !== 'all') {
      filteredApplications = filteredApplications.filter((app) => {
        const appStatus = app.status || "pending";
        if (statusParam === "not_evaluated") return appStatus === "pending" || appStatus === "not_evaluated";
        return appStatus === statusParam;
      });
    }

    const streamSuffix = stream === 'all' ? '_all_streams' : `_${stream.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const statusSuffix = statusParam === 'all' ? '' : `_${statusParam}`;
    const filename = `dcaa_applications${streamSuffix}${statusSuffix}`;

    if (format === 'xlsx') {
      const buffer = await toXlsx(filteredApplications);
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

    const csv = toCsv(filteredApplications);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error) {
    console.error('Applications export API error:', error);
    return Response.json({ message: 'Failed to generate export' }, { status: 500 });
  }
}
