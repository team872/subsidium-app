import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership } from "@/lib/projetsData";
import { listTaches, createTache } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function collaborateur(id: number, uid: number) {
  const role = await getMembership(id, uid);
  return role === "owner" || role === "membre";
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ taches: [] }, { status: 401 });
  if (!(await collaborateur(id, uid))) return NextResponse.json({ taches: [] }, { status: 403 });
  return NextResponse.json({ taches: await listTaches(id) });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!(await collaborateur(id, uid))) return NextResponse.json({ error: "Réservé au porteur et aux contributeurs." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const titre = (b.titre || "").trim();
  if (!titre) return NextResponse.json({ error: "Le titre de la tâche est requis." }, { status: 400 });
  try {
    const tid = await createTache(id, uid, {
      titre, description: (b.description || "").trim(),
      assignee_id: b.assignee_id ? Number(b.assignee_id) : null,
      echeance: b.echeance || null,
    });
    return NextResponse.json({ ok: true, id: tid });
  } catch {
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
