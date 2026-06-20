import { ensureDb, query } from "./db";
import { recomputeNiveau } from "./progression";

export type PublicUser = {
  id: number; email: string; nom: string | null; prenom: string | null;
  situation: string | null; ville: string | null; pays: string | null;
  palier: string | null; score: number | null; badge_n2: boolean;
  niveau: number; charte_validee: boolean; paye: boolean;
  created_at: string;
};

export function displayName(u: { prenom: string | null; nom: string | null; email: string }): string {
  const full = `${u.prenom ?? ""} ${u.nom ?? ""}`.trim();
  return full || u.email;
}

export async function getUserPublic(id: number): Promise<PublicUser | null> {
  await ensureDb();
  const rows = await query<PublicUser>(
    `SELECT id,email,nom,prenom,situation,ville,pays,palier,score,badge_n2,niveau,charte_validee,paye,created_at FROM users WHERE id=$1`,
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

// Applique une transition de progression (charte / paiement) puis recalcule le niveau.
export async function applyProgression(
  id: number,
  patch: { charte_validee?: boolean; paye?: boolean }
): Promise<PublicUser | null> {
  await ensureDb();
  await query(
    `UPDATE users SET
       charte_validee = COALESCE($2, charte_validee),
       paye = COALESCE($3, paye)
     WHERE id = $1`,
    [id, patch.charte_validee ?? null, patch.paye ?? null]
  );
  const u = await getUserPublic(id);
  if (!u) return null;
  const n = recomputeNiveau({
    niveau: u.niveau, charte_validee: u.charte_validee, paye: u.paye, badge_n2: u.badge_n2,
  });
  if (n !== u.niveau) {
    await query(`UPDATE users SET niveau = $2 WHERE id = $1`, [id, n]);
    return getUserPublic(id);
  }
  return u;
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

export type AttachmentMeta = { id: number; filename: string; mime: string; size: number; isImage: boolean };
export type CommentDTO = { id: number; author: string; body: string; created_at: string; attachment: AttachmentMeta | null };

function rowToComment(r: any): CommentDTO {
  const attachment: AttachmentMeta | null = r.att_id
    ? { id: r.att_id, filename: r.att_name, mime: r.att_mime, size: r.att_size, isImage: String(r.att_mime || "").startsWith("image/") }
    : null;
  return { id: r.id, author: r.author, body: r.body, created_at: r.created_at, attachment };
}

export async function listComments(ideaId: number): Promise<CommentDTO[]> {
  await ensureDb();
  const rows = await query<any>(
    `SELECT c.id, c.author, c.body, c.created_at,
            a.id AS att_id, a.filename AS att_name, a.mime AS att_mime, a.size AS att_size
     FROM comments c LEFT JOIN attachments a ON a.comment_id = c.id
     WHERE c.idea_id=$1 ORDER BY c.created_at ASC`,
    [ideaId]
  );
  return rows.map(rowToComment);
}

export type NewFile = { filename: string; mime: string; data: Buffer };

export async function addComment(
  ideaId: number, userId: number, author: string, body: string, file?: NewFile | null
): Promise<CommentDTO> {
  await ensureDb();
  const rows = await query<any>(
    `INSERT INTO comments (idea_id,user_id,author,body) VALUES ($1,$2,$3,$4)
     RETURNING id, author, body, created_at`,
    [ideaId, userId, author, body]
  );
  const c = rows[0];
  let attachment: AttachmentMeta | null = null;
  if (file) {
    const a = await query<any>(
      `INSERT INTO attachments (comment_id,filename,mime,size,data) VALUES ($1,$2,$3,$4,$5)
       RETURNING id, filename, mime, size`,
      [c.id, file.filename, file.mime, file.data.length, file.data]
    );
    attachment = { id: a[0].id, filename: a[0].filename, mime: a[0].mime, size: a[0].size, isImage: file.mime.startsWith("image/") };
  }
  return { id: c.id, author: c.author, body: c.body, created_at: c.created_at, attachment };
}

export async function getAttachment(id: number): Promise<{ filename: string; mime: string; size: number; data: Buffer } | null> {
  await ensureDb();
  const rows = await query<any>(`SELECT filename, mime, size, data FROM attachments WHERE id=$1`, [id]);
  if (!rows[0]) return null;
  return { filename: rows[0].filename, mime: rows[0].mime, size: rows[0].size, data: rows[0].data };
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

/* ---------- Notifications in-app ---------- */

export type NotificationDTO = {
  id: number; type: string; idea_id: number | null; actor: string | null;
  message: string; read: boolean; created_at: string;
};

// Notifie les abonnés d'une idée (et son auteur) lors d'une nouvelle participation,
// en excluant l'auteur du message.
export async function notifyNewComment(ideaId: number, actorId: number, actorName: string, commentId: number): Promise<void> {
  await ensureDb();
  const idea = await query<{ title: string; author_id: number | null }>(
    `SELECT title, author_id FROM ideas WHERE id=$1`, [ideaId]
  );
  if (!idea[0]) return;
  const followers = await query<{ user_id: number }>(`SELECT user_id FROM follows WHERE idea_id=$1`, [ideaId]);
  const ids = new Set<number>(followers.map((r) => r.user_id));
  if (idea[0].author_id) ids.add(idea[0].author_id);
  ids.delete(actorId);
  if (ids.size === 0) return;
  const message = `${actorName} a participé à la discussion sur « ${idea[0].title} »`;
  for (const uid of ids) {
    await query(
      `INSERT INTO notifications (user_id,type,idea_id,comment_id,actor,message) VALUES ($1,'comment',$2,$3,$4,$5)`,
      [uid, ideaId, commentId, actorName, message]
    );
  }
}

export async function listNotifications(userId: number, limit = 30): Promise<{ items: NotificationDTO[]; unread: number }> {
  await ensureDb();
  const items = await query<NotificationDTO>(
    `SELECT id, type, idea_id, actor, message, read, created_at
     FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  const u = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM notifications WHERE user_id=$1 AND read=FALSE`, [userId]);
  return { items, unread: u[0].n };
}

export async function markNotificationsRead(userId: number): Promise<void> {
  await ensureDb();
  await query(`UPDATE notifications SET read=TRUE WHERE user_id=$1 AND read=FALSE`, [userId]);
}
