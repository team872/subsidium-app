import { NextResponse } from "next/server";
import { orgsPoints } from "@/lib/mapData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pts = await orgsPoints();
    return NextResponse.json({ points: pts.map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, title: p.title, subtitle: p.subtitle, href: `/app/organisations/${p.id}` })) });
  } catch {
    return NextResponse.json({ points: [] });
  }
}
