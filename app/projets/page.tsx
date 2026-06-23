"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

const CarteSubsidium = dynamic(() => import("@/components/CarteSubsidium"), {
  ssr: false,
  loading: () => <div className="board-empty">Chargement de la carte…</div>,
});

type Projet = { id: number; title: string; theme: string | null; desc: string; lieu: string | null; prive: boolean; membres: number; grad: string };

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}
const TABS: [string, string][] = [["tous", "Tous les projets"], ["suivis", "Projets suivis"], ["emis", "Projets émis"]];

function ProjetCard({ p }: { p: Projet }) {
  return (
    <Link href={`/projets/${p.id}`} className="icard">
      <div style={{ height: 96, background: p.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(p.title)}</div>
      <div className="bd">
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{p.theme || "Projet"}{p.prive ? " · privé" : ""}</span>
        <h3 style={{ marginTop: 4 }}>{p.title}</h3>
        {p.lieu && <p style={{ color: "#9C919E", fontSize: 13 }}>{p.lieu} · {p.membres} membre{p.membres > 1 ? "s" : ""}</p>}
      </div>
    </Link>
  );
}

export default function ProjetsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("tous");
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(0);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [points, setPoints] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", theme: "", lieu: "", desc: "", prive: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load(t: string) {
    setLoading(true);
    fetch(`/app/api/projets?filter=${t}`).then((r) => r.json()).then((d) => setProjets(d.projets || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(tab); }, [tab]);
  useEffect(() => {
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => setNiveau(d.user?.niveau ?? 0)).catch(() => {});
    fetch("/app/api/projets/geo").then((r) => r.json()).then((d) => setPoints(d.points || [])).catch(() => {});
  }, []);

  const canCreate = niveau >= 2;
  const list = useMemo(() => projets.filter((p) => {
    if (!q) return true; const s = q.toLowerCase();
    return p.title.toLowerCase().includes(s) || (p.lieu || "").toLowerCase().includes(s) || (p.theme || "").toLowerCase().includes(s);
  }), [projets, q]);

  async function create() {
    if (busy) return;
    if (!form.title.trim()) { setError("Le titre du projet est requis."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/projets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Création impossible."); setBusy(false); return; }
      router.push(`/projets/${d.id}`);
    } catch { setError("Création impossible."); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>Projets</h1>
        {canCreate && <button className="btn btn-coral" onClick={() => setOpen(true)}>Publier un projet</button>}
      </div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 14px", lineHeight: 1.6 }}>
        Les appels à projet transforment les idées en actions concrètes. Suivez les projets qui vous inspirent,
        candidatez pour y contribuer, ou portez le vôtre.
      </p>

      <div className="board-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un projet, un thème, une ville…" />
        </div>
        <div style={{ display: "inline-flex", border: "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
          <button type="button" onClick={() => setView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>Liste</button>
          <button type="button" onClick={() => setView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>Carte</button>
        </div>
      </div>

      {loading ? <p className="board-empty">Chargement des projets…</p>
      : list.length === 0 ? <p className="board-empty">{tab === "tous" ? "Aucun projet pour le moment." : tab === "suivis" ? "Vous ne suivez aucun projet." : "Vous n'avez émis aucun projet."}</p>
      : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((p) => <ProjetCard key={p.id} p={p} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="idees-grid">
          {list.map((p) => <ProjetCard key={p.id} p={p} />)}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Publier un projet</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Titre du projet</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="mfield"><label>Thème</label><input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Ex. Faire ensemble, Mobilité, Solidarité…" /></div>
              <div className="mfield"><label>Lieu</label><input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder="Ville, quartier…" /></div>
              <div className="mfield"><label>Description</label><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Présentez l'objectif et le déroulé du projet…" /></div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#5E4A73", fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={form.prive} onChange={(e) => setForm({ ...form, prive: e.target.checked })} />
                Projet privé (visible uniquement par les membres)
              </label>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={create} disabled={busy}>{busy ? "Création…" : "Publier"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
