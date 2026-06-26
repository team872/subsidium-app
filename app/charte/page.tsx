"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import CharteChat from "@/components/CharteChat";
import { useLang } from "@/components/LangProvider";
import "@/components/MemberBoards.css";

type Eng = { t: string; d: string };
type L = {
  title: string; intro: string; opens: string; how: string;
  formTitle: string; formDesc: string; assistTitle: string; assistDesc: string;
  skip: string; skipHint: string; back: string; confirmIntro: string;
  motivLabel: string; motivPh: string; validating: string; validate: string;
  errChecks: string; errMotiv: string; errValid: string;
  engagements: Eng[]; apports: string[];
};

const DICT: Record<string, L> = {
  fr: {
    title: "Adhérer à la Charte d'engagement",
    intro: "La Charte d'engagement n'est pas un test idéologique, ni un examen : c'est un engagement de cohérence, en quelques minutes. En l'adoptant, vous devenez Refondateur et rejoignez la communauté de celles et ceux qui agissent. Vous pouvez aussi la valider plus tard — et continuer à découvrir la plateforme en attendant.",
    opens: "Ce que la Charte vous ouvre", how: "Comment souhaitez-vous procéder ?",
    formTitle: "Par formulaire", formDesc: "Lisez les quatre engagements et confirmez-les en un instant. Le plus rapide.",
    assistTitle: "Avec l'assistant", assistDesc: "Un court échange guidé avec l'assistant SUBSIDIUM AI, à votre rythme et avec vos mots.",
    skip: "Passer pour l'instant et découvrir le site", skipHint: "Vous pourrez valider la Charte quand vous le souhaitez pour débloquer toutes les actions.",
    back: "← Retour au choix", confirmIntro: "Confirmez votre adhésion à chacun des quatre engagements de la Charte.",
    motivLabel: "En quelques mots, qu'est-ce qui vous engage ?", motivPh: "Ce qui me motive à rejoindre la communauté des Refondateurs…",
    validating: "Validation…", validate: "Valider mon adhésion",
    errChecks: "Merci de confirmer les quatre engagements.", errMotiv: "Dites en quelques mots ce qui vous engage.", errValid: "Validation impossible.",
    engagements: [
      { t: "Vérité", d: "Je parle en conscience, sans haine ni mensonge." },
      { t: "Respect", d: "J'écoute les autres et je construis dans le dialogue." },
      { t: "Responsabilité", d: "Je cherche le bien commun, pas le conflit." },
      { t: "Espérance", d: "Je crois en la capacité collective à changer les choses." },
    ],
    apports: [
      "Exprimer vos idées et lancer des initiatives",
      "Participer aux débats citoyens et soutenir les idées qui vous tiennent à cœur",
      "Accéder au contenu réservé aux membres",
      "Progresser vers les niveaux supérieurs (projets, missions, market-place, clubs)",
    ],
  },
  en: {
    title: "Adopt the Charter of Commitment",
    intro: "The Charter of Commitment is not an ideological test or an exam: it's a commitment to consistency, in a few minutes. By adopting it, you become a Refounder and join the community of those who act. You can also validate it later — and keep exploring the platform in the meantime.",
    opens: "What the Charter unlocks for you", how: "How would you like to proceed?",
    formTitle: "By form", formDesc: "Read the four commitments and confirm them in a moment. The fastest way.",
    assistTitle: "With the assistant", assistDesc: "A short guided exchange with the SUBSIDIUM AI assistant, at your own pace and in your own words.",
    skip: "Skip for now and explore the site", skipHint: "You can validate the Charter whenever you like to unlock all actions.",
    back: "← Back to choice", confirmIntro: "Confirm your adherence to each of the four commitments of the Charter.",
    motivLabel: "In a few words, what commits you?", motivPh: "What motivates me to join the Refounders' community…",
    validating: "Validating…", validate: "Confirm my membership",
    errChecks: "Please confirm the four commitments.", errMotiv: "Say in a few words what commits you.", errValid: "Validation failed.",
    engagements: [
      { t: "Truth", d: "I speak in good conscience, without hatred or lies." },
      { t: "Respect", d: "I listen to others and build through dialogue." },
      { t: "Responsibility", d: "I seek the common good, not conflict." },
      { t: "Hope", d: "I believe in our collective ability to change things." },
    ],
    apports: [
      "Express your ideas and launch initiatives",
      "Take part in citizen debates and support the ideas you care about",
      "Access members-only content",
      "Progress to higher levels (projects, missions, marketplace, clubs)",
    ],
  },
  it: {
    title: "Aderire alla Carta d'impegno",
    intro: "La Carta d'impegno non è un test ideologico né un esame: è un impegno di coerenza, in pochi minuti. Adottandola, diventi Rifondatore e ti unisci alla comunità di chi agisce. Puoi anche convalidarla più tardi — e continuare a scoprire la piattaforma nel frattempo.",
    opens: "Ciò che la Carta ti apre", how: "Come desideri procedere?",
    formTitle: "Tramite modulo", formDesc: "Leggi i quattro impegni e confermali in un istante. Il modo più rapido.",
    assistTitle: "Con l'assistente", assistDesc: "Un breve scambio guidato con l'assistente SUBSIDIUM AI, al tuo ritmo e con le tue parole.",
    skip: "Salta per ora e scopri il sito", skipHint: "Potrai convalidare la Carta quando vuoi per sbloccare tutte le azioni.",
    back: "← Torna alla scelta", confirmIntro: "Conferma la tua adesione a ciascuno dei quattro impegni della Carta.",
    motivLabel: "In poche parole, cosa ti impegna?", motivPh: "Ciò che mi motiva a unirmi alla comunità dei Rifondatori…",
    validating: "Convalida…", validate: "Conferma la mia adesione",
    errChecks: "Conferma i quattro impegni.", errMotiv: "Indica in poche parole cosa ti impegna.", errValid: "Convalida impossibile.",
    engagements: [
      { t: "Verità", d: "Parlo in coscienza, senza odio né menzogna." },
      { t: "Rispetto", d: "Ascolto gli altri e costruisco nel dialogo." },
      { t: "Responsabilità", d: "Cerco il bene comune, non il conflitto." },
      { t: "Speranza", d: "Credo nella capacità collettiva di cambiare le cose." },
    ],
    apports: [
      "Esprimere le tue idee e lanciare iniziative",
      "Partecipare ai dibattiti civici e sostenere le idee che ti stanno a cuore",
      "Accedere ai contenuti riservati ai membri",
      "Progredire verso i livelli superiori (progetti, missioni, marketplace, club)",
    ],
  },
};

export default function ChartePage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const router = useRouter();
  const [mode, setMode] = useState<"choix" | "formulaire" | "assistant">("choix");
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [motiv, setMotiv] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const allChecked = checks.every(Boolean);
  function toggle(i: number) { setChecks((c) => c.map((v, j) => (j === i ? !v : v))); }

  async function validerFormulaire() {
    if (busy) return;
    if (!allChecked) { setErr(tr.errChecks); return; }
    if (motiv.trim().length < 10) { setErr(tr.errMotiv); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/app/api/progression/charte-form", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ motivation: motiv }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || tr.errValid); setBusy(false); return; }
      router.push("/paiement");
    } catch { setErr(tr.errValid); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head"><h1>{tr.title}</h1></div>

      <div style={{ maxWidth: 820, marginBottom: 18 }}>
        <p style={{ color: "#5E4A73", lineHeight: 1.65, margin: "0 0 12px" }}>{tr.intro}</p>
        <div style={{ background: "#F9F1E9", border: "1px solid #EBD9CD", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontWeight: 800, color: "#372646", marginBottom: 8 }}>{tr.opens}</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#5E4A73", lineHeight: 1.7 }}>
            {tr.apports.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>

      {mode === "choix" && (
        <div style={{ maxWidth: 820 }}>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{tr.how}</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button onClick={() => setMode("formulaire")} style={{ flex: "1 1 300px", textAlign: "left", cursor: "pointer", border: "1px solid #EBD9CD", background: "#fff", borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "#FCE9E2", color: "#C2452F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </span>
                <b style={{ color: "#372646", fontSize: 16 }}>{tr.formTitle}</b>
              </div>
              <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, lineHeight: 1.55 }}>{tr.formDesc}</p>
            </button>

            <button onClick={() => setMode("assistant")} style={{ flex: "1 1 300px", textAlign: "left", cursor: "pointer", border: "1px solid #EBD9CD", background: "#fff", borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "#FCE9E2", color: "#C2452F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </span>
                <b style={{ color: "#372646", fontSize: 16 }}>{tr.assistTitle}</b>
              </div>
              <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, lineHeight: 1.55 }}>{tr.assistDesc}</p>
            </button>
          </div>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <Link href="/accueil" style={{ color: "#9C919E", textDecoration: "underline", fontSize: 14 }}>{tr.skip}</Link>
            <p style={{ color: "#9C919E", fontSize: 12.5, marginTop: 4 }}>{tr.skipHint}</p>
          </div>
        </div>
      )}

      {mode === "formulaire" && (
        <div style={{ maxWidth: 760 }}>
          <button onClick={() => setMode("choix")} className="board-back" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}>{tr.back}</button>
          <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 14px" }}>{tr.confirmIntro}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tr.engagements.map((e, i) => (
              <label key={e.t} style={{ display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid #EBD9CD", borderRadius: 12, padding: "12px 14px", background: checks[i] ? "#FCFBF8" : "#fff", cursor: "pointer" }}>
                <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} style={{ marginTop: 3 }} />
                <span><b style={{ color: "#372646" }}>{e.t}</b><span style={{ color: "#5E4A73" }}> — {e.d}</span></span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontWeight: 700, color: "#372646", display: "block", marginBottom: 6 }}>{tr.motivLabel}</label>
            <textarea value={motiv} onChange={(e) => setMotiv(e.target.value)} rows={3} placeholder={tr.motivPh} style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
          </div>
          {err && <p className="msg" style={{ marginTop: 8 }}>{err}</p>}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-coral" onClick={validerFormulaire} disabled={busy || !allChecked}>{busy ? tr.validating : tr.validate}</button>
          </div>
        </div>
      )}

      {mode === "assistant" && (
        <div style={{ maxWidth: 760 }}>
          <button onClick={() => setMode("choix")} className="board-back" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}>{tr.back}</button>
          <CharteChat onFallback={() => setMode("formulaire")} />
        </div>
      )}
    </AppShell>
  );
}
