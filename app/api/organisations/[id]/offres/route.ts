import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { listOrgOffres, createOffreForOrg } from "@/lib/marketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const orgId = Number(params.id);
  if (!uid || !(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  try {
    return NextResponse.json({ offres: await listOrgOffres(orgId) });
  } catch {
    return NextResponse.json({ offres: [] });
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
  try {
    const id = await createOffreForOrg(orgId, uid, { title, desc: (b.desc || "").trim(), price: (b.price || "").trim() });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
