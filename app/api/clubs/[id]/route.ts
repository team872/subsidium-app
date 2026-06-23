import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getClub, listClubMembers, isClubMember, listClubPosts } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const club = await getClub(id);
    if (!club) return NextResponse.json({ error: "Club introuvable." }, { status: 404 });
    const uid = await getUserId();
    const isMember = uid ? await isClubMember(id, uid) : false;
    const [members, posts] = await Promise.all([listClubMembers(id), isMember ? listClubPosts(id) : Promise.resolve([])]);
    return NextResponse.json({ club, members, isMember, posts });
  } catch {
    return NextResponse.json({ error: "Club indisponible." }, { status: 500 });
  }
}
