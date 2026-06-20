import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  try {
    await markNotificationsRead(uid);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Action impossible." }, { status: 500 });
  }
}
