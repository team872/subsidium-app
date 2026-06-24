import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership } from "@/lib/projetsData";
import { listJalons, createJalon } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ jalons: [] }, { status: 401 });
  const role = await getMembership(id, uid);
  if (role !== "owner" && role !== "membre") return NextResponse.json({ jalons: [] }, { status: 403 });
  return NextResponse.json({ jalons: await listJalons(id) });
}

// La feuille de route est gérée par le porteur du projet.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const role = await getMembership(id, uid);
  if (role !== "owner") return NextResponse.json({ error: "Seul le porteur gère la feuille de route." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const titre = (b.titre || "").trim();
  if (!titre) return NextResponse.json({ error: "Le titre du jalon est requis." }, { status: 400 });
  const jid = await createJalon(id, { titre, cible: b.cible || null });
  return NextResponse.json({ ok: true, id: jid });
}
