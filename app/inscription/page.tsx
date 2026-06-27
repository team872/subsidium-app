"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Stepper from "@/components/Stepper";
import { useT, useLang } from "@/components/LangProvider";

type Perso = { nom: string; prenom: string; situation: string; ville: string; pays: string };

// Écrans propres au tunnel dissocié : l'inscription crée un VISITEUR INSCRIT.
// La Charte (→ Refondateur) et l'auto-évaluation (→ Initiateur) sont des étapes ultérieures.
const LX: Record<string, {
  emailTaken: string; emailInvalid: string; checking: string;
  doneTitle: string; doneRole: string; doneP: string; ctaCharte: string; ctaSite: string;
}> = {
  fr: {
    emailTaken: "Un compte existe déjà avec cet e-mail. Connectez-vous ou utilisez une autre adresse.",
    emailInvalid: "Veuillez saisir une adresse e-mail valide.",
    checking: "Vérification…",
    doneTitle: "Bienvenue ! Votre compte est créé.",
    doneRole: "Vous êtes désormais Visiteur inscrit.",
    doneP: "Prochaine étape pour passer à l'action : adhérer à la Charte d'engagement et devenir Refondateur. Vous pouvez aussi explorer la plateforme dès maintenant.",
    ctaCharte: "Adhérer à la Charte",
    ctaSite: "Explorer la plateforme",
  },
  en: {
    emailTaken: "An account already exists with this e-mail. Sign in or use another address.",
    emailInvalid: "Please enter a valid e-mail address.",
    checking: "Checking…",
    doneTitle: "Welcome! Your account has been created.",
    doneRole: "You are now a Registered Visitor.",
    doneP: "Next step to take action: adopt the Charter of Commitment and become a Refounder. You can also explore the platform right now.",
    ctaCharte: "Adopt the Charter",
    ctaSite: "Explore the platform",
  },
  it: {
    emailTaken: "Esiste già un account con questa e-mail. Accedi o usa un altro indirizzo.",
    emailInvalid: "Inserisci un indirizzo e-mail valido.",
    checking: "Verifica…",
    doneTitle: "Benvenuto! Il tuo account è stato creato.",
    doneRole: "Ora sei un Visitatore registrato.",
    doneP: "Prossimo passo per agire: aderire alla Carta d'impegno e diventare Rifondatore. Puoi anche esplorare la piattaforma fin da subito.",
    ctaCharte: "Aderire alla Carta",
    ctaSite: "Esplorare la piattaforma",
  },
};

export default function InscriptionPage() {
  const router = useRouter();
  const t = useT();
  const { lang } = useLang();
  const L = LX[lang] || LX.fr;

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Etape 1 : informations de connexion
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  // Etape 2 : informations personnelles
  const [perso, setPerso] = useState<Perso>({ nom: "", prenom: "", situation: "", ville: "", pays: "" });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  // MODE DEMO : reserve aux comptes de test (meme detection que la barre MODE TEST).
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    fetch("/app/api/auth/me")
      .then((r) => r.json())
      .then((d) => setDemo(!!d.isTest))
      .catch(() => {});
  }, []);

  function back() {
    setError("");
    if (step === 0) router.push("/connexion");
    else setStep((s) => s - 1);
  }

  function validStep1() {
    if (!email || !pwd || !pwd2) return t("insc.err.fields");
    if (pwd !== pwd2) return t("insc.err.pwdMatch");
    if (pwd.length < 8) return t("insc.err.pwdLen");
    return "";
  }
  function validStep2() {
    const { nom, prenom, situation, ville, pays } = perso;
    if (!nom || !prenom || !situation || !ville || !pays) return t("insc.err.fields");
    return "";
  }

  async function next() {
    setError("");
    if (step !== 0) return;
    const e = validStep1();
    if (e) return setError(e);
    // Contrôle PRÉCOCE de disponibilité de l'e-mail (recette AN051).
    setChecking(true);
    try {
      const r = await fetch(`/app/api/auth/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const d = await r.json();
      setChecking(false);
      if (d.valid === false) return setError(L.emailInvalid);
      if (d.available === false) return setError(L.emailTaken);
    } catch {
      setChecking(false);
    }
    setStep(1);
  }

  async function finish() {
    setError("");
    const e = validStep2();
    if (e) return setError(e);
    setBusy(true);
    try {
      const r = await fetch("/app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pwd,
          nom: perso.nom,
          prenom: perso.prenom,
          situation: perso.situation,
          ville: perso.ville,
          pays: perso.pays,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || t("insc.err.register"));
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError(t("insc.err.registerOffline"));
      setBusy(false);
    }
  }

  // Barre flottante MODE DEMO (comptes test uniquement) — 2 étapes.
  function DemoBar() {
    if (!demo || done) return null;
    const labels = [t("insc.step1"), t("insc.step2")];
    return (
      <div
        style={{
          position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center",
          maxWidth: "calc(100vw - 24px)", background: "#372646", color: "#fff", borderRadius: 999,
          padding: "8px 14px", boxShadow: "0 10px 28px rgba(55,38,70,.35)", fontSize: 13,
          fontFamily: "system-ui, Arial, sans-serif",
        }}
        role="region"
        aria-label="Navigation de demo de l'inscription"
      >
        <strong style={{ letterSpacing: ".07em", fontSize: 10.5, opacity: 0.75 }}>MODE DÉMO</strong>
        <span style={{ fontSize: 10.5, opacity: 0.6 }}>PASSER À L'ÉTAPE</span>
        {[0, 1].map((i) => {
          const activeStep = step === i;
          return (
            <button
              key={i}
              onClick={() => { setError(""); setStep(i); }}
              title={labels[i]}
              style={{
                background: activeStep ? "#F27B6A" : "transparent",
                color: "#fff",
                border: activeStep ? "none" : "1px solid rgba(255,255,255,.4)",
                borderRadius: 999, width: 28, height: 28, cursor: "pointer",
                fontWeight: 700, fontSize: 13,
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    );
  }

  /* ---------- ecran de fin ---------- */
  if (done) {
    return (
      <AuthShell wide>
        <Stepper current={2} total={2} />
        <div className="done-wrap">
          <div className="done-check" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>{L.doneTitle}</h2>
          <p className="done-palier"><b>{L.doneRole}</b></p>
          <p>{L.doneP}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
            <button className="btn btn-coral" onClick={() => router.push("/charte")}>{L.ctaCharte}</button>
            <button
              className="btn"
              onClick={() => router.push("/accueil")}
              style={{ background: "#fff", color: "#372646", border: "1px solid #E3D7CC" }}
            >
              {L.ctaSite}
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell wide>
      <div className="wizard-head">
        <button className="back" onClick={back} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
          {step === 0 ? t("insc.back.connexion") : t("insc.back.prev")}
        </button>
      </div>

      <Stepper current={step} total={2} />

      {/* ---------- Etape 1 : informations de connexion ---------- */}
      {step === 0 && (
        <>
          <h1 className="h-form">{t("insc.s1.title")}</h1>
          <p className="sub">{t("insc.s1.sub")}</p>
          <div className="field">
            <label htmlFor="r-email">{t("insc.s1.email")}</label>
            <input id="r-email" type="email" placeholder={t("insc.s1.email.ph")} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="r-pwd">{t("insc.s1.pwd")}</label>
              <input id="r-pwd" type="password" placeholder={t("insc.s1.pwd.ph")} value={pwd} onChange={(e) => setPwd(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="r-pwd2">{t("insc.s1.pwd2")}</label>
              <input id="r-pwd2" type="password" placeholder={t("insc.s1.pwd2.ph")} value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {/* ---------- Etape 2 : informations personnelles ---------- */}
      {step === 1 && (
        <>
          <h1 className="h-form">{t("insc.s2.title")}</h1>
          <p className="sub">{t("insc.s2.sub")}</p>
          <div className="grid2">
            <div className="field">
              <label htmlFor="nom">{t("insc.s2.nom")}</label>
              <input id="nom" placeholder={t("insc.s2.nom.ph")} value={perso.nom} onChange={(e) => setPerso({ ...perso, nom: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="prenom">{t("insc.s2.prenom")}</label>
              <input id="prenom" placeholder={t("insc.s2.prenom.ph")} value={perso.prenom} onChange={(e) => setPerso({ ...perso, prenom: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="situation">{t("insc.s2.situation")}</label>
            <select id="situation" value={perso.situation} onChange={(e) => setPerso({ ...perso, situation: e.target.value })}>
              <option value="">{t("insc.select")}</option>
              <option value="Etudiant(e)">{t("insc.sit.student")}</option>
              <option value="En activite">{t("insc.sit.active")}</option>
              <option value="En recherche d'emploi">{t("insc.sit.seeking")}</option>
              <option value="Entrepreneur(e)">{t("insc.sit.entrepreneur")}</option>
              <option value="Retraite(e)">{t("insc.sit.retired")}</option>
              <option value="Autre">{t("insc.sit.other")}</option>
            </select>
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="ville">{t("insc.s2.ville")}</label>
              <input id="ville" placeholder={t("insc.s2.ville.ph")} value={perso.ville} onChange={(e) => setPerso({ ...perso, ville: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="pays">{t("insc.s2.pays")}</label>
              <select id="pays" value={perso.pays} onChange={(e) => setPerso({ ...perso, pays: e.target.value })}>
                <option value="">{t("insc.select")}</option>
                <option value="France">{t("insc.country.fr")}</option>
                <option value="Belgique">{t("insc.country.be")}</option>
                <option value="Suisse">{t("insc.country.ch")}</option>
                <option value="Italie">{t("insc.country.it")}</option>
                <option value="Autre">{t("insc.country.other")}</option>
              </select>
            </div>
          </div>
        </>
      )}

      {error && <p className="msg" style={{ marginTop: 8 }}>{error}</p>}

      <div className="actions-end" style={{ marginTop: 22 }}>
        {step === 0 && <button className="btn btn-coral" onClick={next} disabled={checking}>{checking ? L.checking : t("insc.validate")}</button>}
        {step === 1 && <button className="btn btn-coral" onClick={finish} disabled={busy}>{busy ? t("insc.s4.busy") : t("insc.validate")}</button>}
      </div>

      <DemoBar />
    </AuthShell>
  );
}
