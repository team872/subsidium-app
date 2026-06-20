"use client";

import AppShell from "@/components/AppShell";
import CharteChat from "@/components/CharteChat";

export default function ChartePage() {
  return (
    <AppShell>
      <div className="board-head">
        <h1>Adhérer à la Charte</h1>
      </div>
      <p style={{ maxWidth: 720, color: "#5E4A73", margin: "0 0 18px" }}>
        Première étape du parcours : passer de Visiteur à Refondateur. L'agent vérifie votre adhésion
        aux principes d'engagement de Subsidium.
      </p>
      <div style={{ maxWidth: 760 }}>
        <CharteChat />
      </div>
    </AppShell>
  );
}
