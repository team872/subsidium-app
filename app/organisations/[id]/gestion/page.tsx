"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Mission = { id: number; type: string; color: string; title: string; desc: string; profil: string; location: string | null; date: string; candidatures: number; en_attente: number };
type Cand = { id: number; nom: string; prenom: string; email: string; presentation: string; statut: string; created_at: string };

const TYPES = ["Bénévolat", "CDI", "CDD"];
const STATUT_LABEL: Record<string, string> = { en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée" };
function statutChip(s: string): React.CSSProperties {
  const map: Record<string, [string, string]> = { en_attente: ["#8A5A00", "#FCE3B4"], acceptee: ["#1E6B1E", "#DBF0D9"], refusee: ["#9C2A2A", "#F3D6D6"] };
  const [c, b] = map[s] || ["#5E4A73", "#EFE8F2"];
  return { fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 8px", color: c, background: b };
}
const fld: React.CSSProperties = { width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", marginBottom: 8, color: "#372646" };

export default function OrgGestionPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [orgName, setOrgName] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Bénévolat", title: "", desc: "", profil: "", location: "", date: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openMission, setOpenMission] = useState<number | null>(null);
  const [cands, setCands] = useState<Record<number, Cand[]>>({});

  useEffect(() => {
    fetch(`/app/api/organisations/${id}`).then((r) => r.json()).then((d) => setOrgName(d.org?.name || "")).catch(() => {});
    fetch(`/app/api/organisations/mine`).then((r) => r.json()).then((d) => {
      const ok = (d.organisations || []).some((o: any) => o.id === id);
      setAllowed(ok);
      if (ok) load();
    }).catch(() => setAllowed(false));
  }, [id]);

  function load() {
    fetch(`/app/api/organisations/${id}/missions`).then((r) => r.json()).then((d) => setMissions(d.missions || [])).catch(() => {});
  }
  async function publier() {
    if (busy) return;
    if (!form.title.trim()) { setError("Le titre est requis."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch(`/app/api/organisations/${id}/missions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Publication impossible."); setBusy(false); return; }
      setOpen(false); setForm({ type: "Bénévolat", title: "", desc: "", profil: "", location: "", date: "" }); load();
    } catch { setError("Publication impossible."); }
    setBusy(false);
  }
  async function toggleMission(mid: number) {
    if (openMission === mid) { setOpenMission(null); return; }
    setOpenMission(mid);
    if (!cands[mid]) {
      const d = await fetch(`/app/api/missions/${mid}/candidatures`).then((x) => x.json());
      setCands((c) => ({ ...c, [mid]: d.candidatures || [] }));
    }
  }
  async function setStatut(cid: number, mid: number, statut: string) {
    await fetch(`/app/api/candidatures/${cid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut }) });
    const d = await fetch(`/app/api/missions/${mid}/candidatures`).then((x) => x.json());
    setCands((c) => ({ ...c, [mid]: d.candidatures || [] }));
    load();
  }

  if (allowed === false) {
    return <AppShell><Link href={`/organisations/${id}`} className="board-back">← Retour à la fiche</Link><p className="board-empty">Espace réservé aux membres de cette organisation.</p></AppShell>;
  }

  return (
    <AppShell>
      <Link href={`/organisations/${id}`} className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        {orgName || "Organisation"}
      </Link>

      <div className="board-head">
        <h1>Missions de l'organisation</h1>
        <button className="btn btn-coral" onClick={() => setOpen(true)}>Publier une mission</button>
      </div>

      {allowed === null ? <p className="board-empty">Chargement…</p>
      : missions.length === 0 ? <p className="board-empty">Aucune mission publiée. Cliquez sur « Publier une mission » pour commencer.</p>
      : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
          {missions.map((m) => (
            <div key={m.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
              <button onClick={() => toggleMission(m.id)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#fff", background: m.color, borderRadius: 999, padding: "2px 10px" }}>{m.type}</span>
                <span style={{ fontWeight: 700, color: "#372646", flex: 1 }}>{m.title}</span>
                <span style={{ fontSize: 13, color: "#5E4A73" }}>{m.candidatures} candidature{m.candidatures > 1 ? "s" : ""}{m.en_attente > 0 ? ` · ${m.en_attente} en attente` : ""}</span>
              </button>
              {openMission === m.id && (
                <div style={{ borderTop: "1px solid #F0E6DD", padding: "12px 16px", background: "#FCF9F6" }}>
                  {!cands[m.id] ? <p style={{ color: "#9C919E" }}>Chargement…</p>
                  : cands[m.id].length === 0 ? <p style={{ color: "#9C919E" }}>Aucune candidature pour le moment.</p>
                  : cands[m.id].map((c) => (
                    <div key={c.id} style={{ borderBottom: "1px solid #F0E6DD", padding: "10px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <b style={{ color: "#372646" }}>{`${c.prenom} ${c.nom}`.trim() || "Candidat"}</b>
                        <span style={{ color: "#9C919E", fontSize: 13 }}>{c.email}</span>
                        <span style={statutChip(c.statut)}>{STATUT_LABEL[c.statut] || c.statut}</span>
                      </div>
                      {c.presentation && <p style={{ color: "#5E4A73", fontSize: 14, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{c.presentation}</p>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-coral" disabled={c.statut === "acceptee"} onClick={() => setStatut(c.id, m.id, "acceptee")}>Accepter</button>
                        <button className="btn btn-ghost" disabled={c.statut === "refusee"} onClick={() => setStatut(c.id, m.id, "refusee")}>Refuser</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Publier une mission</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="mfield"><label>Intitulé de la mission</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="mfield"><label>Description</label><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Décrivez la mission…" /></div>
              <div className="mfield"><label>Profil recherché</label><textarea value={form.profil} onChange={(e) => setForm({ ...form, profil: e.target.value })} placeholder="Compétences, qualités attendues…" /></div>
              <div className="mfield"><label>Lieu</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ville, télétravail…" /></div>
              <div className="mfield"><label>Date / disponibilité</label><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Ex. dès septembre" /></div>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={publier} disabled={busy}>{busy ? "Publication…" : "Publier"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
