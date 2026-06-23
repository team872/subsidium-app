"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREET = "Bonjour, je suis Lumi, votre guide Subsidium ✨ Posez-moi vos questions sur la plateforme, la démarche ou votre parcours.";
const SUGGESTIONS = ["Comment devenir Refondateur ?", "Différence entre une idée et un projet ?", "C'est quoi un Club ?"];

function MascotFace({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#F9F1E9" />
      <g fill="none" stroke="#C2452F" strokeWidth="1.6" opacity=".5">
        <ellipse cx="24" cy="24" rx="8" ry="20" /><ellipse cx="24" cy="24" rx="20" ry="8" />
      </g>
      <circle cx="18" cy="22" r="2.6" fill="#372646" />
      <circle cx="30" cy="22" r="2.6" fill="#372646" />
      <path d="M17 29 q7 6 14 0" fill="none" stroke="#372646" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="13.5" cy="28" r="2" fill="#F4A28C" opacity=".7" />
      <circle cx="34.5" cy="28" r="2" fill="#F4A28C" opacity=".7" />
    </svg>
  );
}

export default function Mascotte() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, busy, open]);

  async function ask(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    const next: Msg[] = [...history, { role: "user", content: t }];
    setHistory(next);
    setBusy(true);
    try {
      const r = await fetch("/app/api/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const d = await r.json();
      setHistory([...next, { role: "assistant", content: d.reply || d.error || "Désolée, je n'ai pas pu répondre." }]);
    } catch {
      setHistory([...next, { role: "assistant", content: "Connexion impossible pour le moment. Réessayez dans un instant." }]);
    }
    setBusy(false);
  }

  return (
    <>
      {open && (
        <div style={{ position: "fixed", right: 24, bottom: 96, width: 360, maxWidth: "calc(100vw - 32px)", height: 500, maxHeight: "calc(100vh - 130px)", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 18, boxShadow: "0 18px 50px rgba(55,38,70,.22)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "linear-gradient(135deg,#F27B6A,#C2452F)", color: "#fff" }}>
            <span style={{ width: 36, height: 36, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><MascotFace size={28} /></span>
            <span style={{ flex: 1, lineHeight: 1.1 }}><b style={{ fontSize: 15 }}>Lumi</b><br /><small style={{ opacity: .9, fontSize: 11.5 }}>Votre guide Subsidium</small></span>
            <button onClick={() => setOpen(false)} aria-label="Fermer" style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 999, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, background: "#FCF9F6", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#fff", border: "1px solid #EBD9CD", borderRadius: "14px 14px 14px 4px", padding: "10px 12px", color: "#372646", fontSize: 14, lineHeight: 1.5 }}>{GREET}</div>
            {history.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} style={{ background: "#FCE9E2", color: "#C2452F", border: "none", borderRadius: 999, padding: "6px 10px", fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>{s}</button>
                ))}
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.role === "user" ? "linear-gradient(135deg,#F27B6A,#C2452F)" : "#fff", color: m.role === "user" ? "#fff" : "#372646", border: m.role === "user" ? "none" : "1px solid #EBD9CD", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 12px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
            ))}
            {busy && <div style={{ alignSelf: "flex-start", color: "#9C919E", fontSize: 13, fontStyle: "italic", padding: "4px 6px" }}>Lumi réfléchit…</div>}
          </div>

          <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #F0E6DD", background: "#fff" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ask(input); }} placeholder="Écrivez votre message…" disabled={busy} style={{ flex: 1, border: "1px solid #E3D7CC", borderRadius: 10, padding: "9px 12px", color: "#372646", fontSize: 14 }} />
            <button onClick={() => ask(input)} disabled={busy || !input.trim()} className="btn btn-coral" style={{ padding: "9px 14px" }}>Envoyer</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label="Ouvrir l'assistant Lumi" title="Lumi — votre guide Subsidium" style={{ position: "fixed", right: 24, bottom: 24, width: 60, height: 60, borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#F27B6A,#C2452F)", boxShadow: "0 10px 26px rgba(194,69,47,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 71 }}>
        <span style={{ width: 44, height: 44, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><MascotFace size={34} /></span>
      </button>
    </>
  );
}
