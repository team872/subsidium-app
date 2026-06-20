"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

// Paiement SIMULÉ (provisoire) pour tester le passage Visiteur -> Refondateur.
// Aucune transaction réelle : le bouton appelle /api/progression/pay (paye=true).
// Le vrai Stripe sera branché ici plus tard.
// Textes et montant alignés sur l'AVP (écran « Une contribution pour faire vivre la démarche »).
const MONTANT = "20,00 €";

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
        <h1>Une contribution pour faire vivre la démarche</h1>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div style={{ display: "inline-block", background: "#FBE7DC", color: "#5E4A73", fontSize: 12, fontWeight: 700, letterSpacing: ".04em", borderRadius: 999, padding: "4px 12px", marginBottom: 16 }}>
          PAIEMENT SIMULÉ · TEST
        </div>

        {done ? (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 18, padding: 24, background: "#fff" }}>
            <h2 style={{ marginTop: 0, color: "#372646" }}>Paiement confirmé</h2>
            <p style={{ color: "#5E4A73" }}>
              Votre contribution est enregistrée (simulation). Si votre charte est validée, vous êtes désormais
              <b> Refondateur</b> et pouvez exprimer vos idées.
            </p>
            <Link href="/accueil" className="btn btn-coral" style={{ display: "inline-block", marginTop: 6 }}>
              Accéder à la plateforme
            </Link>
          </div>
        ) : (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 18, padding: "26px 24px", background: "#fff" }}>
            <h2 style={{ margin: "0 0 10px", color: "#372646", fontSize: 18, textAlign: "center" }}>
              S&apos;engager concrètement dans la démarche
            </h2>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 10px" }}>
              La cotisation annuelle est une étape essentielle pour poursuivre votre engagement au sein de la
              communauté. Elle permet de faire vivre la plateforme, de garantir son indépendance et de soutenir
              le développement d&apos;outils dédiés à la coopération citoyenne et à la transformation éthique.
            </p>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 18px" }}>
              En contribuant, vous participez activement à un projet collectif fondé sur des valeurs partagées et
              rendez possible l&apos;émergence de projets citoyens durables, ouverts et responsables.
            </p>

            <div style={{ textAlign: "center", background: "#FCF6F0", border: "1px solid #F0E6DD", borderRadius: 14, padding: "16px 12px", marginBottom: 18 }}>
              <div style={{ color: "#372646", fontWeight: 800, fontSize: 26 }}>{MONTANT}</div>
              <div style={{ color: "#9C919E", fontSize: 13 }}>Annuel</div>
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
              {busy ? "Traitement…" : "Procéder au paiement"}
            </button>
            <p style={{ color: "#9C919E", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>
              Paiement sécurisé · Aucune transaction réelle (carte de test). Stripe réel à brancher ultérieurement.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 13, color: "#5E4A73", margin: "10px 0 4px" };
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", fontSize: 15, color: "#372646", background: "#FCF9F6" };
