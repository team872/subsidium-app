import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listMissions } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  try {
    return NextResponse.json({ missions: await listMissions() });
  } catch {
    return NextResponse.json({ error: "Missions indisponibles." }, { status: 500 });
  }
}
