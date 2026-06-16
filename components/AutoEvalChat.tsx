"use client";

import { useEffect, useRef, useState } from "react";
import "./AutoEvalChat.css";

type Msg = { role: "user" | "assistant"; content: string };

export type EvalSummary = {
  total: number;
  palier: string;
  indice_fiabilite: number;
  badge_n2_octroyable: boolean;
  reserves: string[];
};

const API = "/app/api/eval";
const OPENER = "Bonjour, je suis prêt(e) à commencer l'entretien.";

// L'agent place sa question après un marqueur « QUESTION : » — on l'isole pour la mettre en valeur.
function splitQuestion(text: string) {
  const re = /QUESTION\s*:/gi;
  let last = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) last = m.index;
  if (last < 0) return { intro: text.trim(), question: "" };
  return {
    intro: text.slice(0, last).trim(),
    question: text.slice(last).replace(/^QUESTION\s*:\s*/i, "").trim(),
  };
}

export default function AutoEvalChat({ onResult }: { onResult: (s: EvalSummary | null) => void }) {
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<EvalSummary | null>(null);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, busy]);

  async function chat(next: Msg[]) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const d = await r.json();
      const reply: string = d.reply || d.error || "(pas de réponse)";
      setHistory([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("Connexion à l'évaluateur impossible. Réessayez.");
    }
    setBusy(false);
  }

  async function start() {
    if (started || busy) return;
    setStarted(true);
    const next: Msg[] = [{ role: "user", content: OPENER }];
    setHistory(next);
    await chat(next);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...history, { role: "user", content: text }];
    setHistory(next);
    await chat(next);
  }

  async function finish() {
    if (busy || history.length < 2) return;
    setBusy(true);
    setError("");
    const transcript = history
      .map((m) => (m.role === "user" ? "Visiteur: " : "Agent: ") + m.content)
      .join("\n");
    try {
      const r = await fetch(`${API}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const d = await r.json();
      if (d.error) {
        setError(d.error);
        setBusy(false);
        return;
      }
      const rr = d.result || {};
      const s: EvalSummary = {
        total: rr.total,
        palier: rr.palier,
        indice_fiabilite: rr.indice_fiabilite,
        badge_n2_octroyable: !!rr.badge_n2_octroyable,
        reserves: rr.reserves || [],
      };
      setResult(s);
      onResult(s);
    } catch {
      setError("Évaluation impossible pour le moment.");
    }
    setBusy(false);
  }

  /* ----- résultat ----- */
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
        {result.reserves.length > 0 && (
          <p className="eval-reserves">Points de vigilance : {result.reserves.join(" · ")}</p>
        )}
        <p className="eval-note">
          Votre entretien a été évalué par l'agent SUBSIDIUM. Vous pouvez maintenant passer à la
          signature de la charte d'engagement.
        </p>
      </div>
    );
  }

  /* ----- introduction ----- */
  if (!started) {
    return (
      <div className="eval-intro">
        <p>
          Cette étape n'est pas un test idéologique. Un agent SUBSIDIUM vous accompagne dans un court
          entretien : à chaque question, répondez avec vos propres mots et, si vous le pouvez, illustrez
          d'un exemple concret. Vous pourrez conclure et obtenir votre palier à tout moment.
        </p>
        <button type="button" className="btn btn-coral" onClick={start}>Démarrer l'entretien</button>
      </div>
    );
  }

  /* ----- conversation ----- */
  return (
    <div className="eval-chat">
      <div className="chat-window" ref={scrollRef}>
        {history.map((m, i) => {
          if (i === 0 && m.role === "user") return null; // on masque l'amorce
          if (m.role === "user") {
            return (
              <div className="bub-row me" key={i}>
                <div className="bub me">{m.content}</div>
              </div>
            );
          }
          const { intro, question } = splitQuestion(m.content);
          return (
            <div className="bub-row bot" key={i}>
              <span className="bub-label">Évaluateur SUBSIDIUM</span>
              {intro && <div className="bub bot">{intro}</div>}
              {question && <div className="bub-q">{question}</div>}
              {!intro && !question && <div className="bub bot">{m.content}</div>}
            </div>
          );
        })}
        {busy && (
          <div className="bub-row bot">
            <span className="bub-label">Évaluateur SUBSIDIUM</span>
            <div className="bub bot typing"><span></span><span></span><span></span></div>
          </div>
        )}
      </div>

      {error && <p className="msg" style={{ marginTop: 10 }}>{error}</p>}

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Votre réponse…"
          disabled={busy}
        />
        <button type="button" className="btn btn-coral" onClick={send} disabled={busy || !input.trim()}>
          Envoyer
        </button>
      </div>
      <button type="button" className="btn btn-ghost eval-finish" onClick={finish} disabled={busy || history.length < 2}>
        Terminer l'entretien et obtenir mon palier
      </button>
    </div>
  );
}
