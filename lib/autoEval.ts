// Référentiel d'auto-évaluation éthique SUBSIDIUM.
// Les énoncés "Dignité" proviennent de l'AVP ; les autres dimensions sont
// des énoncés représentatifs à compléter avec la grille officielle.

export type Dimension = {
  key: string;
  title: string;
  statements: string[];
};

export const SCALE = ["Jamais", "Parfois", "Souvent", "Toujours"];

export const DIMENSIONS: Dimension[] = [
  {
    key: "dignite",
    title: "Dignité de la personne humaine",
    statements: [
      "Je respecte la dignité de toute personne, même lorsque ses idées ou ses choix me heurtent.",
      "Je refuse toute instrumentalisation d'autrui (cause, image, intérêt).",
      "Je protège la liberté de conscience et je prends au sérieux la vulnérabilité humaine.",
    ],
  },
  {
    key: "bien-commun",
    title: "Bien commun",
    statements: [
      "Je cherche ce qui profite à tous plutôt qu'à mon seul intérêt.",
      "Je contribue concrètement à des projets utiles à ma communauté.",
    ],
  },
  {
    key: "responsabilite",
    title: "Responsabilité",
    statements: [
      "J'assume les conséquences de mes actes et de mes engagements.",
      "Je tiens parole et je vais au bout de ce que j'ai accepté de porter.",
    ],
  },
  {
    key: "subsidiarite",
    title: "Subsidiarité",
    statements: [
      "Je laisse à chacun la capacité d'agir à son niveau plutôt que de décider à sa place.",
      "Je soutiens les initiatives locales avant de chercher une solution centralisée.",
    ],
  },
  {
    key: "justice",
    title: "Justice",
    statements: [
      "Je traite les personnes avec équité, sans favoritisme.",
      "Je suis attentif aux plus fragiles dans mes décisions.",
    ],
  },
  {
    key: "sobriete",
    title: "Sobriété",
    statements: [
      "Je veille à un usage mesuré des ressources, humaines comme matérielles.",
      "Je privilégie le durable et l'essentiel au superflu.",
    ],
  },
  {
    key: "participation",
    title: "Participation",
    statements: [
      "Je favorise l'implication et l'écoute de chacun dans l'action collective.",
      "Je coopère plutôt que d'agir seul lorsque c'est possible.",
    ],
  },
  {
    key: "transmission",
    title: "Transmission",
    statements: [
      "Je partage mon expérience et ce que j'apprends avec d'autres.",
      "Je cherche à faire grandir et à inspirer autour de moi.",
    ],
  },
];
