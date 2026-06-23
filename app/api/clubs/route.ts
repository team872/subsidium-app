import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { listClubs, createClub } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ clubs: await listClubs() });
  } catch {
    return NextResponse.json({ clubs: [] });
  }
}

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || (u.niveau ?? 0) < 3) return NextResponse.json({ error: "Réservé aux Leaders certifiés (N3)." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const name = (b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Le nom du club est requis." }, { status: 400 });
  try {
    const id = await createClub(uid, { name, theme: (b.theme || "").trim(), descr: (b.descr || "").trim() });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
