"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import "@/components/MemberBoards.css";

type QA = { q: string; a: string };
type Cat = { titre: string; items: QA[] };
type Content = { title: string; subtitle: string; search: string; noResult: string; cats: Cat[] };

const CONTENT: Record<string, Content> = {
  fr: {
    title: "Notre espace d'aide Subsidium",
    subtitle: "Besoin d'aide ? Retrouvez les réponses aux questions les plus fréquentes, par thématique.",
    search: "Rechercher une question…", noResult: "Aucune réponse ne correspond à votre recherche.",
    cats: [
      { titre: "Compte & connexion", items: [
        { q: "Comment modifier mes informations personnelles ?", a: "Depuis votre espace Compte, cliquez sur « Modifier mes informations » pour mettre à jour votre nom, votre situation, votre ville et votre adresse mail." },
        { q: "Comment me déconnecter ?", a: "Cliquez sur le bouton de déconnexion en bas du menu latéral, à côté de votre nom." },
        { q: "Comment changer la langue ?", a: "Dans le menu (en bas) ou depuis votre Compte, choisissez Français, English ou Italiano : l'interface bascule immédiatement." },
      ] },
      { titre: "Parcours & niveaux", items: [
        { q: "Comment devenir Refondateur ?", a: "Adhérez à la Charte d'engagement via un court entretien avec un agent, puis finalisez votre adhésion. Vous devenez alors Refondateur." },
        { q: "Comment passer Initiateur ?", a: "Réussissez l'auto-évaluation éthique pour obtenir le badge : vous accédez au niveau Initiateur (projets, missions, market-place)." },
        { q: "Qu'est-ce qu'un Refondateur Certifié (Leader) ?", a: "En suivant le Parcours Leader puis en demandant la certification (validée par l'équipe), vous pouvez créer et animer des Clubs." },
      ] },
      { titre: "Idées & Projets", items: [
        { q: "Quelle différence entre une idée et un projet ?", a: "Une idée est une proposition ouverte au débat. Un projet est une initiative structurée que l'on peut suivre, rejoindre ou porter." },
        { q: "Comment proposer une idée ?", a: "Dans la rubrique Idées, cliquez sur « Exprimer une idée »." },
        { q: "Qu'est-ce qu'un projet privé ?", a: "Un projet privé n'est visible que par ses membres. Candidatez pour demander à le rejoindre." },
      ] },
      { titre: "Confidentialité & support", items: [
        { q: "Mes données sont-elles sécurisées ?", a: "Vos données sont conservées de manière sécurisée et utilisées uniquement pour le fonctionnement de la plateforme." },
        { q: "Comment contacter le support ?", a: "Écrivez à l'équipe Subsidium depuis votre Compte ; nous revenons vers vous au plus vite." },
      ] },
    ],
  },
  en: {
    title: "Our Subsidium help center",
    subtitle: "Need help? Find answers to the most frequent questions, by topic.",
    search: "Search a question…", noResult: "No answer matches your search.",
    cats: [
      { titre: "Account & sign-in", items: [
        { q: "How do I edit my personal information?", a: "From your Account, click “Edit my information” to update your name, status, city and email." },
        { q: "How do I log out?", a: "Click the log-out button at the bottom of the side menu, next to your name." },
        { q: "How do I change the language?", a: "In the menu (bottom) or from your Account, choose Français, English or Italiano: the interface switches instantly." },
      ] },
      { titre: "Journey & levels", items: [
        { q: "How do I become a Refounder?", a: "Sign the Engagement Charter via a short interview with an agent, then complete your membership. You become a Refounder." },
        { q: "How do I become an Initiator?", a: "Pass the ethical self-assessment to earn the badge: you reach the Initiator level (projects, missions, marketplace)." },
        { q: "What is a Certified Refounder (Leader)?", a: "By completing the Leader Path and requesting certification (validated by the team), you can create and run Clubs." },
      ] },
      { titre: "Ideas & Projects", items: [
        { q: "What's the difference between an idea and a project?", a: "An idea is a proposal open to discussion. A project is a structured initiative you can follow, join or lead." },
        { q: "How do I propose an idea?", a: "In the Ideas section, click “Propose an idea”." },
        { q: "What is a private project?", a: "A private project is only visible to its members. Apply to request to join it." },
      ] },
      { titre: "Privacy & support", items: [
        { q: "Is my data secure?", a: "Your data is stored securely and used only to run the platform." },
        { q: "How do I contact support?", a: "Reach out to the Subsidium team from your Account; we'll get back to you quickly." },
      ] },
    ],
  },
  it: {
    title: "Il nostro centro assistenza Subsidium",
    subtitle: "Hai bisogno di aiuto? Trova le risposte alle domande più frequenti, per argomento.",
    search: "Cerca una domanda…", noResult: "Nessuna risposta corrisponde alla tua ricerca.",
    cats: [
      { titre: "Account & accesso", items: [
        { q: "Come modifico i miei dati personali?", a: "Dal tuo Account, clicca su « Modifica i miei dati » per aggiornare nome, situazione, città ed email." },
        { q: "Come mi disconnetto?", a: "Clicca sul pulsante di disconnessione in fondo al menu laterale, accanto al tuo nome." },
        { q: "Come cambio la lingua ?", a: "Nel menu (in basso) o dal tuo Account, scegli Français, English o Italiano: l'interfaccia cambia subito." },
      ] },
      { titre: "Percorso & livelli", items: [
        { q: "Come divento Rifondatore?", a: "Aderisci alla Carta d'impegno con un breve colloquio con un agente, poi completa l'adesione. Diventi Rifondatore." },
        { q: "Come divento Iniziatore?", a: "Supera l'autovalutazione etica per ottenere il badge: accedi al livello Iniziatore (progetti, missioni, marketplace)." },
        { q: "Cos'è un Rifondatore Certificato (Leader)?", a: "Completando il Percorso Leader e richiedendo la certificazione (convalidata dal team), puoi creare e animare Club." },
      ] },
      { titre: "Idee & Progetti", items: [
        { q: "Che differenza c'è tra un'idea e un progetto?", a: "Un'idea è una proposta aperta al dibattito. Un progetto è un'iniziativa strutturata che puoi seguire, raggiungere o guidare." },
        { q: "Come propongo un'idea?", a: "Nella sezione Idee, clicca su « Proponi un'idea »." },
        { q: "Cos'è un progetto privato?", a: "Un progetto privato è visibile solo ai suoi membri. Candidati per chiedere di unirti." },
      ] },
      { titre: "Privacy & supporto", items: [
        { q: "I miei dati sono al sicuro?", a: "I tuoi dati sono conservati in modo sicuro e usati solo per il funzionamento della piattaforma." },
        { q: "Come contatto il supporto?", a: "Scrivi al team Subsidium dal tuo Account; ti risponderemo al più presto." },
      ] },
    ],
  },
};

export default function FaqPage() {
  const { lang } = useLang();
  const C = CONTENT[lang] || CONTENT.fr;
  const [cat, setCat] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const searching = q.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    const s = q.toLowerCase();
    const out: { cat: string; item: QA }[] = [];
    C.cats.forEach((c) => c.items.forEach((it) => { if (it.q.toLowerCase().includes(s) || it.a.toLowerCase().includes(s)) out.push({ cat: c.titre, item: it }); }));
    return out;
  }, [q, searching, C]);

  function item(qa: QA, sub: string, idx: number) {
    const id = sub + "-" + idx;
    const isOpen = open === id;
    return (
      <div key={id} style={{ border: "1px solid #EBD9CD", borderRadius: 12, background: "#fff", marginBottom: 10, overflow: "hidden" }}>
        <button onClick={() => setOpen(isOpen ? null : id)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "#372646", fontWeight: 700, fontSize: 15 }}>
          <span style={{ flex: 1 }}>{qa.q}</span>
          <span style={{ color: "#C2452F", fontSize: 22, lineHeight: 1, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .15s" }}>+</span>
        </button>
        {isOpen && <div style={{ padding: "0 16px 14px", color: "#5E4A73", fontSize: 14, lineHeight: 1.6 }}>{qa.a}</div>}
      </div>
    );
  }

  const current = C.cats[cat] || C.cats[0];

  return (
    <AppShell>
      <div className="board-head"><h1>{C.title}</h1></div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 16px", lineHeight: 1.6 }}>{C.subtitle}</p>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={C.search} />
        </div>
      </div>

      {searching ? (
        <div style={{ maxWidth: 860 }}>
          {results.length === 0 ? <p className="board-empty">{C.noResult}</p> : results.map((r, i) => item(r.item, "search", i))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
          <nav style={{ flex: "1 1 220px", maxWidth: 260, border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: 6 }}>
            {C.cats.map((c, i) => (
              <button key={i} onClick={() => { setCat(i); setOpen(null); }} style={{ width: "100%", textAlign: "left", background: i === cat ? "#FCE9E2" : "none", color: i === cat ? "#C2452F" : "#5E4A73", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontWeight: i === cat ? 800 : 600, fontSize: 14 }}>
                {c.titre}
              </button>
            ))}
          </nav>
          <div style={{ flex: "2 1 460px" }}>
            <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{current.titre}</h2>
            {current.items.map((qa, i) => item(qa, "c" + cat, i))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
