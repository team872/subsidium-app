import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getCandidatureProjetId, isOwner, decideCandidature } from "@/lib/projetsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const candId = Number(params.id);
  const c = await getCandidatureProjetId(candId);
  if (!c || !(await isOwner(c.projet_id, uid))) return NextResponse.json({ error: "Réservé au porteur du projet." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  try {
    await decideCandidature(candId, !!b.approve);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Décision impossible." }, { status: 500 });
  }
}
