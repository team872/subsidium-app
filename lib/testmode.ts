import { cookies } from "next/headers";
import type { PublicUser } from "./data";
import { clampNiveau } from "./niveau";

/**
 * MODE TEST — aperçu « rendu seul » du parcours, réservé aux comptes de test.
 *
 * - Aucune écriture en base : on surcharge seulement le `niveau` DANS LA RÉPONSE de
 *   l'API, en fonction d'un cookie (l'index de niveau 0..4).
 * - Activé uniquement pour les emails listés dans la variable d'env `TEST_ACCOUNTS`
 *   (séparés par des virgules). Vide => personne n'est en mode test => barre invisible.
 * - La vraie progression (charte+paiement → N1, badge → N2, admin → N3/N4) reste l'unique
 *   chemin pour les vrais utilisateurs : ce module n'y touche pas.
 */
export const PREVIEW_COOKIE = "sub_preview";

export function isTestAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.TEST_ACCOUNTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** Surcharge le `niveau` affiché si (compte test) ET (cookie de prévisualisation valide). */
export function withPreview(user: PublicUser | null): { user: PublicUser | null; isTest: boolean } {
  if (!user) return { user, isTest: false };
  const test = isTestAccount(user.email);
  if (!test) return { user, isTest: false };

  let raw = "";
  try {
    raw = cookies().get(PREVIEW_COOKIE)?.value || "";
  } catch {
    raw = "";
  }
  if (raw === "") return { user, isTest: true }; // pas d'aperçu actif : vrai niveau

  const n = clampNiveau(Number(raw));
  return { user: { ...user, niveau: n }, isTest: true };
}
