import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { toggleLike } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Soutenir / retirer le soutien (« j'aime ») d'une idée — ouvert à tous les profils connectés (recette AN056).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const ideaId = Number(params.id);
    if (!Number.isInteger(ideaId)) return NextResponse.json({ error: "Idée introuvable." }, { status: 400 });
    const res = await toggleLike(uid, ideaId);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "Action impossible pour le moment." }, { status: 500 });
  }
}
