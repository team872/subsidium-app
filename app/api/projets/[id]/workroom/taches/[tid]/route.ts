import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership } from "@/lib/projetsData";
import { updateTache, deleteTache, getTacheProjet } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard(id: number, tid: number) {
  const uid = await getUserId();
  if (!uid) return { code: 401 as const };
  const role = await getMembership(id, uid);
  if (role !== "owner" && role !== "membre") return { code: 403 as const };
  if ((await getTacheProjet(tid)) !== id) return { code: 404 as const };
  return { code: 200 as const };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; tid: string } }) {
  const id = Number(params.id), tid = Number(params.tid);
  const g = await guard(id, tid);
  if (g.code !== 200) return NextResponse.json({ error: "Action impossible." }, { status: g.code });
  const b = await req.json().catch(() => ({} as any));
  await updateTache(tid, {
    statut: b.statut,
    assignee_id: b.assignee_id === undefined ? undefined : (b.assignee_id ? Number(b.assignee_id) : null),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; tid: string } }) {
  const id = Number(params.id), tid = Number(params.tid);
  const g = await guard(id, tid);
  if (g.code !== 200) return NextResponse.json({ error: "Action impossible." }, { status: g.code });
  await deleteTache(tid);
  return NextResponse.json({ ok: true });
}
