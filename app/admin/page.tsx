"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { NIVEAUX } from "@/lib/niveau";
import "@/components/MemberBoards.css";

type Member = {
  id: number; email: string; nom: string | null; prenom: string | null;
  niveau: number; badge_n2: boolean; charte_validee: boolean; paye: boolean; created_at: string;
};
type Org = { id: number; name: string; type: string; region: string | null; labellisee: boolean };

const chip = (on: boolean): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 8px", marginRight: 6,
  background: on ? "#DBF0D9" : "#ECECEC", color: on ? "#1E6B1E" : "#9C919E",
});
const th: React.CSSProperties = { padding: "10px 14px", fontSize: 13, fontWeight: 800 };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"membres" | "organisations">("membres");
  const [members, setMembers] = useState<Member[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
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

  const mlist = useMemo(() => members.filter((m) => {
    if (!q) return true; const s = q.toLowerCase();
    return (m.email || "").toLowerCase().includes(s) || `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(s);
  }), [members, q]);
  const olist = useMemo(() => orgs.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase())), [orgs, q]);

  if (isAdmin === false) {
    return <AppShell><div className="board-head"><h1>Administration</h1></div><p className="board-empty">Accès réservé aux administrateurs.</p></AppShell>;
  }

  return (
    <AppShell>
      <div className="board-head"><h1>Administration</h1></div>

      <div className="board-tabs">
        <button className={tab === "membres" ? "on" : ""} onClick={() => setTab("membres")}>Membres</button>
        <button className={tab === "organisations" ? "on" : ""} onClick={() => setTab("organisations")}>Organisations</button>
      </div>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "membres" ? "Rechercher un membre…" : "Rechercher une organisation…"} />
        </div>
      </div>

      {loading ? <p className="board-empty">Chargement…</p> : tab === "membres" ? (
        <>
          <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>
            Promouvez un Initiateur en <b>Refondateur Certifié (N3)</b> ou <b>Ambassadeur (N4)</b>. Les niveaux 0→2 s'obtiennent normalement par le parcours.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 14 }}>
              <thead><tr style={{ textAlign: "left", color: "#372646", background: "#EFE8F2" }}>
                <th style={th}>Membre</th><th style={th}>Niveau actuel</th><th style={th}>État parcours</th><th style={th}>Promouvoir / valider</th>
              </tr></thead>
              <tbody>
                {mlist.map((m) => (
                  <tr key={m.id} style={{ borderTop: "1px solid #F0E6DD" }}>
                    <td style={td}><div style={{ fontWeight: 700, color: "#372646" }}>{`${m.prenom || ""} ${m.nom || ""}`.trim() || "—"}</div><div style={{ color: "#9C919E", fontSize: 13 }}>{m.email}</div></td>
                    <td style={td}><span style={{ fontWeight: 700, color: "#372646" }}>{NIVEAUX[m.niveau]}</span><span style={{ color: "#9C919E" }}> · N{m.niveau}</span></td>
                    <td style={td}><span style={chip(m.charte_validee)}>charte</span><span style={chip(m.paye)}>payé</span><span style={chip(m.badge_n2)}>badge N2</span></td>
                    <td style={td}>
                      <select value={m.niveau} disabled={saving === "m" + m.id} onChange={(e) => changeNiveau(m.id, Number(e.target.value))} style={{ border: "1px solid #E3D7CC", borderRadius: 10, padding: "7px 10px", color: "#372646", background: "#FCF9F6", fontSize: 14 }}>
                        {NIVEAUX.map((label, i) => <option key={i} value={i}>{i} — {label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>
            Validez les organisations : une organisation <b>labellisée</b> apparaît dans l'annuaire public. Les organisations créées par les membres sont en attente jusqu'à votre validation.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 14 }}>
              <thead><tr style={{ textAlign: "left", color: "#372646", background: "#EFE8F2" }}>
                <th style={th}>Organisation</th><th style={th}>Statut</th><th style={th}>Action</th>
              </tr></thead>
              <tbody>
                {olist.map((o) => (
                  <tr key={o.id} style={{ borderTop: "1px solid #F0E6DD" }}>
                    <td style={td}><div style={{ fontWeight: 700, color: "#372646" }}>{o.name}</div><div style={{ color: "#9C919E", fontSize: 13 }}>{o.type}{o.region ? " · " + o.region : ""}</div></td>
                    <td style={td}><span style={chip(o.labellisee)}>{o.labellisee ? "Labellisée" : "En attente"}</span></td>
                    <td style={td}>
                      <button className={o.labellisee ? "btn btn-ghost" : "btn btn-coral"} disabled={saving === "o" + o.id} onClick={() => toggleLabel(o.id, !o.labellisee)}>
                        {saving === "o" + o.id ? "…" : o.labellisee ? "Retirer le label" : "Labelliser"}
                      </button>
                    </td>
                  </tr>
                ))}
                {olist.length === 0 && <tr><td style={td} colSpan={3}><span style={{ color: "#9C919E" }}>Aucune organisation.</span></td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
