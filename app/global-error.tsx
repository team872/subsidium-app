"use client";

// Boundary d'erreur GLOBAL (couvre même les erreurs du layout racine).
// Doit rendre ses propres <html>/<body> (recette AN048).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif", background: "#FBF4EC" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 16, padding: "30px 28px" }}>
            <div style={{ fontSize: 42, marginBottom: 8 }} aria-hidden="true">🌱</div>
            <h2 style={{ color: "#372646", margin: "0 0 10px" }}>Une erreur est survenue</h2>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 18px" }}>
              Désolé, quelque chose n'a pas fonctionné. Vous pouvez réessayer ; si le problème persiste, contactez le support.
            </p>
            <button onClick={() => reset()} style={{ background: "#C2452F", color: "#fff", border: "none", borderRadius: 999, padding: "10px 22px", fontWeight: 700, cursor: "pointer" }}>Réessayer</button>
          </div>
        </div>
      </body>
    </html>
  );
}
