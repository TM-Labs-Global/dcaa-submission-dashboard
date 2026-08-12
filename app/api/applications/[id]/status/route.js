import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(request, { params }) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || session.user?.status === 'pending' || session.user?.status === 'paused') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const allowedStatuses = ['pending', 'not_evaluated', 'shortlisted', 'rejected', 'hired'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // Update in Supabase
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
