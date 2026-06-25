"use client";

import { useEffect, useRef, useState } from "react";
import EvalResult from "@/components/EvalResult";
import { useLang } from "@/components/LangProvider";
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
const TARGET_QUESTIONS = 20;
const OPENER = "Bonjour, je suis prêt(e) à commencer l'entretien.";

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  fr: {
    noReply: "(pas de réponse)", connErr: "Connexion à l'évaluateur impossible. Réessayez.", scoreErr: "Évaluation impossible pour le moment.",
    intro: "Cette étape n'est pas un test idéologique. Un agent SUBSIDIUM vous accompagne dans un entretien qui passe en revue les grandes dimensions de votre engagement. Répondez avec vos propres mots et, si vous le pouvez, illustrez d'un exemple concret vécu — c'est ce qui permet d'établir votre palier. Vous pourrez conclure à tout moment.",
    start: "Démarrer l'entretien", dimension: "Dimension", on: "sur", evaluator: "Évaluateur SUBSIDIUM",
    replyPh: "Votre réponse…", send: "Envoyer",
    doneHint: "Vous avez parcouru les grands domaines : vous pouvez conclure et obtenir votre palier.", finish: "Terminer l'entretien et obtenir mon palier",
  },
  en: {
    noReply: "(no reply)", connErr: "Could not connect to the evaluator. Please try again.", scoreErr: "Assessment failed for now.",
    intro: "This step is not an ideological test. A SUBSIDIUM agent guides you through an interview reviewing the main dimensions of your commitment. Answer in your own words and, if you can, illustrate with a concrete lived example — this is what establishes your level. You can conclude at any time.",
    start: "Start the interview", dimension: "Dimension", on: "of", evaluator: "SUBSIDIUM Evaluator",
    replyPh: "Your reply…", send: "Send",
    doneHint: "You have covered the main areas: you can conclude and get your level.", finish: "End the interview and get my level",
  },
  it: {
    noReply: "(nessuna risposta)", connErr: "Connessione al valutatore impossibile. Riprova.", scoreErr: "Valutazione impossibile per ora.",
    intro: "Questa tappa non è un test ideologico. Un agente SUBSIDIUM ti accompagna in un colloquio che passa in rassegna le principali dimensioni del tuo impegno. Rispondi con parole tue e, se puoi, illustra con un esempio concreto vissuto — è ciò che permette di stabilire il tuo livello. Puoi concludere in qualsiasi momento.",
    start: "Avviare il colloquio", dimension: "Dimensione", on: "su", evaluator: "Valutatore SUBSIDIUM",
    replyPh: "La tua risposta…", send: "Invia",
    doneHint: "Hai esaminato i principali ambiti: puoi concludere e ottenere il tuo livello.", finish: "Concludere il colloquio e ottenere il mio livello",
  },
};

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
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
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
      const reply: string = d.reply || d.error || tr.noReply;
      setHistory([...next, { role: "assistant", content: reply }]);
    } catch {
      setError(tr.connErr);
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
      setError(tr.scoreErr);
    }
    setBusy(false);
  }

  if (result) return <EvalResult summary={result} />;

  if (!started) {
    return (
      <div className="eval-intro">
        <p>{tr.intro}</p>
        <button type="button" className="btn btn-coral" onClick={start}>{tr.start}</button>
      </div>
    );
  }

  const asked = history.filter((m) => m.role === "assistant").length;
  const current = Math.min(asked, TARGET_QUESTIONS);
  const pct = Math.min(asked / TARGET_QUESTIONS, 1) * 100;
  return (
    <div className="eval-chat">
      <div className="eval-progress">
        <div className="eval-progress-head">
          <span>{tr.dimension} {current} {tr.on} {TARGET_QUESTIONS}</span>
          <span>{Math.round(pct)} %</span>
        </div>
        <div className="eval-bar"><div className="eval-bar-fill" style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="chat-window" ref={scrollRef}>
        {history.map((m, i) => {
          if (i === 0 && m.role === "user") return null;
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
              <span className="bub-label">{tr.evaluator}</span>
              {intro && <div className="bub bot">{intro}</div>}
              {question && <div className="bub-q">{question}</div>}
              {!intro && !question && <div className="bub bot">{m.content}</div>}
            </div>
          );
        })}
        {busy && (
          <div className="bub-row bot">
            <span className="bub-label">{tr.evaluator}</span>
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
          placeholder={tr.replyPh}
          disabled={busy}
        />
        <button type="button" className="btn btn-coral" onClick={send} disabled={busy || !input.trim()}>
          {tr.send}
        </button>
      </div>
      {asked >= TARGET_QUESTIONS && (
        <p className="eval-hint">{tr.doneHint}</p>
      )}
      <button type="button" className="btn btn-ghost eval-finish" onClick={finish} disabled={busy || history.length < 2}>
        {tr.finish}
      </button>
    </div>
  );
}
