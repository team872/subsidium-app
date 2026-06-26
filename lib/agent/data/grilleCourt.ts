import { GRILLE_V4, GrilleItem } from "./grille20";

export const COURT_ITEM_IDS = [1, 4, 8, 10, 13, 16, 18, 20];

export const GRILLE_COURT: GrilleItem[] = COURT_ITEM_IDS.map((id) => {
  const g = GRILLE_V4.find((x) => x.id === id);
  if (!g) throw new Error(`Item court ${id} absent de la grille V4`);
  return g;
});

export const COURT_PROJECTION = 60 / (GRILLE_COURT.length * 3);
