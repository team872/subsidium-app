import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { updateActualite, deleteActualite, getActualite } from "@/lib/actualites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guardAdmin() {
  const uid = await getUserId();
  if (!uid) return 401 as const;
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return 403 as const;
  return 200 as const;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const code = await guardAdmin();
  if (code !== 200) return NextResponse.json({ error: "Non autorisé." }, { status: code });
  const id = Number(params.id);
  if (!(await getActualite(id))) return NextResponse.json({ error: "Actualité introuvable." }, { status: 404 });
  const b = await req.json().catch(() => ({} as any));
  await updateActualite(id, { tag: b.tag, title: b.title, desc: b.desc, source: b.source });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const code = await guardAdmin();
  if (code !== 200) return NextResponse.json({ error: "Non autorisé." }, { status: code });
  const id = Number(params.id);
  await deleteActualite(id);
  return NextResponse.json({ ok: true });
}
