export const STEPS = [
  "Mes informations de connexion",
  "Mes informations personnelles",
  "Mon auto-évaluation",
  "Signature de la charte d'engagement",
];

export default function Stepper({ current }: { current: number }) {
  return (
    <div className="stepper" role="list" aria-label="Étapes de l'inscription">
      {STEPS.map((label, i) => {
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
