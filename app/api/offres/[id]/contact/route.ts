import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { getOffre, createContact } from "@/lib/marketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const u = await getUserPublic(uid);
    if (!u || u.niveau < 2) {
      return NextResponse.json({ error: "Réservé aux Initiateurs." }, { status: 403 });
    }
    const offre = await getOffre(Number(params.id));
    if (!offre) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    const b = await req.json().catch(() => ({}));
    const message = String(b.message || "").trim();
    if (!message) return NextResponse.json({ error: "Un message est requis." }, { status: 400 });
    await createContact(Number(params.id), uid, {
      nom: String(b.nom || u.nom || "").trim(),
      prenom: String(b.prenom || u.prenom || "").trim(),
      email: String(b.email || u.email || "").trim(),
      message,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}
