"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";

// Paiement SIMULÉ (provisoire). Le vrai Stripe sera branché ici plus tard.
const MONTANT = "20,00 €";

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  fr: {
    title: "Une contribution pour faire vivre la démarche",
    badge: "PAIEMENT SIMULÉ · TEST",
    doneTitle: "Paiement confirmé",
    doneBody: "Votre contribution est enregistrée (simulation). Si votre charte est validée, vous êtes désormais Refondateur et pouvez exprimer vos idées.",
    access: "Accéder à la plateforme",
    engage: "S'engager concrètement dans la démarche",
    p1: "La cotisation annuelle est une étape essentielle pour poursuivre votre engagement au sein de la communauté. Elle permet de faire vivre la plateforme, de garantir son indépendance et de soutenir le développement d'outils dédiés à la coopération citoyenne et à la transformation éthique.",
    p2: "En contribuant, vous participez activement à un projet collectif fondé sur des valeurs partagées et rendez possible l'émergence de projets citoyens durables, ouverts et responsables.",
    annual: "Annuel",
    cardNum: "Numéro de carte", expiry: "Expiration", cvc: "CVC",
    payErr: "Paiement impossible.", payErr2: "Paiement impossible pour le moment.",
    processing: "Traitement…", pay: "Procéder au paiement",
    secure: "Paiement sécurisé · Aucune transaction réelle (carte de test). Stripe réel à brancher ultérieurement.",
  },
  en: {
    title: "A contribution to keep the initiative alive",
    badge: "SIMULATED PAYMENT · TEST",
    doneTitle: "Payment confirmed",
    doneBody: "Your contribution is recorded (simulation). If your charter is validated, you are now a Refounder and can express your ideas.",
    access: "Access the platform",
    engage: "Commit concretely to the initiative",
    p1: "The annual membership fee is an essential step to continue your commitment within the community. It keeps the platform alive, guarantees its independence and supports the development of tools dedicated to citizen cooperation and ethical transformation.",
    p2: "By contributing, you actively take part in a collective project based on shared values and make possible the emergence of sustainable, open and responsible citizen projects.",
    annual: "Annual",
    cardNum: "Card number", expiry: "Expiry", cvc: "CVC",
    payErr: "Payment failed.", payErr2: "Payment failed for now.",
    processing: "Processing…", pay: "Proceed to payment",
    secure: "Secure payment · No real transaction (test card). Real Stripe to be connected later.",
  },
  it: {
    title: "Un contributo per dare vita all'iniziativa",
    badge: "PAGAMENTO SIMULATO · TEST",
    doneTitle: "Pagamento confermato",
    doneBody: "Il tuo contributo è registrato (simulazione). Se la tua Carta d'impegno è convalidata, ora sei Rifondatore e puoi esprimere le tue idee.",
    access: "Accedi alla piattaforma",
    engage: "Impegnarsi concretamente nell'iniziativa",
    p1: "La quota annuale è una tappa essenziale per proseguire il tuo impegno all'interno della comunità. Permette di dare vita alla piattaforma, di garantirne l'indipendenza e di sostenere lo sviluppo di strumenti dedicati alla cooperazione civica e alla trasformazione etica.",
    p2: "Contribuendo, partecipi attivamente a un progetto collettivo fondato su valori condivisi e rendi possibile la nascita di progetti civici sostenibili, aperti e responsabili.",
    annual: "Annuale",
    cardNum: "Numero della carta", expiry: "Scadenza", cvc: "CVC",
    payErr: "Pagamento impossibile.", payErr2: "Pagamento impossibile per ora.",
    processing: "Elaborazione…", pay: "Procedi al pagamento",
    secure: "Pagamento sicuro · Nessuna transazione reale (carta di test). Stripe reale da collegare in seguito.",
  },
};

export default function PaiementPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/app/api/progression/pay", { method: "POST" });
      const d = await r.json();
      if (!r.ok || d.error) { setError(d.error || tr.payErr); setBusy(false); return; }
      setDone(true);
    } catch {
      setError(tr.payErr2);
    }
    setBusy(false);
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>{tr.title}</h1>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div style={{ display: "inline-block", background: "#FBE7DC", color: "#5E4A73", fontSize: 12, fontWeight: 700, letterSpacing: ".04em", borderRadius: 999, padding: "4px 12px", marginBottom: 16 }}>
          {tr.badge}
        </div>

        {done ? (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 18, padding: 24, background: "#fff" }}>
            <h2 style={{ marginTop: 0, color: "#372646" }}>{tr.doneTitle}</h2>
            <p style={{ color: "#5E4A73" }}>{tr.doneBody}</p>
            <Link href="/accueil" className="btn btn-coral" style={{ display: "inline-block", marginTop: 6 }}>
              {tr.access}
            </Link>
          </div>
        ) : (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 18, padding: "26px 24px", background: "#fff" }}>
            <h2 style={{ margin: "0 0 10px", color: "#372646", fontSize: 18, textAlign: "center" }}>
              {tr.engage}
            </h2>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 10px" }}>{tr.p1}</p>
            <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: "0 0 18px" }}>{tr.p2}</p>

            <div style={{ textAlign: "center", background: "#FCF6F0", border: "1px solid #F0E6DD", borderRadius: 14, padding: "16px 12px", marginBottom: 18 }}>
              <div style={{ color: "#372646", fontWeight: 800, fontSize: 26 }}>{MONTANT}</div>
              <div style={{ color: "#9C919E", fontSize: 13 }}>{tr.annual}</div>
            </div>

            <label style={lbl}>{tr.cardNum}</label>
            <input style={inp} defaultValue="4242 4242 4242 4242" inputMode="numeric" />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{tr.expiry}</label>
                <input style={inp} defaultValue="12 / 34" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>{tr.cvc}</label>
                <input style={inp} defaultValue="123" />
              </div>
            </div>

            {error && <p className="msg" style={{ marginTop: 10 }}>{error}</p>}

            <button type="button" className="btn btn-coral" onClick={pay} disabled={busy} style={{ width: "100%", marginTop: 16 }}>
              {busy ? tr.processing : tr.pay}
            </button>
            <p style={{ color: "#9C919E", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>
              {tr.secure}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 13, color: "#5E4A73", margin: "10px 0 4px" };
const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", fontSize: 15, color: "#372646", background: "#FCF9F6" };
