"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { useLang } from "@/components/LangProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DICT: Record<string, {
  title: string; sub: string; email: string; emailPh: string; cta: string; busy: string;
  okTitle: string; okBody: string; note: string; back: string; errEmail: string;
}> = {
  fr: {
    title: "Mot de passe oublié",
    sub: "Saisissez l'adresse e-mail de votre compte. Si elle correspond à un compte, vous recevrez les instructions de réinitialisation.",
    email: "E-mail", emailPh: "vous@exemple.fr",
    cta: "Envoyer le lien", busy: "Envoi…",
    okTitle: "Demande enregistrée",
    okBody: "Si un compte est associé à cette adresse, vous recevrez prochainement un e-mail avec les instructions de réinitialisation. Pensez à vérifier vos courriers indésirables.",
    note: "Note : l'envoi automatique d'e-mails est en cours de finalisation. En attendant, contactez le support pour réinitialiser votre mot de passe.",
    back: "← Retour à la connexion", errEmail: "Veuillez saisir une adresse e-mail valide.",
  },
  en: {
    title: "Forgot password",
    sub: "Enter your account e-mail address. If it matches an account, you'll receive reset instructions.",
    email: "E-mail", emailPh: "you@example.com",
    cta: "Send the link", busy: "Sending…",
    okTitle: "Request received",
    okBody: "If an account is associated with this address, you'll soon receive an e-mail with reset instructions. Remember to check your spam folder.",
    note: "Note: automatic e-mail delivery is being finalised. In the meantime, contact support to reset your password.",
    back: "← Back to sign in", errEmail: "Please enter a valid e-mail address.",
  },
  it: {
    title: "Password dimenticata",
    sub: "Inserisci l'indirizzo e-mail del tuo account. Se corrisponde a un account, riceverai le istruzioni per il reset.",
    email: "E-mail", emailPh: "tu@esempio.it",
    cta: "Invia il link", busy: "Invio…",
    okTitle: "Richiesta registrata",
    okBody: "Se un account è associato a questo indirizzo, riceverai presto un'e-mail con le istruzioni per il reset. Controlla anche la cartella spam.",
    note: "Nota: l'invio automatico delle e-mail è in fase di finalizzazione. Nel frattempo, contatta il supporto per reimpostare la password.",
    back: "← Torna all'accesso", errEmail: "Inserisci un indirizzo e-mail valido.",
  },
};

export default function MotDePasseOubliePage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError(tr.errEmail);
      return;
    }
    setBusy(true);
    // Pas d'énumération des comptes : confirmation neutre côté client.
    // L'envoi réel d'e-mail sera branché avec la brique mail (cf. AN054).
    setTimeout(() => { setBusy(false); setSent(true); }, 400);
  }

  if (sent) {
    return (
      <AuthShell>
        <h1 className="h-form">{tr.okTitle}</h1>
        <p className="sub">{tr.okBody}</p>
        <p className="sub" style={{ color: "#9C919E", fontSize: ".85rem" }}>{tr.note}</p>
        <p className="foot-note"><Link href="/connexion">{tr.back}</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="h-form">{tr.title}</h1>
      <p className="sub">{tr.sub}</p>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="fp-email">{tr.email}</label>
          <input id="fp-email" type="email" placeholder={tr.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        {error && <p className="msg" style={{ marginBottom: 14 }}>{error}</p>}
        <div className="actions-end">
          <button type="submit" className="btn btn-coral" disabled={busy}>{busy ? tr.busy : tr.cta}</button>
        </div>
      </form>
      <p className="foot-note"><Link href="/connexion">{tr.back}</Link></p>
    </AuthShell>
  );
}
