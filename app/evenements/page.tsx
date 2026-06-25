"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import type { EventDTO } from "@/lib/data";
import "@/components/MemberBoards.css";

const CarteSubsidium = dynamic(() => import("@/components/CarteSubsidium"), {
  ssr: false,
  loading: () => <div className="board-empty">…</div>,
});

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  fr: {
    title: "Actualités & événements",
    search: "Rechercher une actualité, un événement, une ville…",
    list: "Liste", map: "Carte",
    loading: "Chargement des actualités…", empty: "Aucune actualité ne correspond à votre recherche pour le moment.",
    more: "Lire la suite",
    tAll: "Tout afficher", tNews: "Nouveauté", tConcert: "Concertation", tForum: "Forum", tAtelier: "Atelier", tRencontre: "Rencontre", tRecit: "Récit",
  },
  en: {
    title: "News & events",
    search: "Search news, an event, a city…",
    list: "List", map: "Map",
    loading: "Loading news…", empty: "No news matches your search at the moment.",
    more: "Read more",
    tAll: "Show all", tNews: "News", tConcert: "Consultation", tForum: "Forum", tAtelier: "Workshop", tRencontre: "Meetup", tRecit: "Story",
  },
  it: {
    title: "Notizie ed eventi",
    search: "Cerca una notizia, un evento, una città…",
    list: "Elenco", map: "Mappa",
    loading: "Caricamento delle notizie…", empty: "Nessuna notizia corrisponde alla ricerca al momento.",
    more: "Leggi tutto",
    tAll: "Mostra tutto", tNews: "Novità", tConcert: "Concertazione", tForum: "Forum", tAtelier: "Laboratorio", tRencontre: "Incontro", tRecit: "Racconto",
  },
};

const TAGS = ["Tout afficher", "Nouveauté", "Concertation", "Forum", "Atelier", "Rencontre", "Récit"];
const TAG_KEY: Record<string, string> = { "Tout afficher": "tAll", "Nouveauté": "tNews", "Concertation": "tConcert", "Forum": "tForum", "Atelier": "tAtelier", "Rencontre": "tRencontre", "Récit": "tRecit" };
function tagLabel(t: string, tr: Dict) { return tr[TAG_KEY[t]] || t; }

function EventCard({ ev }: { ev: EventDTO }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <article className="acard">
      <div className="ph" style={{ backgroundImage: ev.grad }}>
        <span className="tg">{tagLabel(ev.tag, tr)}</span>
        <span className="dt"><b>{ev.day}</b><small>{ev.month}</small></span>
      </div>
      <div className="bd">
        <h3>{ev.title}</h3>
        <p>{ev.desc}</p>
        <span className="more">{tr.more}</span>
      </div>
    </article>
  );
}

function EventRow({ ev }: { ev: EventDTO }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: "12px 14px" }}>
      <div style={{ flexShrink: 0, width: 48, borderRadius: 10, backgroundImage: ev.grad, color: "#fff", textAlign: "center", padding: "8px 0", lineHeight: 1.1 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{ev.day}</div>
        <div style={{ fontSize: 10.5, textTransform: "uppercase" }}>{ev.month}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{tagLabel(ev.tag, tr)}</span>
        <h3 style={{ margin: "2px 0 4px", color: "#372646", fontSize: 15 }}>{ev.title}</h3>
        <p style={{ color: "#5E4A73", fontSize: 13, margin: 0, lineHeight: 1.45 }}>{ev.desc}</p>
      </div>
    </div>
  );
}

export default function EvenementsPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [items, setItems] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Tout afficher");
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [allPoints, setAllPoints] = useState<any[]>([]);

  useEffect(() => {
    fetch("/app/api/events").then((r) => r.json()).then((d) => setItems(d.events || [])).catch(() => setItems([])).finally(() => setLoading(false));
    fetch("/app/api/events/geo").then((r) => r.json()).then((d) => setAllPoints(d.points || [])).catch(() => {});
  }, []);

  const list = useMemo(() => {
    return items.filter((ev) => {
      if (tag !== "Tout afficher" && ev.tag !== tag) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) && !ev.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, query, tag]);

  const points = useMemo(() => {
    const ids = new Set(list.map((x) => x.id));
    return allPoints.filter((p) => ids.has(p.id));
  }, [allPoints, list]);

  return (
    <AppShell>
      <div className="board-head"><h1>{tr.title}</h1></div>

      <div className="board-tools" style={{ marginTop: 8 }}>
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr.search} />
        </div>
        <select className="board-select" value={tag} onChange={(e) => setTag(e.target.value)}>
          {TAGS.map((t) => <option key={t} value={t}>{tagLabel(t, tr)}</option>)}
        </select>
        <div style={{ display: "inline-flex", border: "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
          <button type="button" onClick={() => setView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>{tr.list}</button>
          <button type="button" onClick={() => setView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>{tr.map}</button>
        </div>
      </div>

      {loading ? (
        <p className="board-empty">{tr.loading}</p>
      ) : list.length === 0 ? (
        <p className="board-empty">{tr.empty}</p>
      ) : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((ev) => <EventRow key={ev.id} ev={ev} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="actus-grid">
          {list.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      )}
    </AppShell>
  );
}
