import { NextRequest, NextResponse } from "next/server";
import { CascadeLLM, ChatMessage } from "@/lib/agent/llm";
import { agent1ChatPrompt, agent2ChatPrompt, agent2ChatPromptCourt } from "@/lib/agent/prompts";

// Agent conversationnel servi DANS l'app (anciennement conteneur subsidium-test).
// Cascade de modèles OpenRouter ; en cas d'échec total -> { fallback:true } pour
// que l'UI bascule vers le formulaire / questionnaire classique.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "Assistant IA non configuré.", fallback: true }, { status: 503 });
  }

  const sys =
    body.agent === "eval_court" ? agent2ChatPromptCourt()
    : body.agent === "eval" ? agent2ChatPrompt()
    : agent1ChatPrompt();
  const messages: ChatMessage[] = [
    { role: "system", content: sys },
    ...(Array.isArray(body.messages) ? body.messages : []),
  ];

  try {
    const reply = await new CascadeLLM().complete(messages);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Assistant IA momentanément indisponible.", fallback: true }, { status: 503 });
  }
}
