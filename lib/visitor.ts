import { getUserId } from "./auth";
import { getUserPublic } from "./data";

// Nombre d'exemples montrés à un visiteur non payé, par module.
export const VISITOR_SAMPLE = 3;

// Visiteur « restreint » = connecté mais pas encore Refondateur (niveau < 1 = non payé).
// Pour ce profil, la visibilité est limitée (contenu officiel Subsidium uniquement,
// en quantité réduite, détails exploitables masqués, pages détail verrouillées) afin
// d'éviter la récupération d'informations utiles sans adhésion.
export async function isRestrictedVisitor(): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return true;
  const u = await getUserPublic(uid);
  return !u || (u.niveau ?? 0) < 1;
}
