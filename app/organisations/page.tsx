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

type Org = { id: number; name: string; type: string; region: string | null; desc: string; adresse: string | null; grad: string; labellisee?: boolean };

const TYPES = ["Association", "Établissement public", "Collectivité territoriale", "Entreprise", "Autre"];

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "O";
}
function OrgCard({ o }: { o: Org }) {
  return (
    <Link href={`/organisations/${o.id}`} className="icard">
      <div style={{ height: 96, background: o.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(o.name)}</div>
      <div className="bd">
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{o.type}</span>
        <h3 style={{ marginTop: 4 }}>{o.name}</h3>
        {o.adresse && <p style={{ color: "#9C919E", fontSize: 13 }}>{o.adresse}</p>}
      </div>
    </Link>
  );
}

export default function OrganisationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [mine, setMine] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [points, setPoints] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Association", region: "", desc: "", adresse: "", telephone: "", email: "", site: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/app/api/organisations").then((r) => r.json()).then((d) => setOrgs(d.organisations || [])).catch(() => {}).finally(() => setLoading(false));
    fetch("/app/api/organisations/mine").then((r) => r.json()).then((d) => setMine(d.organisations || [])).catch(() => {});
    fetch("/app/api/organisations/geo").then((r) => r.json()).then((d) => setPoints(d.points || [])).catch(() => {});
  }, []);

  const list = useMemo(() => orgs.filter((o) => {
    if (type && o.type !== type) return false;
    if (q) { const s = q.toLowerCase(); if (!o.name.toLowerCase().includes(s) && !(o.adresse || "").toLowerCase().includes(s) && !(o.region || "").toLowerCase().includes(s)) return false; }
    return true;
  }), [orgs, q, type]);

  async function create() {
    if (busy) return;
    if (!form.name.trim()) { setError("Le nom de l'organisation est requis."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/organisations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Création impossible."); setBusy(false); return; }
      router.push(`/organisations/${d.id}`);
    } catch { setError("Création impossible."); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>Organisations labellisées</h1>
        <button className="btn btn-coral" onClick={() => setOpen(true)}>Créer une organisation</button>
      </div>

      {view === "liste" && mine.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 10px" }}>Mes organisations</h2>
          <div className="idees-grid">
            {mine.map((o) => (
              <Link key={o.id} href={`/organisations/${o.id}`} className="icard">
                <div style={{ height: 96, background: o.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(o.name)}</div>
                <div className="bd">
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{o.type}</span>
                  <h3 style={{ marginTop: 4 }}>{o.name}</h3>
                  {o.labellisee === false
                    ? <span style={{ fontSize: 12, fontWeight: 700, color: "#8A5A00", background: "#FCE3B4", borderRadius: 999, padding: "2px 8px", display: "inline-block", marginTop: 4 }}>En attente de labellisation</span>
                    : <span style={{ fontSize: 12, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "2px 8px", display: "inline-block", marginTop: 4 }}>Labellisée</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Saisissez une ville, un code postal, un département, etc." />
        </div>
        <select className="board-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ display: "inline-flex", border: "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
          <button type="button" onClick={() => setView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>Liste</button>
          <button type="button" onClick={() => setView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>Carte</button>
        </div>
      </div>

      {loading ? <p className="board-empty">Chargement des organisations…</p>
      : list.length === 0 ? <p className="board-empty">Aucune organisation ne correspond à votre recherche.</p>
      : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((o) => <OrgCard key={o.id} o={o} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="idees-grid">
          {list.map((o) => <OrgCard key={o.id} o={o} />)}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Créer une organisation</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Nom de l'organisation</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mfield"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="mfield"><label>Région / département</label><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
              <div className="mfield"><label>Description</label><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Présentez la mission de votre organisation…" /></div>
              <div className="mfield"><label>Adresse</label><input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
              <div className="mfield"><label>Téléphone</label><input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
              <div className="mfield"><label>Adresse mail</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="mfield"><label>Site internet</label><input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} /></div>
              {error && <p className="msg">{error}</p>}
              <p style={{ color: "#9C919E", fontSize: 12.5 }}>Votre organisation sera soumise à labellisation par Subsidium avant d'apparaître dans l'annuaire.</p>
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={create} disabled={busy}>{busy ? "Création…" : "Créer"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
