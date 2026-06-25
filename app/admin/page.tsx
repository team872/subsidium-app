"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { NIVEAUX } from "@/lib/niveau";
import { useLang, useT } from "@/components/LangProvider";
import AdminActualites from "@/components/AdminActualites";
import AdminRgpd from "@/components/AdminRgpd";
import AdminAudits from "@/components/AdminAudits";
import "@/components/MemberBoards.css";

type Member = {
  id: number; email: string; nom: string | null; prenom: string | null;
  niveau: number; badge_n2: boolean; charte_validee: boolean; paye: boolean; created_at: string;
};
type Org = { id: number; name: string; type: string; region: string | null; labellisee: boolean };
type Cert = { id: number; user_id: number; nom: string | null; prenom: string | null; email: string; niveau: number; created_at: string };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Administration", denied: "Accès réservé aux administrateurs.",
    tabMembers: "Membres", tabOrgs: "Organisations", tabCerts: "Certifications", tabActus: "Actualités", tabRgpd: "RGPD", tabAudits: "Audits",
    searchMember: "Rechercher un membre…", searchOrg: "Rechercher une organisation…", loading: "Chargement…",
    membersIntro: "Promouvez un Initiateur en Refondateur Certifié (N3) ou Ambassadeur (N4). Les niveaux 0→2 s'obtiennent normalement par le parcours.",
    hMember: "Membre", hLevel: "Niveau actuel", hParcours: "État parcours", hPromote: "Promouvoir / valider",
    chCharte: "charte", chPaid: "payé", chBadge: "badge N2",
    orgsIntro: "Validez les organisations : une organisation labellisée apparaît dans l'annuaire public.",
    hOrg: "Organisation", hStatus: "Statut", hAction: "Action",
    labelled: "Labellisée", pending: "En attente", removeLabel: "Retirer le label", doLabel: "Labelliser", noOrg: "Aucune organisation.",
    certsIntro: "Demandes de certification Leader (Refondateur Certifié N3) issues du parcours. Approuver promeut le membre au niveau N3.",
    hDecision: "Décision", certify: "Certifier (N3)", refuse: "Refuser", noCert: "Aucune demande de certification en attente.",
  },
  en: {
    title: "Administration", denied: "Access reserved for administrators.",
    tabMembers: "Members", tabOrgs: "Organisations", tabCerts: "Certifications", tabActus: "News", tabRgpd: "GDPR", tabAudits: "Audits",
    searchMember: "Search a member…", searchOrg: "Search an organisation…", loading: "Loading…",
    membersIntro: "Promote an Initiator to Certified Refounder (N3) or Ambassador (N4). Levels 0→2 are normally earned through the journey.",
    hMember: "Member", hLevel: "Current level", hParcours: "Journey status", hPromote: "Promote / validate",
    chCharte: "charter", chPaid: "paid", chBadge: "N2 badge",
    orgsIntro: "Validate organisations: an accredited organisation appears in the public directory.",
    hOrg: "Organisation", hStatus: "Status", hAction: "Action",
    labelled: "Accredited", pending: "Pending", removeLabel: "Remove accreditation", doLabel: "Accredit", noOrg: "No organisation.",
    certsIntro: "Leader certification requests (Certified Refounder N3) from the journey. Approving promotes the member to level N3.",
    hDecision: "Decision", certify: "Certify (N3)", refuse: "Decline", noCert: "No pending certification request.",
  },
  it: {
    title: "Amministrazione", denied: "Accesso riservato agli amministratori.",
    tabMembers: "Membri", tabOrgs: "Organizzazioni", tabCerts: "Certificazioni", tabActus: "Notizie", tabRgpd: "GDPR", tabAudits: "Audit",
    searchMember: "Cerca un membro…", searchOrg: "Cerca un'organizzazione…", loading: "Caricamento…",
    membersIntro: "Promuovi un Iniziatore a Rifondatore Certificato (N3) o Ambasciatore (N4). I livelli 0→2 si ottengono normalmente tramite il percorso.",
    hMember: "Membro", hLevel: "Livello attuale", hParcours: "Stato percorso", hPromote: "Promuovi / convalida",
    chCharte: "carta", chPaid: "pagato", chBadge: "badge N2",
    orgsIntro: "Convalida le organizzazioni: un'organizzazione accreditata appare nell'elenco pubblico.",
    hOrg: "Organizzazione", hStatus: "Stato", hAction: "Azione",
    labelled: "Accreditata", pending: "In attesa", removeLabel: "Rimuovi accreditamento", doLabel: "Accredita", noOrg: "Nessuna organizzazione.",
    certsIntro: "Richieste di certificazione Leader (Rifondatore Certificato N3) dal percorso. Approvare promuove il membro al livello N3.",
    hDecision: "Decisione", certify: "Certifica (N3)", refuse: "Rifiuta", noCert: "Nessuna richiesta di certificazione in attesa.",
  },
};

const chip = (on: boolean): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 8px", marginRight: 6,
  background: on ? "#DBF0D9" : "#ECECEC", color: on ? "#1E6B1E" : "#9C919E",
});
const th: React.CSSProperties = { padding: "10px 14px", fontSize: 13, fontWeight: 800 };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 14 };
const headRow: React.CSSProperties = { textAlign: "left", color: "#372646", background: "#EFE8F2" };

export default function AdminPage() {
  const { lang } = useLang();
  const t = useT();
  const tr = DICT[lang] || DICT.fr;
  const roleName = (i: number) => { const k = t(`role.${i}`); return k === `role.${i}` ? NIVEAUX[i] : k; };

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"membres" | "organisations" | "certifications" | "actualites" | "rgpd" | "audits">("membres");
  const [members, setMembers] = useState<Member[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/app/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(!!d.isAdmin);
        if (d.isAdmin) {
          Promise.all([
            fetch("/app/api/admin/members").then((r) => r.json()).then((d) => setMembers(d.members || [])).catch(() => {}),
            fetch("/app/api/admin/organisations").then((r) => r.json()).then((d) => setOrgs(d.organisations || [])).catch(() => {}),
            fetch("/app/api/admin/certifications").then((r) => r.json()).then((d) => setCerts(d.certifications || [])).catch(() => {}),
          ]).finally(() => setLoading(false));
        } else setLoading(false);
      })
      .catch(() => { setIsAdmin(false); setLoading(false); });
  }, []);

  async function changeNiveau(id: number, niveau: number) {
    setSaving("m" + id);
    try {
      const r = await fetch(`/app/api/admin/members/${id}/niveau`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niveau }) });
      const d = await r.json();
      if (r.ok && d.user) setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, niveau: d.user.niveau } : m)));
    } catch {}
    setSaving(null);
  }
  async function toggleLabel(id: number, labellisee: boolean) {
    setSaving("o" + id);
    try {
      const r = await fetch(`/app/api/organisations/${id}/labelliser`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ labellisee }) });
      if (r.ok) setOrgs((os) => os.map((o) => (o.id === id ? { ...o, labellisee } : o)));
    } catch {}
    setSaving(null);
  }
  async function decideCert(id: number, approve: boolean) {
    setSaving("c" + id);
    try {
      const r = await fetch(`/app/api/admin/certifications/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approve }) });
      if (r.ok) {
        setCerts((cs) => cs.filter((c) => c.id !== id));
        if (approve) {
          const m = await fetch("/app/api/admin/members").then((x) => x.json());
          setMembers(m.members || []);
        }
      }
    } catch {}
    setSaving(null);
  }

  const mlist = useMemo(() => members.filter((m) => {
    if (!q) return true; const s = q.toLowerCase();
    return (m.email || "").toLowerCase().includes(s) || `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(s);
  }), [members, q]);
  const olist = useMemo(() => orgs.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase())), [orgs, q]);

  if (isAdmin === false) {
    return <AppShell><div className="board-head"><h1>{tr.title}</h1></div><p className="board-empty">{tr.denied}</p></AppShell>;
  }

  return (
    <AppShell>
      <div className="board-head"><h1>{tr.title}</h1></div>

      <div className="board-tabs">
        <button className={tab === "membres" ? "on" : ""} onClick={() => setTab("membres")}>{tr.tabMembers}</button>
        <button className={tab === "organisations" ? "on" : ""} onClick={() => setTab("organisations")}>{tr.tabOrgs}</button>
        <button className={tab === "certifications" ? "on" : ""} onClick={() => setTab("certifications")}>{tr.tabCerts}{certs.length > 0 ? ` (${certs.length})` : ""}</button>
        <button className={tab === "actualites" ? "on" : ""} onClick={() => setTab("actualites")}>{tr.tabActus}</button>
        <button className={tab === "audits" ? "on" : ""} onClick={() => setTab("audits")}>{tr.tabAudits}</button>
        <button className={tab === "rgpd" ? "on" : ""} onClick={() => setTab("rgpd")}>{tr.tabRgpd}</button>
      </div>

      {(tab === "membres" || tab === "organisations") && (
        <div className="board-tools">
          <div className="board-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "membres" ? tr.searchMember : tr.searchOrg} />
          </div>
        </div>
      )}

      {tab === "actualites" ? <AdminActualites /> : tab === "audits" ? <AdminAudits /> : tab === "rgpd" ? <AdminRgpd /> : loading ? <p className="board-empty">{tr.loading}</p> : tab === "membres" ? (
        <>
          <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>{tr.membersIntro}</p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead><tr style={headRow}>
                <th style={th}>{tr.hMember}</th><th style={th}>{tr.hLevel}</th><th style={th}>{tr.hParcours}</th><th style={th}>{tr.hPromote}</th>
              </tr></thead>
              <tbody>
                {mlist.map((m) => (
                  <tr key={m.id} style={{ borderTop: "1px solid #F0E6DD" }}>
                    <td style={td}><div style={{ fontWeight: 700, color: "#372646" }}>{`${m.prenom || ""} ${m.nom || ""}`.trim() || "—"}</div><div style={{ color: "#9C919E", fontSize: 13 }}>{m.email}</div></td>
                    <td style={td}><span style={{ fontWeight: 700, color: "#372646" }}>{roleName(m.niveau)}</span><span style={{ color: "#9C919E" }}> · N{m.niveau}</span></td>
                    <td style={td}><span style={chip(m.charte_validee)}>{tr.chCharte}</span><span style={chip(m.paye)}>{tr.chPaid}</span><span style={chip(m.badge_n2)}>{tr.chBadge}</span></td>
                    <td style={td}>
                      <select value={m.niveau} disabled={saving === "m" + m.id} onChange={(e) => changeNiveau(m.id, Number(e.target.value))} style={{ border: "1px solid #E3D7CC", borderRadius: 10, padding: "7px 10px", color: "#372646", background: "#FCF9F6", fontSize: 14 }}>
                        {NIVEAUX.map((_, i) => <option key={i} value={i}>{i} — {roleName(i)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : tab === "organisations" ? (
        <>
          <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>{tr.orgsIntro}</p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead><tr style={headRow}><th style={th}>{tr.hOrg}</th><th style={th}>{tr.hStatus}</th><th style={th}>{tr.hAction}</th></tr></thead>
              <tbody>
                {olist.map((o) => (
                  <tr key={o.id} style={{ borderTop: "1px solid #F0E6DD" }}>
                    <td style={td}><div style={{ fontWeight: 700, color: "#372646" }}>{o.name}</div><div style={{ color: "#9C919E", fontSize: 13 }}>{o.type}{o.region ? " · " + o.region : ""}</div></td>
                    <td style={td}><span style={chip(o.labellisee)}>{o.labellisee ? tr.labelled : tr.pending}</span></td>
                    <td style={td}>
                      <button className={o.labellisee ? "btn btn-ghost" : "btn btn-coral"} disabled={saving === "o" + o.id} onClick={() => toggleLabel(o.id, !o.labellisee)}>
                        {saving === "o" + o.id ? "…" : o.labellisee ? tr.removeLabel : tr.doLabel}
                      </button>
                    </td>
                  </tr>
                ))}
                {olist.length === 0 && <tr><td style={td} colSpan={3}><span style={{ color: "#9C919E" }}>{tr.noOrg}</span></td></tr>}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>{tr.certsIntro}</p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead><tr style={headRow}><th style={th}>{tr.hMember}</th><th style={th}>{tr.hLevel}</th><th style={th}>{tr.hDecision}</th></tr></thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} style={{ borderTop: "1px solid #F0E6DD" }}>
                    <td style={td}><div style={{ fontWeight: 700, color: "#372646" }}>{`${c.prenom || ""} ${c.nom || ""}`.trim() || "—"}</div><div style={{ color: "#9C919E", fontSize: 13 }}>{c.email}</div></td>
                    <td style={td}><span style={{ fontWeight: 700, color: "#372646" }}>{roleName(c.niveau)}</span><span style={{ color: "#9C919E" }}> · N{c.niveau}</span></td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-coral" disabled={saving === "c" + c.id} onClick={() => decideCert(c.id, true)}>{tr.certify}</button>
                        <button className="btn btn-ghost" disabled={saving === "c" + c.id} onClick={() => decideCert(c.id, false)}>{tr.refuse}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {certs.length === 0 && <tr><td style={td} colSpan={3}><span style={{ color: "#9C919E" }}>{tr.noCert}</span></td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
