import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { applyProgression } from "@/lib/data";

// Validation de la Charte AVEC re-vérification serveur : on rescore l'entretien via
// l'agent (le client ne décide pas du verdict). charte_validee n'est persistée que si
// le verdict de l'agent est « valide ». Le passage Visiteur -> Refondateur requiert
// ensuite le paiement.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AGENT_BASE_URL || "http://subsidium-test:8090";

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch {}
  const transcript = String(body.transcript || "");
  if (!transcript) return NextResponse.json({ error: "Entretien vide." }, { status: 400 });

  // Re-scoring serveur via l'agent (autoritatif).
  let result: any = {};
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    const r = await fetch(`${BASE}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: "charte", transcript }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const d = await r.json().catch(() => ({}));
    result = d.result || {};
  } catch {
    return NextResponse.json({ error: "Vérification momentanément indisponible." }, { status: 502 });
  }

  const valide = result.verdict === "valide";
  const user = valide ? await applyProgression(uid, { charte_validee: true }) : null;
  return NextResponse.json({ valide, result, user });
}
