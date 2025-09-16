import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const r = await fetch(`${process.env.WAN_API_URL}/jobs/${params.id}`, {
    cache: "no-store",
  });
  return NextResponse.json(await r.json(), { status: r.status });
}
