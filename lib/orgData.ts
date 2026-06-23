import { query } from "./db";

// Module Organisations (inc.1) : annuaire des organisations labellisées + fiche + création.
// Tables créées/amorcées à la demande. Données seed inspirées de l'AVP (p228-232).

export type OrgDTO = {
  id: number; name: string; type: string; region: string | null; desc: string;
  budget: number | null; benevoles: number | null; annee: number | null;
  adresse: string | null; telephone: string | null; email: string | null; site: string | null;
  labellisee: boolean; grad: string;
};

const GRADS = [
  "linear-gradient(135deg,#E8A98F,#C85A48)", "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)", "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)", "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];

const SEED = [
  {
    name: "CIDFF - Centre d'Information sur les Droits des Femmes et des Familles",
    type: "Établissement public", region: "Haute-Garonne",
    desc: "Le Centre d'Information sur les Droits des Femmes et des Familles (CIDFF) de la Haute-Garonne est une association loi 1901 dédiée à l'autonomie, à l'information et à l'accompagnement des femmes et du grand public dans leurs démarches juridiques, sociales et professionnelles. Son équipe pluridisciplinaire mobilise une approche globale et confidentielle pour défendre l'égalité entre les femmes et les hommes et promouvoir l'émancipation sociale.",
    budget: 100000, benevoles: 1160, annee: 1972,
    adresse: "95 Grande Rue Saint-Michel, 31400 Toulouse", telephone: "05 34 31 23 31", email: "cidff31@cidff31.fr", site: "https://fncidff.info", labellisee: true,
  },
  {
    name: "Association Aide Aux Familles", type: "Association", region: "Haute-Garonne",
    desc: "Association d'aide et d'accompagnement des familles : soutien à la parentalité, écoute et orientation vers les dispositifs locaux.",
    budget: null, benevoles: null, annee: null,
    adresse: "1 Imp. des Violettes, 31270 Cugnaux", telephone: null, email: null, site: null, labellisee: true,
  },
  {
    name: "APIAF", type: "Collectivité territoriale", region: "Haute-Garonne",
    desc: "Structure dédiée à l'accompagnement des femmes et à l'égalité : écoute, information et actions de prévention.",
    budget: null, benevoles: null, annee: null,
    adresse: "31 Rue de l'Étoile, 31000 Toulouse", telephone: null, email: null, site: null, labellisee: true,
  },
  {
    name: "MASE - Maisons de l'Action Sociale et de l'Emploi", type: "Établissement public", region: "Haute-Garonne",
    desc: "Accueil, accompagnement social et appui à l'insertion professionnelle sur le territoire.",
    budget: null, benevoles: null, annee: null,
    adresse: "11 Rue Vignemale, 31240 L'Union", telephone: null, email: null, site: null, labellisee: true,
  },
  {
    name: "Réso - Association Résilience Occitanie", type: "Association", region: "Occitanie",
    desc: "Association de solidarité en mouvement : mobilisation citoyenne, entraide et coordination d'actions de proximité.",
    budget: null, benevoles: null, annee: null,
    adresse: "13 Rue André Villet, 31432 Toulouse Cedex 4", telephone: null, email: null, site: null, labellisee: true,
  },
];

let ready: Promise<void> | null = null;
export function ensureOrg(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS organisations (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, type TEXT, region TEXT, descr TEXT,
      budget INT, benevoles INT, annee INT,
      adresse TEXT, telephone TEXT, email TEXT, site TEXT,
      labellisee BOOLEAN DEFAULT FALSE, owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS org_members (
      org_id INT REFERENCES organisations(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'membre',
      PRIMARY KEY (org_id, user_id)
    );
  `);
  const c = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM organisations`);
  if (c[0].n === 0) {
    for (const o of SEED) {
      await query(
        `INSERT INTO organisations (name,type,region,descr,budget,benevoles,annee,adresse,telephone,email,site,labellisee)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [o.name, o.type, o.region, o.desc, o.budget, o.benevoles, o.annee, o.adresse, o.telephone, o.email, o.site, o.labellisee]
      );
    }
  }
}

function mapOrg(r: any): OrgDTO {
  return {
    id: r.id, name: r.name, type: r.type, region: r.region, desc: r.desc,
    budget: r.budget, benevoles: r.benevoles, annee: r.annee,
    adresse: r.adresse, telephone: r.telephone, email: r.email, site: r.site,
    labellisee: !!r.labellisee, grad: GRADS[(r.id - 1) % GRADS.length],
  };
}
const SELECT = `SELECT id,name,type,region,descr AS "desc",budget,benevoles,annee,adresse,telephone,email,site,labellisee FROM organisations`;

export async function listOrganisations(labelliseesOnly = true): Promise<OrgDTO[]> {
  await ensureOrg();
  const rows = await query<any>(`${SELECT}${labelliseesOnly ? " WHERE labellisee = TRUE" : ""} ORDER BY name ASC`);
  return rows.map(mapOrg);
}
export async function getOrganisation(id: number): Promise<OrgDTO | null> {
  await ensureOrg();
  const rows = await query<any>(`${SELECT} WHERE id=$1`, [id]);
  return rows[0] ? mapOrg(rows[0]) : null;
}
export async function createOrganisation(
  ownerId: number,
  f: { name: string; type: string; region?: string; desc?: string; adresse?: string; telephone?: string; email?: string; site?: string }
): Promise<number> {
  await ensureOrg();
  const rows = await query<{ id: number }>(
    `INSERT INTO organisations (name,type,region,descr,adresse,telephone,email,site,labellisee,owner_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE,$9) RETURNING id`,
    [f.name, f.type, f.region || null, f.desc || null, f.adresse || null, f.telephone || null, f.email || null, f.site || null, ownerId]
  );
  const id = rows[0].id;
  await query(`INSERT INTO org_members (org_id,user_id,role) VALUES ($1,$2,'owner') ON CONFLICT DO NOTHING`, [id, ownerId]);
  return id;
}
export async function setLabellisee(id: number, labellisee: boolean): Promise<void> {
  await ensureOrg();
  await query(`UPDATE organisations SET labellisee=$2 WHERE id=$1`, [id, labellisee]);
}
