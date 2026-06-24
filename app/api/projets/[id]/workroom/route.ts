import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getProjet, getMembership } from "@/lib/projetsData";
import { listTaches, listJalons, listDocs, listWrMembers, workroomStats } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Agrégat de l'espace de travail : réservé au porteur et aux contributeurs.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const projet = await getProjet(id);
  if (!projet) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  const role = await getMembership(id, uid);
  if (role !== "owner" && role !== "membre")
    return NextResponse.json({ error: "Espace réservé au porteur et aux contributeurs." }, { status: 403 });
  try {
    const [taches, jalons, docs, membres, stats] = await Promise.all([
      listTaches(id), listJalons(id), listDocs(id), listWrMembers(id), workroomStats(id),
    ]);
    return NextResponse.json({
      projet: { id: projet.id, title: projet.title, theme: projet.theme, lieu: projet.lieu, grad: projet.grad },
      role, isOwner: role === "owner", taches, jalons, docs, membres, stats,
    });
  } catch {
    return NextResponse.json({ error: "Espace de travail indisponible." }, { status: 500 });
  }
}
