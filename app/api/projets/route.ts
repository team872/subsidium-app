import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { listProjets, createProjet, listProjetsVisitor, countProjetsPublics } from "@/lib/projetsData";
import { isRestrictedVisitor, VISITOR_SAMPLE } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const uid = await getUserId();
  const filter = req.nextUrl.searchParams.get("filter") || "tous";
  try {
    // Visiteur non payé : uniquement quelques projets officiels (Subsidium), description tronquée.
    if (await isRestrictedVisitor()) {
      const [projets, total] = await Promise.all([
        listProjetsVisitor(VISITOR_SAMPLE),
        countProjetsPublics(),
      ]);
      return NextResponse.json({ projets, restricted: true, total });
    }
    return NextResponse.json({ projets: await listProjets(filter, uid), restricted: false });
  } catch {
    return NextResponse.json({ projets: [] });
  }
}

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || (u.niveau ?? 0) < 2) return NextResponse.json({ error: "Réservé aux Initiateurs et plus." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const title = (b.title || "").trim();
  if (!title) return NextResponse.json({ error: "Le titre du projet est requis." }, { status: 400 });
  try {
    const id = await createProjet(uid, { title, theme: (b.theme || "").trim(), desc: (b.desc || "").trim(), lieu: (b.lieu || "").trim(), prive: !!b.prive, image: b.image ? String(b.image).trim() || null : null });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
