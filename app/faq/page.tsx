"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type QA = { q: string; a: string };
type Cat = { key: string; titre: string; items: QA[] };

const CATEGORIES: Cat[] = [
  {
    key: "compte", titre: "Compte & connexion",
    items: [
      { q: "Comment modifier mes informations personnelles ?", a: "Depuis votre espace Compte, cliquez sur « Modifier mes informations ». Vous pouvez y mettre à jour votre nom, votre situation, votre ville et votre adresse mail." },
      { q: "Comment changer mon adresse e-mail ?", a: "Rendez-vous dans votre Compte, section informations personnelles, et modifiez l'adresse mail. Une confirmation peut vous être demandée pour sécuriser le changement." },
      { q: "Comment me déconnecter de mon compte ?", a: "Cliquez sur le bouton de déconnexion en bas du menu latéral, à côté de votre nom. Vous serez ramené à l'écran de connexion." },
      { q: "J'ai oublié mon mot de passe, que faire ?", a: "Sur l'écran de connexion, utilisez le lien de réinitialisation pour recevoir les instructions par e-mail. Pour toute difficulté, contactez le support." },
    ],
  },
  {
    key: "parcours", titre: "Parcours & niveaux",
    items: [
      { q: "Comment devenir Refondateur ?", a: "Adhérez à la Charte d'engagement via un court entretien avec l'agent SUBSIDIUM, puis finalisez votre adhésion. Vous devenez alors Refondateur et pouvez exprimer vos idées." },
      { q: "Qu'est-ce que l'auto-évaluation éthique ?", a: "C'est un parcours d'accompagnement (et non un test idéologique) qui couvre 8 dimensions de la doctrine. Vos réponses, formulées à l'échelle Jamais / Parfois / Souvent / Toujours, situent votre engagement et peuvent ouvrir le niveau Initiateur." },
      { q: "Comment passer Initiateur ?", a: "Après avoir obtenu le badge à l'auto-évaluation, vous accédez au niveau Initiateur : vous pouvez porter des projets, candidater aux missions et accéder à la Market-place." },
      { q: "Qu'est-ce qu'un Refondateur Certifié (Leader) ?", a: "En suivant le Parcours Leader puis en demandant la certification (validée par l'équipe SUBSIDIUM), vous devenez Refondateur Certifié. Vous pouvez alors créer et animer des Clubs." },
    ],
  },
  {
    key: "idees", titre: "Idées & Projets",
    items: [
      { q: "Quelle différence entre une idée et un projet ?", a: "Une idée est une proposition citoyenne ouverte au débat. Un projet (appel à projet) est une initiative structurée que l'on peut suivre, rejoindre ou porter, avec un fil d'activité et des contributeurs." },
      { q: "Comment proposer une idée ?", a: "Depuis la rubrique Idées, cliquez sur « Exprimer une idée ». Votre idée rejoint le débat citoyen où chacun peut réagir et échanger." },
      { q: "Comment publier ou rejoindre un projet ?", a: "Dans la rubrique Projets, utilisez « Publier un projet » pour porter le vôtre. Pour contribuer à un projet existant, ouvrez sa fiche puis « Suivre » ou « Candidater pour contribuer »." },
      { q: "Qu'est-ce qu'un projet privé ?", a: "Un projet privé n'est visible que par ses membres. Pour y accéder, candidatez : le porteur du projet accepte ou refuse votre demande." },
    ],
  },
  {
    key: "engagement", titre: "Missions, Market-place & Organisations",
    items: [
      { q: "Comment candidater à une mission ?", a: "Ouvrez la fiche de la mission puis cliquez sur « Candidater » et complétez le formulaire. L'organisation émettrice reçoit votre candidature et peut l'accepter ou la refuser." },
      { q: "Comment contacter une offre de la Market-place ?", a: "Sur la fiche de l'offre, utilisez le formulaire de contact. Votre demande est transmise à l'organisation qui propose l'offre." },
      { q: "Comment réفérencer mon organisation ?", a: "Dans la rubrique Organisations, cliquez sur « Créer une organisation ». Elle est ensuite soumise à labellisation par SUBSIDIUM avant d'apparaître dans l'annuaire public." },
      { q: "Qu'est-ce que la labellisation ?", a: "La labellisation est la validation d'une organisation par SUBSIDIUM. Une organisation labellisée apparaît dans l'annuaire et gagne en visibilité auprès des citoyens." },
    ],
  },
  {
    key: "clubs", titre: "Clubs",
    items: [
      { q: "Qu'est-ce qu'un Club ?", a: "Un Club réunit des citoyens autour d'une thématique ou d'un territoire, avec un mur de partage pour échanger entre membres." },
      { q: "Comment créer un Club ?", a: "La création de Clubs est réservée aux Refondateurs Certifiés (Leaders). Une fois certifié, utilisez « Créer un club » dans la rubrique Clubs." },
    ],
  },
  {
    key: "confidentialite", titre: "Confidentialité & sécurité",
    items: [
      { q: "Mes données sont-elles sécurisées ?", a: "Vos données personnelles sont conservées de manière sécurisée et ne sont utilisées que pour le fonctionnement de la plateforme. Vous pouvez les consulter et les mettre à jour à tout moment depuis votre Compte." },
      { q: "Qui peut voir mes contributions ?", a: "Vos idées et messages publics sont visibles par la communauté. Les contenus des projets privés et des clubs ne sont visibles que par leurs membres." },
    ],
  },
  {
    key: "support", titre: "Support",
    items: [
      { q: "Comment contacter le support ?", a: "Écrivez à l'équipe SUBSIDIUM depuis votre Compte ou à l'adresse de contact indiquée. Nous revenons vers vous dans les meilleurs délais." },
      { q: "Que faire en cas de problème technique ?", a: "Rechargez la page et vérifiez votre connexion. Si le problème persiste, contactez le support en décrivant l'écran concerné et l'action effectuée." },
    ],
  },
];

// correction d'un caractère d'échappement involontaire
CATEGORIES[3].items[2].q = "Comment référencer mon organisation ?";

export default function FaqPage() {
  const [cat, setCat] = useState(CATEGORIES[0].key);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const searching = q.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    const s = q.toLowerCase();
    const out: { cat: string; item: QA }[] = [];
    for (const c of CATEGORIES) for (const it of c.items)
      if (it.q.toLowerCase().includes(s) || it.a.toLowerCase().includes(s)) out.push({ cat: c.titre, item: it });
    return out;
  }, [q, searching]);

  const current = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];

  function item(qa: QA, sub?: string, idx?: number) {
    const id = (sub || cat) + "-" + (idx ?? qa.q);
    const isOpen = open === id;
    return (
      <div key={id} style={{ border: "1px solid #EBD9CD", borderRadius: 12, background: "#fff", marginBottom: 10, overflow: "hidden" }}>
        <button onClick={() => setOpen(isOpen ? null : id)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "#372646", fontWeight: 700, fontSize: 15 }}>
          <span style={{ flex: 1 }}>{qa.q}{sub ? <span style={{ color: "#9C919E", fontWeight: 500, fontSize: 12.5 }}> · {sub}</span> : null}</span>
          <span style={{ color: "#C2452F", fontSize: 22, lineHeight: 1, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .15s" }}>+</span>
        </button>
        {isOpen && <div style={{ padding: "0 16px 14px", color: "#5E4A73", fontSize: 14, lineHeight: 1.6 }}>{qa.a}</div>}
      </div>
    );
  }

  return (
    <AppShell>
      <div className="board-head"><h1>Notre espace d'aide Subsidium</h1></div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 16px", lineHeight: 1.6 }}>
        Besoin d'aide ? Retrouvez les réponses aux questions les plus fréquentes, par thématique.
      </p>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une question…" />
        </div>
      </div>

      {searching ? (
        <div style={{ maxWidth: 860 }}>
          {results.length === 0 ? <p className="board-empty">Aucune réponse ne correspond à votre recherche.</p>
          : results.map((r, i) => item(r.item, r.cat, i))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
          <nav style={{ flex: "1 1 220px", maxWidth: 260, border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: 6 }}>
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => { setCat(c.key); setOpen(null); }} style={{ width: "100%", textAlign: "left", background: c.key === cat ? "#FCE9E2" : "none", color: c.key === cat ? "#C2452F" : "#5E4A73", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontWeight: c.key === cat ? 800 : 600, fontSize: 14 }}>
                {c.titre}
              </button>
            ))}
          </nav>
          <div style={{ flex: "2 1 460px" }}>
            <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{current.titre}</h2>
            {current.items.map((qa, i) => item(qa, undefined, i))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
