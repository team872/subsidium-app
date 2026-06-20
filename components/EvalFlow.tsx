"use client";

import { useState } from "react";
import AutoEvalChat, { EvalSummary } from "@/components/AutoEvalChat";
import QuestionnaireForm from "@/components/QuestionnaireForm";

type Mode = "choix" | "form" | "chat";

// Étape d'auto-évaluation « au choix » : l'utilisateur sélectionne le questionnaire
// guidé (formulaire écran-par-écran) ou l'entretien avec l'agent IA (chat).
export default function EvalFlow({ onResult }: { onResult?: (s: EvalSummary | null) => void }) {
  const [mode, setMode] = useState<Mode>("choix");

  if (mode === "form") {
    return (
      <div>
        <button type="button" onClick={() => setMode("choix")} style={backLink}>← Changer de mode</button>
        <QuestionnaireForm onResult={(s) => onResult?.(s)} />
      </div>
    );
  }
  if (mode === "chat") {
    return (
      <div>
        <button type="button" onClick={() => setMode("choix")} style={backLink}>← Changer de mode</button>
        <AutoEvalChat onResult={(s) => onResult?.(s)} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <Card
        title="Questionnaire guidé"
        desc="Répondez aux énoncés, dimension par dimension, sur une échelle simple (Jamais → Toujours). Rapide et autonome."
        cta="Commencer le questionnaire"
        onClick={() => setMode("form")}
        icon={
          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        }
      />
      <Card
        title="Entretien avec l'agent IA"
        desc="Un échange accompagné avec un agent SUBSIDIUM, qui explore votre engagement avec vos propres mots."
        cta="Commencer l'entretien"
        onClick={() => setMode("chat")}
        icon={
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
        }
      />
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
