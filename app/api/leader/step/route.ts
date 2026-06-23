import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { toggleStep, listProgress } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const b = await req.json().catch(() => ({} as any));
  if (!b.key) return NextResponse.json({ error: "Étape manquante." }, { status: 400 });
  try {
    await toggleStep(uid, String(b.key), !!b.done);
    return NextResponse.json({ ok: true, done: await listProgress(uid) });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
