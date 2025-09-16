import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${process.env.WAN_API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return NextResponse.json(await r.json(), { status: r.status });
}
