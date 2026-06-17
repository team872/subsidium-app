import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getIdea, listComments, isFollowing } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    const idea = await getIdea(id);
    if (!idea) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });
    const comments = await listComments(id);
    const uid = await getUserId();
    const following = uid ? await isFollowing(uid, id) : false;
    return NextResponse.json({ idea, comments, following });
  } catch {
    return NextResponse.json({ error: "Idée indisponible." }, { status: 500 });
  }
}
