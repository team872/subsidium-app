import Link from "next/link";

// Page 404 conviviale (recette AN048 — message utilisateur clair).
export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", border: "1px solid #EBD9CD", borderRadius: 16, padding: "30px 28px" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }} aria-hidden="true">🧭</div>
        <h2 style={{ color: "#372646", fontFamily: "var(--font-display),cursive", margin: "0 0 10px" }}>Page introuvable</h2>
        <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 18px" }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/accueil" className="btn btn-coral">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
