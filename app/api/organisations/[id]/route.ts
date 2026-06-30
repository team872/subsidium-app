import { NextRequest, NextResponse } from "next/server";
import { getOrganisation } from "@/lib/orgData";
import { isRestrictedVisitor } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Visiteur non payé : fiche détaillée verrouillée (mur d'adhésion).
    if (await isRestrictedVisitor()) {
      return NextResponse.json(
        { locked: true, error: "Adhérez à Subsidium pour accéder à la fiche complète." },
        { status: 403 }
      );
    }
    const org = await getOrganisation(Number(params.id));
    if (!org) return NextResponse.json({ error: "Organisation introuvable." }, { status: 404 });
    return NextResponse.json({ org });
  } catch {
    return NextResponse.json({ error: "Organisation indisponible." }, { status: 500 });
  }
}
