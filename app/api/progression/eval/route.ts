import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { query } from "@/lib/db";
import { recomputeNiveau } from "@/lib/progression";

// Persiste le résultat d'auto-évaluation de l'utilisateur connecté : score, palier d'auto-éval
// et badge N2 (jamais retiré une fois acquis), puis recalcule le niveau (badge -> Initiateur).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  let b: any = {};
  try { b = await req.json(); } catch {}
  const total = Number.isFinite(Number(b.total)) ? Number(b.total) : null;
  const palier = typeof b.palier === "string" ? b.palier : null;
  const badge = !!b.badge_n2_octroyable;

  await query(
    `UPDATE users SET score = COALESCE($2, score), palier = COALESCE($3, palier), badge_n2 = (badge_n2 OR $4) WHERE id = $1`,
    [uid, total, palier, badge]
  );
  const u = await getUserPublic(uid);
  if (!u) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  const n = recomputeNiveau({ niveau: u.niveau, charte_validee: u.charte_validee, paye: u.paye, badge_n2: u.badge_n2 });
  if (n !== u.niveau) {
    await query(`UPDATE users SET niveau = $2 WHERE id = $1`, [uid, n]);
    return NextResponse.json({ user: await getUserPublic(uid) });
  }
  return NextResponse.json({ user: u });
}
