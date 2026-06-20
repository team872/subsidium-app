"use client";

import AppShell from "@/components/AppShell";
import AutoEvalChat from "@/components/AutoEvalChat";

export default function AutoEvaluationPage() {
  return (
    <AppShell>
      <div className="board-head">
        <h1>Auto-évaluation</h1>
      </div>
      <p style={{ maxWidth: 720, color: "#5E4A73", margin: "0 0 18px" }}>
        Deuxième étape : passer de Refondateur à Initiateur. L'agent évalue votre engagement sur les
        grandes dimensions éthiques et détermine votre palier.
      </p>
      <div style={{ maxWidth: 760 }}>
        <AutoEvalChat onResult={() => {}} />
      </div>
    </AppShell>
  );
}
