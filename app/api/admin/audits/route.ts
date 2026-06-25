import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { listPendingAudits } from "@/lib/audits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ audits: [] }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ audits: [] }, { status: 403 });
  try {
    return NextResponse.json({ audits: await listPendingAudits() });
  } catch {
    return NextResponse.json({ audits: [] });
  }
}
