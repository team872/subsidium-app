import { query } from "./db";
import { setNiveau } from "./admin";

// Module Leader + Clubs. Parcours de formation Leader (MOOC light : leçons, points clés,
// ressources par étape) + demande de certification → validation admin (N3). Clubs.

export type LeaderLecon = { titre: string; corps: string };
export type LeaderRessource = { label: string; href?: string };
export type LeaderStep = { key: string; titre: string; contenu: string; lecons?: LeaderLecon[]; points_cles?: string[]; ressources?: LeaderRessource[] };
export type CertStatut = "en_attente" | "certifie" | "refuse";
export type CertRequest = { id: number; user_id: number; nom: string; prenom: string; email: string; niveau: number; created_at: string };
export type ClubDTO = { id: number; name: string; theme: string | null; descr: string; owner_id: number | null; members: number; grad: string };
export type ClubMember = { nom: string; prenom: string; role: string };
export type ClubPost = { id: number; corps: string; auteur: string; created_at: string };

export const LEADER_STEPS: LeaderStep[] = [
  {
    key: "comprendre", titre: "Comprendre la subsidiarité",
    contenu: "Au cœur de SUBSIDIUM, la subsidiarité confie chaque décision au niveau le plus proche des personnes concernées. Un Leader sait reconnaître qui est légitime pour agir, et créer les conditions pour que chacun prenne sa part. Cette étape pose le socle doctrinal de votre rôle.",
    lecons: [
      { titre: "Le principe", corps: "La subsidiarité confie chaque décision et chaque action au niveau le plus proche des personnes concernées, capable de l'assumer. L'échelon supérieur n'intervient que pour soutenir (subsidium = aide), jamais pour remplacer ce que le niveau local peut faire lui-même." },
      { titre: "Reconnaître qui est légitime", corps: "Avant d'agir, le Leader se demande : qui vit ce problème ? qui a la compétence et la légitimité pour décider ? Son rôle n'est pas de prendre la place, mais de créer les conditions pour que les bonnes personnes prennent la leur." },
      { titre: "Créer les conditions de l'autonomie", corps: "Soutenir sans confisquer : donner accès à l'information, aux ressources et à la méthode, puis se retirer. Un collectif qui décide par lui-même s'engage durablement ; un collectif à qui l'on dicte la solution se démobilise." },
    ],
    points_cles: ["Le niveau le plus proche d'abord", "Aider (subsidium), pas remplacer", "Repérer la légitimité avant d'agir", "Autonomie = engagement durable"],
    ressources: [{ label: "Charte d'engagement SUBSIDIUM", href: "/charte" }],
  },
  {
    key: "ethique", titre: "Incarner l'éthique du Refondateur",
    contenu: "Vérité, Respect, Responsabilité, Espérance : les quatre engagements de la charte ne se décrètent pas, ils s'incarnent. Un Leader est exemplaire dans sa manière de débattre, de décider et de rendre compte. On explore ici les situations concrètes où l'éthique se joue.",
    lecons: [
      { titre: "Quatre engagements vécus", corps: "Vérité, Respect, Responsabilité, Espérance ne sont pas des slogans : ils se jouent dans des situations concrètes — un désaccord vif, une rumeur, une décision difficile. Le Leader est regardé : sa cohérence fait autorité bien plus que son discours." },
      { titre: "L'exemplarité au quotidien", corps: "Dire la vérité même quand elle dérange, écouter celui avec qui l'on n'est pas d'accord, assumer ses erreurs publiquement, et garder le cap de l'espérance quand le groupe doute. C'est cette constance qui crée la confiance." },
      { titre: "Gérer les zones grises", corps: "L'éthique se révèle dans les cas ambigus : un raccourci tentant, un conflit d'intérêt discret, une parole blessante « pour de bon ». Le réflexe du Leader : ralentir, nommer l'enjeu, et choisir ce qui honore les quatre engagements." },
    ],
    points_cles: ["L'éthique se vit, ne se décrète pas", "La cohérence fait autorité", "Assumer ses erreurs publiquement", "Ralentir face aux zones grises"],
    ressources: [{ label: "Auto-évaluation éthique", href: "/auto-evaluation" }],
  },
  {
    key: "animer", titre: "Animer un collectif citoyen",
    contenu: "Faciliter la parole, accueillir le désaccord, faire émerger des décisions partagées : l'animation est un métier. Cette étape donne les méthodes pour conduire une réunion, structurer un débat et maintenir l'énergie d'un groupe dans la durée.",
    lecons: [
      { titre: "Faciliter la parole", corps: "Animer, ce n'est pas parler le plus : c'est faire parler. Tour de table, temps de silence, reformulation : le Leader répartit la parole, fait place aux plus discrets et empêche la confiscation par les plus à l'aise." },
      { titre: "Accueillir le désaccord", corps: "Le conflit d'idées est une ressource, pas une menace. Le Leader distingue la personne du propos, cherche le besoin derrière la position, et transforme l'opposition en matière à décider ensemble." },
      { titre: "Conduire une réunion utile", corps: "Un objectif clair, un ordre du jour minuté, une décision formulée et un relevé d'actions. Une réunion sans décision ni suite démobilise ; une réunion qui aboutit donne de l'énergie au groupe." },
    ],
    points_cles: ["Faire parler plutôt que parler", "Le désaccord est une ressource", "Objectif + décision + suite", "Protéger les voix discrètes"],
    ressources: [{ label: "Espace de travail d'un projet", href: "/projets" }],
  },
  {
    key: "piloter", titre: "Piloter un projet d'intérêt général",
    contenu: "De l'idée à l'action : cadrer un objectif, répartir les rôles, suivre l'avancement et lever les blocages. Le Leader transforme l'envie d'agir en résultats concrets, sans confisquer l'initiative collective.",
    lecons: [
      { titre: "Cadrer avant de courir", corps: "Un objectif précis (quoi, pour qui, pour quand), un périmètre assumé et des critères de réussite. Le pilotage commence par dire non à ce qui disperse, pour concentrer l'énergie sur l'essentiel." },
      { titre: "Répartir et suivre", corps: "Des rôles clairs, des jalons visibles, un point régulier. Le tableau de bord du projet (tâches, jalons) rend l'avancement tangible et permet de lever les blocages tôt, avant qu'ils ne s'enkystent." },
      { titre: "Sans confisquer l'initiative", corps: "Piloter n'est pas tout faire : c'est garantir que ça avance tout en laissant chacun porter sa part. Le Leader délègue de vraies responsabilités, pas seulement des tâches." },
    ],
    points_cles: ["Objectif précis et critères de réussite", "Rôles + jalons + point régulier", "Lever les blocages tôt", "Déléguer des responsabilités, pas que des tâches"],
    ressources: [{ label: "Créer et piloter un projet", href: "/projets" }],
  },
  {
    key: "transmettre", titre: "Transmettre et faire grandir",
    contenu: "Un Leader ne retient pas le pouvoir : il fait grandir d'autres Leaders. Mentorat, délégation, valorisation des réussites — cette dernière étape vous prépare à essaimer la démarche et à animer un Club.",
    lecons: [
      { titre: "Faire grandir d'autres Leaders", corps: "La réussite d'un Leader se mesure aux Leaders qu'il fait émerger. Repérer les talents, leur confier des espaces réels, les accompagner sans les couver : la démarche essaime par la confiance donnée." },
      { titre: "Mentorat et délégation", corps: "Transmettre, c'est rendre l'autre capable de se passer de soi. Montrer, faire faire, laisser faire, puis valoriser. La délégation est un acte de formation, pas un simple transfert de charge." },
      { titre: "Animer un Club", corps: "Le Club prolonge le parcours : un lieu durable où des citoyens se forment, partagent et lancent des actions. En tant que Leader certifié, vous pouvez créer et animer un Club pour faire vivre la démarche sur votre territoire." },
    ],
    points_cles: ["Se mesurer aux Leaders qu'on fait naître", "Montrer, faire faire, laisser faire", "Déléguer = former", "Le Club fait vivre la démarche"],
    ressources: [{ label: "Découvrir les Clubs", href: "/clubs" }],
  },
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
