"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import ImagePicker from "@/components/ImagePicker";
import { keywordsFromText } from "@/lib/keywords";
import "@/components/MemberBoards.css";

const CarteSubsidium = dynamic(() => import("@/components/CarteSubsidium"), {
  ssr: false,
  loading: () => <div className="board-empty">…</div>,
});

type Projet = { id: number; title: string; theme: string | null; desc: string; lieu: string | null; prive: boolean; membres: number; grad: string; image: string | null };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Projets", publish: "Publier un projet",
    intro: "Les appels à projet transforment les idées en actions concrètes. Suivez les projets qui vous inspirent, candidatez pour y contribuer, ou portez le vôtre.",
    tabTous: "Tous les projets", tabSuivis: "Projets suivis", tabEmis: "Projets émis",
    search: "Rechercher un projet, un thème, une ville…", list: "Liste", map: "Carte",
    loading: "Chargement des projets…",
    emptyTous: "Aucun projet pour le moment.", emptySuivis: "Vous ne suivez aucun projet.", emptyEmis: "Vous n'avez émis aucun projet.",
    projet: "Projet", prive: "privé", member: "membre", members: "membres",
    reqTitle: "Le titre du projet est requis.", createErr: "Création impossible.", creating: "Création…",
    fTitle: "Titre du projet", fTheme: "Thème", fLieu: "Lieu", fDesc: "Description", fImage: "Image",
    phTheme: "Ex. Faire ensemble, Mobilité, Solidarité…", phLieu: "Ville, quartier…", phDesc: "Présentez l'objectif et le déroulé du projet…",
    priveLabel: "Projet privé (visible uniquement par les membres)", close: "Fermer",
  },
  en: {
    title: "Projects", publish: "Publish a project",
    intro: "Calls for projects turn ideas into concrete action. Follow the projects that inspire you, apply to contribute, or lead your own.",
    tabTous: "All projects", tabSuivis: "Followed projects", tabEmis: "My projects",
    search: "Search a project, a theme, a city…", list: "List", map: "Map",
    loading: "Loading projects…",
    emptyTous: "No project yet.", emptySuivis: "You are not following any project.", emptyEmis: "You haven't created any project.",
    projet: "Project", prive: "private", member: "member", members: "members",
    reqTitle: "The project title is required.", createErr: "Could not create.", creating: "Creating…",
    fTitle: "Project title", fTheme: "Theme", fLieu: "Location", fDesc: "Description", fImage: "Image",
    phTheme: "E.g. Acting together, Mobility, Solidarity…", phLieu: "City, neighbourhood…", phDesc: "Describe the goal and the steps of the project…",
    priveLabel: "Private project (visible to members only)", close: "Close",
  },
  it: {
    title: "Progetti", publish: "Pubblica un progetto",
    intro: "Gli appelli a progetto trasformano le idee in azioni concrete. Segui i progetti che ti ispirano, candidati per contribuire o guida il tuo.",
    tabTous: "Tutti i progetti", tabSuivis: "Progetti seguiti", tabEmis: "I miei progetti",
    search: "Cerca un progetto, un tema, una città…", list: "Elenco", map: "Mappa",
    loading: "Caricamento dei progetti…",
    emptyTous: "Nessun progetto per ora.", emptySuivis: "Non segui alcun progetto.", emptyEmis: "Non hai creato alcun progetto.",
    projet: "Progetto", prive: "privato", member: "membro", members: "membri",
    reqTitle: "Il titolo del progetto è obbligatorio.", createErr: "Creazione impossibile.", creating: "Creazione…",
    fTitle: "Titolo del progetto", fTheme: "Tema", fLieu: "Luogo", fDesc: "Descrizione", fImage: "Immagine",
    phTheme: "Es. Fare insieme, Mobilità, Solidarietà…", phLieu: "Città, quartiere…", phDesc: "Presenta l'obiettivo e lo svolgimento del progetto…",
    priveLabel: "Progetto privato (visibile solo ai membri)", close: "Chiudi",
  },
};

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}

function ProjetCard({ p, view }: { p: Projet; view: "liste" | "carte" }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <Link href={`/projets/${p.id}?vue=${view}`} className="icard">
      {p.image ? (
        <div style={{ height: 96, flexShrink: 0, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.05), rgba(40,28,52,.4)), url("${p.image}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ) : (
        <div style={{ height: 96, flexShrink: 0, background: p.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(p.title)}</div>
      )}
      <div className="bd">
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{p.theme || tr.projet}{p.prive ? " · " + tr.prive : ""}</span>
        <h3 style={{ marginTop: 4 }}>{p.title}</h3>
        {p.lieu && <p style={{ color: "#9C919E", fontSize: 13 }}>{p.lieu} · {p.membres} {p.membres > 1 ? tr.members : tr.member}</p>}
      </div>
    </Link>
  );
}

// Ligne compacte (sans photo) pour la colonne latérale en vue Carte.
function ProjetRow({ p }: { p: Projet }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <Link href={`/projets/${p.id}?vue=carte`} style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", border: "1px solid #EFE3DA", borderRadius: 12, padding: "10px 12px", textDecoration: "none" }}>
      <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, background: p.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "var(--font-display),cursive" }}>{initials(p.title)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#9C919E" }}>{p.theme || tr.projet}{p.prive ? " · " + tr.prive : ""}</span>
        <h3 style={{ margin: "1px 0 2px", fontSize: 15, color: "#372646", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</h3>
        {p.lieu && <p style={{ margin: 0, color: "#9C919E", fontSize: 12.5 }}>{p.lieu} · {p.membres} {p.membres > 1 ? tr.members : tr.member}</p>}
      </div>
    </Link>
  );
}

export default function ProjetsPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const router = useRouter();
  const [tab, setTab] = useState("tous");
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(0);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [allPoints, setAllPoints] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", theme: "", lieu: "", desc: "", prive: false, image: null as string | null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const TABS: [string, string][] = [["tous", tr.tabTous], ["suivis", tr.tabSuivis], ["emis", tr.tabEmis]];

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

  function load(t: string) {
    setLoading(true);
    fetch(`/app/api/projets?filter=${t}`).then((r) => r.json()).then((d) => setProjets(d.projets || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(tab); }, [tab]);
  useEffect(() => {
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => setNiveau(d.user?.niveau ?? 0)).catch(() => {});
    fetch("/app/api/projets/geo").then((r) => r.json()).then((d) => setAllPoints(d.points || [])).catch(() => {});
  }, []);

  const canCreate = niveau >= 2;
  const list = useMemo(() => projets.filter((p) => {
    if (!q) return true; const s = q.toLowerCase();
    return p.title.toLowerCase().includes(s) || (p.lieu || "").toLowerCase().includes(s) || (p.theme || "").toLowerCase().includes(s);
  }), [projets, q]);

  const points = useMemo(() => {
    const ids = new Set(list.map((x) => x.id));
    return allPoints.filter((p) => ids.has(p.id)).map((p) => ({ ...p, href: `${p.href}?vue=carte` }));
  }, [allPoints, list]);

  async function create() {
    if (busy) return;
    if (!form.title.trim()) { setError(tr.reqTitle); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/projets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || tr.createErr); setBusy(false); return; }
      router.push(`/projets/${d.id}`);
    } catch { setError(tr.createErr); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>{tr.title}</h1>
        {canCreate && <button className="btn btn-coral" onClick={() => setOpen(true)}>{tr.publish}</button>}
      </div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 14px", lineHeight: 1.6 }}>{tr.intro}</p>

      <div className="board-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.search} />
        </div>
        <div style={{ display: "inline-flex", border: "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
          <button type="button" onClick={() => changeView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>{tr.list}</button>
          <button type="button" onClick={() => changeView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>{tr.map}</button>
        </div>
      </div>

      {loading ? <p className="board-empty">{tr.loading}</p>
      : list.length === 0 ? <p className="board-empty">{tab === "tous" ? tr.emptyTous : tab === "suivis" ? tr.emptySuivis : tr.emptyEmis}</p>
      : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((p) => <ProjetRow key={p.id} p={p} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="idees-grid">
          {list.map((p) => <ProjetCard key={p.id} p={p} view={view} />)}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{tr.publish}</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label={tr.close}>×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>{tr.fTitle}</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fTheme}</label><input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder={tr.phTheme} /></div>
              <div className="mfield"><label>{tr.fLieu}</label><input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder={tr.phLieu} /></div>
              <div className="mfield"><label>{tr.fDesc}</label><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder={tr.phDesc} /></div>
              <div className="mfield"><label>{tr.fImage}</label><ImagePicker seed={keywordsFromText(form.title, form.desc) || form.title.trim()} value={form.image} onPick={(u) => setForm({ ...form, image: u })} /></div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#5E4A73", fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={form.prive} onChange={(e) => setForm({ ...form, prive: e.target.checked })} />
                {tr.priveLabel}
              </label>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={create} disabled={busy}>{busy ? tr.creating : tr.publish}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
