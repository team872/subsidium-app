import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { applyProgression } from "@/lib/data";

// Enregistre la validation de la Charte pour l'utilisateur connecté (charte_validee=true),
// puis recalcule le niveau. Le passage Visiteur -> Refondateur requiert aussi le paiement.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const user = await applyProgression(uid, { charte_validee: true });
  return NextResponse.json({ user });
}
