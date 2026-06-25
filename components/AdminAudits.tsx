"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";

type Audit = { id: number; org_id: number; org_name: string; requester: string; documents: string; created_at: string };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    intro: "File d'instruction des audits de labellisation. Les dossiers ci-dessous ont réglé les frais d'audit et attendent votre décision. Valider labellise l'organisation et la fait apparaître dans l'annuaire public.",
    requester: "Demandé par", docs: "Justificatifs", validate: "Valider la labellisation", refuse: "Refuser",
    empty: "Aucun audit en attente d'instruction.", loading: "Chargement…", paid: "Frais d'audit réglés",
  },
  en: {
    intro: "Accreditation audit review queue. The applications below have paid the audit fee and await your decision. Approving accredits the organisation and lists it in the public directory.",
    requester: "Requested by", docs: "Supporting documents", validate: "Approve accreditation", refuse: "Decline",
    empty: "No audit awaiting review.", loading: "Loading…", paid: "Audit fee paid",
  },
  it: {
    intro: "Coda di esame degli audit di accreditamento. Le domande qui sotto hanno pagato i costi dell'audit e attendono la tua decisione. Approvare accredita l'organizzazione e la inserisce nell'elenco pubblico.",
    requester: "Richiesto da", docs: "Documenti giustificativi", validate: "Approva accreditamento", refuse: "Rifiuta",
    empty: "Nessun audit in attesa di esame.", loading: "Caricamento…", paid: "Costi dell'audit pagati",
  },
};

export default function AdminAudits() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const loc = lang === "it" ? "it-IT" : lang === "en" ? "en-GB" : "fr-FR";

  function load() {
    setLoading(true);
    fetch("/app/api/admin/audits").then((r) => r.json()).then((d) => setAudits(d.audits || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function decide(id: number, approve: boolean) {
    setSaving(id);
    try {
      const r = await fetch(`/app/api/admin/audits/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approve }) });
      if (r.ok) setAudits((a) => a.filter((x) => x.id !== id));
    } catch {}
    setSaving(null);
  }

  if (loading) return <p className="board-empty">{tr.loading}</p>;

  return (
    <>
      <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>{tr.intro}</p>
      {audits.length === 0 ? (
        <p className="board-empty">{tr.empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {audits.map((a) => (
            <div key={a.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "16px 18px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                <div style={{ fontWeight: 800, color: "#372646", fontSize: 16 }}>{a.org_name}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "2px 8px" }}>{tr.paid}</span>
              </div>
              <div style={{ color: "#9C919E", fontSize: 13, marginTop: 2 }}>{tr.requester} : {a.requester} · {(() => { try { return new Date(a.created_at).toLocaleDateString(loc, { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } })()}</div>
              {a.documents && <div style={{ marginTop: 10, background: "#FCF6F0", border: "1px solid #F0E6DD", borderRadius: 10, padding: "10px 12px" }}><div style={{ fontWeight: 700, color: "#372646", fontSize: 13, marginBottom: 4 }}>{tr.docs}</div><div style={{ color: "#5E4A73", fontSize: 14, whiteSpace: "pre-wrap" }}>{a.documents}</div></div>}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-coral" disabled={saving === a.id} onClick={() => decide(a.id, true)}>{tr.validate}</button>
                <button className="btn btn-ghost" disabled={saving === a.id} onClick={() => decide(a.id, false)}>{tr.refuse}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
