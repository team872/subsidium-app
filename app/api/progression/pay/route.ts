import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { applyProgression } from "@/lib/data";

// Enregistre le paiement de l'adhésion (paye=true) puis recalcule le niveau.
// NB : intégration de paiement réelle à brancher ici (Stripe, etc.).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const user = await applyProgression(uid, { paye: true });
  return NextResponse.json({ user });
}
