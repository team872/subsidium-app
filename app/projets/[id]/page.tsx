"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Projet = { id: number; title: string; theme: string | null; desc: string; lieu: string | null; prive: boolean; membres: number; grad: string };
type Member = { nom: string; prenom: string; role: string };
type Post = { id: number; corps: string; auteur: string; created_at: string };
type Cand = { id: number; nom: string; prenom: string; email: string; presentation: string; statut: string; created_at: string };

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}
function fdate(s: string) { try { return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } }
const ROLE_LABEL: Record<string, string> = { owner: "Porteur", membre: "Contributeur", suiveur: "Suiveur" };
function statutChip(s: string): React.CSSProperties {
  const map: Record<string, [string, string]> = { en_attente: ["#8A5A00", "#FCE3B4"], acceptee: ["#1E6B1E", "#DBF0D9"], refusee: ["#9C2A2A", "#F3D6D6"] };
  const [c, b] = map[s] || ["#5E4A73", "#EFE8F2"];
  return { fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 8px", color: c, background: b };
}
const STATUT_LABEL: Record<string, string> = { en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée" };

export default function ProjetDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [projet, setProjet] = useState<Projet | null>(null);
  const [restricted, setRestricted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [hasCand, setHasCand] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cands, setCands] = useState<Cand[]>([]);
  const [loading, setLoading] = useState(true);
  const [corps, setCorps] = useState("");
  const [showCand, setShowCand] = useState(false);
  const [cform, setCform] = useState({ nom: "", prenom: "", email: "", presentation: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    return fetch(`/app/api/projets/${id}`).then((r) => r.json()).then((d) => {
      setProjet(d.projet || null); setRestricted(!!d.restricted); setRole(d.role || null);
      setIsOwner(!!d.isOwner); setHasCand(!!d.hasCandidated); setMembers(d.members || []); setPosts(d.posts || []);
      if (d.isOwner) fetch(`/app/api/projets/${id}/candidatures`).then((x) => x.json()).then((c) => setCands(c.candidatures || [])).catch(() => {});
    });
  }
  useEffect(() => { load().catch(() => setProjet(null)).finally(() => setLoading(false)); }, [id]);

  async function toggleSuivre() {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/projets/${id}/suivre`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suivre: role !== "suiveur" }) });
      if (!r.ok) { const d = await r.json(); setErr(d.error || "Action impossible."); }
      else await load();
    } catch { setErr("Action impossible."); }
    setBusy(false);
  }
  async function envoyerCand() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/projets/${id}/candidater`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cform) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Candidature impossible."); setBusy(false); return; }
      setShowCand(false); setHasCand(true);
    } catch { setErr("Candidature impossible."); }
    setBusy(false);
  }
  async function publier() {
    if (busy || !corps.trim()) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/projets/${id}/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ corps }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Publication impossible."); setBusy(false); return; }
      setCorps("");
      const rr = await fetch(`/app/api/projets/${id}/posts`).then((x) => x.json());
      setPosts(rr.posts || []);
    } catch { setErr("Publication impossible."); }
    setBusy(false);
  }
  async function decide(cid: number, approve: boolean) {
    await fetch(`/app/api/projet-candidatures/${cid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approve }) });
    const c = await fetch(`/app/api/projets/${id}/candidatures`).then((x) => x.json());
    setCands(c.candidatures || []);
    load();
  }

  if (loading) return <AppShell><Link href="/projets" className="board-back">← Projets</Link><p className="board-empty">Chargement…</p></AppShell>;
  if (!projet) return <AppShell><Link href="/projets" className="board-back">← Projets</Link><p className="board-empty">Projet introuvable.</p></AppShell>;

  const peutPoster = role === "owner" || role === "membre";
  const peutCandidater = !isOwner && role !== "membre" && !hasCand;

  return (
    <AppShell>
      <Link href="/projets" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Projets
      </Link>

      <section className="idetail" style={{ maxWidth: 820 }}>
        <div style={{ height: 120, background: projet.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 40, fontFamily: "var(--font-display),cursive" }}>{initials(projet.title)}</div>
        <div className="body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            {projet.theme && <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#5E4A73", background: "#EFE8F2", borderRadius: 999, padding: "3px 10px" }}>{projet.theme}</span>}
            {projet.lieu && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#5E8A57", borderRadius: 999, padding: "3px 10px" }}>{projet.lieu}</span>}
            {projet.prive && <span style={{ fontSize: 12, fontWeight: 700, color: "#8A5A00", background: "#FCE3B4", borderRadius: 999, padding: "3px 10px" }}>Privé</span>}
            {role && <span style={{ fontSize: 12, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "3px 10px" }}>{ROLE_LABEL[role] || role}</span>}
          </div>
          <h1>{projet.title}</h1>
          {restricted ? (
            <p className="txt" style={{ color: "#9C919E" }}>Ce projet est privé. Candidatez pour demander à le rejoindre et accéder à son contenu.</p>
          ) : projet.desc ? <p className="txt">{projet.desc}</p> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {(role === "owner" || role === "membre") && (
              <Link href={`/projets/${id}/atelier`} className="btn btn-coral">Espace de travail →</Link>
            )}
            {!isOwner && role !== "membre" && (
              <button className={role === "suiveur" ? "btn btn-ghost" : "btn btn-coral"} onClick={toggleSuivre} disabled={busy}>
                {role === "suiveur" ? "Ne plus suivre" : "Suivre le projet"}
              </button>
            )}
            {peutCandidater && <button className="btn btn-coral" onClick={() => setShowCand(true)}>Candidater pour contribuer</button>}
            {hasCand && <span style={{ alignSelf: "center", color: "#1E6B1E", fontWeight: 700, fontSize: 14 }}>✔ Candidature envoyée</span>}
          </div>
          {err && <p className="msg" style={{ marginTop: 8 }}>{err}</p>}
        </div>
      </section>

      {!restricted && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", maxWidth: 820, marginTop: 24 }}>
          <section style={{ flex: "2 1 460px" }}>
            <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>Fil d'activité</h2>
            {peutPoster && (
              <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: 14, marginBottom: 14, background: "#FCF9F6" }}>
                <textarea value={corps} onChange={(e) => setCorps(e.target.value)} placeholder="Partagez une avancée, une décision, un appel à contribution…" rows={3} style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
                <div style={{ marginTop: 8 }}><button className="btn btn-coral" onClick={publier} disabled={busy || !corps.trim()}>Publier</button></div>
              </div>
            )}
            {posts.length === 0 ? <p className="board-empty">Aucune publication pour le moment.</p>
            : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {posts.map((p) => (
                  <div key={p.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "12px 16px", background: "#fff" }}>
                    <div style={{ color: "#9C919E", fontSize: 12.5, marginBottom: 4 }}>{p.auteur} · {fdate(p.created_at)}</div>
                    <p style={{ color: "#372646", fontSize: 14, margin: 0, whiteSpace: "pre-wrap" }}>{p.corps}</p>
                  </div>
                ))}
              </div>}

            {isOwner && (
              <>
                <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "22px 0 12px" }}>Candidatures</h2>
                {cands.length === 0 ? <p className="board-empty">Aucune candidature pour le moment.</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cands.map((c) => (
                      <div key={c.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "12px 16px", background: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <b style={{ color: "#372646" }}>{`${c.prenom} ${c.nom}`.trim() || "Candidat"}</b>
                          <span style={{ color: "#9C919E", fontSize: 13 }}>{c.email}</span>
                          <span style={statutChip(c.statut)}>{STATUT_LABEL[c.statut] || c.statut}</span>
                        </div>
                        {c.presentation && <p style={{ color: "#5E4A73", fontSize: 14, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{c.presentation}</p>}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-coral" disabled={c.statut === "acceptee"} onClick={() => decide(c.id, true)}>Accepter</button>
                          <button className="btn btn-ghost" disabled={c.statut === "refusee"} onClick={() => decide(c.id, false)}>Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>}
              </>
            )}
          </section>

          <section style={{ flex: "1 1 220px" }}>
            <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>Membres</h2>
            <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "6px 0", background: "#fff" }}>
              {members.length === 0 ? <div style={{ padding: "8px 14px", color: "#9C919E" }}>Aucun membre.</div> : members.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: "#EFE8F2", color: "#5E4A73", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(`${m.prenom} ${m.nom}`)}</span>
                  <span style={{ color: "#372646", fontSize: 14 }}>{`${m.prenom} ${m.nom}`.trim() || "Membre"}</span>
                  {m.role !== "suiveur" && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: m.role === "owner" ? "#C2452F" : "#5E8A57" }}>{ROLE_LABEL[m.role]}</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {showCand && (
        <div className="modal-overlay" onClick={() => setShowCand(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Candidater au projet</h2><button className="modal-x" onClick={() => setShowCand(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Nom</label><input value={cform.nom} onChange={(e) => setCform({ ...cform, nom: e.target.value })} /></div>
              <div className="mfield"><label>Prénom</label><input value={cform.prenom} onChange={(e) => setCform({ ...cform, prenom: e.target.value })} /></div>
              <div className="mfield"><label>Adresse mail</label><input value={cform.email} onChange={(e) => setCform({ ...cform, email: e.target.value })} /></div>
              <div className="mfield"><label>Présentation</label><textarea value={cform.presentation} onChange={(e) => setCform({ ...cform, presentation: e.target.value })} placeholder="Pourquoi souhaitez-vous contribuer à ce projet ?" /></div>
              {err && <p className="msg">{err}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={envoyerCand} disabled={busy}>{busy ? "Envoi…" : "Envoyer ma candidature"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
