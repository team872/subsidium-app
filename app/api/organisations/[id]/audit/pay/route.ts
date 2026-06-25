import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { getAuditForOrg, payAudit } from "@/lib/audits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Paiement de l'audit — SIMULÉ (le vrai Stripe sera branché ici plus tard).
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!(await isOrgMember(id, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation." }, { status: 403 });
  const a = await getAuditForOrg(id);
  if (!a || a.statut !== "a_payer") return NextResponse.json({ error: "Aucun audit en attente de paiement." }, { status: 400 });
  try {
    await payAudit(a.id);
    return NextResponse.json({ ok: true, audit: await getAuditForOrg(id) });
  } catch {
    return NextResponse.json({ error: "Paiement impossible." }, { status: 500 });
  }
}
