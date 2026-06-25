import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { decideAudit } from "@/lib/audits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  try {
    await decideAudit(Number(params.id), !!b.approve);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Action impossible." }, { status: 500 });
  }
}
