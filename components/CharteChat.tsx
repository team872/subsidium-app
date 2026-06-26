"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import "./AutoEvalChat.css";

type Msg = { role: "user" | "assistant"; content: string };

const API = "/app/api/eval";
const OPENER = "Bonjour, je souhaite adhérer à la charte d'engagement Subsidium.";

function isAgentError(s?: string): boolean {
  if (!s || !s.trim()) return true;
  return /(^\s*OpenRouter|"error"\s*:|"code"\s*:\s*\d|rate.?limit|temporarily|provider returned|unavailable|<\/?html|bad gateway|gateway time|quota|exhausted|too many requests|\b429\b|\b50[023]\b)/i.test(s);
}

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  fr: {
    noReply: "(pas de réponse)", connErr: "Connexion à l'agent impossible. Réessayez.", validErr: "Validation impossible pour le moment.",
    agentBusy: "L'assistant IA est momentanément indisponible. Réessayez dans un instant, ou choisissez l'option « Par formulaire ».",
    toForm: "Passer au formulaire",
    vValid: "Adhésion validée", vDeepen: "À approfondir",
    noteValid: "Votre adhésion à la charte est validée. Après le paiement, vous accédez au niveau Refondateur et pouvez exprimer vos idées.",
    noteInvalid: "L'agent souhaite approfondir votre adhésion avant de la valider.",
    points: "Points soulevés :", retestPre: "Nouvel essai possible à partir du", finalize: "Finaliser mon adhésion (paiement)",
    intro: "La charte d'engagement Subsidium n'est pas une formalité : un agent vous accompagne dans un court entretien pour vérifier que vous comprenez et adhérez aux quatre engagements de la charte (Vérité, Respect, Responsabilité, Espérance). Répondez avec vos propres mots. Vous devenez Refondateur une fois l'adhésion validée et le paiement effectué.",
    startBtn: "Commencer l'entretien d'adhésion", agentLabel: "Agent Charte SUBSIDIUM",
    replyPh: "Votre réponse…", send: "Envoyer", conclude: "Conclure et valider mon adhésion",
  },
  en: {
    noReply: "(no reply)", connErr: "Could not connect to the agent. Please try again.", validErr: "Validation failed for now.",
    agentBusy: "The AI assistant is momentarily unavailable. Try again shortly, or choose the “By form” option.",
    toForm: "Switch to the form",
    vValid: "Membership validated", vDeepen: "To deepen",
    noteValid: "Your adherence to the charter is validated. After payment, you reach the Refounder level and can express your ideas.",
    noteInvalid: "The agent would like to deepen your commitment before validating it.",
    points: "Points raised:", retestPre: "New attempt possible from", finalize: "Finalise my membership (payment)",
    intro: "The Subsidium Charter of Commitment is not a formality: an agent guides you through a short interview to check that you understand and adhere to the four commitments of the charter (Truth, Respect, Responsibility, Hope). Answer in your own words. You become a Refounder once your membership is validated and payment is made.",
    startBtn: "Start the membership interview", agentLabel: "SUBSIDIUM Charter Agent",
    replyPh: "Your reply…", send: "Send", conclude: "Conclude and validate my membership",
  },
  it: {
    noReply: "(nessuna risposta)", connErr: "Connessione all'agente impossibile. Riprova.", validErr: "Convalida impossibile per ora.",
    agentBusy: "L'assistente IA è momentaneamente non disponibile. Riprova tra poco o scegli l'opzione « Tramite modulo ».",
    toForm: "Passa al modulo",
    vValid: "Adesione convalidata", vDeepen: "Da approfondire",
    noteValid: "La tua adesione alla carta è convalidata. Dopo il pagamento, accedi al livello Rifondatore e puoi esprimere le tue idee.",
    noteInvalid: "L'agente desidera approfondire la tua adesione prima di convalidarla.",
    points: "Punti sollevati:", retestPre: "Nuovo tentativo possibile dal", finalize: "Finalizzare la mia adesione (pagamento)",
    intro: "La Carta d'impegno Subsidium non è una formalità: un agente ti accompagna in un breve colloquio per verificare che comprendi e aderisci ai quattro impegni della carta (Verità, Rispetto, Responsabilità, Speranza). Rispondi con parole tue. Diventi Rifondatore una volta convalidata l'adesione ed effettuato il pagamento.",
    startBtn: "Iniziare il colloquio di adesione", agentLabel: "Agente Carta SUBSIDIUM",
    replyPh: "La tua risposta…", send: "Invia", conclude: "Concludere e convalidare la mia adesione",
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

export default function CharteChat({ onFallback }: { onFallback?: () => void }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [verdict, setVerdict] = useState<{ valide: boolean; retest?: string; motifs: string[] } | null>(null);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, busy]);

  function fallbackBtn() {
    if (!onFallback) return null;
    return (
      <button type="button" className="btn btn-coral" style={{ marginTop: 10 }} onClick={onFallback}>{tr.toForm}</button>
    );
  }

  async function chat(next: Msg[]) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "charte", messages: next }),
      });
      const d = await r.json().catch(() => ({} as any));
      const reply: string = (d.reply ?? "").toString();
      const errStr: string = (d.error ?? "").toString();
      if (!r.ok || d.fallback === true || isAgentError(reply) || (errStr.trim() !== "" && isAgentError(errStr))) {
        setError(tr.agentBusy);
        const hadAgentReply = next.some((m, i) => i > 0 && m.role === "assistant");
        if (!hadAgentReply) { setStarted(false); setHistory([]); }
        setBusy(false);
        return;
      }
      setHistory([...next, { role: "assistant", content: reply }]);
    } catch {
      setError(tr.connErr);
      const hadAgentReply = next.some((m, i) => i > 0 && m.role === "assistant");
      if (!hadAgentReply) { setStarted(false); setHistory([]); }
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
    const transcript = history.map((m) => (m.role === "user" ? "Visiteur: " : "Agent: ") + m.content).join("\n");
    try {
      const r = await fetch("/app/api/progression/charte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const d = await r.json().catch(() => ({} as any));
      if (!r.ok || d.error) {
        setError(tr.validErr);
        setBusy(false);
        return;
      }
      const rr = d.result || {};
      setVerdict({
        valide: !!d.valide,
        retest: rr.retest_autorise_le || rr.retest || undefined,
        motifs: rr.motifs || rr.reserves || rr.raisons || [],
      });
    } catch {
      setError(tr.validErr);
    }
    setBusy(false);
  }

  if (verdict) {
    return (
      <div className="eval-result">
        <span className="eval-palier">{verdict.valide ? tr.vValid : tr.vDeepen}</span>
        <p className="eval-note">{verdict.valide ? tr.noteValid : tr.noteInvalid}</p>
        {verdict.motifs.length > 0 && (
          <p className="eval-reserves">{tr.points} {verdict.motifs.join(" · ")}</p>
        )}
        {!verdict.valide && verdict.retest && (
          <p className="eval-reserves">{tr.retestPre} {verdict.retest}.</p>
        )}
        {verdict.valide && (
          <Link href="/paiement" className="btn btn-coral" style={{ marginTop: 8, display: "inline-block" }}>
            {tr.finalize}
          </Link>
        )}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="eval-intro">
        <p>{tr.intro}</p>
        {error && <p className="msg" style={{ margin: "0 0 6px" }}>{error}</p>}
        {error && fallbackBtn()}
        <div style={{ marginTop: error ? 10 : 0 }}>
          <button type="button" className="btn btn-coral" onClick={start}>{tr.startBtn}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="eval-chat">
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
              <span className="bub-label">{tr.agentLabel}</span>
              {intro && <div className="bub bot">{intro}</div>}
              {question && <div className="bub-q">{question}</div>}
              {!intro && !question && <div className="bub bot">{m.content}</div>}
            </div>
          );
        })}
        {busy && (
          <div className="bub-row bot">
            <span className="bub-label">{tr.agentLabel}</span>
            <div className="bub bot typing"><span></span><span></span><span></span></div>
          </div>
        )}
      </div>

      {error && <p className="msg" style={{ marginTop: 10 }}>{error}</p>}
      {error && fallbackBtn()}

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
      <button type="button" className="btn btn-ghost eval-finish" onClick={finish} disabled={busy || history.length < 2}>
        {tr.conclude}
      </button>
    </div>
  );
}
