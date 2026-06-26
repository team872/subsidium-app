export const LABELS = {
  statuts: {
    0: "Visiteur",
    1: "Refondateur",
    2: "Initiateur",
    3: "Refondateur Certifie",
    4: "Ambassadeur",
  } as Record<number, string>,
  paliersScore: {
    spectateur: [0, 20] as [number, number],
    acteur: [21, 40] as [number, number],
    transformateur: [41, 50] as [number, number],
    batisseur: [51, 60] as [number, number],
  },
};
