import { NextRequest, NextResponse } from "next/server";
import { findMatches, maillageGeo } from "@/lib/maillage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const matches = await findMatches(id, 5);
    const geo = await maillageGeo(id, matches);
    return NextResponse.json({ matches, geo });
  } catch {
    return NextResponse.json({ matches: [], geo: [] });
  }
}
