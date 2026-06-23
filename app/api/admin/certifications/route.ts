import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isAdmin } from "@/lib/admin";
import { listPendingCertifications } from "@/lib/leaderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isAdmin(u.email)) return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  try {
    return NextResponse.json({ certifications: await listPendingCertifications() });
  } catch {
    return NextResponse.json({ certifications: [] });
  }
}
