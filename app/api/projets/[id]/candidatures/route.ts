import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { isOwner, listCandidatures } from "@/lib/projetsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  const id = Number(params.id);
  if (!uid || !(await isOwner(id, uid))) return NextResponse.json({ error: "Réservé au porteur du projet." }, { status: 403 });
  try {
    return NextResponse.json({ candidatures: await listCandidatures(id) });
  } catch {
    return NextResponse.json({ candidatures: [] });
  }
}
