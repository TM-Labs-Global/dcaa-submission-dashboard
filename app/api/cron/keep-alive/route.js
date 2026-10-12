import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

    // 2. Ping the Supabase REST API (resets the REST inactivity timer)
    const { error: supabaseError } = await supabase
      .from('applications')
      .select('id')
      .limit(1);

    if (supabaseError) {
      console.error('CRON SUPABASE REST ERROR:', supabaseError);
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }

    // 3. Ping the Postgres connection directly via Drizzle (resets the DB inactivity timer)
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase keep-alive ping successful (REST + Postgres)',
      timestamp: new Date().toISOString() 
    }, { status: 200 });
  } catch (err) {
    console.error('CRON ROUTE ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
