import { NextRequest, NextResponse } from "next/server";
import { CascadeLLM } from "@/lib/agent/llm";
import { runCharteLight } from "@/lib/agent/agents/charteLight";
import { runAutoEval20 } from "@/lib/agent/agents/autoEval20";
import { runAutoEval20Court } from "@/lib/agent/agents/autoEval20Court";
import { newVisitor } from "@/lib/agent/progression";

// Scoring autoritatif servi DANS l'app (recalcul /60, palier, anti-triche, badge N2,
// ou verdict d'adhésion charte). Cascade de modèles ; échec total -> { fallback:true }.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "Évaluation non configurée.", fallback: true }, { status: 503 });
  }

  const transcript = String(body.transcript || "");
  const user = newVisitor("anon");
  const llm = new CascadeLLM();
  try {
    if (body.agent === "charte") {
      return NextResponse.json(await runCharteLight(llm, user, transcript));
    }
    if (body.agent === "eval_court") {
      return NextResponse.json(await runAutoEval20Court(llm, user, transcript));
    }
    return NextResponse.json(await runAutoEval20(llm, user, transcript));
  } catch {
    return NextResponse.json({ error: "Évaluation momentanément indisponible.", fallback: true }, { status: 503 });
  }
}
