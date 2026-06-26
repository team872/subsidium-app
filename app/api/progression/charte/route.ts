import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { applyProgression } from "@/lib/data";
import { CascadeLLM } from "@/lib/agent/llm";
import { runCharteLight } from "@/lib/agent/agents/charteLight";
import { newVisitor } from "@/lib/agent/progression";

// Validation de la Charte avec re-vérification serveur (le client ne décide pas du
// verdict). Scoring servi DANS l'app via la cascade. charte_validee persistée seulement
// si verdict « valide ». Échec total -> { fallback:true } (l'UI propose le formulaire).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch {}
  const transcript = String(body.transcript || "");
  if (!transcript) return NextResponse.json({ error: "Entretien vide." }, { status: 400 });

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "Vérification non configurée.", fallback: true }, { status: 503 });
  }

  let result: any = {};
  try {
    const out = await runCharteLight(new CascadeLLM(), newVisitor(String(uid)), transcript);
    result = out.result || {};
  } catch {
    return NextResponse.json({ error: "Vérification momentanément indisponible.", fallback: true }, { status: 503 });
  }

  const valide = result.verdict === "valide";
  const user = valide ? await applyProgression(uid, { charte_validee: true }) : null;
  return NextResponse.json({ valide, result, user });
}
