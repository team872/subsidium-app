export type Level = 0 | 1 | 2 | 3 | 4;
export type Palier = "Spectateur" | "Acteur" | "Transformateur" | "Batisseur";
export type RefondateurActivity = "actif" | "inactif";

export interface User {
  id: string;
  level: Level;
  hasPaid: boolean;
  paidViaPartner?: string;
  charteLightPassed: boolean;
  charteLightLastAttempt?: string;
  autoEval20Score?: number;
  autoEval20Maturity?: Palier;
  refondateurActivity?: RefondateurActivity;
  canProposeIdeas: boolean;
  badges: ("N1" | "N2")[];
}

export type EngagementReponse = "oui" | "plutot_oui" | "reserve";

export interface EngagementEval {
  id: number;
  reponse: EngagementReponse;
  justification: string;
}

export interface CharteLightResult {
  verdict: "valide" | "echec";
  engagements: EngagementEval[];
  retest_autorise_le: string | null;
}

export interface ItemEval {
  id: number;
  libelle_original: string;
  question_posee: string;
  reponse: string;
  note: 0 | 1 | 2 | 3;
  exemple_fourni: boolean;
}

export interface CommentaireDimension {
  bloc: string;
  forces: string;
  axes_progres: string;
}

export interface AutoEval20Result {
  items: ItemEval[];
  total: number;
  palier: Palier;
  indice_fiabilite: number;
  commentaires_par_dimension: CommentaireDimension[];
  badge_n2_octroyable: boolean;
  reserves: string[];
}
