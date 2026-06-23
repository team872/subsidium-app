// Socle i18n trilingue FR / EN / IT. Dictionnaires plats (clés pointées).
// Repli : si une clé manque dans la langue, on retombe sur le français, puis sur la clé.
export type Lang = "fr" | "en" | "it";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
];

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.accueil": "Accueil", "nav.idees": "Idées", "nav.projets": "Projets", "nav.organisations": "Organisations",
  "nav.missions": "Missions", "nav.marche": "Market-place", "nav.leader": "Parcours Leader", "nav.clubs": "Clubs",
  "nav.evenements": "Événements", "nav.notifications": "Notifications", "nav.faq": "Aide & FAQ", "nav.admin": "Administration",
  "role.0": "Visiteur", "role.1": "Refondateur", "role.2": "Initiateur", "role.3": "Refondateur Certifié", "role.4": "Ambassadeur",
  "common.administrator": "Administrateur", "common.logout": "Se déconnecter", "common.seeAll": "Voir tout",
  "common.list": "Liste", "common.map": "Carte", "common.language": "Langue",
  "accueil.welcome": "Bienvenue sur Subsidium",
  "accueil.ideaFollowed": "Idée suivie", "accueil.ideasFollowed": "Idées suivies",
  "accueil.ideaPosted": "Idée émise", "accueil.ideasPosted": "Idées émises",
  "accueil.newIdeasNearby": "Nouvelles idées Subsidium autour de vous",
  "accueil.upcomingEvents": "Les prochains événements Subsidium",
  "accueil.messages": "messages", "accueil.myAccount": "Mon compte", "accueil.proposeIdea": "Proposer une idée",
  "bot.subtitle": "Votre guide Subsidium",
  "bot.greeting": "Bonjour, je suis l'assistant SUBSIDIUM AI ✨ Posez-moi vos questions sur la plateforme, la démarche ou votre parcours.",
  "bot.s1": "Comment devenir Refondateur ?", "bot.s2": "Différence entre une idée et un projet ?", "bot.s3": "C'est quoi un Club ?",
  "bot.thinking": "réfléchit…", "bot.placeholder": "Écrivez votre message…", "bot.send": "Envoyer",
  "bot.fallback": "Désolé, je n'ai pas pu répondre.", "bot.offline": "Connexion impossible pour le moment. Réessayez dans un instant.",
  "bot.open": "Ouvrir l'assistant SUBSIDIUM AI",
};

const en: Dict = {
  "nav.accueil": "Home", "nav.idees": "Ideas", "nav.projets": "Projects", "nav.organisations": "Organizations",
  "nav.missions": "Missions", "nav.marche": "Marketplace", "nav.leader": "Leader Path", "nav.clubs": "Clubs",
  "nav.evenements": "Events", "nav.notifications": "Notifications", "nav.faq": "Help & FAQ", "nav.admin": "Administration",
  "role.0": "Visitor", "role.1": "Refounder", "role.2": "Initiator", "role.3": "Certified Refounder", "role.4": "Ambassador",
  "common.administrator": "Administrator", "common.logout": "Log out", "common.seeAll": "See all",
  "common.list": "List", "common.map": "Map", "common.language": "Language",
  "accueil.welcome": "Welcome to Subsidium",
  "accueil.ideaFollowed": "Idea followed", "accueil.ideasFollowed": "Ideas followed",
  "accueil.ideaPosted": "Idea posted", "accueil.ideasPosted": "Ideas posted",
  "accueil.newIdeasNearby": "New Subsidium ideas near you",
  "accueil.upcomingEvents": "Upcoming Subsidium events",
  "accueil.messages": "messages", "accueil.myAccount": "My account", "accueil.proposeIdea": "Propose an idea",
  "bot.subtitle": "Your Subsidium guide",
  "bot.greeting": "Hello, I'm the SUBSIDIUM AI assistant ✨ Ask me anything about the platform, the approach or your journey.",
  "bot.s1": "How do I become a Refounder?", "bot.s2": "Difference between an idea and a project?", "bot.s3": "What is a Club?",
  "bot.thinking": "is thinking…", "bot.placeholder": "Type your message…", "bot.send": "Send",
  "bot.fallback": "Sorry, I couldn't reply.", "bot.offline": "Connection unavailable right now. Try again in a moment.",
  "bot.open": "Open the SUBSIDIUM AI assistant",
};

const it: Dict = {
  "nav.accueil": "Home", "nav.idees": "Idee", "nav.projets": "Progetti", "nav.organisations": "Organizzazioni",
  "nav.missions": "Missioni", "nav.marche": "Marketplace", "nav.leader": "Percorso Leader", "nav.clubs": "Club",
  "nav.evenements": "Eventi", "nav.notifications": "Notifiche", "nav.faq": "Aiuto & FAQ", "nav.admin": "Amministrazione",
  "role.0": "Visitatore", "role.1": "Rifondatore", "role.2": "Iniziatore", "role.3": "Rifondatore Certificato", "role.4": "Ambasciatore",
  "common.administrator": "Amministratore", "common.logout": "Disconnetti", "common.seeAll": "Vedi tutto",
  "common.list": "Elenco", "common.map": "Mappa", "common.language": "Lingua",
  "accueil.welcome": "Benvenuto su Subsidium",
  "accueil.ideaFollowed": "Idea seguita", "accueil.ideasFollowed": "Idee seguite",
  "accueil.ideaPosted": "Idea proposta", "accueil.ideasPosted": "Idee proposte",
  "accueil.newIdeasNearby": "Nuove idee Subsidium vicino a te",
  "accueil.upcomingEvents": "I prossimi eventi Subsidium",
  "accueil.messages": "messaggi", "accueil.myAccount": "Il mio account", "accueil.proposeIdea": "Proponi un'idea",
  "bot.subtitle": "La tua guida Subsidium",
  "bot.greeting": "Ciao, sono l'assistente SUBSIDIUM AI ✨ Fammi domande sulla piattaforma, l'approccio o il tuo percorso.",
  "bot.s1": "Come diventare Rifondatore?", "bot.s2": "Differenza tra un'idea e un progetto?", "bot.s3": "Cos'è un Club?",
  "bot.thinking": "sta pensando…", "bot.placeholder": "Scrivi il tuo messaggio…", "bot.send": "Invia",
  "bot.fallback": "Spiacente, non sono riuscito a rispondere.", "bot.offline": "Connessione non disponibile. Riprova tra un istante.",
  "bot.open": "Apri l'assistente SUBSIDIUM AI",
};

export const DICTS: Record<Lang, Dict> = { fr, en, it };

export function translate(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? fr[key] ?? key;
}
