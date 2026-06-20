import { NIVEAUX } from "./niveau";

// Logique serveur de progression du parcours. Le niveau de maturité (0..4) est la
// SOURCE DE VÉRITÉ persistée en base ; il est recalculé à chaque transition.

export function niveauLabel(n: number): string {
  const i = Math.max(0, Math.min(NIVEAUX.length - 1, Math.round(n || 0)));
  return NIVEAUX[i];
}

/**
 * Recalcule le niveau à partir de l'état persistant, sans jamais l'abaisser.
 * 0 Visiteur → 1 Refondateur : charte validée ET paiement.
 * 1 → 2 Initiateur : badge N2 (auto-évaluation réussie).
 * 3 Refondateur Certifié / 4 Ambassadeur : décision admin (niveau stocké tel quel).
 */
export function recomputeNiveau(s: {
  niveau?: number; charte_validee?: boolean; paye?: boolean; badge_n2?: boolean;
}): number {
  let n = s.niveau || 0;
  if (s.charte_validee && s.paye) n = Math.max(n, 1);
  if (s.badge_n2) n = Math.max(n, 2);
  return n;
}
