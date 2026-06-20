"use client";

import AppShell from "@/components/AppShell";
import EvalFlow from "@/components/EvalFlow";

export default function AutoEvaluationPage() {
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
        <EvalFlow onResult={() => {}} />
      </div>
    </AppShell>
  );
}
