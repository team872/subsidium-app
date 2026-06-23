import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { follow, unfollow, getMembership } from "@/lib/projetsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || (u.niveau ?? 0) < 2) return NextResponse.json({ error: "Réservé aux Initiateurs et plus." }, { status: 403 });
  const id = Number(params.id);
  const b = await req.json().catch(() => ({} as any));
  try {
    if (b.suivre === false) await unfollow(id, uid);
    else await follow(id, uid);
    return NextResponse.json({ ok: true, role: await getMembership(id, uid) });
  } catch {
    return NextResponse.json({ error: "Action impossible." }, { status: 500 });
  }
}
