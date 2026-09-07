import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // 1. Verify Vercel Cron authorization header if CRON_SECRET is configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cron attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Perform a minimal read query against Supabase to reset the 7-day inactivity timer
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .limit(1);

    if (error) {
      console.error('CRON SUPABASE ERROR:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase keep-alive ping successful', 
      timestamp: new Date().toISOString() 
    }, { status: 200 });
  } catch (err) {
    console.error('CRON ROUTE ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
