export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const r = await fetch(`${process.env.WAN_API_URL}/result/${params.id}`, {
    cache: "no-store",
  });
  const buf = await r.arrayBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `inline; filename="${params.id}.mp4"`,
      "Cache-Control": "no-store",
    },
  });
}
