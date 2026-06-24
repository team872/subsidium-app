import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getMembership } from "@/lib/projetsData";
import { listDocs, createDoc } from "@/lib/workroomData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function collaborateur(id: number, uid: number) {
  const role = await getMembership(id, uid);
  return role === "owner" || role === "membre";
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ docs: [] }, { status: 401 });
  if (!(await collaborateur(id, uid))) return NextResponse.json({ docs: [] }, { status: 403 });
  return NextResponse.json({ docs: await listDocs(id) });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!(await collaborateur(id, uid))) return NextResponse.json({ error: "Réservé au porteur et aux contributeurs." }, { status: 403 });
  const b = await req.json().catch(() => ({} as any));
  const nom = (b.nom || "").trim();
  if (!nom) return NextResponse.json({ error: "Le nom du document est requis." }, { status: 400 });
  let url: string | null = (b.url || "").trim() || null;
  if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
  const did = await createDoc(id, uid, { nom, url, note: (b.note || "").trim() });
  return NextResponse.json({ ok: true, id: did });
}
