import { NextRequest, NextResponse } from "next/server";

// Relais serveur vers l'agent d'auto-évaluation existant (conteneur subsidium-test).
// L'appel se fait de conteneur à conteneur sur le réseau Docker partagé : aucun
// identifiant n'est nécessaire (le basic-auth Traefik ne s'applique qu'au bord public).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AGENT_BASE_URL || "http://subsidium-test:8090";

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const r = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: "eval", messages: Array.isArray(body.messages) ? body.messages : [] }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({ error: "Réponse illisible de l'évaluateur." }));
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "Service d'évaluation momentanément indisponible." }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
