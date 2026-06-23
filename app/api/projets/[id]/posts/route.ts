import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership, listPosts, createPost } from "@/lib/projetsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ posts: await listPosts(Number(params.id)) });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const id = Number(params.id);
  const role = await getMembership(id, uid);
  if (role !== "owner" && role !== "membre") return NextResponse.json({ error: "Réservé au porteur et aux contributeurs du projet." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const corps = (b.corps || "").trim();
  if (!corps) return NextResponse.json({ error: "Le message est vide." }, { status: 400 });
  try {
    const pid = await createPost(id, uid, corps);
    return NextResponse.json({ ok: true, id: pid });
  } catch {
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
