"use client";

import AppShell from "@/components/AppShell";
import EvalFlow from "@/components/EvalFlow";
import type { EvalSummary } from "@/components/AutoEvalChat";

export default function AutoEvaluationPage() {
  // Persiste le résultat (badge -> niveau Initiateur) côté serveur.
  function persist(s: EvalSummary | null) {
    if (!s) return;
    fetch("/app/api/progression/eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    }).catch(() => {});
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>Auto-évaluation</h1>
      </div>
      <p style={{ maxWidth: 720, color: "#5E4A73", margin: "0 0 18px" }}>
        Deuxième étape : passer de Refondateur à Initiateur. Choisissez votre format — un questionnaire
        guidé, ou un entretien accompagné avec un agent SUBSIDIUM — pour déterminer votre palier.
      </p>
      <div style={{ maxWidth: 820 }}>
        <EvalFlow onResult={persist} />
      </div>
    </AppShell>
  );
}
