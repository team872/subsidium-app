import { cookies } from "next/headers";
import type { PublicUser } from "./data";

/**
 * MODE TEST — aperçu "rendu seul" du parcours, réservé aux comptes de test.
 *
 * - Aucune écriture en base : on surcharge seulement le `palier` (et `badge_n2`/`score`
 *   pour la cohérence d'affichage) DANS LA RÉPONSE de l'API, en fonction d'un cookie.
 * - Activé uniquement pour les emails listés dans la variable d'env `TEST_ACCOUNTS`
 *   (séparés par des virgules). Vide => personne n'est en mode test => barre invisible.
 * - La vraie progression (Charte+paiement -> N1, Auto-éval -> N2, admin -> N3/N4) reste
 *   l'unique chemin pour les vrais utilisateurs : ce module n'y touche pas.
 */
export const PALIERS = [
  "Visiteur",
  "Refondateur",
  "Initiateur",
  "Refondateur Certifié",
  "Ambassadeur",
] as const;

export const PREVIEW_COOKIE = "sub_preview";

export function isTestAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.TEST_ACCOUNTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/**
 * Applique l'aperçu de niveau si (compte test) ET (cookie de prévisualisation valide).
 * Retourne l'utilisateur (éventuellement surchargé) + le flag `isTest` pour l'UI.
 */
export function withPreview(user: PublicUser | null): { user: PublicUser | null; isTest: boolean } {
  if (!user) return { user, isTest: false };
  const test = isTestAccount(user.email);
  if (!test) return { user, isTest: false };

  let val = "";
  try {
    val = decodeURIComponent(cookies().get(PREVIEW_COOKIE)?.value || "");
  } catch {
    val = "";
  }
  const idx = (PALIERS as readonly string[]).indexOf(val);
  if (idx < 0) return { user, isTest: true }; // pas d'aperçu actif : on garde le vrai palier

  const hasBadge = idx >= 2; // Initiateur et au-delà
  return {
    user: { ...user, palier: PALIERS[idx], badge_n2: hasBadge, score: hasBadge ? 45 : null },
    isTest: true,
  };
}
