import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isClubMember, listClubPosts, createClubPost } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const id = Number(params.id);
  if (!uid || !(await isClubMember(id, uid))) return NextResponse.json({ error: "Réservé aux membres du club." }, { status: 403 });
  try {
    return NextResponse.json({ posts: await listClubPosts(id) });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const id = Number(params.id);
  if (!(await isClubMember(id, uid))) return NextResponse.json({ error: "Réservé aux membres du club." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const corps = (b.corps || "").trim();
  if (!corps) return NextResponse.json({ error: "Le message est vide." }, { status: 400 });
  try {
    const pid = await createClubPost(id, uid, corps);
    return NextResponse.json({ ok: true, id: pid });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
