import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { requestCertification, getCertification } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const r = await requestCertification(uid);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true, certification: await getCertification(uid) });
}
