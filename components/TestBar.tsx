"use client";

import React from "react";
import { NIVEAUX, clampNiveau } from "@/lib/niveau";

// Barre de navigation TEST (aperçu rendu-seul). Rendue uniquement si compte test.
// Les fleches changent le niveau AFFICHE via un cookie d'index (aucune ecriture en base).
// Raccourcis démo : ouvrir l'écran d'Inscription et l'écran de Paiement (simulé).
const COOKIE = "sub_preview";

function setPreview(index: number | null) {
  if (index == null) document.cookie = COOKIE + "=; path=/app; max-age=0";
  else document.cookie = COOKIE + "=" + index + "; path=/app; max-age=86400";
  window.location.reload();
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "rgba(255,255,255,.18)" : "#F27B6A",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    width: 30,
    height: 30,
    cursor: disabled ? "default" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };
}

const ghost: React.CSSProperties = {
  background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.4)",
  borderRadius: 999, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", opacity: 0.9,
};

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
  </svg>
);

export default function TestBar({ niveau, isTest }: { niveau: number; isTest: boolean }) {
  if (!isTest) return null;
  const idx = clampNiveau(niveau);
  const go = (delta: number) => {
    const ni = clampNiveau(idx + delta);
    if (ni !== idx) setPreview(ni);
  };
  async function resetParcours() {
    await fetch("/app/api/test/reset", { method: "POST" }).catch(() => {});
    setPreview(null); // efface l'aperçu + recharge : retour à Visiteur (niveau réel remis à 0)
  }
  const open = (path: string) => { window.location.href = path; };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: "calc(100vw - 24px)",
        background: "#372646",
        color: "#fff",
        borderRadius: 999,
        padding: "8px 14px",
        boxShadow: "0 10px 28px rgba(55,38,70,.35)",
        fontSize: 13,
        fontFamily: "system-ui, Arial, sans-serif",
      }}
      role="region"
      aria-label="Navigation de test du parcours"
    >
      <strong style={{ letterSpacing: ".07em", fontSize: 10.5, opacity: 0.75 }}>MODE TEST</strong>
      <button onClick={() => go(-1)} disabled={idx <= 0} style={btnStyle(idx <= 0)} aria-label="Niveau précédent" title="Niveau précédent">
        <Chevron dir="left" />
      </button>
      <span style={{ minWidth: 168, textAlign: "center", fontWeight: 700 }}>
        {NIVEAUX[idx]} <span style={{ opacity: 0.6, fontWeight: 400 }}>· N{idx}</span>
      </span>
      <button onClick={() => go(1)} disabled={idx >= NIVEAUX.length - 1} style={btnStyle(idx >= NIVEAUX.length - 1)} aria-label="Niveau suivant" title="Niveau suivant">
        <Chevron dir="right" />
      </button>
      <button onClick={() => setPreview(null)} style={ghost} title="Revenir au niveau réel du compte">Réel</button>
      <button onClick={resetParcours} style={ghost} title="Réinitialiser le parcours et repartir de Visiteur (compte test)">↺ Réinitialiser</button>

      <span style={{ width: 1, height: 18, background: "rgba(255,255,255,.25)", margin: "0 2px" }} aria-hidden="true" />
      <span style={{ fontSize: 10.5, opacity: 0.6 }}>ÉCRANS</span>
      <button onClick={() => open("/app/inscription")} style={ghost} title="Voir l'écran d'inscription du visiteur">Inscription</button>
      <button onClick={() => open("/app/charte")} style={ghost} title="Voir l'écran d'adhésion à la Charte">Charte</button>
      <button onClick={() => open("/app/paiement")} style={ghost} title="Voir la simulation de paiement de l'adhésion">Paiement</button>
    </div>
  );
}
