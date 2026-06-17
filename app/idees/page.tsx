"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { IDEAS, CATEGORIES } from "@/lib/feed";
import "@/components/MemberBoards.css";

const TABS = [
  { key: "toutes", label: "Toutes les idées" },
  { key: "suivies", label: "Idées suivies" },
  { key: "emises", label: "Idées émises" },
  { key: "archivees", label: "Idées archivées" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function IdeesPage() {
  const [tab, setTab] = useState<TabKey>("toutes");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");

  const list = useMemo(() => {
    return IDEAS.filter((it) => {
      if (tab === "suivies" && it.status !== "suivie") return false;
      if (tab === "emises" && it.status !== "emise") return false;
      if (tab === "archivees" && it.status !== "archivee") return false;
      if (cat && it.cat !== cat) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!it.title.toLowerCase().includes(q) && !it.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tab, query, cat]);

  return (
    <AppShell>
      <div className="board-head">
        <h1>Idées citoyennes</h1>
        <button className="btn btn-coral">Exprimer une idée</button>
      </div>

      <div className="board-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Saisissez une ville, un code postal, un département…"
          />
        </div>
        <select className="board-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Toutes les thématiques</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <p className="board-empty">Aucune idée ne correspond à votre recherche pour le moment.</p>
      ) : (
        <div className="idees-grid">
          {list.map((it, i) => (
            <article className="icard" key={i}>
              <div className="band" style={{ background: it.color }}>
                <span>{it.cat}</span>
              </div>
              <div className="bd">
                <h3>{it.title}</h3>
                <p>{it.desc}</p>
                <div className="foot">
                  <span className="msg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" /></svg>
                    {it.messages} messages
                  </span>
                  <span className="auth">Par {it.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
