import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listOrganisations, createOrganisation, listOrganisationsVisitor, countOrganisationsLabellisees } from "@/lib/orgData";
import { isRestrictedVisitor, VISITOR_SAMPLE } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  try {
    // Visiteur non payé : uniquement quelques organisations officielles, sans détails exploitables.
    if (await isRestrictedVisitor()) {
      const [organisations, total] = await Promise.all([
        listOrganisationsVisitor(VISITOR_SAMPLE),
        countOrganisationsLabellisees(),
      ]);
      return NextResponse.json({ organisations, restricted: true, total });
    }
    return NextResponse.json({ organisations: await listOrganisations(true), restricted: false });
  } catch {
    return NextResponse.json({ error: "Annuaire indisponible." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  // Créer une organisation est réservé aux membres (adhésion réglée), pas aux visiteurs.
  if (await isRestrictedVisitor()) {
    return NextResponse.json({ error: "Réservé aux membres : finalisez votre adhésion." }, { status: 403 });
  }
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim();
  const type = String(b.type || "").trim();
  if (!name || !type) return NextResponse.json({ error: "Nom et type requis." }, { status: 400 });
  try {
    const id = await createOrganisation(uid, {
      name, type,
      region: String(b.region || "").trim(),
      desc: String(b.desc || "").trim(),
      adresse: String(b.adresse || "").trim(),
      telephone: String(b.telephone || "").trim(),
      email: String(b.email || "").trim(),
      site: String(b.site || "").trim(),
      image: b.image ? String(b.image).trim() || null : null,
    });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
