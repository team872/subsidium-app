import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listPublications, createPublication, isOrgMember } from "@/lib/orgData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ publications: await listPublications(Number(params.id)) });
  } catch {
    return NextResponse.json({ publications: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const orgId = Number(params.id);
  if (!(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const titre = (b.titre || "").trim();
  if (!titre) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  try {
    const id = await createPublication(orgId, uid, b.kind, titre, (b.corps || "").trim());
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
