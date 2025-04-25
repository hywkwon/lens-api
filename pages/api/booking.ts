// 📁 pages/api/booking.ts
import { NextApiRequest, NextApiResponse } from "next"

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  const { method } = req

  if (method === "POST") {
    const { user_name, email, phone, store_id, visit_date, visit_time, request_note } = req.body

    if (!user_name || !email || !phone || !store_id || !visit_date || !visit_time) {
      return res.status(400).json({ error: "Missing required fields" })
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
    })

    const data = await insertRes.json()

    if (!insertRes.ok) {
      console.error("❌ Failed to insert booking:", data)
      return res.status(500).json({ message: "Failed to insert booking", detail: data })
    }

    try {
      const sheetRes = await fetch("https://script.google.com/macros/s/AKfycbyQtVuRpPasZiHKG-8ZSOqQbglFNqW1nb2tLDXWd2Ym3DtElXbGQcdub9jNkFK8uz4KHA/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, email, phone, visit_date, visit_time, request_note, store_id }),
      })
      const sheetText = await sheetRes.text()
      console.log("✅ Google Sheets response:", sheetText)
    } catch (err) {
      console.error("❌ Google Sheets 전송 실패:", err)
    }

    return res.status(200).json({ success: true, data })
  }

  if (method === "GET") {
    const email = req.query.email as string
    if (!email) return res.status(400).json({ message: "Email is required" })

    const fetchRes = await fetch(`${supabaseUrl}/rest/v1/bookings?email=eq.${email}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    const data = await fetchRes.json()
    if (!fetchRes.ok) {
      console.error("❌ Failed to fetch bookings:", data)
      return res.status(500).json({ message: "Failed to fetch bookings" })
    }

    return res.status(200).json({ data })
  }

  if (method === "DELETE") {
    const { id } = req.body
    if (!id) return res.status(400).json({ message: "ID is required" })

    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq."${id}"`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
    })

    const detail = await deleteRes.text()

    if (!deleteRes.ok) {
      console.error("❌ Supabase DELETE failed:", detail)
      return res.status(500).json({ message: "Failed to cancel booking", detail })
    }

    console.log("✅ Supabase DELETE success for ID:", id)
    return res.status(200).json({ message: "Cancelled" })
  }

  return res.status(405).json({ message: "Method Not Allowed" })
}
