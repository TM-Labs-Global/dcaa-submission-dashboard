import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Fallback: If 'email' isn't explicitly named in formData, try to extract it from common names, otherwise null
    const userEmail = formData.email || formData.Email || formData.user_email || null;

    const { data, error } = await supabase
      .from('applications')
      .insert([
        { 
          email: userEmail,
          raw_data: formData,
          status: 'pending'
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('WEBHOOK ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
