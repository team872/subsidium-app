"use client";

import { useEffect, useRef, useState, Fragment } from "react";
import { useT } from "@/components/LangProvider";

type Msg = { role: "user" | "assistant"; content: string };

const BOT = "SUBSIDIUM AI";
const CREAM = "#F3E7D2";
const INK = "#2E2438";

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

// Petit indicateur « le bot réfléchit » : trois points qui rebondissent.
function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }} aria-label="…">
      <span className="subx-dot" />
      <span className="subx-dot" style={{ animationDelay: ".15s" }} />
      <span className="subx-dot" style={{ animationDelay: ".3s" }} />
    </span>
  );
}

export default function Mascotte() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);       // requête en cours (réseau OU frappe)
  const [thinking, setThinking] = useState(false); // phase réseau : points animés
  const [streaming, setStreaming] = useState(false); // phase frappe : curseur clignotant
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, thinking, streaming, open]);

  // Nettoyage du minuteur de frappe si le composant est démonté.
  useEffect(() => () => { if (revealTimer.current) window.clearTimeout(revealTimer.current); }, []);

  // Révèle le texte progressivement (effet machine à écrire) par petits paquets de caractères.
  function reveal(full: string, base: Msg[]): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      setStreaming(true);
      setHistory([...base, { role: "assistant", content: "" }]);
      const step = () => {
        // On avance de 1 à 3 caractères, en absorbant les espaces pour un rendu naturel.
        i += 1 + Math.floor(Math.random() * 3);
        if (full[i] === " ") i += 1;
        const slice = full.slice(0, i);
        setHistory([...base, { role: "assistant", content: slice }]);
        if (i < full.length) {
          revealTimer.current = window.setTimeout(step, 18);
        } else {
          setStreaming(false);
          resolve();
        }
      };
      revealTimer.current = window.setTimeout(step, 130);
    });
  }

  async function ask(text: string) {
    const tx = text.trim();
    if (!tx || busy) return;
    setInput("");
    const next: Msg[] = [...history, { role: "user", content: tx }];
    setHistory(next);
    setBusy(true);
    setThinking(true);
    let full = "";
    try {
      const r = await fetch("/app/api/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const d = await r.json();
      full = d.reply || d.error || t("bot.fallback");
    } catch {
      full = t("bot.offline");
    }
    setThinking(false);
    // Petit délai pour laisser voir les points, puis frappe progressive.
    await reveal(full, next);
    setBusy(false);
  }

  const SUGG = [t("bot.s1"), t("bot.s2"), t("bot.s3")];

  return (
    <>
      <style>{`
        .subx-dot{width:7px;height:7px;border-radius:999px;background:#C2452F;display:inline-block;animation:subx-bounce 1.1s infinite ease-in-out}
        @keyframes subx-bounce{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-5px);opacity:1}}
        .subx-caret{display:inline-block;width:2px;height:1em;background:#C2452F;margin-left:1px;vertical-align:-2px;animation:subx-blink 1s steps(1) infinite}
        @keyframes subx-blink{0%,50%{opacity:1}50.01%,100%{opacity:0}}
      `}</style>

      {open && (
        <div style={{ position: "fixed", right: 24, bottom: 96, width: 360, maxWidth: "calc(100vw - 32px)", height: 500, maxHeight: "calc(100vh - 130px)", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 18, boxShadow: "0 18px 50px rgba(55,38,70,.22)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "linear-gradient(135deg,#F27B6A,#C2452F)", color: "#fff" }}>
            <span style={{ width: 38, height: 38, borderRadius: 999, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MascotHead size={32} /></span>
            <span style={{ flex: 1, lineHeight: 1.1 }}><b style={{ fontSize: 15 }}>{BOT}</b><br /><small style={{ opacity: .9, fontSize: 11.5 }}>{t("bot.subtitle")}</small></span>
            <button onClick={() => setOpen(false)} aria-label="×" style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 999, cursor: "pointer", fontSize: 16 }}>×</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, background: "#FCF9F6", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#fff", border: "1px solid #EBD9CD", borderRadius: "14px 14px 14px 4px", padding: "10px 12px", color: "#372646", fontSize: 14, lineHeight: 1.55 }}>{t("bot.greeting")}</div>
            {history.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {SUGG.map((s) => (
                  <button key={s} onClick={() => ask(s)} style={{ background: "#FCE9E2", color: "#C2452F", border: "none", borderRadius: 999, padding: "6px 10px", fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>{s}</button>
                ))}
              </div>
            )}
            {history.map((m, i) => {
              const isLast = i === history.length - 1;
              const showCaret = streaming && isLast && m.role === "assistant";
              return (
                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", background: m.role === "user" ? "linear-gradient(135deg,#F27B6A,#C2452F)" : "#fff", color: m.role === "user" ? "#fff" : "#372646", border: m.role === "user" ? "none" : "1px solid #EBD9CD", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 12px", fontSize: 14, lineHeight: 1.55 }}>
                  {m.role === "user"
                    ? <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
                    : <div>{renderRich(m.content)}{showCaret && <span className="subx-caret" />}</div>}
                </div>
              );
            })}
            {thinking && (
              <div style={{ alignSelf: "flex-start", background: "#fff", border: "1px solid #EBD9CD", borderRadius: "14px 14px 14px 4px", padding: "12px 14px", display: "flex", alignItems: "center" }}>
                <TypingDots />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #F0E6DD", background: "#fff" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ask(input); }} placeholder={t("bot.placeholder")} disabled={busy} style={{ flex: 1, border: "1px solid #E3D7CC", borderRadius: 10, padding: "9px 12px", color: "#372646", fontSize: 14 }} />
            <button onClick={() => ask(input)} disabled={busy || !input.trim()} className="btn btn-coral" style={{ padding: "9px 14px" }}>{t("bot.send")}</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label={t("bot.open")} title={BOT} style={{ position: "fixed", right: 24, bottom: 24, width: 62, height: 62, borderRadius: 999, border: "3px solid #C2452F", cursor: "pointer", background: CREAM, boxShadow: "0 10px 26px rgba(194,69,47,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 71, padding: 0 }}>
        <MascotHead size={44} />
      </button>
    </>
  );
}
