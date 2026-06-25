import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { getAuditForOrg, requestAudit } from "@/lib/audits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ audit: await getAuditForOrg(Number(params.id)) });
  } catch {
    return NextResponse.json({ audit: null });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!(await isOrgMember(id, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const documents = (b.documents || "").trim();
  if (documents.length < 10) return NextResponse.json({ error: "Décrivez les justificatifs fournis (statuts, rapport d'activité, etc.)." }, { status: 400 });
  try {
    const audit = await requestAudit(id, uid, documents);
    return NextResponse.json({ ok: true, audit });
  } catch {
    return NextResponse.json({ error: "Demande impossible." }, { status: 500 });
  }
}
