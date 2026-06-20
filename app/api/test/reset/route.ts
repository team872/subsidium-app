import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserPublic } from "@/lib/data";
import { isTestAccount } from "@/lib/testmode";
import { query } from "@/lib/db";

// Réinitialise la progression du compte (retour à Visiteur) — RÉSERVÉ aux comptes test.
// Permet de rejouer l'intégralité du parcours autant de fois que voulu.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const u = await getUserPublic(uid);
  if (!u || !isTestAccount(u.email)) {
    return NextResponse.json({ error: "Réservé aux comptes de test." }, { status: 403 });
  }
  await query(
    `UPDATE users SET niveau = 0, charte_validee = false, paye = false, badge_n2 = false, score = NULL, palier = NULL WHERE id = $1`,
    [uid]
  );
  return NextResponse.json({ ok: true });
}
