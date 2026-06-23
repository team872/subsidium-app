import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { listCandidatures, getMissionOrgId } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const missionId = Number(params.id);
  const orgId = await getMissionOrgId(missionId);
  if (!uid || !orgId || !(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation émettrice." }, { status: 403 });
  try {
    return NextResponse.json({ candidatures: await listCandidatures(missionId) });
  } catch {
    return NextResponse.json({ candidatures: [] });
  }
}
