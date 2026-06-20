// Référentiel d'auto-évaluation éthique SUBSIDIUM (SUBSIDIUM ETHICS).
// Dimensions issues du Blueprint : dignité, bien commun, responsabilité, subsidiarité,
// solidarité, participation — complétées par sobriété et transmission.
// Chaque dimension porte une explication (intro) affichée en tête d'écran.

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
    intro:
      "Toute personne a une valeur inconditionnelle. La reconnaître, c'est refuser de la réduire à son utilité, son statut ou ses opinions.",
    statements: [
      "Je respecte la dignité de toute personne, même lorsque ses idées ou ses choix me heurtent.",
      "Je refuse d'instrumentaliser autrui pour une cause, une image ou un intérêt.",
      "Je prends au sérieux la vulnérabilité d'autrui et je protège la liberté de conscience.",
      "Je traite chacun comme une personne capable d'agir, et non comme un simple profil ou un moyen.",
    ],
  },
  {
    key: "bien-commun",
    title: "Bien commun",
    intro:
      "Le bien commun n'est pas la somme des intérêts particuliers : c'est ce qui permet à chacun de s'accomplir au sein d'une communauté.",
    statements: [
      "Je cherche ce qui profite à tous plutôt qu'à mon seul intérêt.",
      "Je contribue concrètement à des projets utiles à ma communauté.",
      "J'accepte de renoncer à un avantage personnel quand l'intérêt collectif le demande.",
    ],
  },
  {
    key: "responsabilite",
    title: "Responsabilité",
    intro:
      "Être responsable, c'est répondre du réel : assumer ses actes, ses engagements et leurs conséquences.",
    statements: [
      "J'assume les conséquences de mes actes et de mes engagements.",
      "Je tiens parole et je vais au bout de ce que j'ai accepté de porter.",
      "Quand une situation me concerne, j'agis plutôt que d'attendre que d'autres le fassent.",
    ],
  },
  {
    key: "subsidiarite",
    title: "Subsidiarité",
    intro:
      "La subsidiarité consiste à laisser agir au niveau le plus proche et le plus compétent, et à n'intervenir d'en haut que pour soutenir, jamais pour remplacer.",
    statements: [
      "Je laisse à chacun la capacité d'agir à son niveau plutôt que de décider à sa place.",
      "Je soutiens les initiatives locales avant de chercher une solution centralisée.",
      "Quand j'aide quelqu'un, je cherche à le rendre plus autonome, pas plus dépendant.",
    ],
  },
  {
    key: "solidarite",
    title: "Solidarité",
    intro:
      "La solidarité relie les personnes : c'est l'attention concrète portée aux autres, en particulier aux plus fragiles.",
    statements: [
      "Je suis attentif aux plus fragiles dans mes décisions et mes actes.",
      "Je traite les personnes avec équité, sans favoritisme.",
      "Je m'engage aux côtés des autres plutôt que d'agir seul lorsque c'est possible.",
    ],
  },
  {
    key: "participation",
    title: "Participation",
    intro:
      "Participer, c'est prendre part à la vie collective et faire place à la parole et à l'action de chacun.",
    statements: [
      "Je favorise l'implication et l'écoute de chacun dans l'action collective.",
      "Je coopère plutôt que d'agir seul lorsque c'est possible.",
      "Je cherche à inclure celles et ceux qu'on entend le moins.",
    ],
  },
  {
    key: "sobriete",
    title: "Sobriété",
    intro:
      "La sobriété est un usage mesuré et juste des ressources — humaines, matérielles et attentionnelles.",
    statements: [
      "Je veille à un usage mesuré des ressources, humaines comme matérielles.",
      "Je privilégie le durable et l'essentiel au superflu.",
      "Je tiens compte de l'impact de mes actions sur le long terme.",
    ],
  },
  {
    key: "transmission",
    title: "Transmission",
    intro:
      "La progression ultime n'est pas le statut, c'est la transmission : faire grandir et durer ce qui a été appris et entrepris.",
    statements: [
      "Je partage mon expérience et ce que j'apprends avec d'autres.",
      "Je cherche à faire grandir et à inspirer autour de moi.",
      "Je veille à ce que ce que je construis puisse continuer sans moi.",
    ],
  },
];
