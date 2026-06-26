export interface GrilleItem {
  id: number;
  bloc: string;
  libelle: string;
}

export const GRILLE_V4: GrilleItem[] = [
  { id: 1, bloc: "Dignite de la personne humaine", libelle: "Respecter la dignite de toute personne, meme quand ses idees/choix me heurtent." },
  { id: 2, bloc: "Dignite de la personne humaine", libelle: "Refuser toute instrumentalisation d'autrui (cause, image, camp, interet)." },
  { id: 3, bloc: "Dignite de la personne humaine", libelle: "Proteger la liberte de conscience / prendre au serieux la vulnerabilite humaine." },
  { id: 4, bloc: "Bien commun", libelle: "Privilegier le bien commun plutot que mon seul interet." },
  { id: 5, bloc: "Bien commun", libelle: "Chercher la cohesion et la paix sociale plutot que la division." },
  { id: 6, bloc: "Bien commun", libelle: "Me soucier de l'acces de chacun aux ressources essentielles." },
  { id: 7, bloc: "Responsabilite integrale", libelle: "Mesurer l'impact de mes decisions (social, economique, environnemental, relationnel)." },
  { id: 8, bloc: "Responsabilite integrale", libelle: "Coherence entre convictions et actes, et accepter d'etre evalue." },
  { id: 9, bloc: "Responsabilite integrale", libelle: "Quand je constate un ecart, corriger et progresser." },
  { id: 10, bloc: "Subsidiarite active", libelle: "Agir a mon niveau avant d'attendre une solution d'en haut." },
  { id: 11, bloc: "Subsidiarite active", libelle: "Soutenir l'autonomie des personnes, communautes et initiatives locales." },
  { id: 12, bloc: "Subsidiarite active", libelle: "Defendre une subsidiarite reelle (les niveaux superieurs soutiennent/coordonnent, ne se substituent pas)." },
  { id: 13, bloc: "Justice & reciprocite", libelle: "Lutter contre privileges et injustices, y compris quand ils m'avantagent." },
  { id: 14, bloc: "Justice & reciprocite", libelle: "Attention prioritaire aux plus fragiles (equite, reparation, protection)." },
  { id: 15, bloc: "Justice & reciprocite", libelle: "Pratiquer la reciprocite (equilibre, reconnaissance mutuelle, droits et devoirs)." },
  { id: 16, bloc: "Sobriete / ecologie integrale", libelle: "Pratiquer une sobriete choisie (consommation, ressources, modes de vie)." },
  { id: 17, bloc: "Sobriete / ecologie integrale", libelle: "Relier ecologie, dignite humaine et justice sociale." },
  { id: 18, bloc: "Participation effective", libelle: "Participer a la vie collective (projets locaux, association, dialogue, concertation)." },
  { id: 19, bloc: "Transmission & education", libelle: "Contribuer a preserver une culture commune de l'engagement (memoire, reperes, continuite)." },
  { id: 20, bloc: "Transmission & education", libelle: "Valoriser l'education (parents, ecole, associations) comme priorite et s'y impliquer." },
];

export const ITEMS_COUT_PERSONNEL = [13, 14, 16];

export const PAIRES_COHERENCE: [number, number][] = [
  [8, 13],
];

export const BLOCS = [
  "Dignite de la personne humaine",
  "Bien commun",
  "Responsabilite integrale",
  "Subsidiarite active",
  "Justice & reciprocite",
  "Sobriete / ecologie integrale",
  "Participation effective",
  "Transmission & education",
];
