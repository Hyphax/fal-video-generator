import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const WAN_API = process.env.WAN_API_URL!;
  const r = await fetch(`${WAN_API}/jobs/${params.id}`, { cache: "no-store" });
  const json = await r.json();
  return NextResponse.json(json, { status: r.status });
}
