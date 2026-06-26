import { CONFIG, SubsidiumConfig } from "./config";
import { LABELS } from "./labels";
import { ItemEval, Palier } from "./types";
import { ITEMS_COUT_PERSONNEL, PAIRES_COHERENCE } from "./data/grille20";

export function applyAntiCheat(items: ItemEval[], cfg: SubsidiumConfig = CONFIG): ItemEval[] {
  return items.map((it) => {
    if (it.note >= cfg.EXEMPLE_OBLIGATOIRE_SI_NOTE && !it.exemple_fourni) {
      return { ...it, note: 1 as 0 | 1 | 2 | 3 };
    }
    return { ...it };
  });
}

export function computeTotal(items: ItemEval[]): number {
  return items.reduce((sum, it) => sum + it.note, 0);
}

export function palierFromTotal(total: number): Palier {
  const p = LABELS.paliersScore;
  if (total <= p.spectateur[1]) return "Spectateur";
  if (total <= p.acteur[1]) return "Acteur";
  if (total <= p.transformateur[1]) return "Transformateur";
  return "Batisseur";
}

export function indiceFiabilite(itemsClames: ItemEval[]): number {
  const ges2 = itemsClames.filter((it) => it.note >= 2);
  if (ges2.length === 0) return 1;
  const etayees = ges2.filter((it) => it.exemple_fourni).length;
  return Math.round((etayees / ges2.length) * 100) / 100;
}

export function detectToutA3(itemsClames: ItemEval[]): boolean {
  return itemsClames.length > 0 && itemsClames.every((it) => it.note === 3);
}

export function coutPersonnelSuspects(itemsClames: ItemEval[]): number[] {
  return itemsClames
    .filter((it) => ITEMS_COUT_PERSONNEL.includes(it.id) && it.note === 3 && !it.exemple_fourni)
    .map((it) => it.id);
}

export function incoherencesCroisees(itemsClames: ItemEval[]): [number, number][] {
  const byId = new Map(itemsClames.map((it) => [it.id, it]));
  const out: [number, number][] = [];
  for (const [a, b] of PAIRES_COHERENCE) {
    const ia = byId.get(a);
    const ib = byId.get(b);
    if (ia && ib && Math.abs(ia.note - ib.note) >= 2) out.push([a, b]);
  }
  return out;
}

export interface ScoreReport {
  itemsAjustes: ItemEval[];
  total: number;
  palier: Palier;
  indice_fiabilite: number;
  reserves: string[];
}

export function scoreAutoEval(itemsClames: ItemEval[], cfg: SubsidiumConfig = CONFIG): ScoreReport {
  const reserves: string[] = [];

  const fiabilite = indiceFiabilite(itemsClames);
  if (fiabilite < cfg.SEUIL_FIABILITE_RESERVE) {
    reserves.push(
      `Fiabilite faible (${Math.round(fiabilite * 100)}%) : trop de notes elevees sans exemple concret.`
    );
  }
  if (detectToutA3(itemsClames)) {
    reserves.push("Profil 'tout a 3' sans nuance : relance recommandee (valeurs reduites a des slogans).");
  }
  const cout = coutPersonnelSuspects(itemsClames);
  if (cout.length) {
    reserves.push(`Items a cout personnel notes 3 sans renoncement demontre : ${cout.join(", ")}.`);
  }
  const incoh = incoherencesCroisees(itemsClames);
  for (const [a, b] of incoh) {
    reserves.push(`Incoherence croisee entre items ${a} et ${b} : verification recommandee.`);
  }

  const itemsAjustes = applyAntiCheat(itemsClames, cfg);
  const total = computeTotal(itemsAjustes);
  const palier = palierFromTotal(total);

  return { itemsAjustes, total, palier, indice_fiabilite: fiabilite, reserves };
}
