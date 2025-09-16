import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const WAN_API = process.env.WAN_API_URL!;
  const r = await fetch(`${WAN_API}/result/${params.id}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `inline; filename="${params.id}.mp4"`,
      "Cache-Control": "no-store",
    },
  });
}
