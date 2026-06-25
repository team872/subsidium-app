"use client";

import AppShell from "@/components/AppShell";
import EvalFlow from "@/components/EvalFlow";
import type { EvalSummary } from "@/components/AutoEvalChat";
import { useLang } from "@/components/LangProvider";

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  fr: {
    title: "Mon auto-évaluation éthique",
    p1: "Cette auto-évaluation est un temps de réflexion bienveillant pour vous aider à mieux comprendre vos valeurs et votre engagement éthique.",
    p2: "Elle se compose de 20 questions simples, conçues pour vous inviter à réfléchir à vos pratiques et à vos convictions. L'évaluation ne devrait pas vous prendre plus de 30 minutes et peut être réalisée à votre rythme.",
    p3: "Son objectif est de vous accompagner dans votre démarche personnelle et de vous permettre de rejoindre une communauté de citoyens engagés, désireux de contribuer collectivement à des projets et des transformations éthiques.",
    choose: "Choisissez votre format pour commencer :",
  },
  en: {
    title: "My ethical self-assessment",
    p1: "This self-assessment is a caring moment of reflection to help you better understand your values and your ethical commitment.",
    p2: "It consists of 20 simple questions, designed to invite you to reflect on your practices and convictions. The assessment should not take more than 30 minutes and can be done at your own pace.",
    p3: "Its purpose is to support you in your personal journey and to allow you to join a community of committed citizens, eager to contribute collectively to ethical projects and transformations.",
    choose: "Choose your format to begin:",
  },
  it: {
    title: "La mia autovalutazione etica",
    p1: "Questa autovalutazione è un momento di riflessione benevolo per aiutarti a comprendere meglio i tuoi valori e il tuo impegno etico.",
    p2: "È composta da 20 domande semplici, pensate per invitarti a riflettere sulle tue pratiche e convinzioni. La valutazione non dovrebbe richiedere più di 30 minuti e può essere svolta al tuo ritmo.",
    p3: "Il suo obiettivo è accompagnarti nel tuo percorso personale e permetterti di unirti a una comunità di cittadini impegnati, desiderosi di contribuire collettivamente a progetti e trasformazioni etiche.",
    choose: "Scegli il tuo formato per iniziare:",
  },
};

export default function AutoEvaluationPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;

  function persist(s: EvalSummary | null) {
    if (!s) return;
    fetch("/app/api/progression/eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    }).catch(() => {});
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>{tr.title}</h1>
      </div>
      <div style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 10px" }}>{tr.p1}</p>
        <p style={{ margin: "0 0 10px" }}>{tr.p2}</p>
        <p style={{ margin: "0 0 12px" }}>{tr.p3}</p>
        <p style={{ margin: 0, fontWeight: 600, color: "#372646" }}>{tr.choose}</p>
      </div>
      <div style={{ maxWidth: 820 }}>
        <EvalFlow onResult={persist} />
      </div>
    </AppShell>
  );
}
