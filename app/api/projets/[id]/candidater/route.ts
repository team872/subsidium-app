import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { candidater } from "@/lib/projetsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || (u.niveau ?? 0) < 2) return NextResponse.json({ error: "Réservé aux Initiateurs et plus." }, { status: 403 });
  const id = Number(params.id);
  const b = await req.json().catch(() => ({} as any));
  const f = { nom: (b.nom || "").trim(), prenom: (b.prenom || "").trim(), email: (b.email || "").trim(), presentation: (b.presentation || "").trim() };
  try {
    const ok = await candidater(id, uid, f);
    return NextResponse.json({ ok, deja: !ok });
  } catch {
    return NextResponse.json({ error: "Candidature impossible." }, { status: 500 });
  }
}
