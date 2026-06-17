import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { userStats } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ suivies: 0, emises: 0 });
    return NextResponse.json(await userStats(uid));
  } catch {
    return NextResponse.json({ suivies: 0, emises: 0 });
  }
}
