"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./AutoEvalChat.css";

type Msg = { role: "user" | "assistant"; content: string };

const API = "/app/api/eval";
const OPENER = "Bonjour, je souhaite adhérer à la charte d'engagement Subsidium.";

// Entretien d'adhésion à la Charte (agent « charte » = Charte Light, agent1).
// La validation est re-vérifiée côté serveur via /api/progression/charte (l'agent rescore).
export default function CharteChat() {
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

  async function chat(next: Msg[]) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "charte", messages: next }),
      });
      const d = await r.json();
      const reply: string = d.reply || d.error || "(pas de réponse)";
      setHistory([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("Connexion à l'agent impossible. Réessayez.");
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
      // L'endpoint re-vérifie l'entretien via l'agent (autoritatif) et persiste si valide.
      const r = await fetch("/app/api/progression/charte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setBusy(false); return; }
      const rr = d.result || {};
      setVerdict({
        valide: !!d.valide,
        retest: rr.retest_autorise_le || rr.retest || undefined,
        motifs: rr.motifs || rr.reserves || rr.raisons || [],
      });
    } catch {
      setError("Validation impossible pour le moment.");
    }
    setBusy(false);
  }

  if (verdict) {
    return (
      <div className="eval-result">
        <span className="eval-palier">{verdict.valide ? "Adhésion validée" : "À approfondir"}</span>
        <p className="eval-note">
          {verdict.valide
            ? "Votre adhésion à la charte est validée. Après le paiement, vous accédez au niveau Refondateur et pouvez exprimer vos idées."
            : "L'agent souhaite approfondir votre adhésion avant de la valider."}
        </p>
        {verdict.motifs.length > 0 && (
          <p className="eval-reserves">Points soulevés : {verdict.motifs.join(" · ")}</p>
        )}
        {!verdict.valide && verdict.retest && (
          <p className="eval-reserves">Nouvel essai possible à partir du {verdict.retest}.</p>
        )}
        {verdict.valide && (
          <Link href="/paiement" className="btn btn-coral" style={{ marginTop: 8, display: "inline-block" }}>
            Finaliser mon adhésion (paiement)
          </Link>
        )}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="eval-intro">
        <p>
          La charte d'engagement Subsidium n'est pas une formalité : un agent vous accompagne dans un
          court entretien pour vérifier que vous comprenez et adhérez aux principes (dignité, bien commun,
          responsabilité, subsidiarité). Répondez avec vos propres mots. Vous devenez Refondateur une fois
          l'adhésion validée et le paiement effectué.
        </p>
        <button type="button" className="btn btn-coral" onClick={start}>Commencer l'entretien d'adhésion</button>
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
          return (
            <div className="bub-row bot" key={i}>
              <span className="bub-label">Agent Charte SUBSIDIUM</span>
              <div className="bub bot">{m.content}</div>
            </div>
          );
        })}
        {busy && (
          <div className="bub-row bot">
            <span className="bub-label">Agent Charte SUBSIDIUM</span>
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
        Conclure et valider mon adhésion
      </button>
    </div>
  );
}
