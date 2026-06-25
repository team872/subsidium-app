import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { autoIllustrateEvents, autoIllustrateIdeas, pexelsConfigured } from "@/lib/cardImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Illustre automatiquement les événements et idées sans image via Pexels (admin).
export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  if (!pexelsConfigured()) return NextResponse.json({ configured: false, events: 0, ideas: 0 });
  try {
    const events = await autoIllustrateEvents();
    const ideas = await autoIllustrateIdeas();
    return NextResponse.json({ configured: true, events, ideas });
  } catch {
    return NextResponse.json({ error: "Illustration impossible." }, { status: 500 });
  }
}
