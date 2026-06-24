import { query } from "./db";
import { ensureProjets } from "./projetsData";

// Work Room — espace de travail d'un projet d'Initiateur.
// Tâches internes, jalons (feuille de route) et documents/ressources.
// Réutilise projet_membres (membres) et projet_posts (discussion).
// Tables auto-créées à la demande (auto-contenu), sur le modèle de projetsData.

export type TacheStatut = "todo" | "doing" | "done";
export type WrTache = {
  id: number; titre: string; description: string; statut: TacheStatut;
  assignee_id: number | null; assignee: string | null; echeance: string | null; created_at: string;
};
export type WrJalon = { id: number; titre: string; fait: boolean; ordre: number; cible: string | null; created_at: string };
export type WrDoc = { id: number; nom: string; url: string | null; note: string; auteur: string | null; created_at: string };
export type WrMembre = { user_id: number; nom: string; prenom: string; role: string };
export type WrStats = {
  membres: number;
  taches: { todo: number; doing: number; done: number; total: number };
  jalons: { faits: number; total: number };
  docs: number; messages: number;
};

let ready: Promise<void> | null = null;
export function ensureWorkroom(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init(): Promise<void> {
  await ensureProjets(); // garantit projets / projet_membres / projet_posts
  await query(`
    CREATE TABLE IF NOT EXISTS workroom_taches (
      id SERIAL PRIMARY KEY,
      projet_id INT REFERENCES projets(id) ON DELETE CASCADE,
      titre TEXT NOT NULL, description TEXT,
      statut TEXT DEFAULT 'todo',
      assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_by INT REFERENCES users(id) ON DELETE SET NULL,
      echeance DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS workroom_jalons (
      id SERIAL PRIMARY KEY,
      projet_id INT REFERENCES projets(id) ON DELETE CASCADE,
      titre TEXT NOT NULL, fait BOOLEAN DEFAULT FALSE,
      ordre INT DEFAULT 0, cible DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS workroom_docs (
      id SERIAL PRIMARY KEY,
      projet_id INT REFERENCES projets(id) ON DELETE CASCADE,
      nom TEXT NOT NULL, url TEXT, note TEXT,
      uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

const AUTEUR = `COALESCE(NULLIF(TRIM(CONCAT(u.prenom,' ',u.nom)),''), u.email, 'Membre')`;

// ---- Membres (avec id, pour l'assignation) ----
export async function listWrMembers(projetId: number): Promise<WrMembre[]> {
  await ensureWorkroom();
  const rows = await query<any>(
    `SELECT m.user_id, u.nom, u.prenom, m.role FROM projet_membres m JOIN users u ON u.id=m.user_id
     WHERE m.projet_id=$1 ORDER BY (m.role='owner') DESC,(m.role='membre') DESC, m.joined_at ASC`, [projetId]);
  return rows.map((r) => ({ user_id: r.user_id, nom: r.nom || "", prenom: r.prenom || "", role: r.role || "suiveur" }));
}

// ---- Tâches ----
export async function listTaches(projetId: number): Promise<WrTache[]> {
  await ensureWorkroom();
  const rows = await query<any>(
    `SELECT t.id,t.titre,t.description,t.statut,t.assignee_id,t.echeance,t.created_at,
       (SELECT ${AUTEUR} FROM users u WHERE u.id=t.assignee_id) AS assignee
     FROM workroom_taches t WHERE t.projet_id=$1
     ORDER BY CASE t.statut WHEN 'doing' THEN 0 WHEN 'todo' THEN 1 ELSE 2 END, t.created_at DESC`, [projetId]);
  return rows.map((r) => ({
    id: r.id, titre: r.titre || "", description: r.description || "",
    statut: (["todo", "doing", "done"].includes(r.statut) ? r.statut : "todo") as TacheStatut,
    assignee_id: r.assignee_id, assignee: r.assignee || null,
    echeance: r.echeance ? String(r.echeance).slice(0, 10) : null, created_at: r.created_at,
  }));
}
export async function createTache(projetId: number, userId: number, f: { titre: string; description?: string; assignee_id?: number | null; echeance?: string | null }): Promise<number> {
  await ensureWorkroom();
  const rows = await query<{ id: number }>(
    `INSERT INTO workroom_taches (projet_id,titre,description,assignee_id,created_by,echeance)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [projetId, f.titre, f.description || null, f.assignee_id || null, userId, f.echeance || null]);
  return rows[0].id;
}
export async function updateTache(tacheId: number, f: { statut?: TacheStatut; assignee_id?: number | null }): Promise<void> {
  await ensureWorkroom();
  if (f.statut && ["todo", "doing", "done"].includes(f.statut))
    await query(`UPDATE workroom_taches SET statut=$2 WHERE id=$1`, [tacheId, f.statut]);
  if (f.assignee_id !== undefined)
    await query(`UPDATE workroom_taches SET assignee_id=$2 WHERE id=$1`, [tacheId, f.assignee_id || null]);
}
export async function deleteTache(tacheId: number): Promise<void> {
  await ensureWorkroom();
  await query(`DELETE FROM workroom_taches WHERE id=$1`, [tacheId]);
}
export async function getTacheProjet(tacheId: number): Promise<number | null> {
  await ensureWorkroom();
  const rows = await query<{ projet_id: number }>(`SELECT projet_id FROM workroom_taches WHERE id=$1`, [tacheId]);
  return rows[0]?.projet_id ?? null;
}

// ---- Jalons (feuille de route) ----
export async function listJalons(projetId: number): Promise<WrJalon[]> {
  await ensureWorkroom();
  const rows = await query<any>(`SELECT id,titre,fait,ordre,cible,created_at FROM workroom_jalons WHERE projet_id=$1 ORDER BY ordre ASC, id ASC`, [projetId]);
  return rows.map((r) => ({ id: r.id, titre: r.titre || "", fait: !!r.fait, ordre: r.ordre ?? 0, cible: r.cible ? String(r.cible).slice(0, 10) : null, created_at: r.created_at }));
}
export async function createJalon(projetId: number, f: { titre: string; cible?: string | null }): Promise<number> {
  await ensureWorkroom();
  const ord = await query<{ n: number }>(`SELECT COALESCE(MAX(ordre),0)+1 AS n FROM workroom_jalons WHERE projet_id=$1`, [projetId]);
  const rows = await query<{ id: number }>(`INSERT INTO workroom_jalons (projet_id,titre,cible,ordre) VALUES ($1,$2,$3,$4) RETURNING id`, [projetId, f.titre, f.cible || null, ord[0].n]);
  return rows[0].id;
}
export async function toggleJalon(jalonId: number, fait: boolean): Promise<void> {
  await ensureWorkroom();
  await query(`UPDATE workroom_jalons SET fait=$2 WHERE id=$1`, [jalonId, fait]);
}
export async function deleteJalon(jalonId: number): Promise<void> {
  await ensureWorkroom();
  await query(`DELETE FROM workroom_jalons WHERE id=$1`, [jalonId]);
}
export async function getJalonProjet(jalonId: number): Promise<number | null> {
  await ensureWorkroom();
  const rows = await query<{ projet_id: number }>(`SELECT projet_id FROM workroom_jalons WHERE id=$1`, [jalonId]);
  return rows[0]?.projet_id ?? null;
}

// ---- Documents / ressources ----
export async function listDocs(projetId: number): Promise<WrDoc[]> {
  await ensureWorkroom();
  const rows = await query<any>(
    `SELECT d.id,d.nom,d.url,d.note,d.created_at,(SELECT ${AUTEUR} FROM users u WHERE u.id=d.uploaded_by) AS auteur
     FROM workroom_docs d WHERE d.projet_id=$1 ORDER BY d.created_at DESC`, [projetId]);
  return rows.map((r) => ({ id: r.id, nom: r.nom || "", url: r.url || null, note: r.note || "", auteur: r.auteur || null, created_at: r.created_at }));
}
export async function createDoc(projetId: number, userId: number, f: { nom: string; url?: string | null; note?: string }): Promise<number> {
  await ensureWorkroom();
  const rows = await query<{ id: number }>(`INSERT INTO workroom_docs (projet_id,nom,url,note,uploaded_by) VALUES ($1,$2,$3,$4,$5) RETURNING id`, [projetId, f.nom, f.url || null, f.note || null, userId]);
  return rows[0].id;
}
export async function deleteDoc(docId: number): Promise<void> {
  await ensureWorkroom();
  await query(`DELETE FROM workroom_docs WHERE id=$1`, [docId]);
}
export async function getDocProjet(docId: number): Promise<number | null> {
  await ensureWorkroom();
  const rows = await query<{ projet_id: number }>(`SELECT projet_id FROM workroom_docs WHERE id=$1`, [docId]);
  return rows[0]?.projet_id ?? null;
}

// ---- Agrégat tableau de bord ----
export async function workroomStats(projetId: number): Promise<WrStats> {
  await ensureWorkroom();
  const [mem, tac, jal, doc, msg] = await Promise.all([
    query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM projet_membres WHERE projet_id=$1`, [projetId]),
    query<{ statut: string; n: number }>(`SELECT statut, COUNT(*)::int AS n FROM workroom_taches WHERE projet_id=$1 GROUP BY statut`, [projetId]),
    query<{ fait: boolean; n: number }>(`SELECT fait, COUNT(*)::int AS n FROM workroom_jalons WHERE projet_id=$1 GROUP BY fait`, [projetId]),
    query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM workroom_docs WHERE projet_id=$1`, [projetId]),
    query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM projet_posts WHERE projet_id=$1`, [projetId]),
  ]);
  const t = { todo: 0, doing: 0, done: 0, total: 0 };
  for (const r of tac) { if (r.statut === "todo") t.todo = r.n; else if (r.statut === "doing") t.doing = r.n; else if (r.statut === "done") t.done = r.n; }
  t.total = t.todo + t.doing + t.done;
  let faits = 0, totalJ = 0;
  for (const r of jal) { totalJ += r.n; if (r.fait) faits += r.n; }
  return { membres: mem[0].n, taches: t, jalons: { faits, total: totalJ }, docs: doc[0].n, messages: msg[0].n };
}
