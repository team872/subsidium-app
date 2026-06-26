import { LLMClient, ChatMessage, parseJsonResponse } from "../llm";
import { agent2SystemPrompt } from "../prompts";
import { AutoEval20Result, ItemEval, User } from "../types";
import { CONFIG, SubsidiumConfig } from "../config";
import { scoreAutoEval } from "../scoring";
import { applyTransitions } from "../progression";
import { GRILLE_V4 } from "../data/grille20";

interface LLMItemsPayload {
  items: ItemEval[];
  commentaires_par_dimension?: AutoEval20Result["commentaires_par_dimension"];
}

export interface AutoEval20Outcome {
  result: AutoEval20Result;
  user: User;
}

export function validateItems(items: ItemEval[]): void {
  if (items.length !== GRILLE_V4.length) {
    throw new Error(`Attendu ${GRILLE_V4.length} items, recu ${items.length}`);
  }
  const ids = new Set(items.map((i) => i.id));
  if (ids.size !== GRILLE_V4.length) throw new Error("Items dupliques ou manquants (mapping 1:1 rompu)");
  for (const g of GRILLE_V4) {
    if (!ids.has(g.id)) throw new Error(`Item ${g.id} manquant`);
  }
}

export async function runAutoEval20(
  llm: LLMClient,
  user: User,
  transcript: string,
  cfg: SubsidiumConfig = CONFIG
): Promise<AutoEval20Outcome> {
  const messages: ChatMessage[] = [
    { role: "system", content: agent2SystemPrompt() },
    { role: "user", content: transcript },
  ];
  const raw = await llm.complete(messages);
  const payload = parseJsonResponse<LLMItemsPayload>(raw);

  const byId = new Map(GRILLE_V4.map((g) => [g.id, g]));
  const items: ItemEval[] = payload.items.map((it) => ({
    ...it,
    libelle_original: byId.get(it.id)?.libelle ?? it.libelle_original,
  }));
  validateItems(items);

  const score = scoreAutoEval(items, cfg);
  const badge = score.total >= cfg.SEUIL_BADGE_N2;

  const result: AutoEval20Result = {
    items: score.itemsAjustes,
    total: score.total,
    palier: score.palier,
    indice_fiabilite: score.indice_fiabilite,
    commentaires_par_dimension: payload.commentaires_par_dimension ?? [],
    badge_n2_octroyable: badge,
    reserves: score.reserves,
  };

  let u: User = {
    ...user,
    autoEval20Score: score.total,
    autoEval20Maturity: score.palier,
  };
  if (badge) u = applyTransitions(u, cfg);

  return { result, user: u };
}
