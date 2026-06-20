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
        <h1>Mon auto-évaluation éthique</h1>
      </div>
      <div style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 10px" }}>
          Cette auto-évaluation est un temps de réflexion bienveillant pour vous aider à mieux comprendre
          vos valeurs et votre engagement éthique.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          Elle se compose de 20 questions simples, conçues pour vous inviter à réfléchir à vos pratiques et
          à vos convictions. L&apos;évaluation ne devrait pas vous prendre plus de 30 minutes et peut être
          réalisée à votre rythme.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          Son objectif est de vous accompagner dans votre démarche personnelle et de vous permettre de
          rejoindre une communauté de citoyens engagés, désireux de contribuer collectivement à des projets
          et des transformations éthiques.
        </p>
        <p style={{ margin: 0, fontWeight: 600, color: "#372646" }}>
          Choisissez votre format pour commencer :
        </p>
      </div>
      <div style={{ maxWidth: 820 }}>
        <EvalFlow onResult={persist} />
      </div>
    </AppShell>
  );
}
