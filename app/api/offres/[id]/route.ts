import { NextRequest, NextResponse } from "next/server";
import { getOffre } from "@/lib/marketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const offre = await getOffre(Number(params.id));
    if (!offre) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    return NextResponse.json({ offre });
  } catch {
    return NextResponse.json({ error: "Offre indisponible." }, { status: 500 });
  }
}
