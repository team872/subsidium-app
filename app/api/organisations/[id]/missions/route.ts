import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { listOrgMissions, createMissionForOrg } from "@/lib/missionsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const orgId = Number(params.id);
  if (!uid || !(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  try {
    return NextResponse.json({ missions: await listOrgMissions(orgId) });
  } catch {
    return NextResponse.json({ missions: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const orgId = Number(params.id);
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const title = (b.title || "").trim();
  if (!title) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  const type = ["Bénévolat", "CDI", "CDD"].includes(b.type) ? b.type : "Bénévolat";
  try {
    const id = await createMissionForOrg(orgId, uid, {
      type, title, desc: (b.desc || "").trim(), profil: (b.profil || "").trim(),
      location: (b.location || "").trim(), date: (b.date || "").trim(),
    });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
