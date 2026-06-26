import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { autoIllustrateEvents, autoIllustrateIdeas, autoIllustrateProjets, autoIllustrateOrgs, autoIllustrateOffres, pexelsConfigured } from "@/lib/cardImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Illustre automatiquement événements, idées, projets, organisations et offres sans image via Pexels (admin).
export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  if (!pexelsConfigured()) return NextResponse.json({ configured: false, events: 0, ideas: 0, projets: 0, orgs: 0, offres: 0 });
  try {
    const events = await autoIllustrateEvents();
    const ideas = await autoIllustrateIdeas();
    const projets = await autoIllustrateProjets();
    const orgs = await autoIllustrateOrgs();
    const offres = await autoIllustrateOffres();
    return NextResponse.json({ configured: true, events, ideas, projets, orgs, offres });
  } catch {
    return NextResponse.json({ error: "Illustration impossible." }, { status: 500 });
  }
}
