import { ensureDb, query } from "./db";
import type { PublicUser } from "./data";

// Rôle administrateur : emails listés dans ADMIN_ACCOUNTS (séparés par des virgules),
// même logique que TEST_ACCOUNTS. Côté serveur uniquement.
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_ACCOUNTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export type MemberRow = {
  id: number; email: string; nom: string | null; prenom: string | null;
  niveau: number; badge_n2: boolean; charte_validee: boolean; paye: boolean; created_at: string;
};

export async function listMembers(): Promise<MemberRow[]> {
  await ensureDb();
  return query<MemberRow>(
    `SELECT id, email, nom, prenom, niveau, badge_n2, charte_validee, paye, created_at
     FROM users ORDER BY created_at DESC`
  );
}

// Fixe directement le niveau (0..4). Utilisé pour la validation humaine N3/N4.
// recomputeNiveau (parcours) n'abaisse jamais un niveau (max), donc un N3/N4 octroyé
// par l'admin n'est pas écrasé par une action de parcours ultérieure.
export async function setNiveau(userId: number, niveau: number): Promise<PublicUser | null> {
  await ensureDb();
  const n = Math.max(0, Math.min(4, Math.round(niveau)));
  await query(`UPDATE users SET niveau=$2 WHERE id=$1`, [userId, n]);
  const rows = await query<PublicUser>(
    `SELECT id,email,nom,prenom,situation,ville,pays,palier,score,badge_n2,niveau,charte_validee,paye,created_at FROM users WHERE id=$1`,
    [userId]
  );
  return rows[0] ?? null;
}
