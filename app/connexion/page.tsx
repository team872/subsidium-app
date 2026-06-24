"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { useT } from "@/components/LangProvider";

export default function ConnexionPage() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t("auth.login.err.empty"));
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || t("auth.login.err.fail"));
        setBusy(false);
        return;
      }
      router.push("/accueil");
    } catch {
      setError(t("auth.login.err.offline"));
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="h-form">{t("auth.login.title")}</h1>
      <p className="sub">{t("auth.login.sub")}</p>

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">{t("auth.email")}</label>
          <input
            id="email"
            type="email"
            placeholder={t("auth.email.ph")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">{t("auth.password")}</label>
          <input
            id="password"
            type="password"
            placeholder={t("auth.password.ph")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="between">
          <Link href="/mot-de-passe-oublie">{t("auth.forgot")}</Link>
        </div>

        {error && <p className="msg" style={{ marginBottom: 14 }}>{error}</p>}

        <div className="actions-end">
          <button type="submit" className="btn btn-coral" disabled={busy}>
            {busy ? t("auth.login.busy") : t("auth.login.cta")}
          </button>
        </div>
      </form>

      <p className="foot-note">
        {t("auth.noAccount")}{" "}
        <Link href="/inscription">{t("auth.createAccount")}</Link>
      </p>
    </AuthShell>
  );
}
