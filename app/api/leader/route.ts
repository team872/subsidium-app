import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { LEADER_STEPS, listProgress, getCertification } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ steps: LEADER_STEPS, done: [], certification: null });
  try {
    const [done, certification] = await Promise.all([listProgress(uid), getCertification(uid)]);
    return NextResponse.json({ steps: LEADER_STEPS, done, certification });
  } catch {
    return NextResponse.json({ steps: LEADER_STEPS, done: [], certification: null });
  }
}
