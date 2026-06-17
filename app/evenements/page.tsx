"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { EVENTS } from "@/lib/feed";
import "@/components/MemberBoards.css";

const TAGS = ["Tout afficher", "Nouveauté", "Concertation", "Forum", "Atelier", "Rencontre", "Récit"];

export default function EvenementsPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Tout afficher");

  const list = useMemo(() => {
    return EVENTS.filter((ev) => {
      if (tag !== "Tout afficher" && ev.tag !== tag) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) && !ev.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [query, tag]);

  return (
    <AppShell>
      <div className="board-head">
        <h1>Actualités &amp; événements</h1>
      </div>

      <div className="board-tools" style={{ marginTop: 8 }}>
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une actualité, un événement, une ville…"
          />
        </div>
        <select className="board-select" value={tag} onChange={(e) => setTag(e.target.value)}>
          {TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <p className="board-empty">Aucune actualité ne correspond à votre recherche pour le moment.</p>
      ) : (
        <div className="actus-grid">
          {list.map((ev, i) => (
            <article className="acard" key={i}>
              <div className="ph" style={{ backgroundImage: ev.grad }}>
                <span className="tg">{ev.tag}</span>
                <span className="dt"><b>{ev.day}</b><small>{ev.month}</small></span>
              </div>
              <div className="bd">
                <h3>{ev.title}</h3>
                <p>{ev.desc}</p>
                <span className="more">Lire la suite</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
