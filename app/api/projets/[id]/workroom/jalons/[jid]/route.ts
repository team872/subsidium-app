import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership } from "@/lib/projetsData";
import { toggleJalon, deleteJalon, getJalonProjet } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guardOwner(id: number, jid: number) {
  const uid = await getUserId();
  if (!uid) return 401 as const;
  const role = await getMembership(id, uid);
  if (role !== "owner") return 403 as const;
  if ((await getJalonProjet(jid)) !== id) return 404 as const;
  return 200 as const;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; jid: string } }) {
  const id = Number(params.id), jid = Number(params.jid);
  const code = await guardOwner(id, jid);
  if (code !== 200) return NextResponse.json({ error: "Action impossible." }, { status: code });
  const b = await req.json().catch(() => ({} as any));
  await toggleJalon(jid, !!b.fait);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; jid: string } }) {
  const id = Number(params.id), jid = Number(params.jid);
  const code = await guardOwner(id, jid);
  if (code !== 200) return NextResponse.json({ error: "Action impossible." }, { status: code });
  await deleteJalon(jid);
  return NextResponse.json({ ok: true });
}
