import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership } from "@/lib/projetsData";
import { deleteDoc, getDocProjet } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; did: string } }) {
  const id = Number(params.id), did = Number(params.did);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const role = await getMembership(id, uid);
  if (role !== "owner" && role !== "membre") return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if ((await getDocProjet(did)) !== id) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  await deleteDoc(did);
  return NextResponse.json({ ok: true });
}
