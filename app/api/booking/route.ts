// app/api/booking/route.ts

import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sheetWebhook = "https://script.google.com/macros/s/AKfycbyQtVuRpPasZiHKG-8ZSOqQbglFNqW1nb2tLDXWd2Ym3DtElXbGQcdub9jNkFK8uz4KHA/exec";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { user_name, email, phone, store_id, visit_date, visit_time, request_note } = body;

  if (!user_name || !email || !phone || !store_id || !visit_date || !visit_time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      { user_name, email, phone, store_id, visit_date, visit_time, request_note },
    ]),
  });

  const data = await insertRes.json();

  if (!insertRes.ok) {
    console.error("❌ Failed to insert booking:", data);
    return NextResponse.json({ message: "Failed to insert booking", detail: data }, { status: 500 });
  }

  try {
    await fetch(sheetWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name, email, phone, visit_date, visit_time, request_note, store_id }),
    });
  } catch (err) {
    console.error("❌ Google Sheets 전송 실패:", err);
  }

  return NextResponse.json({ success: true, data });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/bookings?email=eq.${email}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const data = await fetchRes.json();

  if (!fetchRes.ok) {
    console.error("❌ Failed to fetch bookings:", data);
    return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  console.log("📥 DELETE method triggered");

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  const deleteRes = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
  });

  const detail = await deleteRes.text();
  console.log("🧾 Supabase DELETE response:", detail);

  if (!deleteRes.ok) {
    console.error("❌ Supabase DELETE failed:", detail);
    return NextResponse.json({ message: "Failed to cancel booking", detail }, { status: 500 });
  }

  console.log("✅ Supabase DELETE success for ID:", id);
  return NextResponse.json({ message: "Cancelled" });
}
