// api/flights.js
const API_KEY  = process.env.APIDEVOOS_KEY || "";
const BASE_URL = "https://app.apidevoos.dev/api/v1";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!API_KEY) return res.status(500).json({ error: "API key não configurada." });
  try {
    const upstream = await fetch(`${BASE_URL}/flights/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}
