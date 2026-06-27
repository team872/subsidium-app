"use client";

import { useT } from "./LangProvider";

// Conserve pour compatibilite d'import ; l'affichage utilise desormais les cles i18n.
export const STEPS = [
  "Mes informations de connexion",
  "Mes informations personnelles",
  "Mon auto-evaluation",
  "Signature de la charte d'engagement",
];

// `total` permet de n'afficher que les N premières étapes (tunnel d'inscription
// réduit à 2 étapes : compte + informations personnelles).
export default function Stepper({ current, total }: { current: number; total?: number }) {
  const t = useT();
  const all = [t("insc.step1"), t("insc.step2"), t("insc.step3"), t("insc.step4")];
  const labels = all.slice(0, Math.max(1, Math.min(all.length, total ?? all.length)));
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
