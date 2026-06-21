"use client";

import AppShell from "@/components/AppShell";
import CharteChat from "@/components/CharteChat";

export default function ChartePage() {
  return (
    <AppShell>
      <div className="board-head">
        <h1>Signature de la charte d&apos;engagement</h1>
      </div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 8px", lineHeight: 1.6 }}>
        Cette charte d&apos;engagement pose un cadre commun pour garantir des échanges respectueux, sincères
        et constructifs au sein de la communauté. En la validant, vous affirmez votre volonté de participer
        à cette démarche éthique dans un esprit de dialogue, de coopération et de responsabilité.
      </p>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>
        Les engagements proposés constituent un socle partagé — Vérité, Respect, Responsabilité, Espérance —
        qui visent à créer un espace de confiance, propice à la co-construction et à l&apos;expression citoyenne.
      </p>
      <div style={{ maxWidth: 760 }}>
        <CharteChat />
      </div>
    </AppShell>
  );
}
