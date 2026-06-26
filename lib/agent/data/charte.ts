export interface Engagement {
  id: number;
  texte: string;
}

export const ENGAGEMENTS: Engagement[] = [
  { id: 1, texte: "Vérité : je parle en conscience, sans haine ni mensonge." },
  { id: 2, texte: "Respect : j'écoute les autres et je construis dans le dialogue." },
  { id: 3, texte: "Responsabilité : je cherche le bien commun, pas le conflit." },
  { id: 4, texte: "Espérance : je crois en la capacité collective à changer les choses." },
];

export const VALIDATION_CASE =
  "Je m'engage à respecter la charte d'engagement et je souhaite rejoindre la communauté des Refondateurs.";

export const MIN_JUSTIFICATIONS_MOTS = 2;
