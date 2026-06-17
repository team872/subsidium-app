// Données de démonstration du parcours membre (à remplacer par l'API/back-office).

export type Idea = {
  cat: string;
  color: string;
  title: string;
  desc: string;
  messages: number;
  date: string;
  author: string;
  status?: "suivie" | "emise" | "archivee";
};
export type Event = {
  tag: string;
  title: string;
  desc: string;
  day: string;
  month: string;
  grad: string;
};

// Thématiques (filtre « Toutes les thématiques » de l'écran Idées).
export const CATEGORIES = [
  "Mobilité et déplacement",
  "Vie de quartier et lien social",
  "Environnement",
  "Solidarité",
  "Numérique",
  "Culture et éducation",
];

// Couleur de bandeau par thématique (pastels charte).
export const CAT_COLOR: Record<string, string> = {
  "Mobilité et déplacement": "#F0C3A6",
  "Vie de quartier et lien social": "#9FC9CC",
  "Environnement": "#A9CF9C",
  "Solidarité": "#CBA9C2",
  "Numérique": "#B7A6D6",
  "Culture et éducation": "#E0C088",
};

export const IDEAS: Idea[] = [
  { cat: "Mobilité et déplacement", color: CAT_COLOR["Mobilité et déplacement"], title: "Rendre le Vieux-Lyon accessible aux familles", desc: "Réaménager les passages pavés, impraticables en poussette ou en fauteuil roulant.", messages: 15, date: "12 juin à 9h08", author: "Camille R.", status: "suivie" },
  { cat: "Solidarité", color: CAT_COLOR["Solidarité"], title: "Une épicerie solidaire de quartier", desc: "Créer un lieu d'entraide alimentaire géré par et pour les habitants.", messages: 9, date: "10 juin à 14h20", author: "Yann B.", status: "suivie" },
  { cat: "Vie de quartier et lien social", color: CAT_COLOR["Vie de quartier et lien social"], title: "Des activités pour les enfants du quartier", desc: "Organiser des ateliers et des sorties pendant les vacances scolaires.", messages: 21, date: "08 juin à 18h45", author: "Inès M." },
  { cat: "Environnement", color: CAT_COLOR["Environnement"], title: "Des îlots de fraîcheur en centre-ville", desc: "Végétaliser quatre places minérales pour rafraîchir la ville l'été.", messages: 11, date: "05 juin à 11h32", author: "Théo L.", status: "emise" },
  { cat: "Numérique", color: CAT_COLOR["Numérique"], title: "Des ateliers contre la fracture numérique", desc: "Accompagner les aînés vers l'autonomie numérique au quotidien.", messages: 7, date: "03 juin à 16h10", author: "Sofia D." },
  { cat: "Mobilité et déplacement", color: CAT_COLOR["Mobilité et déplacement"], title: "Sécuriser les abords des écoles", desc: "Apaiser la circulation et créer des cheminements piétons sûrs aux heures de sortie.", messages: 18, date: "31 mai à 8h50", author: "Marc V." },
  { cat: "Environnement", color: CAT_COLOR["Environnement"], title: "Un composteur partagé par immeuble", desc: "Installer des composteurs collectifs et former des référents de quartier.", messages: 6, date: "28 mai à 19h05", author: "Lila F." },
  { cat: "Culture et éducation", color: CAT_COLOR["Culture et éducation"], title: "Une boîte à livres dans chaque parc", desc: "Favoriser le partage de lectures et les rencontres entre habitants.", messages: 13, date: "25 mai à 10h15", author: "Hugo T.", status: "archivee" },
  { cat: "Vie de quartier et lien social", color: CAT_COLOR["Vie de quartier et lien social"], title: "Un repas de quartier chaque saison", desc: "Quatre rendez-vous conviviaux par an pour tisser du lien entre voisins.", messages: 10, date: "22 mai à 12h40", author: "Awa S." },
];

export const EVENTS: Event[] = [
  { tag: "Nouveauté", title: "Forum sur les droits des femmes", desc: "Une journée d'échanges et d'ateliers participatifs ouverts à tous.", day: "06", month: "mars", grad: "linear-gradient(135deg,#E8A98F,#C85A48)" },
  { tag: "Concertation", title: "Nouveau plan de mobilité : votre avis", desc: "Co-construire les futurs aménagements du quartier avec la ville.", day: "15", month: "mars", grad: "linear-gradient(135deg,#8FB8C9,#5E7E91)" },
  { tag: "Forum", title: "Forum citoyen sur la transition", desc: "Échanges autour de la transition écologique et des gestes concrets.", day: "17", month: "mars", grad: "linear-gradient(135deg,#9FC79A,#5E8A57)" },
  { tag: "Récit", title: "Journée de bénévolat citoyen", desc: "Nettoyage des espaces verts et stands associatifs de quartier.", day: "23", month: "mars", grad: "linear-gradient(135deg,#C9A8C0,#7A5E73)" },
  { tag: "Atelier", title: "Atelier budgets municipaux", desc: "Comprendre et participer aux choix budgétaires de votre commune.", day: "27", month: "mars", grad: "linear-gradient(135deg,#E0C088,#B4863C)" },
  { tag: "Rencontre", title: "Café des initiatives locales", desc: "Rencontrer les porteurs de projets et rejoindre une action près de chez vous.", day: "02", month: "avril", grad: "linear-gradient(135deg,#E8A98F,#B5705A)" },
  { tag: "Concertation", title: "Quels usages pour la friche Nord ?", desc: "Imaginer ensemble l'avenir d'un espace à réinventer.", day: "09", month: "avril", grad: "linear-gradient(135deg,#9FB8C9,#5E7E91)" },
  { tag: "Atelier", title: "Initiation au compostage partagé", desc: "Apprendre les bons gestes pour lancer un composteur d'immeuble.", day: "16", month: "avril", grad: "linear-gradient(135deg,#9FC79A,#5E8A57)" },
];
