import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { listRgpdLog } from "@/lib/rgpd";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ log: [] }, { status: 401 });
  const me = await getUserPublic(uid);
  if (!me || !isAdmin(me.email)) return NextResponse.json({ log: [] }, { status: 403 });
  try {
    return NextResponse.json({ log: await listRgpdLog() });
  } catch {
    return NextResponse.json({ log: [] });
  }
}
