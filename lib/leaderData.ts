import { query } from "./db";
import { setNiveau } from "./admin";

// Module Leader + Clubs (« One More Thing »), version V1 incluse.
// - Parcours de formation Leader (étapes) + demande de certification → validation admin (N3).
// - Clubs : création (Leader N3+), adhésion, mur de partage.
// Tables créées/amorcées à la demande (auto-contenu).

export type LeaderStep = { key: string; titre: string; contenu: string };
export type CertStatut = "en_attente" | "certifie" | "refuse";
export type CertRequest = { id: number; user_id: number; nom: string; prenom: string; email: string; niveau: number; created_at: string };
export type ClubDTO = { id: number; name: string; theme: string | null; descr: string; owner_id: number | null; members: number; grad: string };
export type ClubMember = { nom: string; prenom: string; role: string };
export type ClubPost = { id: number; corps: string; auteur: string; created_at: string };

export const LEADER_STEPS: LeaderStep[] = [
  { key: "comprendre", titre: "Comprendre la subsidiarité", contenu: "Au cœur de SUBSIDIUM, la subsidiarité confie chaque décision au niveau le plus proche des personnes concernées. Un Leader sait reconnaître qui est légitime pour agir, et créer les conditions pour que chacun prenne sa part. Cette étape pose le socle doctrinal de votre rôle." },
  { key: "ethique", titre: "Incarner l'éthique du Refondateur", contenu: "Vérité, Respect, Responsabilité, Espérance : les quatre engagements de la charte ne se décrètent pas, ils s'incarnent. Un Leader est exemplaire dans sa manière de débattre, de décider et de rendre compte. On explore ici les situations concrètes où l'éthique se joue." },
  { key: "animer", titre: "Animer un collectif citoyen", contenu: "Faciliter la parole, accueillir le désaccord, faire émerger des décisions partagées : l'animation est un métier. Cette étape donne les méthodes pour conduire une réunion, structurer un débat et maintenir l'énergie d'un groupe dans la durée." },
  { key: "piloter", titre: "Piloter un projet d'intérêt général", contenu: "De l'idée à l'action : cadrer un objectif, répartir les rôles, suivre l'avancement et lever les blocages. Le Leader transforme l'envie d'agir en résultats concrets, sans confisquer l'initiative collective." },
  { key: "transmettre", titre: "Transmettre et faire grandir", contenu: "Un Leader ne retient pas le pouvoir : il fait grandir d'autres Leaders. Mentorat, délégation, valorisation des réussites — cette dernière étape vous prépare à essaimer la démarche et à animer un Club." },
];

const GRADS = [
  "linear-gradient(135deg,#E8A98F,#C85A48)", "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)", "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)", "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];

let ready: Promise<void> | null = null;
export function ensureLeader(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS leader_progress (
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      step_key TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (user_id, step_key)
    );
    CREATE TABLE IF NOT EXISTS leader_certifications (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      statut TEXT NOT NULL DEFAULT 'en_attente',
      created_at TIMESTAMPTZ DEFAULT now(),
      decided_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS clubs (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, theme TEXT, descr TEXT,
      owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS club_members (
      club_id INT REFERENCES clubs(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'membre',
      joined_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (club_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS club_posts (
      id SERIAL PRIMARY KEY,
      club_id INT REFERENCES clubs(id) ON DELETE CASCADE,
      author_id INT REFERENCES users(id) ON DELETE SET NULL,
      corps TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

// --- Parcours de formation ---

export async function listProgress(userId: number): Promise<string[]> {
  await ensureLeader();
  const rows = await query<{ step_key: string }>(`SELECT step_key FROM leader_progress WHERE user_id=$1`, [userId]);
  const valid = new Set(LEADER_STEPS.map((s) => s.key));
  return rows.map((r) => r.step_key).filter((k) => valid.has(k));
}
export async function toggleStep(userId: number, key: string, done: boolean): Promise<void> {
  await ensureLeader();
  if (!LEADER_STEPS.some((s) => s.key === key)) return;
  if (done) await query(`INSERT INTO leader_progress (user_id,step_key) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [userId, key]);
  else await query(`DELETE FROM leader_progress WHERE user_id=$1 AND step_key=$2`, [userId, key]);
}
export async function getCertification(userId: number): Promise<{ statut: CertStatut } | null> {
  await ensureLeader();
  const rows = await query<{ statut: CertStatut }>(`SELECT statut FROM leader_certifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`, [userId]);
  return rows[0] ?? null;
}
export async function requestCertification(userId: number): Promise<{ ok: boolean; error?: string }> {
  await ensureLeader();
  const done = await listProgress(userId);
  if (done.length < LEADER_STEPS.length) return { ok: false, error: "Terminez d'abord toutes les étapes du parcours." };
  const cur = await getCertification(userId);
  if (cur?.statut === "en_attente") return { ok: false, error: "Une demande de certification est déjà en attente." };
  if (cur?.statut === "certifie") return { ok: false, error: "Vous êtes déjà certifié Leader." };
  await query(`INSERT INTO leader_certifications (user_id) VALUES ($1)`, [userId]);
  return { ok: true };
}

// --- Certification (admin) ---

export async function listPendingCertifications(): Promise<CertRequest[]> {
  await ensureLeader();
  return query<CertRequest>(
    `SELECT c.id, c.user_id, c.created_at, u.nom, u.prenom, u.email, u.niveau
     FROM leader_certifications c JOIN users u ON u.id = c.user_id
     WHERE c.statut='en_attente' ORDER BY c.created_at ASC`
  );
}
export async function decideCertification(certId: number, approve: boolean): Promise<void> {
  await ensureLeader();
  const rows = await query<{ user_id: number }>(`SELECT user_id FROM leader_certifications WHERE id=$1`, [certId]);
  if (!rows[0]) return;
  await query(`UPDATE leader_certifications SET statut=$2, decided_at=now() WHERE id=$1`, [certId, approve ? "certifie" : "refuse"]);
  if (approve) await setNiveau(rows[0].user_id, 3);
}

// --- Clubs ---

function mapClub(r: any): ClubDTO {
  return { id: r.id, name: r.name, theme: r.theme, descr: r.descr || "", owner_id: r.owner_id, members: r.members ?? 0, grad: GRADS[(r.id - 1) % GRADS.length] };
}
export async function listClubs(): Promise<ClubDTO[]> {
  await ensureLeader();
  const rows = await query<any>(
    `SELECT id,name,theme,descr,owner_id,(SELECT COUNT(*)::int FROM club_members m WHERE m.club_id=clubs.id) AS members FROM clubs ORDER BY id DESC`
  );
  return rows.map(mapClub);
}
export async function getClub(id: number): Promise<ClubDTO | null> {
  await ensureLeader();
  const rows = await query<any>(
    `SELECT id,name,theme,descr,owner_id,(SELECT COUNT(*)::int FROM club_members m WHERE m.club_id=clubs.id) AS members FROM clubs WHERE id=$1`, [id]
  );
  return rows[0] ? mapClub(rows[0]) : null;
}
export async function createClub(ownerId: number, f: { name: string; theme?: string; descr?: string }): Promise<number> {
  await ensureLeader();
  const rows = await query<{ id: number }>(
    `INSERT INTO clubs (name,theme,descr,owner_id) VALUES ($1,$2,$3,$4) RETURNING id`,
    [f.name, f.theme || null, f.descr || null, ownerId]
  );
  const id = rows[0].id;
  await query(`INSERT INTO club_members (club_id,user_id,role) VALUES ($1,$2,'owner') ON CONFLICT DO NOTHING`, [id, ownerId]);
  return id;
}
export async function isClubMember(clubId: number, userId: number): Promise<boolean> {
  await ensureLeader();
  const rows = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM club_members WHERE club_id=$1 AND user_id=$2`, [clubId, userId]);
  return rows[0].n > 0;
}
export async function joinClub(clubId: number, userId: number): Promise<void> {
  await ensureLeader();
  await query(`INSERT INTO club_members (club_id,user_id,role) VALUES ($1,$2,'membre') ON CONFLICT DO NOTHING`, [clubId, userId]);
}
export async function leaveClub(clubId: number, userId: number): Promise<void> {
  await ensureLeader();
  await query(`DELETE FROM club_members WHERE club_id=$1 AND user_id=$2 AND role <> 'owner'`, [clubId, userId]);
}
export async function listClubMembers(clubId: number): Promise<ClubMember[]> {
  await ensureLeader();
  const rows = await query<any>(
    `SELECT u.nom, u.prenom, m.role FROM club_members m JOIN users u ON u.id=m.user_id WHERE m.club_id=$1 ORDER BY (m.role='owner') DESC, m.joined_at ASC`, [clubId]
  );
  return rows.map((r) => ({ nom: r.nom || "", prenom: r.prenom || "", role: r.role || "membre" }));
}
export async function listClubPosts(clubId: number): Promise<ClubPost[]> {
  await ensureLeader();
  const rows = await query<any>(
    `SELECT p.id,p.corps,p.created_at, COALESCE(NULLIF(TRIM(CONCAT(u.prenom,' ',u.nom)),''), u.email, 'Membre') AS auteur
     FROM club_posts p LEFT JOIN users u ON u.id=p.author_id WHERE p.club_id=$1 ORDER BY p.created_at DESC`, [clubId]
  );
  return rows.map((r) => ({ id: r.id, corps: r.corps || "", auteur: r.auteur, created_at: r.created_at }));
}
export async function createClubPost(clubId: number, userId: number, corps: string): Promise<number> {
  await ensureLeader();
  const rows = await query<{ id: number }>(`INSERT INTO club_posts (club_id,author_id,corps) VALUES ($1,$2,$3) RETURNING id`, [clubId, userId, corps]);
  return rows[0].id;
}
