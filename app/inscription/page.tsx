"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Stepper from "@/components/Stepper";
import type { EvalSummary } from "@/components/AutoEvalChat";
import EvalFlow from "@/components/EvalFlow";
import { useT } from "@/components/LangProvider";

type Perso = { nom: string; prenom: string; situation: string; ville: string; pays: string };

export default function InscriptionPage() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Etape 1
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  // Etape 2
  const [perso, setPerso] = useState<Perso>({ nom: "", prenom: "", situation: "", ville: "", pays: "" });
  // Etape 3 : auto-evaluation (questionnaire ou agent, au choix — facultative)
  const [evalSummary, setEvalSummary] = useState<EvalSummary | null>(null);
  // Etape 4
  const [accepted, setAccepted] = useState(false);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  function next() {
    setError("");
    if (step === 0) {
      const e = validStep1();
      if (e) return setError(e);
    }
    if (step === 1) {
      const e = validStep2();
      if (e) return setError(e);
    }
    setStep((s) => s + 1);
  }

  async function finish() {
    setError("");
    if (!accepted) return setError(t("insc.s4.err.consent"));
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
          palier: evalSummary?.palier ?? null,
          score: evalSummary?.total ?? null,
          badge_n2: evalSummary?.badge_n2_octroyable ?? false,
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

  /* ---------- ecran de fin ---------- */
  if (done) {
    return (
      <AuthShell wide>
        <Stepper current={4} />
        <div className="done-wrap">
          <div className="done-check" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>{t("insc.done.title")}</h2>
          {evalSummary && (
            <p className="done-palier">
              {t("insc.done.palier")} <b>{evalSummary.palier}</b> · {evalSummary.total}/60
              {evalSummary.badge_n2_octroyable ? ` · ${t("insc.done.badge")}` : ""}
            </p>
          )}
          <p>{t("insc.done.p")}</p>
          <button className="btn btn-coral" onClick={() => router.push("/accueil")}>
            {t("insc.done.cta")}
          </button>
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

      <Stepper current={step} />

      {/* ---------- Etape 1 ---------- */}
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

      {/* ---------- Etape 2 ---------- */}
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

      {/* ---------- Etape 3 : auto-evaluation au choix (facultative) ---------- */}
      {step === 2 && (
        <>
          <h1 className="h-form">{t("insc.s3.title")}</h1>
          <p className="sub">{t("insc.s3.p1")}</p>
          <p className="sub">{t("insc.s3.p2")}</p>

          <EvalFlow onResult={setEvalSummary} onSkip={() => setStep(3)} />

          <div
            style={{
              marginTop: 18,
              background: "#FBF4EC",
              border: "1px solid #EBD9CD",
              borderLeft: "4px solid #F27B6A",
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#372646" }}>
              {t("insc.s3.next.title")}
            </p>
            <p style={{ margin: "0 0 8px", color: "#5E4A73" }}>
              {t("insc.s3.next.p")}
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#5E4A73" }}>
              <li>{t("insc.s3.next.b1")}</li>
              <li>{t("insc.s3.next.b2")}</li>
              <li>{t("insc.s3.next.b3")}</li>
              <li>{t("insc.s3.next.b4")}</li>
            </ul>
          </div>
        </>
      )}

      {/* ---------- Etape 4 : charte ---------- */}
      {step === 3 && (
        <>
          <h1 className="h-form">{t("insc.s4.title")}</h1>
          <p className="sub">{t("insc.s4.sub")}</p>
          <div className="charter">
            <p>{t("insc.s4.body1")}</p>
            <h4>{t("insc.s4.commit")}</h4>
            <p>{t("insc.s4.body2")}</p>
            <p className="muted" style={{ color: "var(--greymauve)", fontSize: ".82rem" }}>
              {t("insc.s4.note")}
            </p>
          </div>
          <label className="consent">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>{t("insc.s4.consent")}</span>
          </label>
        </>
      )}

      {error && <p className="msg" style={{ marginTop: 8 }}>{error}</p>}

      <div className="actions-end" style={{ marginTop: 22 }}>
        {step === 0 && <button className="btn btn-coral" onClick={next}>{t("insc.validate")}</button>}
        {step === 1 && <button className="btn btn-coral" onClick={next}>{t("insc.validate")}</button>}
        {step === 2 && (
          <button className="btn btn-coral" onClick={() => setStep(3)}>
            {evalSummary ? t("insc.continueCharte") : t("insc.skipContinueCharte")}
          </button>
        )}
        {step === 3 && <button className="btn btn-coral" onClick={finish} disabled={busy}>{busy ? t("insc.s4.busy") : t("insc.s4.cta")}</button>}
      </div>
    </AuthShell>
  );
}
