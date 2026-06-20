// Niveau de maturité du parcours citoyen (client-safe : aucun import serveur).
//
// Échelle : Visiteur 0 → Refondateur 1 → Initiateur 2 → Refondateur Certifié 3 → Ambassadeur 4.
//
// La source de vérité est désormais la colonne `niveau` en base (cf. lib/progression.ts).
// Le client lit simplement `user.niveau` ; la barre MODE TEST le surcharge pour l'aperçu.

export const NIVEAUX = [
  "Visiteur",
  "Refondateur",
  "Initiateur",
  "Refondateur Certifié",
  "Ambassadeur",
] as const;

export type Niveau = (typeof NIVEAUX)[number];

/** Borne un niveau dans 0..4. */
export function clampNiveau(n: number | null | undefined): number {
  const v = Math.round(Number(n ?? 0));
  return Math.max(0, Math.min(NIVEAUX.length - 1, Number.isFinite(v) ? v : 0));
}

export const peutProposerIdee = (rang: number) => rang >= 1; // Refondateur+
export const peutInteragir = (rang: number) => rang >= 1; // suivre / commenter
export const peutPorterInitiative = (rang: number) => rang >= 2; // Initiateur+

/** Prochaine étape de progression à mettre en avant selon le niveau. */
export function prochaineEtape(rang: number): { label: string; href: string; hint: string } | null {
  if (rang <= 0) return { label: "Adhérer à la Charte", href: "/charte", hint: "Première étape pour devenir Refondateur et agir." };
  if (rang === 1) return { label: "Passer l'auto-évaluation", href: "/auto-evaluation", hint: "Évaluez votre engagement pour viser le niveau Initiateur." };
  return null;
}
