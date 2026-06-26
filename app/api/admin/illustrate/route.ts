import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { autoIllustrateEvents, autoIllustrateIdeas, autoIllustrateProjets, autoIllustrateOrgs, autoIllustrateOffres, autoIllustrateEnergie, autoIllustrateClubs, autoIllustrateLeaderSteps, pexelsConfigured } from "@/lib/cardImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Illustre automatiquement tous les contenus sans image via Pexels (admin).
export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  if (!pexelsConfigured()) return NextResponse.json({ configured: false });
  try {
    const events = await autoIllustrateEvents();
    const ideas = await autoIllustrateIdeas();
    const projets = await autoIllustrateProjets();
    const orgs = await autoIllustrateOrgs();
    const offres = await autoIllustrateOffres();
    const energie = await autoIllustrateEnergie();
    const clubs = await autoIllustrateClubs();
    const leaderSteps = await autoIllustrateLeaderSteps();
    return NextResponse.json({ configured: true, events, ideas, projets, orgs, offres, energie, clubs, leaderSteps });
  } catch {
    return NextResponse.json({ error: "Illustration impossible." }, { status: 500 });
  }
}
