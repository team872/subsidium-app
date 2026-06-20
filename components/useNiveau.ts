"use client";

import { useEffect, useState } from "react";
import { clampNiveau } from "@/lib/niveau";

// Récupère le niveau effectif de l'utilisateur depuis la base (/api/auth/me renvoie
// `niveau`, déjà surchargé pour les comptes test via l'aperçu de la barre MODE TEST).
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
        setRang(u ? clampNiveau(u.niveau) : 0);
        setReady(true);
      })
      .catch(() => on && setReady(true));
    return () => { on = false; };
  }, []);

  return { rang, ready };
}
