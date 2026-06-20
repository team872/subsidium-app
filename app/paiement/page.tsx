"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

// Paiement SIMULÉ (provisoire) pour tester le passage Visiteur -> Refondateur.
// Aucune transaction réelle : le bouton appelle /api/progression/pay (paye=true).
// Le vrai Stripe sera branché ici plus tard.
const MONTANT = "12 €"; // cotisation annuelle (placeholder)

export default function PaiementPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/app/api/progression/pay", { method: "POST" });
      const d = await r.json();
      if (!r.ok || d.error) { setError(d.error || "Paiement impossible."); setBusy(false); return; }
      setDone(true);
    } catch {
      setError("Paiement impossible pour le moment.");
    }
    setBusy(false);
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>Adhésion Subsidium</h1>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div style={{ display: "inline-block", background: "#FBE7DC", color: "#5E4A73", fontSize: 12, fontWeight: 700, letterSpacing: ".04em", borderRadius: 999, padding: "4px 12px", marginBottom: 14 }}>
          PAIEMENT SIMULÉ · TEST
        </div>

        {done ? (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 18, padding: 24, background: "#fff" }}>
            <h2 style={{ marginTop: 0, color: "#372646" }}>Paiement confirmé</h2>
            <p style={{ color: "#5E4A73" }}>
              Votre adhésion est réglée (simulation). Si votre charte est validée, vous êtes désormais
              <b> Refondateur</b> et pouvez exprimer vos idées.
            </p>
            <Link href="/accueil" className="btn btn-coral" style={{ display: "inline-block", marginTop: 6 }}>
              Accéder à la plateforme
            </Link>
          </div>
        ) : (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 18, padding: 24, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #F0E6DD", paddingBottom: 12, marginBottom: 16 }}>
              <span style={{ color: "#372646", fontWeight: 600 }}>Cotisation annuelle — passage Refondateur</span>
              <span style={{ color: "#372646", fontWeight: 800, fontSize: 18 }}>{MONTANT}</span>
            </div>

            <label style={lbl}>Numéro de carte</label>
            <input style={inp} defaultValue="4242 4242 4242 4242" inputMode="numeric" />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Expiration</label>
                <input style={inp} defaultValue="12 / 34" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>CVC</label>
                <input style={inp} defaultValue="123" />
              </div>
            </div>

            {error && <p className="msg" style={{ marginTop: 10 }}>{error}</p>}

            <button type="button" className="btn btn-coral" onClick={pay} disabled={busy} style={{ width: "100%", marginTop: 16 }}>
              {busy ? "Traitement…" : `Payer ${MONTANT} (simulation)`}
            </button>
            <p style={{ color: "#9C919E", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>
              Aucune transaction réelle. Carte de test pré-remplie. Stripe réel à brancher ultérieurement.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 13, color: "#5E4A73", margin: "10px 0 4px" };
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", fontSize: 15, color: "#372646", background: "#FCF9F6" };
