import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { porterIdeeEnProjet } from "@/lib/projetsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// « Porter ce projet » : transforme une idée (opportunité) en projet + Work Room.
// Acte d'Initiateur (niveau >= 2), cf doctrine SUBSIDIUM (Opportunité => Projet => Work Room).
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || (u.niveau ?? 0) < 2) {
    return NextResponse.json({ error: "Réservé aux Initiateurs et plus." }, { status: 403 });
  }
  const ideaId = Number(params.id);
  if (!Number.isInteger(ideaId)) return NextResponse.json({ error: "Idée introuvable." }, { status: 400 });
  try {
    const res = await porterIdeeEnProjet(uid, ideaId);
    if (!res) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, projetId: res.projetId, already: res.already });
  } catch {
    return NextResponse.json({ error: "Transformation impossible pour le moment." }, { status: 500 });
  }
}
