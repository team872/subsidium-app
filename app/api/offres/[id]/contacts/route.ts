import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOrgMember } from "@/lib/orgData";
import { listContacts, getOffreOrgId } from "@/lib/marketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const offreId = Number(params.id);
  const orgId = await getOffreOrgId(offreId);
  if (!uid || !orgId || !(await isOrgMember(orgId, uid))) return NextResponse.json({ error: "Réservé aux membres de l'organisation émettrice." }, { status: 403 });
  try {
    return NextResponse.json({ contacts: await listContacts(offreId) });
  } catch {
    return NextResponse.json({ contacts: [] });
  }
}
