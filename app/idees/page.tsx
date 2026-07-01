"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import IdeaForm from "@/components/IdeaForm";
import ParcoursCTA from "@/components/ParcoursCTA";
import { useNiveau } from "@/components/useNiveau";
import { peutProposerIdee, prochaineEtape } from "@/lib/niveau";
import { CATEGORIES } from "@/lib/feed";
import type { IdeaDTO } from "@/lib/data";
import "@/components/MemberBoards.css";

const CarteSubsidium = dynamic(() => import("@/components/CarteSubsidium"), {
  ssr: false,
  loading: () => <div className="board-empty">Chargement de la carte…</div>,
});

const TABS = [
  { key: "toutes", label: "Toutes les idées" },
  { key: "suivies", label: "Idées suivies" },
  { key: "emises", label: "Idées émises" },
  { key: "archivees", label: "Idées archivées" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function plural(n: number): string {
  return `${n} message${n > 1 ? "s" : ""}`;
}

function isDraft(it: IdeaDTO): boolean {
  return it.status === "brouillon";
}

function DraftBadge() {
  return (
    <span style={{ display: "inline-block", background: "#FBE9D8", color: "#B45309", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", padding: "2px 8px", borderRadius: 999, marginBottom: 6 }}>
      Brouillon
    </span>
  );
}

function EditButton({ it, onEdit }: { it: IdeaDTO; onEdit: (it: IdeaDTO) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(it); }}
      title="Modifier ce brouillon"
      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #E3D7CC", borderRadius: 999, padding: "3px 10px", cursor: "pointer", color: "#5E4A73", fontSize: 12.5, fontWeight: 700 }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
      Éditer
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#C2452F" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

// Bouton « j'aime » / soutien — ouvert à tous les profils connectés (recette AN056).
function LikeButton({ it, onLike }: { it: IdeaDTO; onLike: (id: number) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(it.id); }}
      aria-pressed={it.liked}
      title={it.liked ? "Retirer mon soutien" : "Soutenir cette idée"}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, color: it.liked ? "#C2452F" : "#9C919E", fontSize: 13, fontWeight: 700 }}
    >
      <HeartIcon filled={it.liked} />
      {it.likes}
    </button>
  );
}

function IdeaCard({ it, view, onLike, onEdit }: { it: IdeaDTO; view: "liste" | "carte"; onLike: (id: number) => void; onEdit: (it: IdeaDTO) => void }) {
  const draft = isDraft(it);
  return (
    <Link href={`/idees/${it.id}?vue=${view}`} className="icard">
      {it.image ? (
        <div style={{ height: 120, flexShrink: 0, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.05), rgba(40,28,52,.45)), url("${it.image}")`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 12, background: it.color, color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", padding: "3px 10px", borderRadius: 999 }}>{it.cat}</span>
        </div>
      ) : (
        <div className="band" style={{ background: it.color }}><span>{it.cat}</span></div>
      )}
      <div className="bd">
        {draft && <DraftBadge />}
        <h3>{it.title}</h3>
        <p>{it.desc}</p>
        <div className="foot">
          <span className="msg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" /></svg>
            {plural(it.messages)}
          </span>
          {draft ? <EditButton it={it} onEdit={onEdit} /> : <LikeButton it={it} onLike={onLike} />}
          <span className="auth">Par {it.author}</span>
        </div>
      </div>
    </Link>
  );
}

// Ligne compacte (sans photo) pour la colonne latérale en vue Carte.
function IdeaRow({ it, onLike, onEdit }: { it: IdeaDTO; onLike: (id: number) => void; onEdit: (it: IdeaDTO) => void }) {
  const draft = isDraft(it);
  return (
    <Link href={`/idees/${it.id}?vue=carte`} style={{ display: "block", background: "#fff", border: "1px solid #EFE3DA", borderLeft: `4px solid ${it.color}`, borderRadius: 12, padding: "10px 14px", textDecoration: "none" }}>
      <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#9C919E" }}>{it.cat}{draft ? " · Brouillon" : ""}</span>
      <h3 style={{ margin: "2px 0 3px", fontSize: 15, color: "#372646", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, color: "#9C919E", fontSize: 12.5, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plural(it.messages)} · Par {it.author}</p>
        {draft ? <EditButton it={it} onEdit={onEdit} /> : <LikeButton it={it} onLike={onLike} />}
      </div>
    </Link>
  );
}

export default function IdeesPage() {
  const [items, setItems] = useState<IdeaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<TabKey>("toutes");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [view, setView] = useState<"liste" | "carte">("carte");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IdeaDTO | null>(null);
  const { rang, charteValidee, paye } = useNiveau();
  const peutProposer = peutProposerIdee(rang);
  const etape = prochaineEtape(rang, charteValidee, paye);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("vue");
    if (v === "liste" || v === "carte") setView(v);
  }, []);
  function changeView(v: "liste" | "carte") {
    setView(v);
    const sp = new URLSearchParams(window.location.search);
    sp.set("vue", v);
    window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
  }

  useEffect(() => {
    fetch("/app/api/ideas")
      .then((r) => r.json())
      .then((d) => { setItems(d.ideas || []); setRestricted(!!d.restricted); setTotal(Number(d.total ?? 0)); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Ajoute une nouvelle idée OU met à jour une idée existante (édition de brouillon).
  function upsert(idea: IdeaDTO) {
    setItems((cur) => (cur.some((x) => x.id === idea.id) ? cur.map((x) => (x.id === idea.id ? idea : x)) : [idea, ...cur]));
    setShowForm(false);
    setEditing(null);
  }

  // Soutien d'une idée : bascule le like et met à jour le compteur localement.
  async function like(id: number) {
    try {
      const r = await fetch(`/app/api/ideas/${id}/like`, { method: "POST" });
      if (!r.ok) return;
      const d = await r.json();
      setItems((cur) => cur.map((it) => (it.id === id ? { ...it, liked: d.liked, likes: d.likes } : it)));
    } catch {
      /* silencieux */
    }
  }

  const list = useMemo(() => {
    return items.filter((it) => {
      // Les brouillons ne s'affichent que dans l'onglet « Idées émises » (recette AN053).
      if (isDraft(it) && tab !== "emises") return false;
      if (tab === "suivies" && !it.following) return false;
      if (tab === "emises" && !it.mine) return false;
      if (tab === "archivees" && it.status !== "archivee") return false;
      if (cat && it.cat !== cat) return false;
      if (query) {
        const q = query.toLowerCase();
        // Recherche sur titre, description ET localisation (ville / code postal) — recette AN059.
        const hay = `${it.title} ${it.desc} ${it.location ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, tab, query, cat]);

  const points = useMemo(() =>
    list
      .filter((it) => typeof it.lat === "number" && typeof it.lon === "number")
      .map((it) => ({ id: it.id, lat: it.lat as number, lon: it.lon as number, title: it.title, subtitle: it.cat, color: "#C2452F", href: `/app/idees/${it.id}?vue=carte` })),
  [list]);

  return (
    <AppShell>
      <div className="board-head">
        <h1>Idées citoyennes</h1>
        {peutProposer ? (
          <button className="btn btn-coral" onClick={() => setShowForm(true)}>Exprimer une idée</button>
        ) : (
          <Link href={etape?.href || "/charte"} className="btn btn-coral" title="Réservé aux Refondateurs — adhérez à la Charte pour exprimer vos idées" style={{ opacity: 0.92, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            Exprimer une idée
          </Link>
        )}
      </div>

      {restricted && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", background: "#FCEFE9", border: "1px solid #F2C9B8", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <p style={{ margin: 0, flex: "1 1 280px", color: "#5E4A73", fontSize: 14, lineHeight: 1.55 }}>
            Aperçu Visiteur : vous découvrez quelques idées d'exemple. Adhérez pour explorer toutes les idées citoyennes, participer aux échanges et soutenir celles qui vous inspirent.{total > list.length ? ` (+${total - list.length})` : ""}
          </p>
          <Link href="/charte" className="btn btn-coral">Adhérer pour tout voir</Link>
        </div>
      )}

      {!restricted && <ParcoursCTA />}

      {showForm && (
        <IdeaForm onClose={() => setShowForm(false)} onCreated={upsert} />
      )}
      {editing && (
        <IdeaForm edit={editing} onClose={() => setEditing(null)} onCreated={upsert} />
      )}

      <div className="board-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Saisissez une ville, un code postal, un département…" />
        </div>
        <select className="board-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Toutes les thématiques</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: "inline-flex", border: "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
          <button type="button" onClick={() => changeView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>Liste</button>
          <button type="button" onClick={() => changeView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>Carte</button>
        </div>
      </div>

      {loading ? (
        <p className="board-empty">Chargement des idées…</p>
      ) : list.length === 0 ? (
        <p className="board-empty">Aucune idée ne correspond à votre recherche pour le moment.</p>
      ) : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((it) => <IdeaRow key={it.id} it={it} onLike={like} onEdit={setEditing} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="idees-grid">
          {list.map((it) => <IdeaCard key={it.id} it={it} view={view} onLike={like} onEdit={setEditing} />)}
        </div>
      )}
    </AppShell>
  );
}
