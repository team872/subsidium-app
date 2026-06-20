import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { addComment, getIdea, getUserPublic, displayName, notifyNewComment, type NewFile } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: "Connexion requise pour participer." }, { status: 401 });
    const id = Number(params.id);
    const idea = await getIdea(id);
    if (!idea) return NextResponse.json({ error: "Idée introuvable." }, { status: 404 });

    const b = await req.json();
    const body = String(b.body || "").trim();

    let file: NewFile | null = null;
    if (b.file && b.file.dataB64) {
      const mime = String(b.file.mime || "");
      if (!ALLOWED.has(mime)) {
        return NextResponse.json({ error: "Type de fichier non autorisé (images ou PDF uniquement)." }, { status: 400 });
      }
      const data = Buffer.from(String(b.file.dataB64), "base64");
      if (data.length === 0) return NextResponse.json({ error: "Fichier illisible." }, { status: 400 });
      if (data.length > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)." }, { status: 413 });
      const filename = String(b.file.name || "piece-jointe").slice(0, 180);
      file = { filename, mime, data };
    }

    if (!body && !file) return NextResponse.json({ error: "Message vide." }, { status: 400 });

    const u = await getUserPublic(uid);
    const author = u ? displayName(u) : "Citoyen";
    const comment = await addComment(id, uid, author, body, file);
    // Notifie les abonnés (best-effort, n'empêche pas la réponse).
    await notifyNewComment(id, uid, author, comment.id).catch(() => {});
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}
