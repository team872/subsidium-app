import { query, ensureDb } from "./db";

// Actualités V1 — système éditorial au-dessus de la table `events` (même stockage que les
// événements affichés sur la page Actualités & événements). Ajoute la publication / édition /
// suppression par l'admin SUBSIDIUM, avec source et auteur. Colonnes ajoutées de façon idempotente.

export type ActualiteDTO = { id: number; tag: string; title: string; desc: string; day: string; month: string; grad: string; source: string | null; created_at: string | null };

const GRADS = [
  "linear-gradient(135deg,#E8A98F,#C85A48)", "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)", "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)", "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];
const MONTHS_FR = ["JANV.", "FÉVR.", "MARS", "AVR.", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."];
export const ACTU_TAGS = ["Nouveauté", "Concertation", "Forum", "Atelier", "Rencontre", "Récit"];

let ready: Promise<void> | null = null;
export function ensureActualites(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init() {
  await ensureDb();
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS source TEXT`);
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS author_id INT`);
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS org_id INT`);
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`);
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS image TEXT`);
}

function mapRow(r: any): ActualiteDTO {
  return { id: r.id, tag: r.tag, title: r.title, desc: r.desc || "", day: r.day, month: r.month, grad: r.grad, source: r.source || null, created_at: r.created_at || null };
}
const COLS = `id,tag,title,descr AS "desc",day,month,grad,source,created_at`;

export async function listActualites(): Promise<ActualiteDTO[]> {
  await ensureActualites();
  const rows = await query<any>(`SELECT ${COLS} FROM events ORDER BY COALESCE(created_at, to_timestamp(0)) DESC, id DESC`);
  return rows.map(mapRow);
}
export async function getActualite(id: number): Promise<ActualiteDTO | null> {
  await ensureActualites();
  const rows = await query<any>(`SELECT ${COLS} FROM events WHERE id=$1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}
export async function createActualite(f: { tag: string; title: string; desc: string; source?: string | null; authorId?: number | null; orgId?: number | null; image?: string | null; day?: string | null; month?: string | null }): Promise<number> {
  await ensureActualites();
  const dt = new Date();
  const day = (f.day && String(f.day).trim()) || String(dt.getDate());
  const month = (f.month && String(f.month).trim()) || MONTHS_FR[dt.getMonth()];
  const grad = GRADS[Math.floor(Math.random() * GRADS.length)];
  const rows = await query<{ id: number }>(
    `INSERT INTO events (tag,title,descr,day,month,grad,source,author_id,org_id,image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [f.tag, f.title, f.desc, day, month, grad, f.source || null, f.authorId || null, f.orgId || null, f.image || null]);
  return rows[0].id;
}
export async function updateActualite(id: number, f: { tag?: string; title?: string; desc?: string; source?: string | null }): Promise<void> {
  await ensureActualites();
  await query(
    `UPDATE events SET tag=COALESCE($2,tag), title=COALESCE($3,title), descr=COALESCE($4,descr), source=COALESCE($5,source) WHERE id=$1`,
    [id, f.tag ?? null, f.title ?? null, f.desc ?? null, f.source ?? null]);
}
export async function deleteActualite(id: number): Promise<void> {
  await ensureActualites();
  await query(`DELETE FROM events WHERE id=$1`, [id]);
}
