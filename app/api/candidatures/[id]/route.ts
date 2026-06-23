import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { getCandidatureMissionId, getMissionOrgId, setCandidatureStatut } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const candId = Number(params.id);
  const missionId = await getCandidatureMissionId(candId);
  const orgId = missionId ? await getMissionOrgId(missionId) : null;
  if (!orgId || !(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const statut = ["acceptee", "refusee", "en_attente"].includes(b.statut) ? b.statut : null;
  if (!statut) return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  try {
    await setCandidatureStatut(candId, statut);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
