import { LLMClient, ChatMessage, parseJsonResponse } from "../llm";
import { agent2SystemPromptCourt } from "../prompts";
import { AutoEval20Result, ItemEval, User } from "../types";
import { CONFIG, SubsidiumConfig } from "../config";
import { scoreAutoEval, palierFromTotal } from "../scoring";
import { applyTransitions } from "../progression";
import { GRILLE_COURT, COURT_PROJECTION } from "../data/grilleCourt";

interface LLMItemsPayload {
  items: ItemEval[];
  commentaires_par_dimension?: AutoEval20Result["commentaires_par_dimension"];
}

export interface AutoEval20Outcome {
  result: AutoEval20Result;
  user: User;
}

export function validateItemsCourt(items: ItemEval[]): void {
  if (items.length !== GRILLE_COURT.length) {
    throw new Error(`Attendu ${GRILLE_COURT.length} items, recu ${items.length}`);
  }
  const ids = new Set(items.map((i) => i.id));
  if (ids.size !== GRILLE_COURT.length) throw new Error("Items dupliques ou manquants (mapping rompu)");
  for (const g of GRILLE_COURT) {
    if (!ids.has(g.id)) throw new Error(`Item court ${g.id} manquant`);
  }
}

export async function runAutoEval20Court(
  llm: LLMClient,
  user: User,
  transcript: string,
  cfg: SubsidiumConfig = CONFIG
): Promise<AutoEval20Outcome> {
  const messages: ChatMessage[] = [
    { role: "system", content: agent2SystemPromptCourt() },
    { role: "user", content: transcript },
  ];
  const raw = await llm.complete(messages);
  const payload = parseJsonResponse<LLMItemsPayload>(raw);

  const byId = new Map(GRILLE_COURT.map((g) => [g.id, g]));
  const items: ItemEval[] = payload.items.map((it) => ({
    ...it,
    libelle_original: byId.get(it.id)?.libelle ?? it.libelle_original,
  }));
  validateItemsCourt(items);

  const score = scoreAutoEval(items, cfg);
  const totalProjete = Math.round(score.total * COURT_PROJECTION);
  const palier = palierFromTotal(totalProjete);
  const badge = totalProjete >= cfg.SEUIL_BADGE_N2;

  const reserves = [
    ...score.reserves,
    `Evaluation COURTE (${GRILLE_COURT.length} dimensions) : total ${score.total}/24 projete a ${totalProjete}/60. ` +
      `Palier indicatif, a confirmer par l'entretien complet a 20 items.`,
  ];

  const result: AutoEval20Result = {
    items: score.itemsAjustes,
    total: totalProjete,
    palier,
    indice_fiabilite: score.indice_fiabilite,
    commentaires_par_dimension: payload.commentaires_par_dimension ?? [],
    badge_n2_octroyable: badge,
    reserves,
  };

  let u: User = { ...user, autoEval20Score: totalProjete, autoEval20Maturity: palier };
  if (badge) u = applyTransitions(u, cfg);

  return { result, user: u };
}
