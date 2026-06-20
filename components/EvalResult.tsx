"use client";

import type { EvalSummary } from "@/components/AutoEvalChat";

// Écran de résultat d'auto-évaluation : remerciement, palier + sens, KPIs et enjeux.
// Partagé par le questionnaire guidé et l'entretien avec l'agent.

const PALIER_DESC: Record<string, string> = {
  Spectateur: "Vous observez le réel avec lucidité. La prochaine étape : oser une première action concrète.",
  Acteur: "Vous agissez déjà concrètement. Consolidez la régularité et l'impact de votre engagement.",
  Transformateur: "Votre engagement est mûr et structurant : vous êtes prêt à porter des initiatives.",
  Bâtisseur: "Engagement exemplaire et durable : vous inspirez et transmettez autour de vous.",
};

export default function EvalResult({ summary }: { summary: EvalSummary }) {
  const fiab = Math.round((summary.indice_fiabilite || 0) * 100);
  const desc = PALIER_DESC[summary.palier] || "";
  const badge = summary.badge_n2_octroyable;

  return (
    <div className="eval-result">
      <p style={{ color: "#5E4A73", margin: "0 0 4px", fontWeight: 600 }}>
        Merci d&apos;avoir pris le temps de réaliser l&apos;auto-évaluation éthique !
      </p>
      <span className="eval-palier">{summary.palier}</span>
      {desc && <p style={{ color: "#372646", maxWidth: 560, margin: "0 auto 6px" }}>{desc}</p>}

      <div className="eval-kpis">
        <div className="kpi"><b>{summary.total}</b><small>/ 60</small></div>
        <div className="kpi"><b>{fiab}%</b><small>fiabilité</small></div>
        <div className={`kpi ${badge ? "ok" : "no"}`}>
          <b>{badge ? "Oui" : "Non"}</b><small>badge Initiateur N2</small>
        </div>
      </div>

      {summary.reserves.length > 0 && (
        <p className="eval-reserves">Points de vigilance : {summary.reserves.join(" · ")}</p>
      )}

      <div className="eval-note" style={{ maxWidth: 600, margin: "10px auto 0", textAlign: "left" }}>
        <p style={{ margin: "0 0 8px" }}>
          <b>Ce que cela signifie.</b> Ce résultat n'est pas un jugement, mais un point de départ. Votre
          <b> palier</b> reflète votre maturité citoyenne aujourd'hui. Le <b>score /60</b> agrège vos
          réponses sur les dimensions éthiques (dignité, bien commun, responsabilité, subsidiarité,
          justice, sobriété, participation, transmission), et l'<b>indice de fiabilité</b> mesure la
          cohérence de vos réponses (et, pour l'entretien, leur appui sur des exemples concrets).
        </p>
        <p style={{ margin: 0 }}>
          <b>Et ensuite.</b>{" "}
          {badge
            ? "Le badge Initiateur (N2) vous est accessible : vous pourrez porter des initiatives au sein de la communauté et faire grandir l'action collective."
            : "En poursuivant votre engagement et en l'illustrant par des actions concrètes, vous pourrez viser le badge Initiateur (N2), à partir d'un score de 41/60."}
        </p>
      </div>
    </div>
  );
}
