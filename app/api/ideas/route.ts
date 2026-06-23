import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listIdeas, createIdea, getUserPublic, displayName } from "@/lib/data";
import { CAT_COLOR } from "@/lib/feed";
import { geocode } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ ideas: await listIdeas() });
  } catch {
    return NextResponse.json({ error: "Idées indisponibles." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const b = await req.json();
    const title = String(b.title || "").trim();
    const desc = String(b.desc || "").trim();
    const cat = String(b.cat || "").trim();
    const location = String(b.location || "").trim() || null;
    if (!title || !desc || !cat) {
      return NextResponse.json({ error: "Titre, description et thématique requis." }, { status: 400 });
    }
    const u = await getUserPublic(uid);
    const author = u ? displayName(u) : "Citoyen";
    const color = CAT_COLOR[cat] || "#E8A98F";
    // Géocodage best-effort du lieu pour la vue carte (dégradation silencieuse).
    const geo = location ? await geocode(location) : null;
    const idea = await createIdea({ cat, color, title, desc, author, authorId: uid, location, lat: geo?.lat ?? null, lon: geo?.lon ?? null });
    return NextResponse.json({ idea });
  } catch {
    return NextResponse.json({ error: "Création de l'idée impossible." }, { status: 500 });
  }
}
