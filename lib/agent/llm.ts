/**
 * Client LLM enfichable (porté depuis subsidium-test). OpenRouter + cascade de modèles.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMClient {
  complete(messages: ChatMessage[]): Promise<string>;
}

export const DEFAULT_MODELS = [
  "openai/gpt-oss-120b",
  "anthropic/claude-3.5-haiku",
  "openai/gpt-4o-mini",
];

/** Liste de modèles de la cascade (env OPENROUTER_MODELS, séparés par des virgules). */
export function modelList(): string[] {
  const raw = (process.env.OPENROUTER_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return raw.length ? raw : DEFAULT_MODELS;
}

/** Appel OpenRouter pour UN modèle donné (avec timeout). */
export class OpenRouterClient implements LLMClient {
  constructor(
    private model = process.env.OPENROUTER_MODEL || DEFAULT_MODELS[0],
    private apiKey = process.env.OPENROUTER_API_KEY || "",
    private timeoutMs = 28_000
  ) {}

  async complete(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) throw new Error("OPENROUTER_API_KEY manquante");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model: this.model, messages, temperature: 0.2 }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
      const data: any = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      if (!content || !String(content).trim()) throw new Error("Réponse vide du modèle");
      return content;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Cascade : essaie chaque modèle dans l'ordre ; passe au suivant en cas d'erreur
 * (429, indisponibilité, timeout, réponse vide…). Si TOUS échouent -> erreur finale
 * (l'UI bascule alors vers le formulaire / questionnaire classique).
 */
export class CascadeLLM implements LLMClient {
  constructor(
    private models: string[] = modelList(),
    private apiKey = process.env.OPENROUTER_API_KEY || ""
  ) {}

  async complete(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) throw new Error("OPENROUTER_API_KEY manquante");
    let lastErr: any = null;
    for (const m of this.models) {
      try {
        return await new OpenRouterClient(m, this.apiKey).complete(messages);
      } catch (e) {
        lastErr = e;
        // on tente le modèle suivant de la cascade
      }
    }
    throw new Error(`Tous les modèles de la cascade ont échoué : ${String(lastErr?.message || lastErr)}`);
  }
}

/** Mock déterministe (tests/démo). */
export class MockLLM implements LLMClient {
  constructor(private scriptedJson: string) {}
  async complete(_messages: ChatMessage[]): Promise<string> {
    return this.scriptedJson;
  }
}

/** Extrait le premier objet JSON d'une réponse LLM (tolérant aux fences markdown). */
export function parseJsonResponse<T>(raw: string): T {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Aucun JSON trouve dans la reponse LLM");
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
