"use client";

import type { EvalSummary } from "@/components/AutoEvalChat";
import { useLang } from "@/components/LangProvider";

// Écran de résultat d'auto-évaluation, partagé par le questionnaire et l'entretien.

const PALIER_NAME: Record<string, Record<string, string>> = {
  fr: { Spectateur: "Spectateur", Acteur: "Acteur", Transformateur: "Transformateur", "Bâtisseur": "Bâtisseur" },
  en: { Spectateur: "Observer", Acteur: "Actor", Transformateur: "Transformer", "Bâtisseur": "Builder" },
  it: { Spectateur: "Spettatore", Acteur: "Attore", Transformateur: "Trasformatore", "Bâtisseur": "Costruttore" },
};
const PALIER_DESC: Record<string, Record<string, string>> = {
  fr: {
    Spectateur: "Vous observez le réel avec lucidité. La prochaine étape : oser une première action concrète.",
    Acteur: "Vous agissez déjà concrètement. Consolidez la régularité et l'impact de votre engagement.",
    Transformateur: "Votre engagement est mûr et structurant : vous êtes prêt à porter des initiatives.",
    "Bâtisseur": "Engagement exemplaire et durable : vous inspirez et transmettez autour de vous.",
  },
  en: {
    Spectateur: "You observe reality with clarity. Next step: dare a first concrete action.",
    Acteur: "You already act concretely. Build the regularity and impact of your commitment.",
    Transformateur: "Your commitment is mature and structuring: you are ready to lead initiatives.",
    "Bâtisseur": "Exemplary and lasting commitment: you inspire and pass it on around you.",
  },
  it: {
    Spectateur: "Osservi la realtà con lucidità. Prossimo passo: osare una prima azione concreta.",
    Acteur: "Agisci già concretamente. Consolida la regolarità e l'impatto del tuo impegno.",
    Transformateur: "Il tuo impegno è maturo e strutturante: sei pronto a portare iniziative.",
    "Bâtisseur": "Impegno esemplare e duraturo: ispiri e trasmetti intorno a te.",
  },
};
type Dict = Record<string, string>;
const CHROME: Record<string, Dict> = {
  fr: {
    thanks: "Merci d'avoir pris le temps de réaliser l'auto-évaluation éthique !",
    reliab: "fiabilité", badge: "badge Initiateur N2", yes: "Oui", no: "Non",
    reserves: "Points de vigilance :", meaningTitle: "Ce que cela signifie.",
    meaningBody: "Ce résultat n'est pas un jugement, mais un point de départ. Votre palier reflète votre maturité citoyenne aujourd'hui. Le score /60 agrège vos réponses sur les dimensions éthiques (dignité, bien commun, responsabilité, subsidiarité, justice, sobriété, participation, transmission), et l'indice de fiabilité mesure la cohérence de vos réponses (et, pour l'entretien, leur appui sur des exemples concrets).",
    nextTitle: "Et ensuite.",
    nextYes: "Le badge Initiateur (N2) vous est accessible : vous pourrez porter des initiatives au sein de la communauté et faire grandir l'action collective.",
    nextNo: "En poursuivant votre engagement et en l'illustrant par des actions concrètes, vous pourrez viser le badge Initiateur (N2), à partir d'un score de 41/60.",
  },
  en: {
    thanks: "Thank you for taking the time to complete the ethical self-assessment!",
    reliab: "reliability", badge: "Initiator N2 badge", yes: "Yes", no: "No",
    reserves: "Points of attention:", meaningTitle: "What this means.",
    meaningBody: "This result is not a judgement but a starting point. Your level reflects your civic maturity today. The score /60 aggregates your answers across the ethical dimensions (dignity, common good, responsibility, subsidiarity, justice, restraint, participation, transmission), and the reliability index measures the consistency of your answers (and, for the interview, their grounding in concrete examples).",
    nextTitle: "What's next.",
    nextYes: "The Initiator badge (N2) is available to you: you will be able to lead initiatives within the community and grow collective action.",
    nextNo: "By continuing your commitment and illustrating it with concrete actions, you can aim for the Initiator badge (N2), from a score of 41/60.",
  },
  it: {
    thanks: "Grazie per aver dedicato del tempo all'autovalutazione etica!",
    reliab: "affidabilità", badge: "badge Iniziatore N2", yes: "Sì", no: "No",
    reserves: "Punti di attenzione:", meaningTitle: "Cosa significa.",
    meaningBody: "Questo risultato non è un giudizio ma un punto di partenza. Il tuo livello riflette la tua maturità civica di oggi. Il punteggio /60 aggrega le tue risposte sulle dimensioni etiche (dignità, bene comune, responsabilità, sussidiarietà, giustizia, sobrietà, partecipazione, trasmissione), e l'indice di affidabilità misura la coerenza delle tue risposte (e, per il colloquio, il loro fondamento su esempi concreti).",
    nextTitle: "E poi.",
    nextYes: "Il badge Iniziatore (N2) è accessibile: potrai portare iniziative nella comunità e far crescere l'azione collettiva.",
    nextNo: "Continuando il tuo impegno e illustrandolo con azioni concrete, potrai puntare al badge Iniziatore (N2), a partire da un punteggio di 41/60.",
  },
};

export default function EvalResult({ summary }: { summary: EvalSummary }) {
  const { lang } = useLang();
  const c = CHROME[lang] || CHROME.fr;
  const fiab = Math.round((summary.indice_fiabilite || 0) * 100);
  const palierName = (PALIER_NAME[lang] || PALIER_NAME.fr)[summary.palier] || summary.palier;
  const desc = (PALIER_DESC[lang] || PALIER_DESC.fr)[summary.palier] || "";
  const badge = summary.badge_n2_octroyable;

  return (
    <div className="eval-result">
      <p style={{ color: "#5E4A73", margin: "0 0 4px", fontWeight: 600 }}>{c.thanks}</p>
      <span className="eval-palier">{palierName}</span>
      {desc && <p style={{ color: "#372646", maxWidth: 560, margin: "0 auto 6px" }}>{desc}</p>}

      <div className="eval-kpis">
        <div className="kpi"><b>{summary.total}</b><small>/ 60</small></div>
        <div className="kpi"><b>{fiab}%</b><small>{c.reliab}</small></div>
        <div className={`kpi ${badge ? "ok" : "no"}`}>
          <b>{badge ? c.yes : c.no}</b><small>{c.badge}</small>
        </div>
      </div>

      {summary.reserves.length > 0 && (
        <p className="eval-reserves">{c.reserves} {summary.reserves.join(" · ")}</p>
      )}

      <div className="eval-note" style={{ maxWidth: 600, margin: "10px auto 0", textAlign: "left" }}>
        <p style={{ margin: "0 0 8px" }}>
          <b>{c.meaningTitle}</b> {c.meaningBody}
        </p>
        <p style={{ margin: 0 }}>
          <b>{c.nextTitle}</b>{" "}
          {badge ? c.nextYes : c.nextNo}
        </p>
      </div>
    </div>
  );
}
