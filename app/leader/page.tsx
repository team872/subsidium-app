"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Step = { key: string; titre: string; contenu: string };
type Cert = { statut: "en_attente" | "certifie" | "refuse" } | null;

export default function LeaderPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [cert, setCert] = useState<Cert>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/app/api/leader").then((r) => r.json()).then((d) => {
      setSteps(d.steps || []); setDone(d.done || []); setCert(d.certification || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function toggle(key: string, isDone: boolean) {
    setDone((d) => (isDone ? d.filter((k) => k !== key) : [...d, key])); // optimiste
    try {
      const r = await fetch("/app/api/leader/step", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, done: !isDone }) });
      const data = await r.json();
      if (data.done) setDone(data.done);
    } catch {}
  }
  async function demander() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/leader/certification", { method: "POST" });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Demande impossible."); setBusy(false); return; }
      setCert(d.certification || { statut: "en_attente" });
    } catch { setError("Demande impossible."); }
    setBusy(false);
  }

  const total = steps.length;
  const nb = done.length;
  const tousFaits = total > 0 && nb >= total;
  const pct = total ? Math.round((nb / total) * 100) : 0;

  return (
    <AppShell>
      <div className="board-head"><h1>Parcours Leader</h1></div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>
        Le parcours Leader prépare les Initiateurs à devenir <b>Refondateurs Certifiés</b> : porter la doctrine,
        animer un collectif et faire grandir d'autres citoyens. Parcourez les étapes, puis demandez votre certification —
        elle sera validée par l'équipe Subsidium.
      </p>

      {loading ? <p className="board-empty">Chargement…</p> : (
        <div style={{ maxWidth: 760 }}>
          {cert?.statut === "certifie" && (
            <div style={{ background: "#DBF0D9", border: "1px solid #B6E0B0", borderRadius: 14, padding: "14px 16px", marginBottom: 16, color: "#1E6B1E", fontWeight: 700 }}>
              ✔ Vous êtes Refondateur Certifié (Leader). Vous pouvez créer et animer des Clubs.
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 10, background: "#EFE8F2", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#F27B6A,#C2452F)" }} />
            </div>
            <span style={{ fontWeight: 700, color: "#372646", fontSize: 14 }}>{nb}/{total}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s, i) => {
              const isDone = done.includes(s.key);
              return (
                <div key={s.key} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "14px 16px", background: isDone ? "#FCFBF8" : "#fff", display: "flex", gap: 14 }}>
                  <button onClick={() => toggle(s.key, isDone)} aria-label={isDone ? "Marquer non terminé" : "Marquer terminé"} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, border: isDone ? "none" : "2px solid #E3D7CC", background: isDone ? "#5E8A57" : "#fff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    {isDone && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                  </button>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#9C919E", textTransform: "uppercase", letterSpacing: ".03em" }}>Étape {i + 1}</div>
                    <h3 style={{ margin: "2px 0 6px", color: "#372646" }}>{s.titre}</h3>
                    <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, lineHeight: 1.55 }}>{s.contenu}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid #F0E6DD", paddingTop: 18 }}>
            {cert?.statut === "en_attente" ? (
              <div style={{ background: "#FCE3B4", border: "1px solid #F0D08A", borderRadius: 12, padding: "12px 16px", color: "#8A5A00", fontWeight: 700 }}>
                Votre demande de certification est en attente de validation par l'équipe Subsidium.
              </div>
            ) : cert?.statut === "certifie" ? null : (
              <>
                {cert?.statut === "refuse" && <p style={{ color: "#9C2A2A", marginBottom: 8 }}>Votre précédente demande n'a pas été retenue. Vous pouvez la représenter.</p>}
                <button className="btn btn-coral" onClick={demander} disabled={busy || !tousFaits}>
                  {busy ? "Envoi…" : "Demander la certification Leader"}
                </button>
                {!tousFaits && <p style={{ color: "#9C919E", fontSize: 13, marginTop: 8 }}>Terminez les {total} étapes pour pouvoir demander votre certification.</p>}
                {error && <p className="msg" style={{ marginTop: 8 }}>{error}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
