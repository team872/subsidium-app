import { NextRequest, NextResponse } from "next/server";

// Relais serveur vers le scoring autoritatif de l'agent (recalcul /60, palier,
// anti-triche et octroi du badge N2 côté serveur agent).
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
    const r = await fetch(`${BASE}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: "eval", transcript: String(body.transcript || "") }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({ error: "Réponse illisible de l'évaluateur." }));
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "Évaluation momentanément indisponible." }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
