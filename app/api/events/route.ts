import { NextRequest, NextResponse } from "next/server";
import { listEvents, getUserPublic, listEventsVisitor, countEvents } from "@/lib/data";
import { getUserId } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { isRestrictedVisitor, VISITOR_SAMPLE } from "@/lib/visitor";
import { createActualite } from "@/lib/actualites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Visiteur non payé : aperçu limité des actualités/événements (contenu officiel Subsidium).
    if (await isRestrictedVisitor()) {
      const [events, total] = await Promise.all([
        listEventsVisitor(VISITOR_SAMPLE * 2),
        countEvents(),
      ]);
      return NextResponse.json({ events, restricted: true, total });
    }
    return NextResponse.json({ events: await listEvents(), restricted: false });
  } catch {
    return NextResponse.json({ error: "Événements indisponibles." }, { status: 500 });
  }
}

// Publication d'une actualité / événement — réservée à l'équipe SUBSIDIUM (admin) en V1.
export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const title = (b.title || "").trim();
  const desc = (b.desc || "").trim();
  const tag = (b.tag || "Nouveauté").trim();
  const image = b.image ? String(b.image).trim() || null : null;
  const day = (b.day || "").toString().trim() || null;
  const month = (b.month || "").toString().trim() || null;
  if (!title || !desc) return NextResponse.json({ error: "Titre et contenu requis." }, { status: 400 });
  try {
    const id = await createActualite({ tag, title, desc, source: (b.source || "").trim() || "SUBSIDIUM", authorId: uid, image, day, month });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
