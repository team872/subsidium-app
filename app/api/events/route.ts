import { NextRequest, NextResponse } from "next/server";
import { listEvents, getUserPublic } from "@/lib/data";
import { getUserId } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { createActualite } from "@/lib/actualites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ events: await listEvents() });
  } catch {
    return NextResponse.json({ error: "Événements indisponibles." }, { status: 500 });
  }
}

// Publication d'une actualité — réservée à l'équipe SUBSIDIUM (admin) en V1.
export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const title = (b.title || "").trim();
  const desc = (b.desc || "").trim();
  const tag = (b.tag || "Nouveauté").trim();
  if (!title || !desc) return NextResponse.json({ error: "Titre et contenu requis." }, { status: 400 });
  try {
    const id = await createActualite({ tag, title, desc, source: (b.source || "").trim() || "SUBSIDIUM", authorId: uid });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
