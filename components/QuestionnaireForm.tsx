"use client";

import { useMemo, useState } from "react";
import { DIMENSIONS, SCALE } from "@/lib/autoEval";
import type { EvalSummary } from "@/components/AutoEvalChat";
import EvalResult from "@/components/EvalResult";
import "./AutoEvalChat.css";

// Questionnaire guidé (version « formulaire » de l'AVP) : un écran par dimension,
// chaque énoncé noté sur l'échelle Jamais / Parfois / Souvent / Toujours (0..3).
// Le scoring est calculé côté serveur (/api/eval/form-score), avec les MÊMES seuils
// que l'agent conversationnel — palier/badge unifiés entre les deux chemins.

export default function QuestionnaireForm({ onResult }: { onResult?: (s: EvalSummary) => void }) {
  const total = DIMENSIONS.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<EvalSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dim = DIMENSIONS[idx];
  const dimComplete = useMemo(
    () => dim.statements.every((_, j) => answers[`${idx}-${j}`] !== undefined),
    [dim, answers, idx]
  );

  function setAnswer(j: number, value: number) {
    setAnswers((a) => ({ ...a, [`${idx}-${j}`]: value }));
  }

  async function finish() {
    setBusy(true);
    setError("");
    const list: number[] = [];
    DIMENSIONS.forEach((d, di) =>
      d.statements.forEach((_, j) => {
        const v = answers[`${di}-${j}`];
        if (v !== undefined) list.push(v);
      })
    );
    try {
      const r = await fetch("/app/api/eval/form-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: list }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setBusy(false); return; }
      const rr = d.result || {};
      const s: EvalSummary = {
        total: rr.total,
        palier: rr.palier,
        indice_fiabilite: rr.indice_fiabilite ?? 1,
        badge_n2_octroyable: !!rr.badge_n2_octroyable,
        reserves: rr.reserves || [],
      };
      setResult(s);
      onResult?.(s);
    } catch {
      setError("Calcul du résultat impossible pour le moment.");
    }
    setBusy(false);
  }

  if (result) return <EvalResult summary={result} />;

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

      <p style={{ color: "#5E4A73", margin: "10px 2px 6px", fontStyle: "italic" }}>{dim.intro}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "6px 2px 4px" }}>
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

      {error && <p className="msg" style={{ marginTop: 10 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, gap: 12 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0 || busy}
        >
          Précédent
        </button>
        {idx < total - 1 ? (
          <button type="button" className="btn btn-coral" onClick={() => setIdx((i) => i + 1)} disabled={!dimComplete}>
            Suivant
          </button>
        ) : (
          <button type="button" className="btn btn-coral" onClick={finish} disabled={!dimComplete || busy}>
            {busy ? "Calcul…" : "Voir mon résultat"}
          </button>
        )}
      </div>
    </div>
  );
}
