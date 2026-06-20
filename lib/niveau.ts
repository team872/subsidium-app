// Niveau de maturité du parcours citoyen (client-safe : aucun import serveur).
//
// Échelle : Visiteur 0 → Refondateur 1 → Initiateur 2 → Refondateur Certifié 3 → Ambassadeur 4.
//
// Le niveau est dérivé du `palier` quand celui-ci est un libellé de maturité
// (cas piloté par la barre MODE TEST, et futur modèle réel), sinon de `badge_n2`.
// IMPORTANT : un membre réel inscrit (palier d'auto-éval type « Acteur », pas de badge)
// est considéré Refondateur (1) par défaut — pour NE PAS verrouiller l'accès existant.

export const NIVEAUX = [
  "Visiteur",
  "Refondateur",
  "Initiateur",
  "Refondateur Certifié",
  "Ambassadeur",
] as const;

export type Niveau = (typeof NIVEAUX)[number];

/** Rang 0..4 à partir du palier + badge. `null`/absence d'utilisateur => Visiteur (0). */
export function rangMaturite(palier: string | null | undefined, badgeN2?: boolean): number {
  const i = (NIVEAUX as readonly string[]).indexOf(palier || "");
  if (i >= 0) return i;
  if (badgeN2) return 2; // Initiateur
  return 1; // membre inscrit par défaut = Refondateur (on ne casse pas l'existant)
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
