"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useNiveau } from "@/components/useNiveau";
import { peutPorterInitiative, prochaineEtape } from "@/lib/niveau";
import "@/components/MemberBoards.css";

type Mission = { id: number; type: string; color: string; title: string; org: string; desc: string; location: string | null; date: string };
type MyMission = Mission & { statut: "en_attente" | "acceptee" | "refusee" };

const TABS = [
  { key: "toutes", label: "Toutes les missions" },
  { key: "candidatees", label: "Missions candidatées" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const TYPES = ["Bénévolat", "CDI", "CDD"];

const STATUT: Record<string, { label: string; bg: string; fg: string }> = {
  acceptee: { label: "Candidature acceptée", bg: "#DBF0D9", fg: "#1E6B1E" },
  refusee: { label: "Candidature refusée", bg: "#FBDED7", fg: "#B23A28" },
  en_attente: { label: "Candidature en attente", bg: "#ECE6F0", fg: "#5E4A73" },
};

function Card({ m, statut }: { m: Mission; statut?: string }) {
  return (
    <Link href={`/missions/${m.id}`} className="icard" key={m.id}>
      <div className="band" style={{ background: m.color }}><span>{m.type}</span></div>
      <div className="bd">
        <h3>{m.title}</h3>
        <p>{m.desc}</p>
        <div className="foot">
          <span className="auth">Par {m.org}</span>
          <span>{m.date}</span>
        </div>
        {statut && (
          <div style={{ marginTop: 10 }}>
            <span style={{ background: STATUT[statut].bg, color: STATUT[statut].fg, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 10px" }}>
              {STATUT[statut].label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function MissionsPage() {
  const { rang, ready } = useNiveau();
  const [tab, setTab] = useState<TabKey>("toutes");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [mine, setMine] = useState<MyMission[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/app/api/missions").then((r) => r.json()).then((d) => setMissions(d.missions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (tab === "candidatees") fetch("/app/api/missions/mine").then((r) => r.json()).then((d) => setMine(d.items || [])).catch(() => {});
  }, [tab]);

  const toutes = useMemo(() => missions.filter((m) => {
    if (type && m.type !== type) return false;
    if (query) { const q = query.toLowerCase(); if (!m.title.toLowerCase().includes(q) && !m.desc.toLowerCase().includes(q) && !(m.location || "").toLowerCase().includes(q)) return false; }
    return true;
  }), [missions, type, query]);
  const candidatees = useMemo(() => mine.filter((m) => !statut || m.statut === statut), [mine, statut]);

  if (ready && !peutPorterInitiative(rang)) {
    const etape = prochaineEtape(rang);
    return (
      <AppShell>
        <div className="board-head"><h1>Missions et opportunités</h1></div>
        <p className="board-empty">
          Cet espace est réservé aux <b>Initiateurs</b>. Réalisez votre auto-évaluation pour débloquer les missions et candidater.
        </p>
        {etape && <Link href={etape.href} className="btn btn-coral" style={{ display: "inline-block" }}>{etape.label}</Link>}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="board-head"><h1>Missions et opportunités</h1></div>

      <div className="board-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Saisissez une ville, un code postal, un département, etc." />
        </div>
        {tab === "toutes" ? (
          <select className="board-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous les types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        ) : (
          <select className="board-select" value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="acceptee">Acceptée</option>
            <option value="refusee">Refusée</option>
          </select>
        )}
      </div>

      {tab === "toutes" ? (
        loading ? <p className="board-empty">Chargement des missions…</p>
        : toutes.length === 0 ? <p className="board-empty">Aucune mission ne correspond à votre recherche.</p>
        : <div className="idees-grid">{toutes.map((m) => <Card key={m.id} m={m} />)}</div>
      ) : (
        candidatees.length === 0 ? <p className="board-empty">Vous n'avez pas encore candidaté à une mission.</p>
        : <div className="idees-grid">{candidatees.map((m) => <Card key={m.id} m={m} statut={m.statut} />)}</div>
      )}
    </AppShell>
  );
}
