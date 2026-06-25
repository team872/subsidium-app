import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { anonymizeUser, logRgpd } from "@/lib/rgpd";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const me = await getUserPublic(uid);
  if (!me || !isAdmin(me.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  const target = Number(params.id);
  if (target === uid) return NextResponse.json({ error: "Vous ne pouvez pas anonymiser votre propre compte ici." }, { status: 400 });
  const tu = await getUserPublic(target);
  const email = tu?.email || "";
  try {
    await anonymizeUser(target);
    await logRgpd(uid, me.email, "anonymisation", target, email).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Anonymisation impossible." }, { status: 500 });
  }
}
