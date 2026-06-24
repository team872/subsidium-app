"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import CharteChat from "@/components/CharteChat";
import "@/components/MemberBoards.css";

const ENGAGEMENTS = [
  { t: "Vérité", d: "Je parle en conscience, sans haine ni mensonge." },
  { t: "Respect", d: "J'écoute les autres et je construis dans le dialogue." },
  { t: "Responsabilité", d: "Je cherche le bien commun, pas le conflit." },
  { t: "Espérance", d: "Je crois en la capacité collective à changer les choses." },
];
const APPORTS = [
  "Exprimer vos idées et lancer des initiatives",
  "Participer aux débats citoyens et soutenir les idées qui vous tiennent à cœur",
  "Accéder au contenu réservé aux membres",
  "Progresser vers les niveaux supérieurs (projets, missions, market-place, clubs)",
];

export default function ChartePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choix" | "formulaire" | "assistant">("choix");
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [motiv, setMotiv] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const allChecked = checks.every(Boolean);
  function toggle(i: number) { setChecks((c) => c.map((v, j) => (j === i ? !v : v))); }

  async function validerFormulaire() {
    if (busy) return;
    if (!allChecked) { setErr("Merci de confirmer les quatre engagements."); return; }
    if (motiv.trim().length < 10) { setErr("Dites en quelques mots ce qui vous engage."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/app/api/progression/charte-form", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ motivation: motiv }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Validation impossible."); setBusy(false); return; }
      router.push("/paiement");
    } catch { setErr("Validation impossible."); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head"><h1>Adhérer à la Charte d'engagement</h1></div>

      {/* Intro claire : ce qu'est la Charte + ce qu'elle apporte */}
      <div style={{ maxWidth: 820, marginBottom: 18 }}>
        <p style={{ color: "#5E4A73", lineHeight: 1.65, margin: "0 0 12px" }}>
          La Charte d'engagement n'est pas un test idéologique, ni un examen : c'est un <b>engagement de cohérence</b>,
          en quelques minutes. En l'adoptant, vous devenez <b>Refondateur</b> et rejoignez la communauté de celles et
          ceux qui agissent. Vous pouvez aussi la valider plus tard — et continuer à découvrir la plateforme en attendant.
        </p>
        <div style={{ background: "#F9F1E9", border: "1px solid #EBD9CD", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontWeight: 800, color: "#372646", marginBottom: 8 }}>Ce que la Charte vous ouvre</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#5E4A73", lineHeight: 1.7 }}>
            {APPORTS.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>

      {mode === "choix" && (
        <div style={{ maxWidth: 820 }}>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>Comment souhaitez-vous procéder ?</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button onClick={() => setMode("formulaire")} style={{ flex: "1 1 300px", textAlign: "left", cursor: "pointer", border: "1px solid #EBD9CD", background: "#fff", borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "#FCE9E2", color: "#C2452F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </span>
                <b style={{ color: "#372646", fontSize: 16 }}>Par formulaire</b>
              </div>
              <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, lineHeight: 1.55 }}>Lisez les quatre engagements et confirmez-les en un instant. Le plus rapide.</p>
            </button>

            <button onClick={() => setMode("assistant")} style={{ flex: "1 1 300px", textAlign: "left", cursor: "pointer", border: "1px solid #EBD9CD", background: "#fff", borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "#FCE9E2", color: "#C2452F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </span>
                <b style={{ color: "#372646", fontSize: 16 }}>Avec l'assistant</b>
              </div>
              <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, lineHeight: 1.55 }}>Un court échange guidé avec l'assistant SUBSIDIUM AI, à votre rythme et avec vos mots.</p>
            </button>
          </div>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <Link href="/accueil" style={{ color: "#9C919E", textDecoration: "underline", fontSize: 14 }}>
              Passer pour l'instant et découvrir le site
            </Link>
            <p style={{ color: "#9C919E", fontSize: 12.5, marginTop: 4 }}>Vous pourrez valider la Charte quand vous le souhaitez pour débloquer toutes les actions.</p>
          </div>
        </div>
      )}

      {mode === "formulaire" && (
        <div style={{ maxWidth: 760 }}>
          <button onClick={() => setMode("choix")} className="board-back" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}>← Retour au choix</button>
          <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 14px" }}>Confirmez votre adhésion à chacun des quatre engagements de la Charte.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ENGAGEMENTS.map((e, i) => (
              <label key={e.t} style={{ display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid #EBD9CD", borderRadius: 12, padding: "12px 14px", background: checks[i] ? "#FCFBF8" : "#fff", cursor: "pointer" }}>
                <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} style={{ marginTop: 3 }} />
                <span><b style={{ color: "#372646" }}>{e.t}</b><span style={{ color: "#5E4A73" }}> — {e.d}</span></span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontWeight: 700, color: "#372646", display: "block", marginBottom: 6 }}>En quelques mots, qu'est-ce qui vous engage ?</label>
            <textarea value={motiv} onChange={(e) => setMotiv(e.target.value)} rows={3} placeholder="Ce qui me motive à rejoindre la communauté des Refondateurs…" style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
          </div>
          {err && <p className="msg" style={{ marginTop: 8 }}>{err}</p>}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-coral" onClick={validerFormulaire} disabled={busy || !allChecked}>{busy ? "Validation…" : "Valider mon adhésion"}</button>
          </div>
        </div>
      )}

      {mode === "assistant" && (
        <div style={{ maxWidth: 760 }}>
          <button onClick={() => setMode("choix")} className="board-back" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}>← Retour au choix</button>
          <CharteChat />
        </div>
      )}
    </AppShell>
  );
}
