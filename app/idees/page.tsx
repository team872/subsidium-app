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

function IdeaCard({ it }: { it: IdeaDTO }) {
  return (
    <Link href={`/idees/${it.id}`} className="icard">
      {it.image ? (
        <div style={{ height: 120, flexShrink: 0, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.05), rgba(40,28,52,.45)), url("${it.image}")`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 12, background: it.color, color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", padding: "3px 10px", borderRadius: 999 }}>{it.cat}</span>
        </div>
      ) : (
        <div className="band" style={{ background: it.color }}><span>{it.cat}</span></div>
      )}
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
    </Link>
  );
}

export default function IdeesPage() {
  const [items, setItems] = useState<IdeaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("toutes");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [view, setView] = useState<"liste" | "carte">("carte");
  const [showForm, setShowForm] = useState(false);
  const { rang, charteValidee, paye } = useNiveau();
  const peutProposer = peutProposerIdee(rang);
  const etape = prochaineEtape(rang, charteValidee, paye);

  useEffect(() => {
    fetch("/app/api/ideas")
      .then((r) => r.json())
      .then((d) => setItems(d.ideas || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    return items.filter((it) => {
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
  }, [items, tab, query, cat]);

  const points = useMemo(() =>
    list
      .filter((it) => typeof it.lat === "number" && typeof it.lon === "number")
      .map((it) => ({ id: it.id, lat: it.lat as number, lon: it.lon as number, title: it.title, subtitle: it.cat, color: "#C2452F", href: `/app/idees/${it.id}` })),
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

      <ParcoursCTA />

      {showForm && (
        <IdeaForm onClose={() => setShowForm(false)} onCreated={(idea) => { setItems((cur) => [idea, ...cur]); setShowForm(false); }} />
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
          <button type="button" onClick={() => setView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>Liste</button>
          <button type="button" onClick={() => setView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>Carte</button>
        </div>
      </div>

      {loading ? (
        <p className="board-empty">Chargement des idées…</p>
      ) : list.length === 0 ? (
        <p className="board-empty">Aucune idée ne correspond à votre recherche pour le moment.</p>
      ) : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((it) => <IdeaCard key={it.id} it={it} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="idees-grid">
          {list.map((it) => <IdeaCard key={it.id} it={it} />)}
        </div>
      )}
    </AppShell>
  );
}
