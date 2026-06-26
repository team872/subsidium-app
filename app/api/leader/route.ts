import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { LEADER_STEPS, listProgress, getCertification, getStepImages } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  try {
    const images = await getStepImages();
    const steps = LEADER_STEPS.map((s) => ({ ...s, image: images[s.key] || null }));
    if (!uid) return NextResponse.json({ steps, done: [], certification: null });
    const [done, certification] = await Promise.all([listProgress(uid), getCertification(uid)]);
    return NextResponse.json({ steps, done, certification });
  } catch {
    return NextResponse.json({ steps: LEADER_STEPS.map((s) => ({ ...s, image: null })), done: [], certification: null });
  }
}
