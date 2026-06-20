// Scoring unifié SUBSIDIUM — source unique des seuils, miroir de l'agent
// (src/labels.ts: paliersScore + src/config.ts: SEUIL_BADGE_N2).
// Utilisé par l'endpoint serveur du questionnaire ; l'agent applique les mêmes seuils
// côté conversation. Les deux chemins produisent donc un palier/badge cohérents.

export const SEUIL_BADGE_N2 = 41; // score /60 minimum pour le badge Initiateur N2

export const PALIERS_SCORE = {
  spectateur: [0, 20],
  acteur: [21, 40],
  transformateur: [41, 50],
  batisseur: [51, 60],
} as const;

/** Palier officiel à partir du total /60 (§4.4). */
export function palierFromTotal(total: number): string {
  if (total <= PALIERS_SCORE.spectateur[1]) return "Spectateur";
  if (total <= PALIERS_SCORE.acteur[1]) return "Acteur";
  if (total <= PALIERS_SCORE.transformateur[1]) return "Transformateur";
  return "Bâtisseur";
}

export function badgeFromTotal(total: number): boolean {
  return total >= SEUIL_BADGE_N2;
}

/** Calcule le total /60 à partir des réponses (0..3 par énoncé), ramené proportionnellement. */
export function totalSur60(answers: number[]): number {
  const valid = answers.filter((n) => Number.isFinite(n));
  if (valid.length === 0) return 0;
  const sum = valid.reduce((a, b) => a + b, 0);
  const max = valid.length * 3; // 3 points max par énoncé
  return Math.round((sum / max) * 60);
}
