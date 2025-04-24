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

  // ✅ Google Spreadsheet Webhook 전송
  try {
    await fetch("https://script.google.com/macros/s/AKfycbyQtVuRpPasZiHKG-8ZSOqQbglFNqW1nb2tLDXWd2Ym3DtElXbGQcdub9jNkFK8uz4KHA/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user_name,
        email,
        phone,
        store_id,
        visit_date,
        visit_time,
        request_note,
        created_at: new Date().toISOString(), // 스프레드시트용 생성시간
      }),
    });
  } catch (e) {
    console.error("❌ Failed to send to Google Sheet:", e);
    // 시트 전송 실패해도 예약 자체는 성공한 것으로 처리
  }

  return res.status(200).json({ success: true, data });
}
