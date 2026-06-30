import { query } from "./db";

// Module Projets (« Appels à projet ») — distinct des Idées. Niveau Initiateur (N2+).
// Liste tous/suivis/émis, création (+ privé), suivi, candidature, fil d'activité.
// Tables créées/amorcées à la demande (auto-contenu). Seed inspiré de l'AVP (Appels à projet).

export type ProjetDTO = {
  id: number; title: string; theme: string | null; desc: string; lieu: string | null;
  prive: boolean; owner_id: number | null; membres: number; grad: string; image: string | null;
};
export type CandStatut = "en_attente" | "acceptee" | "refusee";
export type ProjetCandidature = { id: number; nom: string; prenom: string; email: string; presentation: string; statut: CandStatut; created_at: string };
export type ProjetPost = { id: number; corps: string; auteur: string; created_at: string };
export type ProjetMembre = { nom: string; prenom: string; role: string };

const GRADS = [
  "linear-gradient(135deg,#E8A98F,#C85A48)", "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)", "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)", "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];

const SEED = [
  { title: "Cantine et jardins de quartier", theme: "Faire ensemble", lieu: "Toulouse (31)",
    desc: "Organiser une cantine solidaire et un jardin partagé au pied des immeubles, pour créer du lien et une alimentation locale et accessible. Le projet mobilise habitants, associations et commerçants du quartier." },
  { title: "Parcours d'insertion par le faire", theme: "Solidarité", lieu: "Toulouse (31)",
    desc: "Des chantiers collectifs qui permettent à des personnes éloignées de l'emploi de reprendre confiance en contribuant à des projets utiles au territoire." },
  { title: "Collectif citoyen pour l'éclairage des chemins", theme: "Mobilité", lieu: "Cugnaux (31)",
    desc: "Création d'un collectif citoyen pour améliorer l'éclairage et la sécurité des cheminements piétons entre les quartiers, en lien avec la municipalité." },
  { title: "Réseau d'entraide entre aînés et jeunes", theme: "Lien social", lieu: "L'Union (31)",
    desc: "Mettre en relation des aînés isolés et des jeunes volontaires pour des temps d'échange, d'aide numérique et de transmission." },
];

let ready: Promise<void> | null = null;
export function ensureProjets(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS projets (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, theme TEXT, descr TEXT, lieu TEXT,
      prive BOOLEAN DEFAULT FALSE, owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS projet_membres (
      projet_id INT REFERENCES projets(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'suiveur',
      joined_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (projet_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS projet_candidatures (
      id SERIAL PRIMARY KEY,
      projet_id INT REFERENCES projets(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      nom TEXT, prenom TEXT, email TEXT, presentation TEXT,
      statut TEXT DEFAULT 'en_attente', created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (projet_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS projet_posts (
      id SERIAL PRIMARY KEY,
      projet_id INT REFERENCES projets(id) ON DELETE CASCADE,
      author_id INT REFERENCES users(id) ON DELETE SET NULL,
      corps TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await query(`ALTER TABLE projets ADD COLUMN IF NOT EXISTS image TEXT`);
  const c = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM projets`);
  if (c[0].n === 0) {
    for (const p of SEED) {
      await query(`INSERT INTO projets (title,theme,descr,lieu,prive) VALUES ($1,$2,$3,$4,FALSE)`, [p.title, p.theme, p.desc, p.lieu]);
    }
  }
}

function mapProjet(r: any): ProjetDTO {
  return { id: r.id, title: r.title, theme: r.theme, desc: r.desc || "", lieu: r.lieu, prive: !!r.prive, owner_id: r.owner_id, membres: r.membres ?? 0, grad: GRADS[(r.id - 1) % GRADS.length], image: r.image ?? null };
}
const COLS = `id,title,theme,descr AS "desc",lieu,prive,owner_id,image,(SELECT COUNT(*)::int FROM projet_membres m WHERE m.projet_id=projets.id) AS membres`;

export async function listProjets(filter: string, userId: number | null): Promise<ProjetDTO[]> {
  await ensureProjets();
  if (filter === "suivis" && userId) {
    const rows = await query<any>(
      `SELECT ${COLS} FROM projets WHERE id IN (SELECT projet_id FROM projet_membres WHERE user_id=$1 AND role <> 'owner') ORDER BY id DESC`, [userId]);
    return rows.map(mapProjet);
  }
  if (filter === "emis" && userId) {
    const rows = await query<any>(`SELECT ${COLS} FROM projets WHERE owner_id=$1 ORDER BY id DESC`, [userId]);
    return rows.map(mapProjet);
  }
  const rows = await query<any>(
    `SELECT ${COLS} FROM projets WHERE prive = FALSE${userId ? " OR id IN (SELECT projet_id FROM projet_membres WHERE user_id=$1)" : ""} ORDER BY id DESC`,
    userId ? [userId] : []);
  return rows.map(mapProjet);
}
export async function getProjet(id: number): Promise<ProjetDTO | null> {
  await ensureProjets();
  const rows = await query<any>(`SELECT ${COLS} FROM projets WHERE id=$1`, [id]);
  return rows[0] ? mapProjet(rows[0]) : null;
}
export async function createProjet(ownerId: number, f: { title: string; theme?: string; desc?: string; lieu?: string; prive?: boolean; image?: string | null }): Promise<number> {
  await ensureProjets();
  const rows = await query<{ id: number }>(
    `INSERT INTO projets (title,theme,descr,lieu,prive,owner_id,image) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [f.title, f.theme || null, f.desc || null, f.lieu || null, !!f.prive, ownerId, f.image || null]);
  const id = rows[0].id;
  await query(`INSERT INTO projet_membres (projet_id,user_id,role) VALUES ($1,$2,'owner') ON CONFLICT DO NOTHING`, [id, ownerId]);
  return id;
}

// --- Passerelle « Porter ce projet » : transformer une idée (opportunité) en projet. ---
// Doctrine SUBSIDIUM : Opportunité => Projet => Work Room Initiateur (Blueprint §4.12.3).
// Réservé aux Initiateurs (contrôle de niveau dans la route API).
async function ensurePasserelle(): Promise<void> {
  await ensureProjets();
  await query(`ALTER TABLE projets ADD COLUMN IF NOT EXISTS origin_idea_id INT`);
  await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS projet_id INT`);
}

// Renvoie l'id du projet issu d'une idée (si elle a déjà été portée), sinon null.
export async function getIdeaProjet(ideaId: number): Promise<number | null> {
  await ensurePasserelle();
  const rows = await query<{ projet_id: number | null }>(`SELECT projet_id FROM ideas WHERE id=$1`, [ideaId]);
  return rows[0]?.projet_id ?? null;
}

// Transforme l'idée en projet (idempotent : renvoie le projet existant si déjà porté).
export async function porterIdeeEnProjet(ownerId: number, ideaId: number): Promise<{ projetId: number; already: boolean } | null> {
  await ensurePasserelle();
  const rows = await query<{ id: number; title: string; descr: string | null; cat: string | null; location: string | null; image: string | null; projet_id: number | null }>(
    `SELECT id, title, descr, cat, location, image, projet_id FROM ideas WHERE id=$1`, [ideaId]);
  const idea = rows[0];
  if (!idea) return null;
  if (idea.projet_id) return { projetId: idea.projet_id, already: true };
  const ins = await query<{ id: number }>(
    `INSERT INTO projets (title,theme,descr,lieu,prive,owner_id,image,origin_idea_id)
     VALUES ($1,$2,$3,$4,FALSE,$5,$6,$7) RETURNING id`,
    [idea.title, idea.cat || null, idea.descr || null, idea.location || null, ownerId, idea.image || null, ideaId]);
  const projetId = ins[0].id;
  await query(`INSERT INTO projet_membres (projet_id,user_id,role) VALUES ($1,$2,'owner') ON CONFLICT DO NOTHING`, [projetId, ownerId]);
  await query(`UPDATE ideas SET projet_id=$2 WHERE id=$1`, [ideaId, projetId]);
  await query(`INSERT INTO projet_posts (projet_id,author_id,corps) VALUES ($1,$2,$3)`,
    [projetId, ownerId, `Projet porté à partir de l'idée « ${idea.title} ».`]).catch(() => {});
  return { projetId, already: false };
}

export async function getMembership(projetId: number, userId: number): Promise<string | null> {
  await ensureProjets();
  const rows = await query<{ role: string }>(`SELECT role FROM projet_membres WHERE projet_id=$1 AND user_id=$2`, [projetId, userId]);
  return rows[0]?.role ?? null;
}
export async function follow(projetId: number, userId: number): Promise<void> {
  await ensureProjets();
  await query(`INSERT INTO projet_membres (projet_id,user_id,role) VALUES ($1,$2,'suiveur') ON CONFLICT DO NOTHING`, [projetId, userId]);
}
export async function unfollow(projetId: number, userId: number): Promise<void> {
  await ensureProjets();
  await query(`DELETE FROM projet_membres WHERE projet_id=$1 AND user_id=$2 AND role='suiveur'`, [projetId, userId]);
}
export async function listMembers(projetId: number): Promise<ProjetMembre[]> {
  await ensureProjets();
  const rows = await query<any>(
    `SELECT u.nom,u.prenom,m.role FROM projet_membres m JOIN users u ON u.id=m.user_id WHERE m.projet_id=$1 ORDER BY (m.role='owner') DESC,(m.role='membre') DESC,m.joined_at ASC`, [projetId]);
  return rows.map((r) => ({ nom: r.nom || "", prenom: r.prenom || "", role: r.role || "suiveur" }));
}
export async function hasCandidated(projetId: number, userId: number): Promise<boolean> {
  await ensureProjets();
  const rows = await query(`SELECT 1 FROM projet_candidatures WHERE projet_id=$1 AND user_id=$2`, [projetId, userId]);
  return rows.length > 0;
}
export async function candidater(projetId: number, userId: number, f: { nom: string; prenom: string; email: string; presentation: string }): Promise<boolean> {
  await ensureProjets();
  const rows = await query<{ id: number }>(
    `INSERT INTO projet_candidatures (projet_id,user_id,nom,prenom,email,presentation) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (projet_id,user_id) DO NOTHING RETURNING id`,
    [projetId, userId, f.nom, f.prenom, f.email, f.presentation]);
  return rows.length > 0;
}
export async function listCandidatures(projetId: number): Promise<ProjetCandidature[]> {
  await ensureProjets();
  const rows = await query<any>(
    `SELECT id,nom,prenom,email,presentation,statut,created_at FROM projet_candidatures WHERE projet_id=$1 ORDER BY created_at ASC`, [projetId]);
  return rows.map((r) => ({ id: r.id, nom: r.nom || "", prenom: r.prenom || "", email: r.email || "", presentation: r.presentation || "", statut: (r.statut || "en_attente") as CandStatut, created_at: r.created_at }));
}
export async function getCandidatureProjetId(candId: number): Promise<{ projet_id: number; user_id: number } | null> {
  await ensureProjets();
  const rows = await query<{ projet_id: number; user_id: number }>(`SELECT projet_id,user_id FROM projet_candidatures WHERE id=$1`, [candId]);
  return rows[0] ?? null;
}
export async function decideCandidature(candId: number, approve: boolean): Promise<void> {
  await ensureProjets();
  const c = await getCandidatureProjetId(candId);
  if (!c) return;
  await query(`UPDATE projet_candidatures SET statut=$2 WHERE id=$1`, [candId, approve ? "acceptee" : "refusee"]);
  if (approve) await query(`INSERT INTO projet_membres (projet_id,user_id,role) VALUES ($1,$2,'membre') ON CONFLICT (projet_id,user_id) DO UPDATE SET role='membre'`, [c.projet_id, c.user_id]);
}
export async function isOwner(projetId: number, userId: number): Promise<boolean> {
  await ensureProjets();
  const rows = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM projets WHERE id=$1 AND owner_id=$2`, [projetId, userId]);
  return rows[0].n > 0;
}
export async function listPosts(projetId: number): Promise<ProjetPost[]> {
  await ensureProjets();
  const rows = await query<any>(
    `SELECT p.id,p.corps,p.created_at, COALESCE(NULLIF(TRIM(CONCAT(u.prenom,' ',u.nom)),''), u.email, 'Membre') AS auteur
     FROM projet_posts p LEFT JOIN users u ON u.id=p.author_id WHERE p.projet_id=$1 ORDER BY p.created_at DESC`, [projetId]);
  return rows.map((r) => ({ id: r.id, corps: r.corps || "", auteur: r.auteur, created_at: r.created_at }));
}
export async function createPost(projetId: number, userId: number, corps: string): Promise<number> {
  await ensureProjets();
  const rows = await query<{ id: number }>(`INSERT INTO projet_posts (projet_id,author_id,corps) VALUES ($1,$2,$3) RETURNING id`, [projetId, userId, corps]);
  return rows[0].id;
}
