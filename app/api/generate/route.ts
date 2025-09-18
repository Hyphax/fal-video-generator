// app/api/wan/generate/route.ts
import { NextResponse } from "next/server";

function round16(n: number) {
  return Math.max(16, Math.round(n / 16) * 16);
}

export async function POST(req: Request) {
  const WAN = process.env.WAN_API_URL?.replace(/\/$/, "");
  if (!WAN) {
    return NextResponse.json({ error: "WAN_API_URL missing" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({} as any));
  let {
    prompt = "",
    width = 960,
    height = 544,
    steps = 24,
    guidance_scale = 4.0,
    fps = 24,
    seconds = 8,
    num_frames,
  } = body;

  // defaults / safety
  width = round16(width);
  height = round16(height);

  if (!num_frames) num_frames = seconds * fps + 1;
  // WAN needs (num_frames - 1) % 4 === 0
  if ((num_frames - 1) % 4 !== 0) {
    num_frames = Math.max(5, Math.round((num_frames - 1) / 4) * 4 + 1);
  }
  // keep within a safe ceiling for A100 80GB at 960x544
  num_frames = Math.min(num_frames, 193);

  const payload = { prompt, width, height, num_frames, steps, guidance_scale };

  const r = await fetch(`${WAN}/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.ok ? 200 : r.status || 500 });
}
