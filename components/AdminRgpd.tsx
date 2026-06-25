"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/LangProvider";

type Member = { id: number; email: string; nom: string | null; prenom: string | null };
type Log = { id: number; actor_email: string; action: string; target_user_id: number; target_email: string; created_at: string };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    intro: "Outillage de conformité RGPD : exportez ou anonymisez les données personnelles d'un utilisateur, et consultez le journal des actions.",
    search: "Rechercher un membre…", export: "Exporter (JSON)", anonymize: "Anonymiser",
    confirmAnon: "Anonymiser définitivement les données personnelles de cet utilisateur ? Ses contributions seront conservées sans identité. Cette action est irréversible.",
    log: "Journal des actions RGPD", noLog: "Aucune action enregistrée.",
    loadingU: "Chargement…", emptyU: "Aucun membre.", anonError: "Anonymisation impossible.",
    actExport: "Export des données", actAnon: "Anonymisation",
  },
  en: {
    intro: "GDPR compliance tooling: export or anonymise a user's personal data, and review the action log.",
    search: "Search a member…", export: "Export (JSON)", anonymize: "Anonymise",
    confirmAnon: "Permanently anonymise this user's personal data? Their contributions are kept without identity. This action is irreversible.",
    log: "GDPR action log", noLog: "No action recorded.",
    loadingU: "Loading…", emptyU: "No member.", anonError: "Anonymisation failed.",
    actExport: "Data export", actAnon: "Anonymisation",
  },
  it: {
    intro: "Strumenti di conformità GDPR: esporta o anonimizza i dati personali di un utente e consulta il registro delle azioni.",
    search: "Cerca un membro…", export: "Esporta (JSON)", anonymize: "Anonimizza",
    confirmAnon: "Anonimizzare definitivamente i dati personali di questo utente? I suoi contributi sono conservati senza identità. Azione irreversibile.",
    log: "Registro azioni GDPR", noLog: "Nessuna azione registrata.",
    loadingU: "Caricamento…", emptyU: "Nessun membro.", anonError: "Anonimizzazione impossibile.",
    actExport: "Esportazione dati", actAnon: "Anonimizzazione",
  },
};

export default function AdminRgpd() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [members, setMembers] = useState<Member[]>([]);
  const [log, setLog] = useState<Log[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/app/api/admin/members").then((r) => r.json()).then((d) => setMembers(d.members || [])).catch(() => {}),
      fetch("/app/api/admin/rgpd/log").then((r) => r.json()).then((d) => setLog(d.log || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  const list = useMemo(() => members.filter((m) => {
    if (!q) return true; const s = q.toLowerCase();
    return (m.email || "").toLowerCase().includes(s) || `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(s);
  }), [members, q]);

  async function anonymize(m: Member) {
    if (typeof window !== "undefined" && !window.confirm(tr.confirmAnon)) return;
    setBusy(m.id); setErr("");
    try {
      const r = await fetch(`/app/api/admin/rgpd/anonymize/${m.id}`, { method: "POST" });
      if (!r.ok) { const d = await r.json().catch(() => ({} as any)); setErr(d.error || tr.anonError); setBusy(null); return; }
      load();
    } catch { setErr(tr.anonError); }
    setBusy(null);
  }

  const fdate = (s: string) => { try { return new Date(s).toLocaleString(lang === "it" ? "it-IT" : lang === "en" ? "en-GB" : "fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
  const actionLabel = (a: string) => (a === "export" ? tr.actExport : a === "anonymisation" ? tr.actAnon : a);

  return (
    <div>
      <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>{tr.intro}</p>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.search} />
        </div>
      </div>

      {err && <p className="msg" style={{ marginBottom: 10 }}>{err}</p>}

      {loading ? <p className="board-empty">{tr.loadingU}</p>
      : list.length === 0 ? <p className="board-empty">{tr.emptyU}</p>
      : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 760 }}>
          {list.map((m) => (
            <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid #EBD9CD", borderRadius: 12, background: "#fff", padding: "10px 14px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#372646" }}>{`${m.prenom || ""} ${m.nom || ""}`.trim() || "—"}</div>
                <div style={{ color: "#9C919E", fontSize: 13 }}>{m.email}</div>
              </div>
              <a href={`/app/api/admin/rgpd/export/${m.id}`} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 13 }}>{tr.export}</a>
              <button type="button" className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 13, color: "#C2452F" }} disabled={busy === m.id} onClick={() => anonymize(m)}>{tr.anonymize}</button>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "24px 0 12px" }}>{tr.log}</h2>
      {log.length === 0 ? <p className="board-empty">{tr.noLog}</p>
      : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 760 }}>
          {log.map((l) => (
            <div key={l.id} style={{ display: "flex", gap: 10, alignItems: "baseline", border: "1px solid #F0E6DD", borderRadius: 10, background: "#FCF9F6", padding: "8px 12px", fontSize: 13.5 }}>
              <span style={{ fontWeight: 700, color: l.action === "anonymisation" ? "#C2452F" : "#5E8A57" }}>{actionLabel(l.action)}</span>
              <span style={{ color: "#372646" }}>{l.target_email || `#${l.target_user_id}`}</span>
              <span style={{ color: "#9C919E", marginLeft: "auto", fontSize: 12.5 }}>{l.actor_email} · {fdate(l.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
