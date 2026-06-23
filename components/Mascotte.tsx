"use client";

import { useEffect, useRef, useState, Fragment } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const BOT = "SUBSIDIUM AI";
const GREET = "Bonjour, je suis l'assistant SUBSIDIUM AI ✨ Posez-moi vos questions sur la plateforme, la démarche ou votre parcours.";
const SUGGESTIONS = ["Comment devenir Refondateur ?", "Différence entre une idée et un projet ?", "C'est quoi un Club ?"];

const CREAM = "#F3E7D2";
const INK = "#2E2438";

// Mascotte SUBSIDIUM : tête « globe » (cercle crème + grille méridienne), grands yeux, sourire,
// contour foncé — reproduction du personnage de la maquette.
function MascotHead({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill={CREAM} stroke={INK} strokeWidth="2.4" />
      <g fill="none" stroke={INK} strokeWidth="1" opacity="0.4">
        <ellipse cx="24" cy="24" rx="7" ry="19" />
        <ellipse cx="24" cy="24" rx="19" ry="7" />
        <line x1="24" y1="5" x2="24" y2="43" />
        <line x1="5" y1="24" x2="43" y2="24" />
      </g>
      <ellipse cx="19" cy="24" rx="2.5" ry="4.1" fill={INK} />
      <ellipse cx="30" cy="23.4" rx="2.5" ry="4.1" fill={INK} />
      <circle cx="18.2" cy="22.4" r="0.9" fill="#fff" />
      <circle cx="29.2" cy="21.8" r="0.9" fill="#fff" />
      <path d="M19 31 Q24.5 35.5 30 30" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Rendu Markdown léger : gras (**...**), listes à puces (- / • / *), sauts de ligne.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(p);
    if (m) return <strong key={i}>{m[1]}</strong>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}
function renderRich(text: string) {
  const lines = text.split(/\n/);
  return lines.map((ln, i) => {
    if (!ln.trim()) return <div key={i} style={{ height: 6 }} />;
    const bullet = /^\s*[-•*]\s+/.test(ln);
    if (bullet) {
      const content = ln.replace(/^\s*[-•*]\s+/, "");
      return (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{ color: "#C2452F", lineHeight: 1.5 }}>•</span>
          <span>{renderInline(content)}</span>
        </div>
      );
    }
    return <div key={i}>{renderInline(ln)}</div>;
  });
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
      setHistory([...next, { role: "assistant", content: d.reply || d.error || "Désolé, je n'ai pas pu répondre." }]);
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
            <span style={{ width: 38, height: 38, borderRadius: 999, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MascotHead size={32} /></span>
            <span style={{ flex: 1, lineHeight: 1.1 }}><b style={{ fontSize: 15 }}>{BOT}</b><br /><small style={{ opacity: .9, fontSize: 11.5 }}>Votre guide Subsidium</small></span>
            <button onClick={() => setOpen(false)} aria-label="Fermer" style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 999, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, background: "#FCF9F6", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#fff", border: "1px solid #EBD9CD", borderRadius: "14px 14px 14px 4px", padding: "10px 12px", color: "#372646", fontSize: 14, lineHeight: 1.55 }}>{GREET}</div>
            {history.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} style={{ background: "#FCE9E2", color: "#C2452F", border: "none", borderRadius: 999, padding: "6px 10px", fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>{s}</button>
                ))}
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", background: m.role === "user" ? "linear-gradient(135deg,#F27B6A,#C2452F)" : "#fff", color: m.role === "user" ? "#fff" : "#372646", border: m.role === "user" ? "none" : "1px solid #EBD9CD", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 12px", fontSize: 14, lineHeight: 1.55 }}>
                {m.role === "user" ? <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span> : <div>{renderRich(m.content)}</div>}
              </div>
            ))}
            {busy && <div style={{ alignSelf: "flex-start", color: "#9C919E", fontSize: 13, fontStyle: "italic", padding: "4px 6px" }}>{BOT} réfléchit…</div>}
          </div>

          <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #F0E6DD", background: "#fff" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ask(input); }} placeholder="Écrivez votre message…" disabled={busy} style={{ flex: 1, border: "1px solid #E3D7CC", borderRadius: 10, padding: "9px 12px", color: "#372646", fontSize: 14 }} />
            <button onClick={() => ask(input)} disabled={busy || !input.trim()} className="btn btn-coral" style={{ padding: "9px 14px" }}>Envoyer</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label="Ouvrir l'assistant SUBSIDIUM AI" title="SUBSIDIUM AI — votre guide" style={{ position: "fixed", right: 24, bottom: 24, width: 62, height: 62, borderRadius: 999, border: "3px solid #C2452F", cursor: "pointer", background: CREAM, boxShadow: "0 10px 26px rgba(194,69,47,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 71, padding: 0 }}>
        <MascotHead size={44} />
      </button>
    </>
  );
}
