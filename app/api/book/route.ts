// app/api/book/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const { user_name, email, phone, store_id, visit_date, visit_time, request_note } = body;

  if (!user_name || !email || !phone || !store_id || !visit_date || !visit_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ user_name, email, phone, store_id, visit_date, visit_time, request_note }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 200 });
}
