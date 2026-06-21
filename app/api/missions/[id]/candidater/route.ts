import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic, displayName } from "@/lib/data";
import { getMission, createCandidature } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const u = await getUserPublic(uid);
    if (!u || u.niveau < 2) {
      return NextResponse.json({ error: "Réservé aux Initiateurs (auto-évaluation requise)." }, { status: 403 });
    }
    const id = Number(params.id);
    const mission = await getMission(id);
    if (!mission) return NextResponse.json({ error: "Mission introuvable." }, { status: 404 });

    const b = await req.json().catch(() => ({}));
    const presentation = String(b.presentation || "").trim();
    if (!presentation) return NextResponse.json({ error: "Une présentation est requise." }, { status: 400 });
    const nom = String(b.nom || u.nom || "").trim();
    const prenom = String(b.prenom || u.prenom || "").trim();
    const email = String(b.email || u.email || "").trim();

    const created = await createCandidature(id, uid, { nom, prenom, email, presentation });
    if (!created) return NextResponse.json({ error: "Vous avez déjà candidaté à cette mission." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Candidature impossible pour le moment." }, { status: 500 });
  }
}
