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

// Libellés FR/EN/IT des prochaines étapes du parcours.
const ETAPE_T = {
  charte: {
    label: { fr: "Adhérer à la Charte", en: "Adopt the Charter", it: "Aderire alla Carta" },
    hint: { fr: "Première étape pour devenir Refondateur et agir.", en: "First step to become a Refounder and take action.", it: "Primo passo per diventare Rifondatore e agire." },
  },
  paiement: {
    label: { fr: "Finaliser mon adhésion", en: "Finalise my membership", it: "Finalizzare la mia adesione" },
    hint: { fr: "Dernière étape pour devenir Refondateur : régler votre adhésion.", en: "Last step to become a Refounder: settle your membership.", it: "Ultimo passo per diventare Rifondatore: regolare l'adesione." },
  },
  evaluation: {
    label: { fr: "Passer l'auto-évaluation", en: "Take the self-assessment", it: "Fare l'autovalutazione" },
    hint: { fr: "Évaluez votre engagement pour viser le niveau Initiateur.", en: "Assess your commitment to aim for the Initiator level.", it: "Valuta il tuo impegno per puntare al livello Iniziatore." },
  },
} as const;

/** Prochaine étape de progression à mettre en avant selon le niveau et l'état d'adhésion. */
export function prochaineEtape(
  rang: number,
  charteValidee?: boolean,
  paye?: boolean,
  lang: string = "fr"
): { label: string; href: string; hint: string } | null {
  const L = (o: { fr: string; en: string; it: string }) => (o as any)[lang] || o.fr;
  if (rang <= 0) {
    if (!charteValidee)
      return { label: L(ETAPE_T.charte.label), href: "/charte", hint: L(ETAPE_T.charte.hint) };
    if (!paye)
      return { label: L(ETAPE_T.paiement.label), href: "/paiement", hint: L(ETAPE_T.paiement.hint) };
    return null;
  }
  if (rang === 1)
    return { label: L(ETAPE_T.evaluation.label), href: "/auto-evaluation", hint: L(ETAPE_T.evaluation.hint) };
  return null;
}
