import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { applyProgression } from "@/lib/data";

// Adhésion à la Charte par FORMULAIRE : le citoyen confirme explicitement les 4 engagements
// et formule en quelques mots ce qui l'engage. On persiste charte_validee = true.
// Le passage Visiteur -> Refondateur requiert ensuite le paiement (cf. recompute niveau).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const b = await req.json().catch(() => ({} as any));
  if (String(b.motivation || "").trim().length < 10) {
    return NextResponse.json({ error: "Dites en quelques mots ce qui vous engage." }, { status: 400 });
  }
  try {
    const user = await applyProgression(uid, { charte_validee: true });
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "Validation impossible pour le moment." }, { status: 500 });
  }
}
