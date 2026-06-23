import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin, setNiveau } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const niveau = Number(b.niveau);
  if (!Number.isInteger(niveau) || niveau < 0 || niveau > 4) {
    return NextResponse.json({ error: "Niveau invalide (0 à 4)." }, { status: 400 });
  }
  try {
    const user = await setNiveau(Number(params.id), niveau);
    if (!user) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
