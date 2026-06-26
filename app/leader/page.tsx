"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import "@/components/MemberBoards.css";

type Lecon = { titre: string; corps: string };
type Ressource = { label: string; href?: string };
type Step = { key: string; titre: string; contenu: string; lecons?: Lecon[]; points_cles?: string[]; ressources?: Ressource[]; image?: string | null };
type Cert = { statut: "en_attente" | "certifie" | "refuse" } | null;
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Parcours Leader",
    intro: "Le parcours Leader prépare les Initiateurs à devenir Refondateurs Certifiés : porter la doctrine, animer un collectif et faire grandir d'autres citoyens. Parcourez les modules, puis demandez votre certification — elle sera validée par l'équipe Subsidium.",
    loading: "Chargement…",
    certified: "✔ Vous êtes Refondateur Certifié (Leader). Vous pouvez créer et animer des Clubs.",
    markUndone: "Marquer non terminé", markDone: "Marquer terminé", step: "Étape",
    pending: "Votre demande de certification est en attente de validation par l'équipe Subsidium.",
    refused: "Votre précédente demande n'a pas été retenue. Vous pouvez la représenter.",
    request: "Demander la certification Leader", sending: "Envoi…",
    finishHint1: "Terminez les", finishHint2: "modules pour pouvoir demander votre certification.", reqErr: "Demande impossible.",
    module: "Voir le module", keyPoints: "Points clés", resources: "Ressources",
    markDoneBtn: "Marquer comme terminé", markUndoneBtn: "Marquer comme à revoir", close: "Fermer",
  },
  en: {
    title: "Leader Path",
    intro: "The Leader Path prepares Initiators to become Certified Refounders: carrying the doctrine, leading a group and helping other citizens grow. Go through the modules, then request your certification — it will be validated by the Subsidium team.",
    loading: "Loading…",
    certified: "✔ You are a Certified Refounder (Leader). You can create and run Clubs.",
    markUndone: "Mark as not done", markDone: "Mark as done", step: "Step",
    pending: "Your certification request is awaiting validation by the Subsidium team.",
    refused: "Your previous request was not accepted. You can submit it again.",
    request: "Request Leader certification", sending: "Sending…",
    finishHint1: "Complete the", finishHint2: "modules to request your certification.", reqErr: "Request failed.",
    module: "View module", keyPoints: "Key points", resources: "Resources",
    markDoneBtn: "Mark as done", markUndoneBtn: "Mark as to review", close: "Close",
  },
  it: {
    title: "Percorso Leader",
    intro: "Il Percorso Leader prepara gli Iniziatori a diventare Rifondatori Certificati: portare la dottrina, animare un collettivo e far crescere altri cittadini. Segui i moduli, poi richiedi la tua certificazione — sarà convalidata dal team Subsidium.",
    loading: "Caricamento…",
    certified: "✔ Sei un Rifondatore Certificato (Leader). Puoi creare e animare dei Club.",
    markUndone: "Segna come non completato", markDone: "Segna come completato", step: "Tappa",
    pending: "La tua richiesta di certificazione è in attesa di convalida da parte del team Subsidium.",
    refused: "La tua richiesta precedente non è stata accettata. Puoi ripresentarla.",
    request: "Richiedi la certificazione Leader", sending: "Invio…",
    finishHint1: "Completa i", finishHint2: "moduli per richiedere la certificazione.", reqErr: "Richiesta impossibile.",
    module: "Apri il modulo", keyPoints: "Punti chiave", resources: "Risorse",
    markDoneBtn: "Segna come completato", markUndoneBtn: "Segna come da rivedere", close: "Chiudi",
  },
};

export default function LeaderPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [steps, setSteps] = useState<Step[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [cert, setCert] = useState<Cert>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openStep, setOpenStep] = useState<Step | null>(null);

  useEffect(() => {
    fetch("/app/api/leader").then((r) => r.json()).then((d) => {
      setSteps(d.steps || []); setDone(d.done || []); setCert(d.certification || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function toggle(key: string, isDone: boolean) {
    setDone((d) => (isDone ? d.filter((k) => k !== key) : [...d, key]));
    try {
      const r = await fetch("/app/api/leader/step", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, done: !isDone }) });
      const data = await r.json();
      if (data.done) setDone(data.done);
    } catch {}
  }
  async function demander() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/leader/certification", { method: "POST" });
      const d = await r.json();
      if (!r.ok) { setError(d.error || tr.reqErr); setBusy(false); return; }
      setCert(d.certification || { statut: "en_attente" });
    } catch { setError(tr.reqErr); }
    setBusy(false);
  }

  const total = steps.length;
  const nb = done.length;
  const tousFaits = total > 0 && nb >= total;
  const pct = total ? Math.round((nb / total) * 100) : 0;

  return (
    <AppShell>
      <div className="board-head"><h1>{tr.title}</h1></div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>{tr.intro}</p>

      {loading ? <p className="board-empty">{tr.loading}</p> : (
        <div style={{ maxWidth: 760 }}>
          {cert?.statut === "certifie" && (
            <div style={{ background: "#DBF0D9", border: "1px solid #B6E0B0", borderRadius: 14, padding: "14px 16px", marginBottom: 16, color: "#1E6B1E", fontWeight: 700 }}>
              {tr.certified}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 10, background: "#EFE8F2", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#F27B6A,#C2452F)" }} />
            </div>
            <span style={{ fontWeight: 700, color: "#372646", fontSize: 14 }}>{nb}/{total}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s, i) => {
              const isDone = done.includes(s.key);
              return (
                <div key={s.key} style={{ border: "1px solid #EBD9CD", borderRadius: 14, overflow: "hidden", background: isDone ? "#FCFBF8" : "#fff", display: "flex", gap: 0 }}>
                  {s.image && <div style={{ flexShrink: 0, width: 120, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.05), rgba(40,28,52,.35)), url(\"${s.image}\")`, backgroundSize: "cover", backgroundPosition: "center" }} />}
                  <div style={{ display: "flex", gap: 14, padding: "14px 16px", flex: 1 }}>
                    <button onClick={() => toggle(s.key, isDone)} aria-label={isDone ? tr.markUndone : tr.markDone} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, border: isDone ? "none" : "2px solid #E3D7CC", background: isDone ? "#5E8A57" : "#fff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                      {isDone && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#9C919E", textTransform: "uppercase", letterSpacing: ".03em" }}>{tr.step} {i + 1}</div>
                      <h3 style={{ margin: "2px 0 6px", color: "#372646" }}>{s.titre}</h3>
                      <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, lineHeight: 1.55 }}>{s.contenu}</p>
                      {(s.lecons?.length || s.points_cles?.length || s.ressources?.length) ? (
                        <button type="button" className="btn btn-ghost" style={{ marginTop: 10, padding: "5px 12px", fontSize: 13 }} onClick={() => setOpenStep(s)}>{tr.module}</button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid #F0E6DD", paddingTop: 18 }}>
            {cert?.statut === "en_attente" ? (
              <div style={{ background: "#FCE3B4", border: "1px solid #F0D08A", borderRadius: 12, padding: "12px 16px", color: "#8A5A00", fontWeight: 700 }}>
                {tr.pending}
              </div>
            ) : cert?.statut === "certifie" ? null : (
              <>
                {cert?.statut === "refuse" && <p style={{ color: "#9C2A2A", marginBottom: 8 }}>{tr.refused}</p>}
                <button className="btn btn-coral" onClick={demander} disabled={busy || !tousFaits}>
                  {busy ? tr.sending : tr.request}
                </button>
                {!tousFaits && <p style={{ color: "#9C919E", fontSize: 13, marginTop: 8 }}>{tr.finishHint1} {total} {tr.finishHint2}</p>}
                {error && <p className="msg" style={{ marginTop: 8 }}>{error}</p>}
              </>
            )}
          </div>
        </div>
      )}

      {openStep && (
        <div className="modal-overlay" onClick={() => setOpenStep(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            {openStep.image ? (
              <div style={{ height: 170, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.15), rgba(40,28,52,.6)), url(\"${openStep.image}\")`, backgroundSize: "cover", backgroundPosition: "center", borderTopLeftRadius: 22, borderTopRightRadius: 22, position: "relative" }}>
                <h2 style={{ position: "absolute", left: 22, bottom: 14, right: 56, color: "#fff", fontFamily: "var(--font-display),cursive", fontStyle: "italic", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,.45)" }}>{openStep.titre}</h2>
                <button className="modal-x" onClick={() => setOpenStep(null)} aria-label={tr.close} style={{ position: "absolute", top: 14, right: 16 }}>×</button>
              </div>
            ) : (
              <div className="modal-head"><h2>{openStep.titre}</h2><button className="modal-x" onClick={() => setOpenStep(null)} aria-label={tr.close}>×</button></div>
            )}
            <div className="modal-body">
              <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 14px" }}>{openStep.contenu}</p>
              {openStep.lecons?.map((l, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <h3 style={{ margin: "0 0 4px", color: "#372646", fontSize: 15 }}>{l.titre}</h3>
                  <p style={{ margin: 0, color: "#5E4A73", fontSize: 14, lineHeight: 1.55 }}>{l.corps}</p>
                </div>
              ))}
              {openStep.points_cles && openStep.points_cles.length > 0 && (
                <div style={{ background: "#FBF4EC", border: "1px solid #EBD9CD", borderRadius: 12, padding: "12px 16px", margin: "6px 0 12px" }}>
                  <div style={{ fontWeight: 800, color: "#372646", marginBottom: 6, fontSize: 14 }}>{tr.keyPoints}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#5E4A73", lineHeight: 1.6, fontSize: 14 }}>
                    {openStep.points_cles.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              {openStep.ressources && openStep.ressources.length > 0 && (
                <div>
                  <div style={{ fontWeight: 800, color: "#372646", marginBottom: 6, fontSize: 14 }}>{tr.resources}</div>
                  {openStep.ressources.map((r, i) => r.href
                    ? <Link key={i} href={r.href} style={{ display: "block", color: "#C2452F", fontWeight: 600, fontSize: 14, margin: "2px 0" }}>{r.label} →</Link>
                    : <span key={i} style={{ display: "block", color: "#5E4A73", fontSize: 14, margin: "2px 0" }}>{r.label}</span>
                  )}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className={done.includes(openStep.key) ? "btn btn-ghost" : "btn btn-coral"} onClick={() => toggle(openStep.key, done.includes(openStep.key))}>
                {done.includes(openStep.key) ? tr.markUndoneBtn : tr.markDoneBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
