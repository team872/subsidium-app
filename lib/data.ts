import { ensureDb, query } from "./db";

export type PublicUser = {
  id: number; email: string; nom: string | null; prenom: string | null;
  situation: string | null; ville: string | null; pays: string | null;
  palier: string | null; score: number | null; badge_n2: boolean;
  created_at: string;
};

export function displayName(u: { prenom: string | null; nom: string | null; email: string }): string {
  const full = `${u.prenom ?? ""} ${u.nom ?? ""}`.trim();
  return full || u.email;
}

export async function getUserPublic(id: number): Promise<PublicUser | null> {
  await ensureDb();
  const rows = await query<PublicUser>(
    `SELECT id,email,nom,prenom,situation,ville,pays,palier,score,badge_n2,created_at FROM users WHERE id=$1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateUser(
  id: number,
  f: { nom?: string; prenom?: string; situation?: string; ville?: string; pays?: string }
): Promise<PublicUser | null> {
  await ensureDb();
  await query(
    `UPDATE users SET
       nom = COALESCE($2, nom),
       prenom = COALESCE($3, prenom),
       situation = COALESCE($4, situation),
       ville = COALESCE($5, ville),
       pays = COALESCE($6, pays)
     WHERE id = $1`,
    [id, f.nom ?? null, f.prenom ?? null, f.situation ?? null, f.ville ?? null, f.pays ?? null]
  );
  return getUserPublic(id);
}

export type IdeaDTO = {
  id: number; cat: string; color: string; title: string; desc: string;
  author: string; status: string | null; date: string; messages: number;
  location: string | null;
};

const IDEA_SELECT = `
  SELECT i.id, i.cat, i.color, i.title, i.descr AS "desc", i.author, i.status,
         i.date_label AS "date", i.location,
         (i.base_messages + (SELECT COUNT(*) FROM comments c WHERE c.idea_id = i.id))::int AS messages
  FROM ideas i`;

export async function listIdeas(): Promise<IdeaDTO[]> {
  await ensureDb();
  return query<IdeaDTO>(`${IDEA_SELECT} ORDER BY i.created_at DESC, i.id DESC`);
}

export async function getIdea(id: number): Promise<IdeaDTO | null> {
  await ensureDb();
  const rows = await query<IdeaDTO>(`${IDEA_SELECT} WHERE i.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createIdea(d: { cat: string; color: string; title: string; desc: string; author: string; authorId: number; location?: string | null }): Promise<IdeaDTO> {
  await ensureDb();
  const rows = await query<IdeaDTO>(
    `INSERT INTO ideas (cat,color,title,descr,author,author_id,status,base_messages,date_label,location)
     VALUES ($1,$2,$3,$4,$5,$6,'emise',0,to_char(now(),'DD/MM'),$7)
     RETURNING id, cat, color, title, descr AS "desc", author, status, date_label AS "date", location, 0 AS messages`,
    [d.cat, d.color, d.title, d.desc, d.author, d.authorId, d.location ?? null]
  );
  return rows[0];
}

export type CommentDTO = { id: number; author: string; body: string; created_at: string };

export async function listComments(ideaId: number): Promise<CommentDTO[]> {
  await ensureDb();
  return query<CommentDTO>(
    `SELECT id, author, body, created_at FROM comments WHERE idea_id=$1 ORDER BY created_at ASC`,
    [ideaId]
  );
}

export async function addComment(ideaId: number, userId: number, author: string, body: string): Promise<CommentDTO> {
  await ensureDb();
  const rows = await query<CommentDTO>(
    `INSERT INTO comments (idea_id,user_id,author,body) VALUES ($1,$2,$3,$4)
     RETURNING id, author, body, created_at`,
    [ideaId, userId, author, body]
  );
  return rows[0];
}

export async function isFollowing(userId: number, ideaId: number): Promise<boolean> {
  await ensureDb();
  const rows = await query(`SELECT 1 FROM follows WHERE user_id=$1 AND idea_id=$2`, [userId, ideaId]);
  return rows.length > 0;
}

export async function toggleFollow(userId: number, ideaId: number): Promise<boolean> {
  await ensureDb();
  if (await isFollowing(userId, ideaId)) {
    await query(`DELETE FROM follows WHERE user_id=$1 AND idea_id=$2`, [userId, ideaId]);
    return false;
  }
  await query(`INSERT INTO follows (user_id,idea_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [userId, ideaId]);
  return true;
}

export type EventDTO = { id: number; tag: string; title: string; desc: string; day: string; month: string; grad: string };

export async function listEvents(): Promise<EventDTO[]> {
  await ensureDb();
  return query<EventDTO>(`SELECT id, tag, title, descr AS "desc", day, month, grad FROM events ORDER BY id ASC`);
}

export async function userStats(userId: number): Promise<{ suivies: number; emises: number }> {
  await ensureDb();
  const a = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM follows WHERE user_id=$1`, [userId]);
  const b = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM ideas WHERE author_id=$1`, [userId]);
  return { suivies: a[0].n, emises: b[0].n };
}
