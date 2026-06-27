"use client";

import { useEffect } from "react";

// Boundary d'erreur Next.js : remplace tout plantage de rendu par un message
// utilisateur clair + bouton « Réessayer » (recette AN048 — trapper les erreurs).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Trace côté client (visible en console) sans exposer la pile à l'utilisateur.
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 16, padding: "30px 28px", boxShadow: "0 10px 30px rgba(55,38,70,.08)" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }} aria-hidden="true">🌱</div>
        <h2 style={{ color: "#372646", fontFamily: "var(--font-display),cursive", margin: "0 0 10px" }}>Une erreur est survenue</h2>
        <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 18px" }}>
          Désolé, quelque chose n'a pas fonctionné de notre côté. Vous pouvez réessayer ; si le problème persiste, n'hésitez pas à le signaler au support.
        </p>
        <button className="btn btn-coral" onClick={() => reset()}>Réessayer</button>
        {error?.digest && (
          <p style={{ color: "#9C919E", fontSize: 11, marginTop: 14 }}>Référence : {error.digest}</p>
        )}
      </div>
    </div>
  );
}
