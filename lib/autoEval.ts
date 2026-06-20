// Référentiel d'auto-évaluation éthique SUBSIDIUM (SUBSIDIUM ETHICS).
// Aligné sur l'AVP : 8 dimensions, 20 énoncés au total, notés sur l'échelle
// Jamais / Parfois / Souvent / Toujours (0..3) → score sur 60.
// Ordre et libellés repris de l'AVP (dont « Justice et réciprocité »).

export type Dimension = {
  key: string;
  title: string;
  intro: string;
  statements: string[];
};

export const SCALE = ["Jamais", "Parfois", "Souvent", "Toujours"];

export const DIMENSIONS: Dimension[] = [
  {
    key: "dignite",
    title: "Dignité de la personne humaine",
    intro: "",
    statements: [
      "Je respecte la dignité de toute personne, même lorsque ses idées ou choix me heurtent.",
      "Je refuse toute instrumentalisation d'autrui (cause, image, camp, intérêt).",
      "Je protège la liberté de conscience et je prends au sérieux la vulnérabilité humaine.",
    ],
  },
  {
    key: "bien-commun",
    title: "Bien commun",
    intro: "",
    statements: [
      "Je privilégie le bien commun plutôt que mon seul intérêt.",
      "Je cherche la cohésion et la paix sociale plutôt que la division.",
      "Je me soucie de l'accès de chacun aux ressources essentielles.",
    ],
  },
  {
    key: "responsabilite",
    title: "Responsabilité intégrale",
    intro: "",
    statements: [
      "Je mesure l'impact de mes décisions (social, économique, environnemental, relationnel).",
      "Je recherche la cohérence entre convictions et actes, et j'accepte d'être évalué.",
      "Quand je constate un écart, je corrige et je progresse.",
    ],
  },
  {
    key: "subsidiarite",
    title: "Subsidiarité active",
    intro: "",
    statements: [
      "J'agis à mon niveau avant d'attendre une solution « d'en haut ».",
      "Je soutiens l'autonomie des personnes, communauté et initiatives locales.",
      "Je défends une subsidiarité réelle : les niveaux supérieurs doivent soutenir, coordonner et non se substituer.",
    ],
  },
  {
    key: "justice",
    title: "Justice et réciprocité",
    intro: "",
    statements: [
      "Je lutte contre les privilèges et injustices, y compris lorsqu'ils m'avantagent.",
      "Je porte une attention prioritaire aux plus fragiles (équité, réparation, protection).",
      "Je pratique la réciprocité : équilibre, reconnaissance mutuelle, droits et devoirs.",
    ],
  },
  {
    key: "sobriete",
    title: "Sobriété",
    intro: "",
    statements: [
      "Je pratique une sobriété choisie (consommation, ressources, modes de vie).",
      "Je relie écologie, dignité humaine et justice sociale (écologie intégrale).",
    ],
  },
  {
    key: "participation",
    title: "Participation effective",
    intro: "",
    statements: [
      "Je participe à la vie collective (projets locaux, association, dialogue, concertation utile).",
    ],
  },
  {
    key: "transmission",
    title: "Transmission et éducation (prioritaire)",
    intro: "",
    statements: [
      "Je contribue à préserver une culture commune de l'engagement (mémoire, repères, continuité).",
      "Je valorise l'éducation (parents, école, associations) comme priorité et je m'y implique.",
    ],
  },
];
