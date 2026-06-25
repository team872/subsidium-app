import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { pexelsSearch, pexelsConfigured } from "@/lib/cardImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recherche de photos libres de droit (Pexels). Réservé aux utilisateurs connectés.
export async function GET(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ photos: [], configured: pexelsConfigured() }, { status: 401 });
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  try {
    const photos = await pexelsSearch(q, 12);
    return NextResponse.json({ photos, configured: pexelsConfigured() });
  } catch {
    return NextResponse.json({ photos: [], configured: pexelsConfigured() });
  }
}
