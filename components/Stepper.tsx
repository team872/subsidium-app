"use client";

import { useT } from "./LangProvider";

// Conserve pour compatibilite d'import ; l'affichage utilise desormais les cles i18n.
export const STEPS = [
  "Mes informations de connexion",
  "Mes informations personnelles",
  "Mon auto-evaluation",
  "Signature de la charte d'engagement",
];

export default function Stepper({ current }: { current: number }) {
  const t = useT();
  const labels = [t("insc.step1"), t("insc.step2"), t("insc.step3"), t("insc.step4")];
  return (
    <div className="stepper" role="list" aria-label={t("insc.stepsAria")}>
      {labels.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div className={`step ${state}`} key={i} role="listitem" aria-current={i === current ? "step" : undefined}>
            <span className="dot">{i < current ? "✓" : i + 1}</span>
            <span className="nm">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
