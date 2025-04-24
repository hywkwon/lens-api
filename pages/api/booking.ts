// 📁 pages/api/bookings.ts
import { NextApiRequest, NextApiResponse } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const fetchRes = await fetch(`${supabaseUrl}/rest/v1/bookings?email=eq.${email}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const data = await fetchRes.json();
    if (!fetchRes.ok) return res.status(500).json({ message: "Failed to fetch bookings" });

    return res.status(200).json({ data });
  }

  if (method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "ID is required" });

    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
    });

    if (!deleteRes.ok) return res.status(500).json({ message: "Failed to cancel booking" });

    return res.status(200).json({ message: "Cancelled" });
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
