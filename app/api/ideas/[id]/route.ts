import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getIdea, listComments, isFollowing, updateIdea } from "@/lib/data";
import { getIdeaProjet } from "@/lib/projetsData";
import { CAT_COLOR } from "@/lib/feed";
import { geocode } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    const uid = await getUserId();
    const idea = await getIdea(id, uid ?? undefined);
    if (!idea) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    // Un brouillon n'est consultable que par son auteur (recette AN053).
    if (idea.status === "brouillon" && !idea.mine) {
      return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    }
    const comments = await listComments(id);
    const following = uid ? await isFollowing(uid, id) : false;
    // Passerelle : si l'idée a déjà été portée en projet, on expose le lien.
    const projetId = await getIdeaProjet(id);
    return NextResponse.json({ idea: { ...idea, projet_id: projetId }, comments, following });
  } catch {
    return NextResponse.json({ error: "Idée indisponible." }, { status: 500 });
  }
}

// Édition d'une idée — réservée à l'auteur et au statut « brouillon » (recette AN061).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Idée introuvable." }, { status: 400 });
    const b = await req.json();
    const title = String(b.title || "").trim();
    const desc = String(b.desc || "").trim();
    const cat = String(b.cat || "").trim();
    const location = String(b.location || "").trim() || null;
    const image = b.image ? String(b.image).trim() || null : null;
    const publish = !!b.publish;
    if (!title || !desc || !cat) {
      return NextResponse.json({ error: "Titre, description et thématique requis." }, { status: 400 });
    }
    const color = CAT_COLOR[cat] || "#E8A98F";
    const geo = location ? await geocode(location) : null;
    const updated = await updateIdea(
      id, uid,
      { cat, color, title, desc, location, lat: geo?.lat ?? null, lon: geo?.lon ?? null, image },
      publish
    );
    if (!updated) {
      return NextResponse.json({ error: "Modification impossible : seuls vos brouillons sont modifiables." }, { status: 403 });
    }
    return NextResponse.json({ idea: updated });
  } catch {
    return NextResponse.json({ error: "Modification impossible pour le moment." }, { status: 500 });
  }
}
