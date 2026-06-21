import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listMyCandidatures } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: await listMyCandidatures(uid) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
