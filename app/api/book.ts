import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_name, email, phone, store_id, visit_date, visit_time, request_note } = req.body;

  if (!user_name || !email || !phone || !store_id || !visit_date || !visit_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ user_name, email, phone, store_id, visit_date, visit_time, request_note }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true, data });
}
