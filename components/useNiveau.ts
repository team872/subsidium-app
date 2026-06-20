"use client";

import { useEffect, useState } from "react";
import { rangMaturite } from "@/lib/niveau";

// Récupère le niveau effectif de l'utilisateur (suit l'aperçu de la barre MODE TEST,
// car /api/auth/me renvoie déjà le palier surchargé pour les comptes test).
export function useNiveau() {
  const [rang, setRang] = useState(1); // optimiste (membre) le temps du chargement
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let on = true;
    fetch("/app/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!on) return;
        const u = d.user;
        setRang(u ? rangMaturite(u.palier, u.badge_n2) : 0);
        setReady(true);
      })
      .catch(() => on && setReady(true));
    return () => { on = false; };
  }, []);

  return { rang, ready };
}
