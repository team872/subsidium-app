"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Mission = { id: number; type: string; color: string; title: string; desc: string; profil: string; location: string | null; date: string; candidatures: number; en_attente: number };
type Cand = { id: number; nom: string; prenom: string; email: string; presentation: string; statut: string; created_at: string };
type Offre = { id: number; title: string; provider: string; desc: string; price: string; grad: string; contacts: number };
type Contact = { id: number; nom: string; prenom: string; email: string; message: string; created_at: string };

const TYPES = ["Bénévolat", "CDI", "CDD"];
const STATUT_LABEL: Record<string, string> = { en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée" };
function statutChip(s: string): React.CSSProperties {
  const map: Record<string, [string, string]> = { en_attente: ["#8A5A00", "#FCE3B4"], acceptee: ["#1E6B1E", "#DBF0D9"], refusee: ["#9C2A2A", "#F3D6D6"] };
  const [c, b] = map[s] || ["#5E4A73", "#EFE8F2"];
  return { fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 8px", color: c, background: b };
}
function fdate(s: string) { try { return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } }

export default function OrgGestionPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [orgName, setOrgName] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"missions" | "offres">("missions");

  const [missions, setMissions] = useState<Mission[]>([]);
  const [openMission, setOpenMission] = useState<number | null>(null);
  const [cands, setCands] = useState<Record<number, Cand[]>>({});
  const [openMModal, setOpenMModal] = useState(false);
  const [mForm, setMForm] = useState({ type: "Bénévolat", title: "", desc: "", profil: "", location: "", date: "" });

  const [offres, setOffres] = useState<Offre[]>([]);
  const [openOffre, setOpenOffre] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Record<number, Contact[]>>({});
  const [openOModal, setOpenOModal] = useState(false);
  const [oForm, setOForm] = useState({ title: "", desc: "", price: "" });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/app/api/organisations/${id}`).then((r) => r.json()).then((d) => setOrgName(d.org?.name || "")).catch(() => {});
    fetch(`/app/api/organisations/mine`).then((r) => r.json()).then((d) => {
      const ok = (d.organisations || []).some((o: any) => o.id === id);
      setAllowed(ok);
      if (ok) { loadMissions(); loadOffres(); }
    }).catch(() => setAllowed(false));
  }, [id]);

  function loadMissions() { fetch(`/app/api/organisations/${id}/missions`).then((r) => r.json()).then((d) => setMissions(d.missions || [])).catch(() => {}); }
  function loadOffres() { fetch(`/app/api/organisations/${id}/offres`).then((r) => r.json()).then((d) => setOffres(d.offres || [])).catch(() => {}); }

  async function publierMission() {
    if (busy) return;
    if (!mForm.title.trim()) { setError("Le titre est requis."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch(`/app/api/organisations/${id}/missions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mForm) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Publication impossible."); setBusy(false); return; }
      setOpenMModal(false); setMForm({ type: "Bénévolat", title: "", desc: "", profil: "", location: "", date: "" }); loadMissions();
    } catch { setError("Publication impossible."); }
    setBusy(false);
  }
  async function toggleMission(mid: number) {
    if (openMission === mid) { setOpenMission(null); return; }
    setOpenMission(mid);
    if (!cands[mid]) { const d = await fetch(`/app/api/missions/${mid}/candidatures`).then((x) => x.json()); setCands((c) => ({ ...c, [mid]: d.candidatures || [] })); }
  }
  async function setStatut(cid: number, mid: number, statut: string) {
    await fetch(`/app/api/candidatures/${cid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut }) });
    const d = await fetch(`/app/api/missions/${mid}/candidatures`).then((x) => x.json());
    setCands((c) => ({ ...c, [mid]: d.candidatures || [] })); loadMissions();
  }

  async function publierOffre() {
    if (busy) return;
    if (!oForm.title.trim()) { setError("Le titre est requis."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch(`/app/api/organisations/${id}/offres`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(oForm) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Publication impossible."); setBusy(false); return; }
      setOpenOModal(false); setOForm({ title: "", desc: "", price: "" }); loadOffres();
    } catch { setError("Publication impossible."); }
    setBusy(false);
  }
  async function toggleOffre(oid: number) {
    if (openOffre === oid) { setOpenOffre(null); return; }
    setOpenOffre(oid);
    if (!contacts[oid]) { const d = await fetch(`/app/api/offres/${oid}/contacts`).then((x) => x.json()); setContacts((c) => ({ ...c, [oid]: d.contacts || [] })); }
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
        <h1>Espace de gestion</h1>
        {tab === "missions"
          ? <button className="btn btn-coral" onClick={() => setOpenMModal(true)}>Publier une mission</button>
          : <button className="btn btn-coral" onClick={() => setOpenOModal(true)}>Publier une offre</button>}
      </div>

      <div className="board-tabs">
        <button className={tab === "missions" ? "on" : ""} onClick={() => setTab("missions")}>Missions</button>
        <button className={tab === "offres" ? "on" : ""} onClick={() => setTab("offres")}>Offres</button>
      </div>

      {allowed === null ? <p className="board-empty">Chargement…</p> : tab === "missions" ? (
        missions.length === 0 ? <p className="board-empty">Aucune mission publiée. Cliquez sur « Publier une mission ».</p>
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
        )
      ) : (
        offres.length === 0 ? <p className="board-empty">Aucune offre publiée. Cliquez sur « Publier une offre ».</p>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
            {offres.map((o) => (
              <div key={o.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
                <button onClick={() => toggleOffre(o.id)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontWeight: 700, color: "#372646", flex: 1 }}>{o.title}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#C2452F" }}>{o.price}</span>
                  <span style={{ fontSize: 13, color: "#5E4A73" }}>{o.contacts} contact{o.contacts > 1 ? "s" : ""}</span>
                </button>
                {openOffre === o.id && (
                  <div style={{ borderTop: "1px solid #F0E6DD", padding: "12px 16px", background: "#FCF9F6" }}>
                    {!contacts[o.id] ? <p style={{ color: "#9C919E" }}>Chargement…</p>
                    : contacts[o.id].length === 0 ? <p style={{ color: "#9C919E" }}>Aucune demande de contact pour le moment.</p>
                    : contacts[o.id].map((c) => (
                      <div key={c.id} style={{ borderBottom: "1px solid #F0E6DD", padding: "10px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <b style={{ color: "#372646" }}>{`${c.prenom} ${c.nom}`.trim() || "Contact"}</b>
                          <span style={{ color: "#9C919E", fontSize: 13 }}>{c.email}</span>
                          <span style={{ color: "#9C919E", fontSize: 12.5 }}>{fdate(c.created_at)}</span>
                        </div>
                        {c.message && <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, whiteSpace: "pre-wrap" }}>{c.message}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {openMModal && (
        <div className="modal-overlay" onClick={() => setOpenMModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Publier une mission</h2><button className="modal-x" onClick={() => setOpenMModal(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Type</label><select value={mForm.type} onChange={(e) => setMForm({ ...mForm, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="mfield"><label>Intitulé de la mission</label><input value={mForm.title} onChange={(e) => setMForm({ ...mForm, title: e.target.value })} /></div>
              <div className="mfield"><label>Description</label><textarea value={mForm.desc} onChange={(e) => setMForm({ ...mForm, desc: e.target.value })} placeholder="Décrivez la mission…" /></div>
              <div className="mfield"><label>Profil recherché</label><textarea value={mForm.profil} onChange={(e) => setMForm({ ...mForm, profil: e.target.value })} placeholder="Compétences, qualités attendues…" /></div>
              <div className="mfield"><label>Lieu</label><input value={mForm.location} onChange={(e) => setMForm({ ...mForm, location: e.target.value })} placeholder="Ville, télétravail…" /></div>
              <div className="mfield"><label>Date / disponibilité</label><input value={mForm.date} onChange={(e) => setMForm({ ...mForm, date: e.target.value })} placeholder="Ex. dès septembre" /></div>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={publierMission} disabled={busy}>{busy ? "Publication…" : "Publier"}</button></div>
          </div>
        </div>
      )}

      {openOModal && (
        <div className="modal-overlay" onClick={() => setOpenOModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Publier une offre</h2><button className="modal-x" onClick={() => setOpenOModal(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Titre de l'offre</label><input value={oForm.title} onChange={(e) => setOForm({ ...oForm, title: e.target.value })} /></div>
              <div className="mfield"><label>Description</label><textarea value={oForm.desc} onChange={(e) => setOForm({ ...oForm, desc: e.target.value })} placeholder="Décrivez l'offre ou le service…" /></div>
              <div className="mfield"><label>Prix</label><input value={oForm.price} onChange={(e) => setOForm({ ...oForm, price: e.target.value })} placeholder="Ex. 0,00 € ou 250,00 €" /></div>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={publierOffre} disabled={busy}>{busy ? "Publication…" : "Publier"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
