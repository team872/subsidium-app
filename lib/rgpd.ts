import { query, ensureDb } from "./db";

// Console RGPD — outillage de conformité côté administrateur :
//  - export des données personnelles d'un utilisateur (droit d'accès / portabilité),
//  - anonymisation (droit à l'effacement, sans casser l'intégrité référentielle),
//  - journal horodaté des actions RGPD.

let ready: Promise<void> | null = null;
export function ensureRgpd(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init() {
  await ensureDb();
  await query(`
    CREATE TABLE IF NOT EXISTS rgpd_log (
      id SERIAL PRIMARY KEY,
      actor_id INT, actor_email TEXT,
      action TEXT, target_user_id INT, target_email TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

async function safe(sql: string, params: any[]): Promise<any[]> {
  try { return await query<any>(sql, params); } catch { return []; }
}

// Rassemble toutes les données personnelles connues d'un utilisateur.
export async function exportUserData(userId: number): Promise<any> {
  await ensureRgpd();
  const profile = (await safe(`SELECT id,email,nom,prenom,situation,ville,pays,niveau,charte_validee,paye,badge_n2,created_at FROM users WHERE id=$1`, [userId]))[0] || null;
  const ideas = await safe(`SELECT id,title,descr,cat,location,date_label,created_at FROM ideas WHERE author_id=$1 ORDER BY id`, [userId]);
  const comments = await safe(`SELECT id,idea_id,body,created_at FROM comments WHERE user_id=$1 ORDER BY id`, [userId]);
  const follows = await safe(`SELECT idea_id FROM follows WHERE user_id=$1`, [userId]);
  const projets_membre = await safe(`SELECT projet_id,role,joined_at FROM projet_membres WHERE user_id=$1`, [userId]);
  const projet_candidatures = await safe(`SELECT projet_id,statut,created_at FROM projet_candidatures WHERE user_id=$1`, [userId]);
  const leader_progress = await safe(`SELECT step_key,created_at FROM leader_progress WHERE user_id=$1`, [userId]);
  const club_membre = await safe(`SELECT club_id,role,joined_at FROM club_members WHERE user_id=$1`, [userId]);
  const notifications = await safe(`SELECT id,type,message,read,created_at FROM notifications WHERE user_id=$1 ORDER BY id`, [userId]);
  return {
    exported_at: new Date().toISOString(),
    user: profile,
    ideas, comments,
    follows: follows.map((f) => f.idea_id),
    projets_membre, projet_candidatures, leader_progress, club_membre, notifications,
  };
}

// Anonymise un utilisateur : efface les données identifiantes tout en conservant l'intégrité
// référentielle (les contributions restent, mais sans identité rattachée).
export async function anonymizeUser(userId: number): Promise<void> {
  await ensureRgpd();
  const anonMail = `anonymise-${userId}@supprime.local`;
  await query(`UPDATE users SET nom=NULL, prenom=NULL, email=$2, situation=NULL, ville=NULL, pays=NULL WHERE id=$1`, [userId, anonMail]);
  await safe(`UPDATE ideas SET author='Utilisateur anonymisé' WHERE author_id=$1`, [userId]);
  await safe(`UPDATE comments SET author='Utilisateur anonymisé' WHERE user_id=$1`, [userId]);
  await safe(`DELETE FROM notifications WHERE user_id=$1`, [userId]);
  await safe(`DELETE FROM follows WHERE user_id=$1`, [userId]);
}

export async function logRgpd(actorId: number, actorEmail: string, action: string, targetUserId: number, targetEmail: string): Promise<void> {
  await ensureRgpd();
  await query(`INSERT INTO rgpd_log (actor_id,actor_email,action,target_user_id,target_email) VALUES ($1,$2,$3,$4,$5)`,
    [actorId, actorEmail, action, targetUserId, targetEmail]);
}

export type RgpdLog = { id: number; actor_email: string; action: string; target_user_id: number; target_email: string; created_at: string };
export async function listRgpdLog(limit = 50): Promise<RgpdLog[]> {
  await ensureRgpd();
  return query<RgpdLog>(`SELECT id,actor_email,action,target_user_id,target_email,created_at FROM rgpd_log ORDER BY id DESC LIMIT $1`, [limit]);
}
