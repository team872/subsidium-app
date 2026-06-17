import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { addComment, getIdea, getUserPublic, displayName } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise pour participer." }, { status: 401 });
    const id = Number(params.id);
    const idea = await getIdea(id);
    if (!idea) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    const b = await req.json();
    const body = String(b.body || "").trim();
    if (!body) return NextResponse.json({ error: "Message vide." }, { status: 400 });
    const u = await getUserPublic(uid);
    const author = u ? displayName(u) : "Citoyen";
    const comment = await addComment(id, uid, author, body);
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}
