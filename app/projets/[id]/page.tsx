"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import "@/components/MemberBoards.css";

type Projet = { id: number; title: string; theme: string | null; desc: string; lieu: string | null; prive: boolean; membres: number; grad: string };
type Member = { nom: string; prenom: string; role: string };
type Post = { id: number; corps: string; auteur: string; created_at: string };
type Cand = { id: number; nom: string; prenom: string; email: string; presentation: string; statut: string; created_at: string };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    roleOwner: "Porteur", roleMembre: "Contributeur", roleSuiveur: "Suiveur",
    stPending: "En attente", stAccepted: "Acceptée", stRejected: "Refusée",
    back: "Projets", loading: "Chargement…", notfound: "Projet introuvable.",
    prive: "Privé", restricted: "Ce projet est privé. Candidatez pour demander à le rejoindre et accéder à son contenu.",
    workspace: "Espace de travail →", unfollow: "Ne plus suivre", follow: "Suivre le projet",
    apply: "Candidater pour contribuer", applied: "✔ Candidature envoyée",
    errAction: "Action impossible.", errApply: "Candidature impossible.", errPublish: "Publication impossible.",
    feed: "Fil d'activité", feedPh: "Partagez une avancée, une décision, un appel à contribution…", publish: "Publier", noPost: "Aucune publication pour le moment.",
    candidatures: "Candidatures", noCand: "Aucune candidature pour le moment.", candidate: "Candidat", accept: "Accepter", refuse: "Refuser",
    members: "Membres", noMember: "Aucun membre.", memberWord: "Membre",
    modalTitle: "Candidater au projet", fNom: "Nom", fPrenom: "Prénom", fMail: "Adresse mail", fPres: "Présentation",
    phPres: "Pourquoi souhaitez-vous contribuer à ce projet ?", sending: "Envoi…", sendCand: "Envoyer ma candidature", close: "Fermer",
  },
  en: {
    roleOwner: "Owner", roleMembre: "Contributor", roleSuiveur: "Follower",
    stPending: "Pending", stAccepted: "Accepted", stRejected: "Rejected",
    back: "Projects", loading: "Loading…", notfound: "Project not found.",
    prive: "Private", restricted: "This project is private. Apply to request to join and access its content.",
    workspace: "Workspace →", unfollow: "Unfollow", follow: "Follow the project",
    apply: "Apply to contribute", applied: "✔ Application sent",
    errAction: "Action failed.", errApply: "Could not apply.", errPublish: "Could not publish.",
    feed: "Activity feed", feedPh: "Share an update, a decision, a call for contribution…", publish: "Publish", noPost: "No post yet.",
    candidatures: "Applications", noCand: "No application yet.", candidate: "Applicant", accept: "Accept", refuse: "Decline",
    members: "Members", noMember: "No member.", memberWord: "Member",
    modalTitle: "Apply to the project", fNom: "Last name", fPrenom: "First name", fMail: "Email address", fPres: "Introduction",
    phPres: "Why would you like to contribute to this project?", sending: "Sending…", sendCand: "Send my application", close: "Close",
  },
  it: {
    roleOwner: "Titolare", roleMembre: "Contributore", roleSuiveur: "Follower",
    stPending: "In attesa", stAccepted: "Accettata", stRejected: "Rifiutata",
    back: "Progetti", loading: "Caricamento…", notfound: "Progetto non trovato.",
    prive: "Privato", restricted: "Questo progetto è privato. Candidati per chiedere di unirti e accedere ai contenuti.",
    workspace: "Spazio di lavoro →", unfollow: "Non seguire più", follow: "Segui il progetto",
    apply: "Candidati per contribuire", applied: "✔ Candidatura inviata",
    errAction: "Azione impossibile.", errApply: "Candidatura impossibile.", errPublish: "Pubblicazione impossibile.",
    feed: "Bacheca attività", feedPh: "Condividi un avanzamento, una decisione, un appello…", publish: "Pubblica", noPost: "Nessuna pubblicazione per ora.",
    candidatures: "Candidature", noCand: "Nessuna candidatura per ora.", candidate: "Candidato", accept: "Accetta", refuse: "Rifiuta",
    members: "Membri", noMember: "Nessun membro.", memberWord: "Membro",
    modalTitle: "Candidati al progetto", fNom: "Cognome", fPrenom: "Nome", fMail: "Indirizzo e-mail", fPres: "Presentazione",
    phPres: "Perché vuoi contribuire a questo progetto?", sending: "Invio…", sendCand: "Invia la mia candidatura", close: "Chiudi",
  },
};

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}
function statutChip(s: string): React.CSSProperties {
  const map: Record<string, [string, string]> = { en_attente: ["#8A5A00", "#FCE3B4"], acceptee: ["#1E6B1E", "#DBF0D9"], refusee: ["#9C2A2A", "#F3D6D6"] };
  const [c, b] = map[s] || ["#5E4A73", "#EFE8F2"];
  return { fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 8px", color: c, background: b };
}

export default function ProjetDetailPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-GB" : "fr-FR";
  const fdate = (s: string) => { try { return new Date(s).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } };
  const ROLE: Dict = { owner: tr.roleOwner, membre: tr.roleMembre, suiveur: tr.roleSuiveur };
  const STAT: Dict = { en_attente: tr.stPending, acceptee: tr.stAccepted, refusee: tr.stRejected };

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
      if (!r.ok) { const d = await r.json(); setErr(d.error || tr.errAction); }
      else await load();
    } catch { setErr(tr.errAction); }
    setBusy(false);
  }
  async function envoyerCand() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/projets/${id}/candidater`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cform) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || tr.errApply); setBusy(false); return; }
      setShowCand(false); setHasCand(true);
    } catch { setErr(tr.errApply); }
    setBusy(false);
  }
  async function publier() {
    if (busy || !corps.trim()) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/projets/${id}/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ corps }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || tr.errPublish); setBusy(false); return; }
      setCorps("");
      const rr = await fetch(`/app/api/projets/${id}/posts`).then((x) => x.json());
      setPosts(rr.posts || []);
    } catch { setErr(tr.errPublish); }
    setBusy(false);
  }
  async function decide(cid: number, approve: boolean) {
    await fetch(`/app/api/projet-candidatures/${cid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approve }) });
    const c = await fetch(`/app/api/projets/${id}/candidatures`).then((x) => x.json());
    setCands(c.candidatures || []);
    load();
  }

  if (loading) return <AppShell><Link href="/projets" className="board-back">← {tr.back}</Link><p className="board-empty">{tr.loading}</p></AppShell>;
  if (!projet) return <AppShell><Link href="/projets" className="board-back">← {tr.back}</Link><p className="board-empty">{tr.notfound}</p></AppShell>;

  const peutPoster = role === "owner" || role === "membre";
  const peutCandidater = !isOwner && role !== "membre" && !hasCand;

  return (
    <AppShell>
      <Link href="/projets" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        {tr.back}
      </Link>

      <section className="idetail" style={{ maxWidth: 820 }}>
        <div style={{ height: 120, background: projet.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 40, fontFamily: "var(--font-display),cursive" }}>{initials(projet.title)}</div>
        <div className="body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            {projet.theme && <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#5E4A73", background: "#EFE8F2", borderRadius: 999, padding: "3px 10px" }}>{projet.theme}</span>}
            {projet.lieu && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#5E8A57", borderRadius: 999, padding: "3px 10px" }}>{projet.lieu}</span>}
            {projet.prive && <span style={{ fontSize: 12, fontWeight: 700, color: "#8A5A00", background: "#FCE3B4", borderRadius: 999, padding: "3px 10px" }}>{tr.prive}</span>}
            {role && <span style={{ fontSize: 12, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "3px 10px" }}>{ROLE[role] || role}</span>}
          </div>
          <h1>{projet.title}</h1>
          {restricted ? (
            <p className="txt" style={{ color: "#9C919E" }}>{tr.restricted}</p>
          ) : projet.desc ? <p className="txt">{projet.desc}</p> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {(role === "owner" || role === "membre") && (
              <Link href={`/projets/${id}/atelier`} className="btn btn-coral">{tr.workspace}</Link>
            )}
            {!isOwner && role !== "membre" && (
              <button className={role === "suiveur" ? "btn btn-ghost" : "btn btn-coral"} onClick={toggleSuivre} disabled={busy}>
                {role === "suiveur" ? tr.unfollow : tr.follow}
              </button>
            )}
            {peutCandidater && <button className="btn btn-coral" onClick={() => setShowCand(true)}>{tr.apply}</button>}
            {hasCand && <span style={{ alignSelf: "center", color: "#1E6B1E", fontWeight: 700, fontSize: 14 }}>{tr.applied}</span>}
          </div>
          {err && <p className="msg" style={{ marginTop: 8 }}>{err}</p>}
        </div>
      </section>

      {!restricted && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", maxWidth: 820, marginTop: 24 }}>
          <section style={{ flex: "2 1 460px" }}>
            <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{tr.feed}</h2>
            {peutPoster && (
              <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: 14, marginBottom: 14, background: "#FCF9F6" }}>
                <textarea value={corps} onChange={(e) => setCorps(e.target.value)} placeholder={tr.feedPh} rows={3} style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
                <div style={{ marginTop: 8 }}><button className="btn btn-coral" onClick={publier} disabled={busy || !corps.trim()}>{tr.publish}</button></div>
              </div>
            )}
            {posts.length === 0 ? <p className="board-empty">{tr.noPost}</p>
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
                <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "22px 0 12px" }}>{tr.candidatures}</h2>
                {cands.length === 0 ? <p className="board-empty">{tr.noCand}</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cands.map((c) => (
                      <div key={c.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "12px 16px", background: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <b style={{ color: "#372646" }}>{`${c.prenom} ${c.nom}`.trim() || tr.candidate}</b>
                          <span style={{ color: "#9C919E", fontSize: 13 }}>{c.email}</span>
                          <span style={statutChip(c.statut)}>{STAT[c.statut] || c.statut}</span>
                        </div>
                        {c.presentation && <p style={{ color: "#5E4A73", fontSize: 14, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{c.presentation}</p>}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-coral" disabled={c.statut === "acceptee"} onClick={() => decide(c.id, true)}>{tr.accept}</button>
                          <button className="btn btn-ghost" disabled={c.statut === "refusee"} onClick={() => decide(c.id, false)}>{tr.refuse}</button>
                        </div>
                      </div>
                    ))}
                  </div>}
              </>
            )}
          </section>

          <section style={{ flex: "1 1 220px" }}>
            <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{tr.members}</h2>
            <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "6px 0", background: "#fff" }}>
              {members.length === 0 ? <div style={{ padding: "8px 14px", color: "#9C919E" }}>{tr.noMember}</div> : members.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: "#EFE8F2", color: "#5E4A73", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(`${m.prenom} ${m.nom}`)}</span>
                  <span style={{ color: "#372646", fontSize: 14 }}>{`${m.prenom} ${m.nom}`.trim() || tr.memberWord}</span>
                  {m.role !== "suiveur" && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: m.role === "owner" ? "#C2452F" : "#5E8A57" }}>{ROLE[m.role]}</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {showCand && (
        <div className="modal-overlay" onClick={() => setShowCand(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{tr.modalTitle}</h2><button className="modal-x" onClick={() => setShowCand(false)} aria-label={tr.close}>×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>{tr.fNom}</label><input value={cform.nom} onChange={(e) => setCform({ ...cform, nom: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fPrenom}</label><input value={cform.prenom} onChange={(e) => setCform({ ...cform, prenom: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fMail}</label><input value={cform.email} onChange={(e) => setCform({ ...cform, email: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fPres}</label><textarea value={cform.presentation} onChange={(e) => setCform({ ...cform, presentation: e.target.value })} placeholder={tr.phPres} /></div>
              {err && <p className="msg">{err}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={envoyerCand} disabled={busy}>{busy ? tr.sending : tr.sendCand}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
