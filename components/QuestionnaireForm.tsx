"use client";

import { useMemo, useState } from "react";
import { DIMENSIONS, SCALE } from "@/lib/autoEval";
import type { EvalSummary } from "@/components/AutoEvalChat";
import "./AutoEvalChat.css";

// Questionnaire guidé (version « formulaire » de l'AVP) : un écran par dimension,
// chaque énoncé noté sur l'échelle Jamais / Parfois / Souvent / Toujours (0..3).
// Scoring déterministe ramené sur /60, sans appel à l'agent (résultat indicatif).

const PALIER_PAR_SCORE = (s: number) =>
  s >= 51 ? "Bâtisseur" : s >= 41 ? "Transformateur" : s >= 21 ? "Acteur" : "Spectateur";

export default function QuestionnaireForm({ onResult }: { onResult?: (s: EvalSummary) => void }) {
  const total = DIMENSIONS.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<EvalSummary | null>(null);

  const dim = DIMENSIONS[idx];
  const dimComplete = useMemo(
    () => dim.statements.every((_, j) => answers[`${idx}-${j}`] !== undefined),
    [dim, answers, idx]
  );

  function setAnswer(j: number, value: number) {
    setAnswers((a) => ({ ...a, [`${idx}-${j}`]: value }));
  }

  function compute(): EvalSummary {
    let sum = 0;
    let count = 0;
    DIMENSIONS.forEach((d, di) =>
      d.statements.forEach((_, j) => {
        const v = answers[`${di}-${j}`];
        if (v !== undefined) { sum += v; count += 1; }
      })
    );
    const max = count * (SCALE.length - 1); // 3 points max par énoncé
    const score60 = max > 0 ? Math.round((sum / max) * 60) : 0;
    return {
      total: score60,
      palier: PALIER_PAR_SCORE(score60),
      indice_fiabilite: 1,
      badge_n2_octroyable: score60 >= 41,
      reserves: [],
    };
  }

  function finish() {
    const s = compute();
    setResult(s);
    onResult?.(s);
  }

  if (result) {
    const fiab = Math.round((result.indice_fiabilite || 0) * 100);
    return (
      <div className="eval-result">
        <span className="eval-palier">{result.palier}</span>
        <div className="eval-kpis">
          <div className="kpi"><b>{result.total}</b><small>/ 60</small></div>
          <div className="kpi"><b>{fiab}%</b><small>fiabilité</small></div>
          <div className={`kpi ${result.badge_n2_octroyable ? "ok" : "no"}`}>
            <b>{result.badge_n2_octroyable ? "Oui" : "Non"}</b><small>badge Initiateur N2</small>
          </div>
        </div>
        <p className="eval-note">
          Résultat indicatif calculé à partir de vos réponses au questionnaire. Vous pouvez aussi
          réaliser l'entretien avec l'agent pour une évaluation accompagnée.
        </p>
      </div>
    );
  }

  const pct = ((idx + (dimComplete ? 1 : 0)) / total) * 100;

  return (
    <div className="eval-chat">
      <div className="eval-progress">
        <div className="eval-progress-head">
          <span>Dimension {idx + 1} sur {total} · {dim.title}</span>
          <span>{Math.round(pct)} %</span>
        </div>
        <div className="eval-bar"><div className="eval-bar-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "8px 2px 4px" }}>
        {dim.statements.map((st, j) => {
          const current = answers[`${idx}-${j}`];
          return (
            <div key={j}>
              <p style={{ margin: "0 0 8px", color: "#372646", fontWeight: 500 }}>{st}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SCALE.map((label, v) => {
                  const on = current === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAnswer(j, v)}
                      style={{
                        border: on ? "2px solid #F27B6A" : "1px solid #E3D7CC",
                        background: on ? "#FBE7DC" : "#fff",
                        color: on ? "#372646" : "#5E4A73",
                        borderRadius: 999,
                        padding: "7px 16px",
                        fontSize: 14,
                        fontWeight: on ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, gap: 12 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          Précédent
        </button>
        {idx < total - 1 ? (
          <button type="button" className="btn btn-coral" onClick={() => setIdx((i) => i + 1)} disabled={!dimComplete}>
            Suivant
          </button>
        ) : (
          <button type="button" className="btn btn-coral" onClick={finish} disabled={!dimComplete}>
            Voir mon résultat
          </button>
        )}
      </div>
    </div>
  );
}
