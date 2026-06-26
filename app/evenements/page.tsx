"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import ImagePicker from "@/components/ImagePicker";
import { keywordsFromText } from "@/lib/keywords";
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
    create: "Créer un événement", close: "Fermer",
    fTag: "Type", fTitle: "Titre", phTitle: "Titre de l'événement", fDay: "Jour", fMonth: "Mois", fDesc: "Description", phDesc: "Décrivez l'événement…", fImage: "Image",
    publish: "Publier", publishing: "Publication…", req: "Titre et description requis.",
  },
  en: {
    title: "News & events",
    search: "Search news, an event, a city…",
    list: "List", map: "Map",
    loading: "Loading news…", empty: "No news matches your search at the moment.",
    more: "Read more",
    tAll: "Show all", tNews: "News", tConcert: "Consultation", tForum: "Forum", tAtelier: "Workshop", tRencontre: "Meetup", tRecit: "Story",
    create: "Create an event", close: "Close",
    fTag: "Type", fTitle: "Title", phTitle: "Event title", fDay: "Day", fMonth: "Month", fDesc: "Description", phDesc: "Describe the event…", fImage: "Image",
    publish: "Publish", publishing: "Publishing…", req: "Title and description required.",
  },
  it: {
    title: "Notizie ed eventi",
    search: "Cerca una notizia, un evento, una città…",
    list: "Elenco", map: "Mappa",
    loading: "Caricamento delle notizie…", empty: "Nessuna notizia corrisponde alla ricerca al momento.",
    more: "Leggi tutto",
    tAll: "Mostra tutto", tNews: "Novità", tConcert: "Concertazione", tForum: "Forum", tAtelier: "Laboratorio", tRencontre: "Incontro", tRecit: "Racconto",
    create: "Crea un evento", close: "Chiudi",
    fTag: "Tipo", fTitle: "Titolo", phTitle: "Titolo dell'evento", fDay: "Giorno", fMonth: "Mese", fDesc: "Descrizione", phDesc: "Descrivi l'evento…", fImage: "Immagine",
    publish: "Pubblica", publishing: "Pubblicazione…", req: "Titolo e descrizione obbligatori.",
  },
};

const TAGS = ["Tout afficher", "Nouveauté", "Concertation", "Forum", "Atelier", "Rencontre", "Récit"];
const CREATE_TAGS = ["Nouveauté", "Concertation", "Forum", "Atelier", "Rencontre", "Récit"];
const MONTHS = ["JANV.", "FÉVR.", "MARS", "AVR.", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."];
const TAG_KEY: Record<string, string> = { "Tout afficher": "tAll", "Nouveauté": "tNews", "Concertation": "tConcert", "Forum": "tForum", "Atelier": "tAtelier", "Rencontre": "tRencontre", "Récit": "tRecit" };
function tagLabel(t: string, tr: Dict) { return tr[TAG_KEY[t]] || t; }

const GLYPH: Record<string, string> = {
  "Nouveauté": "✨", "Concertation": "🗳️", "Forum": "🤝", "Atelier": "🛠️", "Rencontre": "☕", "Récit": "📖",
};
function glyph(tag: string) { return GLYPH[tag] || "📍"; }

function phStyle(ev: EventDTO): React.CSSProperties {
  if (ev.image) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.12), rgba(40,28,52,.58)), url("${ev.image}")`,
      backgroundSize: "cover", backgroundPosition: "center", position: "relative",
    };
  }
  return { backgroundImage: ev.grad, position: "relative", overflow: "hidden" };
}

function EventCard({ ev, onOpen }: { ev: EventDTO; onOpen: (e: EventDTO) => void }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <article className="acard" style={{ cursor: "pointer" }} onClick={() => onOpen(ev)}>
      <div className="ph" style={phStyle(ev)}>
        {!ev.image && (
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, opacity: 0.34, filter: "saturate(.6)" }}>{glyph(ev.tag)}</span>
        )}
        <span className="tg">{tagLabel(ev.tag, tr)}</span>
        <span className="dt"><b>{ev.day}</b><small>{ev.month}</small></span>
      </div>
      <div className="bd">
        <h3>{ev.title}</h3>
        <p>{ev.desc}</p>
        <span className="more">{tr.more} →</span>
      </div>
    </article>
  );
}

function EventRow({ ev, onOpen }: { ev: EventDTO; onOpen: (e: EventDTO) => void }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: "12px 14px", cursor: "pointer" }} onClick={() => onOpen(ev)}>
      <div style={{ flexShrink: 0, width: 48, borderRadius: 10, backgroundImage: ev.image ? `linear-gradient(180deg, rgba(40,28,52,.15), rgba(40,28,52,.55)), url("${ev.image}")` : ev.grad, backgroundSize: "cover", backgroundPosition: "center", color: "#fff", textAlign: "center", padding: "8px 0", lineHeight: 1.1 }}>
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

function EventDetail({ ev, onClose }: { ev: EventDTO; onClose: () => void }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div style={{ height: 200, ...phStyle(ev) }}>
          {!ev.image && <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 84, opacity: 0.34 }}>{glyph(ev.tag)}</span>}
          <span style={{ position: "absolute", left: 16, top: 16, fontSize: 12, fontWeight: 800, color: "#fff", background: "#C2452F", padding: "4px 12px", borderRadius: 999 }}>{tagLabel(ev.tag, tr)}</span>
          <button className="modal-x" onClick={onClose} aria-label={tr.close} style={{ position: "absolute", top: 14, right: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="modal-body" style={{ padding: "18px 24px 8px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#C2452F", marginBottom: 6 }}>{ev.day} {ev.month}</div>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", fontSize: "1.4rem", margin: "0 0 12px" }}>{ev.title}</h2>
          <p style={{ color: "#5E4A73", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{ev.desc}</p>
        </div>
        <div className="modal-foot"><button className="btn btn-coral" onClick={onClose}>{tr.close}</button></div>
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function reload() {
    fetch("/app/api/events").then((r) => r.json()).then((d) => setItems(d.events || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }
  useEffect(() => {
    reload();
    fetch("/app/api/events/geo").then((r) => r.json()).then((d) => setAllPoints(d.points || [])).catch(() => {});
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => setIsAdmin(!!d.isAdmin)).catch(() => {});
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
      <div className="board-head">
        <h1>{tr.title}</h1>
        {isAdmin && <button className="btn btn-coral" onClick={() => setShowCreate(true)}>{tr.create}</button>}
      </div>

      {selected && <EventDetail ev={selected} onClose={() => setSelected(null)} />}
      {showCreate && <CreateEvent tr={tr} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setLoading(true); reload(); }} />}

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
            {list.map((ev) => <EventRow key={ev.id} ev={ev} onOpen={setSelected} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="actus-grid">
          {list.map((ev) => <EventCard key={ev.id} ev={ev} onOpen={setSelected} />)}
        </div>
      )}
    </AppShell>
  );
}

function CreateEvent({ tr, onClose, onCreated }: { tr: Dict; onClose: () => void; onCreated: () => void }) {
  const [tag, setTag] = useState("Nouveauté");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!title.trim() || !desc.trim()) { setErr(tr.req); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/app/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag, title, desc, image, day, month }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || ""); setBusy(false); return; }
      onCreated();
    } catch { setErr(""); setBusy(false); }
  }

  const seed = keywordsFromText(title, desc) || title.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{tr.create}</h2>
          <button className="modal-x" onClick={onClose} aria-label={tr.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="mfield">
            <label>{tr.fTag}</label>
            <select value={tag} onChange={(e) => setTag(e.target.value)}>
              {CREATE_TAGS.map((t) => <option key={t} value={t}>{tagLabel(t, tr)}</option>)}
            </select>
          </div>
          <div className="mfield">
            <label>{tr.fTitle}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr.phTitle} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="mfield" style={{ width: 90 }}>
              <label>{tr.fDay}</label>
              <input value={day} onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} placeholder="12" />
            </div>
            <div className="mfield" style={{ flex: 1 }}>
              <label>{tr.fMonth}</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">—</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="mfield">
            <label>{tr.fDesc}</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={tr.phDesc} rows={4} />
          </div>
          <div className="mfield">
            <label>{tr.fImage}</label>
            <ImagePicker seed={seed} value={image} onPick={setImage} />
          </div>
          {err && <p className="msg">{err}</p>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-coral" onClick={submit} disabled={busy}>{busy ? tr.publishing : tr.publish}</button>
        </div>
      </div>
    </div>
  );
}
