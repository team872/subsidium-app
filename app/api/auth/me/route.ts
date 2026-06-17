import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ user: null });
    return NextResponse.json({ user: await getUserPublic(uid) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
