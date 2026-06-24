"use client";

import { useState } from "react";
import AutoEvalChat, { EvalSummary } from "@/components/AutoEvalChat";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import { useT, useLang } from "@/components/LangProvider";

type Mode = "choix" | "form" | "chat";

// Les 8 dimensions de la grille ethique evaluees par l'auto-evaluation (20 questions).
const DOMAINS: Record<string, string[]> = {
  fr: [
    "Dignité de la personne humaine", "Bien commun", "Responsabilité intégrale", "Subsidiarité active",
    "Justice & réciprocité", "Sobriété & écologie intégrale", "Participation effective", "Transmission & éducation",
  ],
  en: [
    "Dignity of the human person", "Common good", "Full responsibility", "Active subsidiarity",
    "Justice & reciprocity", "Restraint & integral ecology", "Effective participation", "Transmission & education",
  ],
  it: [
    "Dignità della persona umana", "Bene comune", "Responsabilità integrale", "Sussidiarietà attiva",
    "Giustizia & reciprocità", "Sobrietà & ecologia integrale", "Partecipazione effettiva", "Trasmissione & educazione",
  ],
};
const DOM_TITLE: Record<string, string> = {
  fr: "Les domaines évalués", en: "The dimensions assessed", it: "Le dimensioni valutate",
};
const DOM_INTRO: Record<string, string> = {
  fr: "L'auto-évaluation porte sur 8 dimensions de la grille éthique (20 questions) :",
  en: "The self-assessment covers 8 dimensions of the ethical framework (20 questions):",
  it: "L'autovalutazione riguarda 8 dimensioni della griglia etica (20 domande):",
};

// Etape d'auto-evaluation « au choix » : questionnaire guide, entretien avec l'agent IA,
// ou possibilite de passer cette etape facultative pour aller directement a la Charte.
export default function EvalFlow({
  onResult,
  onSkip,
}: {
  onResult?: (s: EvalSummary | null) => void;
  onSkip?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("choix");
  const t = useT();
  const { lang } = useLang();
  const dl = DOMAINS[lang] || DOMAINS.fr;

  if (mode === "form") {
    return (
      <div>
        <button type="button" onClick={() => setMode("choix")} style={backLink}>{t("eval.changeMode")}</button>
        <QuestionnaireForm onResult={(s) => onResult?.(s)} />
      </div>
    );
  }
  if (mode === "chat") {
    return (
      <div>
        <button type="button" onClick={() => setMode("choix")} style={backLink}>{t("eval.changeMode")}</button>
        <AutoEvalChat onResult={(s) => onResult?.(s)} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, background: "#FBF4EC", border: "1px solid #EBD9CD", borderRadius: 12, padding: "12px 16px" }}>
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#372646" }}>{DOM_TITLE[lang] || DOM_TITLE.fr}</p>
        <p style={{ margin: "0 0 10px", color: "#5E4A73", fontSize: 14 }}>{DOM_INTRO[lang] || DOM_INTRO.fr}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {dl.map((d, i) => (
            <span key={i} style={{ background: "#fff", border: "1px solid #EBD9CD", borderRadius: 999, padding: "3px 10px", fontSize: 13, color: "#5E4A73" }}>{d}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card
          title={t("eval.q.title")}
          desc={t("eval.q.desc")}
          cta={t("eval.q.cta")}
          onClick={() => setMode("form")}
          icon={
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          }
        />
        <Card
          title={t("eval.chat.title")}
          desc={t("eval.chat.desc")}
          cta={t("eval.chat.cta")}
          onClick={() => setMode("chat")}
          icon={
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
          }
        />
      </div>

      {onSkip && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button type="button" onClick={onSkip} style={skipLink}>
            {t("insc.s3.skip")}
          </button>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#8A7C97" }}>
            {t("insc.s3.skipHint")}
          </p>
        </div>
      )}
    </div>
  );
}

const backLink: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#5E4A73",
  cursor: "pointer",
  padding: "4px 0",
  marginBottom: 8,
  fontSize: 14,
};

const skipLink: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#5E4A73",
  cursor: "pointer",
  padding: "4px 6px",
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

function Card({
  title, desc, cta, onClick, icon,
}: { title: string; desc: string; cta: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <div
      style={{
        flex: "1 1 260px",
        minWidth: 260,
        border: "1px solid #EBD9CD",
        borderRadius: 18,
        padding: "22px 20px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 12, background: "#FBE7DC", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#F27B6A" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <h3 style={{ margin: 0, color: "#372646" }}>{title}</h3>
      <p style={{ margin: 0, color: "#5E4A73", flex: 1 }}>{desc}</p>
      <button type="button" className="btn btn-coral" onClick={onClick} style={{ alignSelf: "flex-start" }}>{cta}</button>
    </div>
  );
}
