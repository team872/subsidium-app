import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getProjet, getMembership, isOwner, listMembers, listPosts, hasCandidated } from "@/lib/projetsData";
import { isRestrictedVisitor } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    // Visiteur non payé : détail d'un projet verrouillé (mur d'adhésion).
    if (await isRestrictedVisitor()) {
      return NextResponse.json(
        { locked: true, error: "Adhérez à Subsidium pour consulter le détail d'un projet." },
        { status: 403 }
      );
    }
    const projet = await getProjet(id);
    if (!projet) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    const uid = await getUserId();
    const role = uid ? await getMembership(id, uid) : null;
    const owner = !!role && role === "owner";
    const lie = !!role; // suiveur / membre / owner
    if (projet.prive && !lie) {
      return NextResponse.json({ projet: { ...projet, desc: "" }, restricted: true, role: null, isOwner: false, hasCandidated: false, members: [], posts: [] });
    }
    const [members, posts, cand] = await Promise.all([
      listMembers(id),
      listPosts(id),
      uid ? hasCandidated(id, uid) : Promise.resolve(false),
    ]);
    return NextResponse.json({ projet, restricted: false, role, isOwner: owner, hasCandidated: cand, members, posts });
  } catch {
    return NextResponse.json({ error: "Projet indisponible." }, { status: 500 });
  }
}
