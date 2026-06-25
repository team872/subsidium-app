"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";

type Audit = { id: number; statut: "a_payer" | "en_instruction" | "valide" | "refuse"; documents: string; paye: boolean } | null;
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Labellisation SUBSIDIUM",
    intro: "Pour rejoindre l'annuaire des organisations labellisées, demandez un audit : décrivez vos justificatifs, réglez les frais d'audit, puis l'équipe SUBSIDIUM instruit votre dossier.",
    docsLabel: "Justificatifs fournis",
    docsPh: "Statuts de l'association, dernier rapport d'activité, comptes annuels, agréments… (décrivez-les ou collez les liens)",
    submit: "Demander l'audit de labellisation",
    submitting: "Envoi…",
    aPayerTitle: "Demande enregistrée — frais d'audit à régler",
    aPayerText: "Réglez les frais d'audit pour lancer l'instruction de votre dossier par l'équipe SUBSIDIUM.",
    pay: "Payer l'audit · 49 €",
    paying: "Paiement…",
    simulated: "Paiement simulé — le règlement par carte (Stripe) sera branché prochainement.",
    instrTitle: "Dossier en cours d'instruction",
    instrText: "Vos frais d'audit ont bien été reçus. L'équipe SUBSIDIUM examine votre dossier et reviendra vers vous avec sa décision.",
    valideTitle: "Audit validé — organisation labellisée",
    valideText: "Félicitations : votre organisation est désormais labellisée et apparaît dans l'annuaire public.",
    refuseTitle: "Audit non validé",
    refuseText: "Votre dossier n'a pas été retenu cette fois. Vous pouvez soumettre une nouvelle demande avec des justificatifs complétés.",
    redo: "Soumettre une nouvelle demande",
    yourDocs: "Vos justificatifs",
  },
  en: {
    title: "SUBSIDIUM accreditation",
    intro: "To join the directory of accredited organisations, request an audit: describe your supporting documents, pay the audit fee, then the SUBSIDIUM team reviews your application.",
    docsLabel: "Supporting documents",
    docsPh: "Articles of association, latest activity report, annual accounts, approvals… (describe them or paste links)",
    submit: "Request the accreditation audit",
    submitting: "Sending…",
    aPayerTitle: "Request recorded — audit fee to be paid",
    aPayerText: "Pay the audit fee to start the review of your application by the SUBSIDIUM team.",
    pay: "Pay the audit · €49",
    paying: "Paying…",
    simulated: "Simulated payment — card payment (Stripe) will be connected soon.",
    instrTitle: "Application under review",
    instrText: "Your audit fee has been received. The SUBSIDIUM team is reviewing your application and will get back to you with its decision.",
    valideTitle: "Audit approved — organisation accredited",
    valideText: "Congratulations: your organisation is now accredited and appears in the public directory.",
    refuseTitle: "Audit not approved",
    refuseText: "Your application was not accepted this time. You can submit a new request with completed supporting documents.",
    redo: "Submit a new request",
    yourDocs: "Your supporting documents",
  },
  it: {
    title: "Accreditamento SUBSIDIUM",
    intro: "Per entrare nell'elenco delle organizzazioni accreditate, richiedi un audit: descrivi i tuoi documenti giustificativi, paga i costi dell'audit, poi il team SUBSIDIUM esamina la tua domanda.",
    docsLabel: "Documenti giustificativi",
    docsPh: "Statuto dell'associazione, ultima relazione di attività, bilanci annuali, autorizzazioni… (descrivili o incolla i link)",
    submit: "Richiedi l'audit di accreditamento",
    submitting: "Invio…",
    aPayerTitle: "Richiesta registrata — costi dell'audit da pagare",
    aPayerText: "Paga i costi dell'audit per avviare l'esame della tua domanda da parte del team SUBSIDIUM.",
    pay: "Paga l'audit · 49 €",
    paying: "Pagamento…",
    simulated: "Pagamento simulato — il pagamento con carta (Stripe) sarà collegato a breve.",
    instrTitle: "Domanda in fase di esame",
    instrText: "I costi dell'audit sono stati ricevuti. Il team SUBSIDIUM sta esaminando la tua domanda e ti ricontatterà con la sua decisione.",
    valideTitle: "Audit approvato — organizzazione accreditata",
    valideText: "Congratulazioni: la tua organizzazione è ora accreditata e appare nell'elenco pubblico.",
    refuseTitle: "Audit non approvato",
    refuseText: "La tua domanda non è stata accolta questa volta. Puoi inviare una nuova richiesta con documenti completati.",
    redo: "Invia una nuova richiesta",
    yourDocs: "I tuoi documenti giustificativi",
  },
};

const box: React.CSSProperties = { border: "1px solid #EBD9CD", borderRadius: 14, padding: 18, background: "#FCF9F6" };

export default function OrgAuditPanel({ orgId }: { orgId: number }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [audit, setAudit] = useState<Audit>(null);
  const [loaded, setLoaded] = useState(false);
  const [docs, setDocs] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    fetch(`/app/api/organisations/${orgId}/audit`).then((r) => r.json()).then((d) => setAudit(d.audit || null)).catch(() => {}).finally(() => setLoaded(true));
  }
  useEffect(load, [orgId]);

  async function submit() {
    if (busy) return;
    if (docs.trim().length < 10) { setErr(tr.docsLabel); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/organisations/${orgId}/audit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documents: docs }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || ""); setBusy(false); return; }
      setAudit(d.audit); setDocs("");
    } catch { setErr(""); }
    setBusy(false);
  }
  async function pay() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/organisations/${orgId}/audit/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || ""); setBusy(false); return; }
      setAudit(d.audit);
    } catch { setErr(""); }
    setBusy(false);
  }

  if (!loaded) return null;
  const statut = audit?.statut;
  const showForm = !audit || statut === "refuse";

  return (
    <section style={{ maxWidth: 820, marginTop: 24 }}>
      <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{tr.title}</h2>
      <div style={box}>
        {statut === "refuse" && (
          <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "#FBE3DE", color: "#9A2F1C" }}>
            <b>{tr.refuseTitle}</b><div style={{ fontSize: 14, marginTop: 2 }}>{tr.refuseText}</div>
          </div>
        )}

        {showForm && (
          <>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 12px" }}>{tr.intro}</p>
            <label style={{ fontWeight: 700, color: "#372646", fontSize: 14 }}>{tr.docsLabel}</label>
            <textarea value={docs} onChange={(e) => setDocs(e.target.value)} placeholder={tr.docsPh} rows={4}
              style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", marginTop: 6, color: "#372646", resize: "vertical" }} />
            {err && <p className="msg" style={{ marginTop: 6 }}>{err}</p>}
            <div style={{ marginTop: 12 }}><button className="btn btn-coral" onClick={submit} disabled={busy}>{busy ? tr.submitting : tr.submit}</button></div>
          </>
        )}

        {statut === "a_payer" && (
          <>
            <b style={{ color: "#372646" }}>{tr.aPayerTitle}</b>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "6px 0 4px" }}>{tr.aPayerText}</p>
            {audit?.documents && <p style={{ color: "#9C919E", fontSize: 13, whiteSpace: "pre-wrap", margin: "0 0 12px" }}><b>{tr.yourDocs} : </b>{audit.documents}</p>}
            {err && <p className="msg" style={{ marginTop: 6 }}>{err}</p>}
            <div style={{ marginTop: 6 }}><button className="btn btn-coral" onClick={pay} disabled={busy}>{busy ? tr.paying : tr.pay}</button></div>
            <p style={{ color: "#9C919E", fontSize: 12.5, marginTop: 8 }}>{tr.simulated}</p>
          </>
        )}

        {statut === "en_instruction" && (
          <>
            <b style={{ color: "#8A5A00" }}>{tr.instrTitle}</b>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "6px 0 0" }}>{tr.instrText}</p>
          </>
        )}

        {statut === "valide" && (
          <>
            <b style={{ color: "#1E6B1E" }}>{tr.valideTitle}</b>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "6px 0 0" }}>{tr.valideText}</p>
          </>
        )}
      </div>
    </section>
  );
}
