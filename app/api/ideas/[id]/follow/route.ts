import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { toggleFollow, getIdea } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise pour suivre une idée." }, { status: 401 });
    const id = Number(params.id);
    const idea = await getIdea(id);
    if (!idea) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    const following = await toggleFollow(uid, id);
    return NextResponse.json({ following });
  } catch {
    return NextResponse.json({ error: "Action impossible pour le moment." }, { status: 500 });
  }
}
