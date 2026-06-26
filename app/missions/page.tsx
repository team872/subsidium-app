"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import { useNiveau } from "@/components/useNiveau";
import { peutPorterInitiative, prochaineEtape } from "@/lib/niveau";
import "@/components/MemberBoards.css";

type Mission = { id: number; type: string; color: string; title: string; org: string; desc: string; location: string | null; date: string };
type MyMission = Mission & { statut: "en_attente" | "acceptee" | "refusee" };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Missions et opportunités",
    gated: "Cet espace est réservé aux Initiateurs. Réalisez votre auto-évaluation pour débloquer les missions et candidater.",
    tabToutes: "Toutes les missions", tabCand: "Missions candidatées",
    search: "Saisissez une ville, un code postal, un département, etc.",
    allTypes: "Tous les types", allStatus: "Tous les statuts",
    stPending: "En attente", stAccepted: "Acceptée", stRejected: "Refusée",
    candPending: "Candidature en attente", candAccepted: "Candidature acceptée", candRejected: "Candidature refusée",
    loading: "Chargement des missions…", emptyAll: "Aucune mission ne correspond à votre recherche.", emptyMine: "Vous n'avez pas encore candidaté à une mission.",
    by: "Par", typeVol: "Bénévolat",
  },
  en: {
    title: "Missions and opportunities",
    gated: "This area is reserved for Initiators. Complete your self-assessment to unlock missions and apply.",
    tabToutes: "All missions", tabCand: "My applications",
    search: "Enter a city, postcode, department, etc.",
    allTypes: "All types", allStatus: "All statuses",
    stPending: "Pending", stAccepted: "Accepted", stRejected: "Rejected",
    candPending: "Application pending", candAccepted: "Application accepted", candRejected: "Application declined",
    loading: "Loading missions…", emptyAll: "No mission matches your search.", emptyMine: "You haven't applied to any mission yet.",
    by: "By", typeVol: "Volunteering",
  },
  it: {
    title: "Missioni e opportunità",
    gated: "Questo spazio è riservato agli Iniziatori. Completa la tua autovalutazione per sbloccare le missioni e candidarti.",
    tabToutes: "Tutte le missioni", tabCand: "Le mie candidature",
    search: "Inserisci una città, un CAP, un dipartimento, ecc.",
    allTypes: "Tutti i tipi", allStatus: "Tutti gli stati",
    stPending: "In attesa", stAccepted: "Accettata", stRejected: "Rifiutata",
    candPending: "Candidatura in attesa", candAccepted: "Candidatura accettata", candRejected: "Candidatura rifiutata",
    loading: "Caricamento delle missioni…", emptyAll: "Nessuna missione corrisponde alla ricerca.", emptyMine: "Non hai ancora inviato candidature.",
    by: "Di", typeVol: "Volontariato",
  },
};

const TYPES = ["Bénévolat", "CDI", "CDD"];
function typeLabel(t: string, tr: Dict) { return t === "Bénévolat" ? tr.typeVol : t; }
function orgInitials(n: string) {
  return (n || "").replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "O";
}

const STATUT_COLOR: Record<string, { bg: string; fg: string }> = {
  acceptee: { bg: "#DBF0D9", fg: "#1E6B1E" },
  refusee: { bg: "#FBDED7", fg: "#B23A28" },
  en_attente: { bg: "#ECE6F0", fg: "#5E4A73" },
};

// Cartes à hauteur uniforme : titre 2 lignes max, description tronquée à 3 lignes.
const clamp2: React.CSSProperties = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.6em" };
const clamp3: React.CSSProperties = { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: "none", height: "4.5em", margin: 0 };

function Card({ m, statut }: { m: Mission; statut?: string }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const candLabel: Record<string, string> = { acceptee: tr.candAccepted, refusee: tr.candRejected, en_attente: tr.candPending };
  return (
    <Link href={`/missions/${m.id}`} className="icard" key={m.id}>
      <div className="band" style={{ background: m.color }}><span>{typeLabel(m.type, tr)}</span></div>
      <div className="bd">
        <h3 style={clamp2}>{m.title}</h3>
        <p style={clamp3}>{m.desc}</p>
        <div className="foot">
          <span className="auth" style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{orgInitials(m.org)}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tr.by} {m.org}</span>
          </span>
          <span style={{ flexShrink: 0 }}>{m.date}</span>
        </div>
        {statut && (
          <div style={{ marginTop: 10 }}>
            <span style={{ background: STATUT_COLOR[statut].bg, color: STATUT_COLOR[statut].fg, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 10px" }}>
              {candLabel[statut]}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function MissionsPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const { rang, ready } = useNiveau();
  const [tab, setTab] = useState<"toutes" | "candidatees">("toutes");
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
    const etape = prochaineEtape(rang, undefined, undefined, lang);
    return (
      <AppShell>
        <div className="board-head"><h1>{tr.title}</h1></div>
        <p className="board-empty">{tr.gated}</p>
        {etape && <Link href={etape.href} className="btn btn-coral" style={{ display: "inline-block" }}>{etape.label}</Link>}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="board-head"><h1>{tr.title}</h1></div>

      <div className="board-tabs">
        <button className={tab === "toutes" ? "on" : ""} onClick={() => setTab("toutes")}>{tr.tabToutes}</button>
        <button className={tab === "candidatees" ? "on" : ""} onClick={() => setTab("candidatees")}>{tr.tabCand}</button>
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr.search} />
        </div>
        {tab === "toutes" ? (
          <select className="board-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{tr.allTypes}</option>
            {TYPES.map((t) => <option key={t} value={t}>{typeLabel(t, tr)}</option>)}
          </select>
        ) : (
          <select className="board-select" value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">{tr.allStatus}</option>
            <option value="en_attente">{tr.stPending}</option>
            <option value="acceptee">{tr.stAccepted}</option>
            <option value="refusee">{tr.stRejected}</option>
          </select>
        )}
      </div>

      {tab === "toutes" ? (
        loading ? <p className="board-empty">{tr.loading}</p>
        : toutes.length === 0 ? <p className="board-empty">{tr.emptyAll}</p>
        : <div className="idees-grid">{toutes.map((m) => <Card key={m.id} m={m} />)}</div>
      ) : (
        candidatees.length === 0 ? <p className="board-empty">{tr.emptyMine}</p>
        : <div className="idees-grid">{candidatees.map((m) => <Card key={m.id} m={m} statut={m.statut} />)}</div>
      )}
    </AppShell>
  );
}
