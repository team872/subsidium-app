import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMission, hasCandidated } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const mission = await getMission(id);
    if (!mission) return NextResponse.json({ error: "Mission introuvable." }, { status: 404 });
    const uid = await getUserId();
    const candidated = uid ? await hasCandidated(uid, id) : false;
    return NextResponse.json({ mission, candidated });
  } catch {
    return NextResponse.json({ error: "Mission indisponible." }, { status: 500 });
  }
}
