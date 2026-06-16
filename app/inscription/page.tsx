"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Stepper, { STEPS } from "@/components/Stepper";
import { DIMENSIONS, SCALE } from "@/lib/autoEval";

type Perso = { nom: string; prenom: string; situation: string; ville: string; pays: string };

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [perso, setPerso] = useState<Perso>({ nom: "", prenom: "", situation: "", ville: "", pays: "" });
  const [activeDim, setActiveDim] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  function back() {
    setError("");
    if (step === 0) router.push("/connexion");
    else setStep((s) => s - 1);
  }

  function validStep1() {
    if (!email || !pwd || !pwd2) return "Veuillez remplir tous les champs.";
    if (pwd !== pwd2) return "Les deux mots de passe ne correspondent pas.";
    if (pwd.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    return "";
  }
  function validStep2() {
    const { nom, prenom, situation, ville, pays } = perso;
    if (!nom || !prenom || !situation || !ville || !pays) return "Veuillez remplir tous les champs.";
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

  function nextDimension() {
    if (activeDim < DIMENSIONS.length - 1) setActiveDim((d) => d + 1);
    else setStep(3);
  }

  function finish() {
    setError("");
    if (!accepted) return setError("Vous devez accepter la charte pour finaliser votre inscription.");
    // TODO : créer le compte via l'API (auth + base de données)
    setDone(true);
  }

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
          <h2>Votre engagement commence ici !</h2>
          <p>
            Votre compte a bien été créé. Bienvenue au sein de la communauté ! Vous pouvez désormais
            accéder à la plateforme et participer pleinement à la démarche citoyenne et éthique.
          </p>
          <button className="btn btn-coral" onClick={() => router.push("/accueil")}>
            Accéder à la plateforme
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
          {step === 0 ? "Connexion" : "Précédent"}
        </button>
      </div>

      <Stepper current={step} />

      {step === 0 && (
        <>
          <h1 className="h-form">Mes informations de connexion</h1>
          <p className="sub">Veuillez renseigner l'adresse e-mail qui vous permettra de vous connecter.</p>
          <div className="field">
            <label htmlFor="r-email">Votre adresse mail</label>
            <input id="r-email" type="email" placeholder="Adresse mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="r-pwd">Votre mot de passe</label>
              <input id="r-pwd" type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => setPwd(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="r-pwd2">Confirmation du mot de passe</label>
              <input id="r-pwd2" type="password" placeholder="Confirmation du mot de passe" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="h-form">Mes informations personnelles</h1>
          <p className="sub">
            Ce formulaire est destiné à la création de votre compte citoyen. Les informations recueillies
            seront utilisées exclusivement dans le cadre de la gestion de votre compte et de vos accès.
          </p>
          <div className="grid2">
            <div className="field">
              <label htmlFor="nom">Votre nom</label>
              <input id="nom" placeholder="Nom" value={perso.nom} onChange={(e) => setPerso({ ...perso, nom: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="prenom">Votre prénom</label>
              <input id="prenom" placeholder="Prénom" value={perso.prenom} onChange={(e) => setPerso({ ...perso, prenom: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="situation">Votre situation</label>
            <select id="situation" value={perso.situation} onChange={(e) => setPerso({ ...perso, situation: e.target.value })}>
              <option value="">Sélectionner</option>
              <option>Étudiant(e)</option>
              <option>En activité</option>
              <option>En recherche d'emploi</option>
              <option>Entrepreneur(e)</option>
              <option>Retraité(e)</option>
              <option>Autre</option>
            </select>
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="ville">Votre ville</label>
              <input id="ville" placeholder="Ville" value={perso.ville} onChange={(e) => setPerso({ ...perso, ville: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="pays">Votre pays</label>
              <select id="pays" value={perso.pays} onChange={(e) => setPerso({ ...perso, pays: e.target.value })}>
                <option value="">Sélectionner</option>
                <option>France</option>
                <option>Belgique</option>
                <option>Suisse</option>
                <option>Italie</option>
                <option>Autre</option>
              </select>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="h-form">Mon auto-évaluation éthique</h1>
          <div className="themebar">
            {DIMENSIONS.map((d, i) => (
              <button key={d.key} className={i === activeDim ? "on" : ""} onClick={() => setActiveDim(i)} type="button">
                {d.title.split(" ")[0]}
              </button>
            ))}
          </div>
          <h3 style={{ fontFamily: "var(--font-display), cursive", fontStyle: "italic", color: "var(--plum)", fontSize: "1.3rem", marginBottom: 18 }}>
            {DIMENSIONS[activeDim].title}
          </h3>
          {DIMENSIONS[activeDim].statements.map((st, si) => {
            const id = `${DIMENSIONS[activeDim].key}-${si}`;
            return (
              <div className="statement" key={id}>
                <p>{si + 1} — {st}</p>
                <div className="scale">
                  {SCALE.map((label, vi) => (
                    <button
                      key={label}
                      type="button"
                      className={answers[id] === vi ? "sel" : ""}
                      onClick={() => setAnswers({ ...answers, [id]: vi })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="h-form">Signature de la charte d'engagement</h1>
          <p className="sub">Lisez la charte SUBSIDIUM puis confirmez votre engagement pour rejoindre la communauté.</p>
          <div className="charter">
            <p>
              En rejoignant SUBSIDIUM, je choisis de ne plus rester spectateur du réel et de participer à une
              dynamique de transformation fondée sur la responsabilité, la coopération et le service du bien commun.
            </p>
            <h4>Je m'engage à :</h4>
            <p>
              respecter la <b>dignité</b> de chaque personne ; rechercher le <b>bien commun</b> ; assumer mes
              <b> responsabilités</b> ; pratiquer la <b>subsidiarité</b> et la <b>justice</b> ; agir avec
              <b> sobriété</b> ; favoriser la <b>participation</b> de chacun ; et <b>transmettre</b> ce que j'apprends.
            </p>
            <p style={{ color: "var(--greymauve)", fontSize: ".82rem" }}>
              (Texte de présentation — la charte officielle complète sera intégrée ici.)
            </p>
          </div>
          <label className="consent">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>J'ai lu et j'adhère à la charte d'engagement SUBSIDIUM.</span>
          </label>
        </>
      )}

      {error && <p className="msg" style={{ marginTop: 8 }}>{error}</p>}

      <div className="actions-end" style={{ marginTop: 22 }}>
        {step === 0 && <button className="btn btn-coral" onClick={next}>Valider mes informations</button>}
        {step === 1 && <button className="btn btn-coral" onClick={next}>Valider mes informations</button>}
        {step === 2 && (
          <button className="btn btn-coral" onClick={nextDimension}>
            {activeDim < DIMENSIONS.length - 1 ? "Suivant" : "Valider mon auto-évaluation"}
          </button>
        )}
        {step === 3 && <button className="btn btn-coral" onClick={finish}>Signer et finaliser mon inscription</button>}
      </div>
    </AuthShell>
  );
}
