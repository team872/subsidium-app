"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez renseigner votre adresse mail et votre mot de passe.");
      return;
    }
    // TODO : authentification réelle (à brancher sur l'API)
    alert("Connexion simulée — à brancher sur l'authentification.");
  }

  return (
    <AuthShell>
      <h1 className="h-form">Accédez à votre compte</h1>
      <p className="sub">
        Pour vous connecter à votre compte, veuillez renseigner votre adresse mail et votre mot de passe.
      </p>

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Adresse mail</label>
          <input
            id="email"
            type="email"
            placeholder="Saisissez votre adresse mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="Saisissez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="between">
          <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        </div>

        {error && <p className="msg" style={{ marginBottom: 14 }}>{error}</p>}

        <div className="actions-end">
          <button type="submit" className="btn btn-coral">Se connecter</button>
        </div>
      </form>

      <p className="foot-note">
        Si vous ne disposez pas d'espace sur Subsidium, créez votre compte :{" "}
        <Link href="/inscription">Créez votre compte !</Link>
      </p>
    </AuthShell>
  );
}
