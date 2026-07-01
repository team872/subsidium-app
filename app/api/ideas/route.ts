import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listIdeas, createIdea, getUserPublic, displayName, listIdeasVisitor, countIdeasPubliques } from "@/lib/data";
import { isRestrictedVisitor, VISITOR_SAMPLE } from "@/lib/visitor";
import { CAT_COLOR } from "@/lib/feed";
import { geocode } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Visiteur non payé : uniquement quelques idées officielles (Subsidium), description tronquée.
    if (await isRestrictedVisitor()) {
      const [ideas, total] = await Promise.all([
        listIdeasVisitor(VISITOR_SAMPLE),
        countIdeasPubliques(),
      ]);
      return NextResponse.json({ ideas, restricted: true, total });
    }
    // L'utilisateur courant (s'il est connecté) enrichit chaque idée des drapeaux
    // « suivie » / « émise par moi » / « likée » (cf recette AN044/AN046/AN056/AN060).
    const uid = await getUserId();
    return NextResponse.json({ ideas: await listIdeas(uid ?? undefined), restricted: false });
  } catch {
    return NextResponse.json({ error: "Idées indisponibles." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const u = await getUserPublic(uid);
    // Proposer une idée est réservé aux Refondateurs et plus (niveau >= 1), par cohérence
    // avec la doctrine du parcours (peutProposerIdee) et avec la création de projets.
    if (!u || (u.niveau ?? 0) < 1) {
      return NextResponse.json({ error: "Réservé aux Refondateurs et plus." }, { status: 403 });
    }
    const b = await req.json();
    const title = String(b.title || "").trim();
    const desc = String(b.desc || "").trim();
    const cat = String(b.cat || "").trim();
    const location = String(b.location || "").trim() || null;
    const image = b.image ? String(b.image).trim() || null : null;
    // Brouillon (enregistré sans publier, recette AN053) ou idée publiée.
    const status = b.status === "brouillon" ? "brouillon" : "emise";
    if (!title || !desc || !cat) {
      return NextResponse.json({ error: "Titre, description et thématique requis." }, { status: 400 });
    }
    const author = displayName(u);
    const color = CAT_COLOR[cat] || "#E8A98F";
    // Géocodage best-effort du lieu pour la vue carte (dégradation silencieuse).
    const geo = location ? await geocode(location) : null;
    const idea = await createIdea({ cat, color, title, desc, author, authorId: uid, location, lat: geo?.lat ?? null, lon: geo?.lon ?? null, image, status });
    return NextResponse.json({ idea });
  } catch {
    return NextResponse.json({ error: "Création de l'idée impossible." }, { status: 500 });
  }
}
