import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const WAN_API = process.env.WAN_API_URL!;
  const r = await fetch(`${WAN_API}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await r.json();
  return NextResponse.json(json, { status: r.status });
}
