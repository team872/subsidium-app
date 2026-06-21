"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Mission = { id: number; type: string; color: string; title: string; org: string; desc: string; profil: string; location: string | null; date: string };

export default function MissionDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [mission, setMission] = useState<Mission | null>(null);
  const [candidated, setCandidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ nom: string; prenom: string; email: string }>({ nom: "", prenom: "", email: "" });
  const [presentation, setPresentation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const done = useRef(false);

  useEffect(() => {
    fetch(`/app/api/missions/${id}`).then((r) => r.json()).then((d) => { setMission(d.mission || null); setCandidated(!!d.candidated); }).catch(() => setMission(null)).finally(() => setLoading(false));
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => { const u = d.user; if (u) setMe({ nom: u.nom || "", prenom: u.prenom || "", email: u.email || "" }); }).catch(() => {});
  }, [id]);

  async function submit() {
    if (busy) return;
    if (!presentation.trim()) { setError("Présentez vos motivations pour ce projet."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch(`/app/api/missions/${id}/candidater`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...me, presentation: presentation.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Candidature impossible."); setBusy(false); return; }
      done.current = true; setCandidated(true); setOpen(false);
    } catch { setError("Candidature impossible."); }
    setBusy(false);
  }

  if (loading) return <AppShell><Link href="/missions" className="board-back">← Missions</Link><p className="board-empty">Chargement…</p></AppShell>;
  if (!mission) return <AppShell><Link href="/missions" className="board-back">← Missions</Link><p className="board-empty">Mission introuvable.</p></AppShell>;

  return (
    <AppShell>
      <Link href="/missions" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Toutes les missions
      </Link>

      <section className="idetail" style={{ maxWidth: 760 }}>
        <div className="band" style={{ background: mission.color }}><span>{mission.type}</span></div>
        <div className="body">
          <h1>{mission.title}</h1>
          <div className="meta">
            <span className="auth">Par {mission.org}</span>
            <span>· {mission.date}</span>
            {mission.location && <span>· {mission.location}</span>}
          </div>
          <p className="txt">{mission.desc}</p>
          <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "1.02rem", color: "#372646", margin: "4px 0 8px" }}>Profil recherché</h2>
          <p className="txt">{mission.profil}</p>

          {candidated ? (
            <span style={{ background: "#DBF0D9", color: "#1E6B1E", fontWeight: 700, borderRadius: 999, padding: "8px 16px", display: "inline-block" }}>✓ Candidature envoyée</span>
          ) : (
            <button className="btn btn-coral" onClick={() => setOpen(true)}>Candidater</button>
          )}
        </div>
      </section>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Candidater</h2>
              <button className="modal-x" onClick={() => setOpen(false)} aria-label="Fermer">×</button>
            </div>
            <div className="modal-body">
              <div className="mfield"><label>Nom</label><input value={me.nom} onChange={(e) => setMe({ ...me, nom: e.target.value })} /></div>
              <div className="mfield"><label>Prénom</label><input value={me.prenom} onChange={(e) => setMe({ ...me, prenom: e.target.value })} /></div>
              <div className="mfield"><label>Adresse mail</label><input value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} /></div>
              <div className="mfield"><label>Présentation</label><textarea value={presentation} onChange={(e) => setPresentation(e.target.value)} placeholder="Présentez vos motivations et votre intérêt pour ce projet…" /></div>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-coral" onClick={submit} disabled={busy}>{busy ? "Envoi…" : "Envoyer"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
