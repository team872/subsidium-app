import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getAttachment } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sert une pièce jointe (image / PDF) stockée en base. Réservé aux utilisateurs connectés.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  const att = await getAttachment(id);
  if (!att) return NextResponse.json({ error: "Pièce jointe introuvable." }, { status: 404 });
  const safe = (att.filename || "fichier").replace(/[^\w.\-]+/g, "_");
  return new NextResponse(att.data, {
    status: 200,
    headers: {
      "Content-Type": att.mime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${safe}"`,
      "Content-Length": String(att.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
