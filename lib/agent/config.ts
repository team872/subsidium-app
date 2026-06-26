export interface SubsidiumConfig {
  X_JOURS_DELAI_RETEST: number;
  SEUIL_BADGE_N2: number;
  ORDRE_QUESTIONS_20: "fixe" | "melange";
  EXEMPLE_OBLIGATOIRE_SI_NOTE: number;
  SEUIL_FIABILITE_RESERVE: number;
}

export const CONFIG: SubsidiumConfig = {
  X_JOURS_DELAI_RETEST: 7,
  SEUIL_BADGE_N2: 41,
  ORDRE_QUESTIONS_20: "fixe",
  EXEMPLE_OBLIGATOIRE_SI_NOTE: 2,
  SEUIL_FIABILITE_RESERVE: 0.6,
};
