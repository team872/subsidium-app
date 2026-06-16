// Données de démonstration de l'accueil membre (à remplacer par l'API).

export type Idea = {
  cat: string; color: string; title: string; desc: string; messages: number; date: string;
};
export type Event = {
  tag: string; title: string; desc: string; day: string; month: string; grad: string;
};

export const IDEAS: Idea[] = [
  { cat: "Mobilité", color: "#E8A98F", title: "Rendre le Vieux-Lyon accessible aux familles", desc: "Réaménager les passages pavés, impraticables en poussette ou en fauteuil.", messages: 15, date: "12 juin" },
  { cat: "Solidarité", color: "#C9A8C0", title: "Une épicerie solidaire de quartier", desc: "Créer un lieu d'entraide alimentaire géré par les habitants.", messages: 9, date: "10 juin" },
  { cat: "Vie de quartier", color: "#8FB8C9", title: "Des activités pour les enfants du quartier", desc: "Organiser des ateliers et des sorties pendant les vacances.", messages: 21, date: "08 juin" },
  { cat: "Environnement", color: "#9FC79A", title: "Des îlots de fraîcheur en centre-ville", desc: "Végétaliser quatre places minérales pour l'été.", messages: 11, date: "05 juin" },
  { cat: "Numérique", color: "#B7A6D6", title: "Des ateliers contre la fracture numérique", desc: "Accompagner les aînés vers l'autonomie numérique.", messages: 7, date: "03 juin" },
];

export const EVENTS: Event[] = [
  { tag: "Nouveauté", title: "Forum sur les droits des femmes", desc: "Une journée d'échanges et d'ateliers participatifs.", day: "06", month: "mars", grad: "linear-gradient(135deg,#E8A98F,#C85A48)" },
  { tag: "Concertation", title: "Nouveau plan de mobilité : votre avis", desc: "Co-construire les futurs aménagements du quartier.", day: "15", month: "mars", grad: "linear-gradient(135deg,#8FB8C9,#5E7E91)" },
  { tag: "Forum", title: "Forum citoyen sur la transition", desc: "Échanges autour de la transition écologique.", day: "17", month: "mars", grad: "linear-gradient(135deg,#9FC79A,#5E8A57)" },
  { tag: "Récit", title: "Journée de bénévolat citoyen", desc: "Nettoyage des espaces verts et stands associatifs.", day: "23", month: "mars", grad: "linear-gradient(135deg,#C9A8C0,#7A5E73)" },
  { tag: "Atelier", title: "Atelier budgets municipaux", desc: "Comprendre et participer aux choix budgétaires.", day: "27", month: "mars", grad: "linear-gradient(135deg,#E0C088,#B4863C)" },
];
