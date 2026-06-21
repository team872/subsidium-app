import { query } from "./db";

// Module Missions (espace Initiateur). Tables creees et amorcees a la demande
// (auto-contenu, sans toucher l'init principal). Donnees seed issues de l'AVP (p98-104).

export type MissionDTO = {
  id: number; type: string; color: string; title: string; org: string;
  desc: string; profil: string; location: string | null; date: string;
};
export type CandidatureStatut = "en_attente" | "acceptee" | "refusee";
export type MyCandidatureDTO = MissionDTO & { statut: CandidatureStatut };

export const TYPE_COLOR: Record<string, string> = {
  "Bénévolat": "#F27B6A",
  "CDI": "#5E8A57",
  "CDD": "#5E7E91",
};

const SEED = [
  {
    type: "Bénévolat",
    title: "Animateur·rice d'ateliers citoyens sur la transition écologique",
    org: "Conseil Départemental de la Haute-Garonne",
    location: "Pl. du Capitole, 31000 Toulouse",
    date: "3 janvier",
    desc: "Dans le cadre d'un projet de concertation locale autour des mobilités douces, nous recherchons une personne pour accompagner l'animation des échanges entre habitants, associations et acteurs du territoire. La mission consiste à organiser et modérer des temps de discussion (en ligne et en présentiel), à synthétiser les contributions, à structurer les propositions issues des échanges et à participer à la formalisation de pistes d'actions concrètes. Vous interviendrez également dans la préparation de supports de restitution et dans la coordination avec les partenaires du projet.",
    profil: "Cette mission s'adresse à une personne sensible aux enjeux de transition écologique et de participation citoyenne, à l'aise dans l'animation de groupes et la facilitation d'échanges. Une bonne capacité d'écoute, de synthèse et de communication est essentielle. Aucune expertise technique spécifique n'est requise, mais une appétence pour les sujets de mobilité, d'aménagement du territoire ou de concertation publique est un plus. La mission est ouverte à des profils étudiants, en reconversion ou déjà engagés dans des projets citoyens.",
  },
  {
    type: "Bénévolat",
    title: "Facilitateur·rice de débats citoyens",
    org: "Ville de Toulouse", location: "Toulouse (31)", date: "3 janvier",
    desc: "Animer et modérer des discussions entre habitants autour de sujets locaux, encourager l'expression de tous les points de vue et veiller à la qualité des échanges.",
    profil: "Aisance à l'oral, neutralité et sens de l'écoute. Une expérience d'animation de réunions ou d'ateliers est appréciée.",
  },
  {
    type: "CDI",
    title: "Chargé·e de mobilisation locale",
    org: "Réseau Subsidium", location: "Toulouse (31)", date: "3 janvier",
    desc: "Aller à la rencontre des habitants, présenter les projets en cours, encourager les participations et relayer les initiatives citoyennes sur le territoire.",
    profil: "Sens du contact, autonomie et goût du terrain. Permis B apprécié.",
  },
  {
    type: "Bénévolat",
    title: "Coordinateur·rice de projet participatif",
    org: "Collectif Garonne", location: "Toulouse (31)", date: "3 janvier",
    desc: "Assurer le suivi d'un projet collaboratif, organiser les réunions, coordonner les contributeurs et veiller à la bonne avancée des actions.",
    profil: "Organisation, rigueur et capacité à fédérer. Une première expérience en gestion de projet est un plus.",
  },
  {
    type: "CDD",
    title: "Rédacteur·rice de synthèses citoyennes",
    org: "Subsidium", location: "Télétravail", date: "3 janvier",
    desc: "Rédiger des comptes rendus clairs et fidèles à partir des contributions et débats citoyens, pour en restituer l'essentiel à la communauté.",
    profil: "Excellentes qualités rédactionnelles, esprit de synthèse, rigueur et neutralité.",
  },
  {
    type: "CDD",
    title: "Ambassadeur·rice de la plateforme",
    org: "Subsidium", location: "France", date: "3 janvier",
    desc: "Faire connaître la démarche Subsidium, accompagner les nouveaux membres et animer la communauté en ligne comme sur le terrain.",
    profil: "Aisance relationnelle, enthousiasme et connaissance des réseaux et de la vie associative locale.",
  },
];

let ready: Promise<void> | null = null;
export function ensureMissions(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY, type TEXT, title TEXT NOT NULL, org TEXT,
      descr TEXT, profil TEXT, location TEXT, date_label TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS candidatures (
      id SERIAL PRIMARY KEY,
      mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      nom TEXT, prenom TEXT, email TEXT, presentation TEXT,
      statut TEXT DEFAULT 'en_attente', created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (mission_id, user_id)
    );
  `);
  const c = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM missions`);
  if (c[0].n === 0) {
    for (const m of SEED) {
      await query(
        `INSERT INTO missions (type,title,org,descr,profil,location,date_label)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [m.type, m.title, m.org, m.desc, m.profil, m.location, m.date]
      );
    }
  }
}

function mapMission(r: any): MissionDTO {
  return {
    id: r.id, type: r.type, color: TYPE_COLOR[r.type] || "#9C919E",
    title: r.title, org: r.org, desc: r.desc, profil: r.profil,
    location: r.location, date: r.date,
  };
}
const SELECT = `SELECT id, type, title, org, descr AS "desc", profil, location, date_label AS "date" FROM missions`;

export async function listMissions(): Promise<MissionDTO[]> {
  await ensureMissions();
  const rows = await query<any>(`${SELECT} ORDER BY id ASC`);
  return rows.map(mapMission);
}
export async function getMission(id: number): Promise<MissionDTO | null> {
  await ensureMissions();
  const rows = await query<any>(`${SELECT} WHERE id=$1`, [id]);
  return rows[0] ? mapMission(rows[0]) : null;
}
export async function hasCandidated(userId: number, missionId: number): Promise<boolean> {
  await ensureMissions();
  const rows = await query(`SELECT 1 FROM candidatures WHERE user_id=$1 AND mission_id=$2`, [userId, missionId]);
  return rows.length > 0;
}
export async function createCandidature(
  missionId: number, userId: number, f: { nom: string; prenom: string; email: string; presentation: string }
): Promise<boolean> {
  await ensureMissions();
  const rows = await query<{ id: number }>(
    `INSERT INTO candidatures (mission_id,user_id,nom,prenom,email,presentation)
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (mission_id,user_id) DO NOTHING RETURNING id`,
    [missionId, userId, f.nom, f.prenom, f.email, f.presentation]
  );
  return rows.length > 0;
}
export async function listMyCandidatures(userId: number): Promise<MyCandidatureDTO[]> {
  await ensureMissions();
  const rows = await query<any>(
    `SELECT m.id, m.type, m.title, m.org, m.descr AS "desc", m.profil, m.location, m.date_label AS "date", c.statut
     FROM candidatures c JOIN missions m ON m.id = c.mission_id
     WHERE c.user_id=$1 ORDER BY c.created_at DESC`,
    [userId]
  );
  return rows.map((r) => ({ ...mapMission(r), statut: (r.statut || "en_attente") as CandidatureStatut }));
}
