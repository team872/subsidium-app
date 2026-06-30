import { query } from "./db";

// Module Organisations : annuaire des organisations labellisées + fiche + création (inc.1)
// + espace membre (mes organisations) et publications propositions/réussites (inc.2).
// Tables créées/amorcées à la demande. Données seed inspirées de l'AVP (p228-232).

export type OrgDTO = {
  id: number; name: string; type: string; region: string | null; desc: string;
  budget: number | null; benevoles: number | null; annee: number | null;
  adresse: string | null; telephone: string | null; email: string | null; site: string | null;
  labellisee: boolean; grad: string; image: string | null;
};
export type OrgMembership = OrgDTO & { role: string };
export type PublicationDTO = {
  id: number; org_id: number; kind: "proposition" | "reussite";
  titre: string; corps: string; auteur: string; created_at: string;
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
    CREATE TABLE IF NOT EXISTS org_publications (
      id SERIAL PRIMARY KEY,
      org_id INT REFERENCES organisations(id) ON DELETE CASCADE,
      author_id INT REFERENCES users(id) ON DELETE SET NULL,
      kind TEXT NOT NULL DEFAULT 'proposition',
      titre TEXT NOT NULL, corps TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await query(`ALTER TABLE organisations ADD COLUMN IF NOT EXISTS image TEXT`);
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
    labellisee: !!r.labellisee, grad: GRADS[(r.id - 1) % GRADS.length], image: r.image ?? null,
  };
}
const SELECT = `SELECT id,name,type,region,descr AS "desc",budget,benevoles,annee,adresse,telephone,email,site,labellisee,image FROM organisations`;

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

// --- Visibilité restreinte (visiteur non payé) ---
// Le contenu « officiel Subsidium » est celui sans propriétaire (seed) : owner_id IS NULL.
// Le contenu créé par un membre a un owner_id : il n'est PAS exposé au visiteur.
// On masque en plus les détails exploitables (adresse, contacts, KPIs) et on tronque la description.
export function maskOrg(o: OrgDTO): OrgDTO {
  const d = o.desc || "";
  return {
    ...o, adresse: null, telephone: null, email: null, site: null, budget: null, benevoles: null,
    desc: d.length > 160 ? d.slice(0, 160).replace(/\s+\S*$/, "") + "…" : d,
  };
}
export async function listOrganisationsVisitor(limit: number): Promise<OrgDTO[]> {
  await ensureOrg();
  const rows = await query<any>(`${SELECT} WHERE labellisee = TRUE AND owner_id IS NULL ORDER BY name ASC LIMIT $1`, [limit]);
  return rows.map(mapOrg).map(maskOrg);
}
export async function countOrganisationsLabellisees(): Promise<number> {
  await ensureOrg();
  const r = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM organisations WHERE labellisee = TRUE`);
  return r[0].n;
}

export async function createOrganisation(
  ownerId: number,
  f: { name: string; type: string; region?: string; desc?: string; adresse?: string; telephone?: string; email?: string; site?: string; image?: string | null }
): Promise<number> {
  await ensureOrg();
  const rows = await query<{ id: number }>(
    `INSERT INTO organisations (name,type,region,descr,adresse,telephone,email,site,labellisee,owner_id,image)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE,$9,$10) RETURNING id`,
    [f.name, f.type, f.region || null, f.desc || null, f.adresse || null, f.telephone || null, f.email || null, f.site || null, ownerId, f.image || null]
  );
  const id = rows[0].id;
  await query(`INSERT INTO org_members (org_id,user_id,role) VALUES ($1,$2,'owner') ON CONFLICT DO NOTHING`, [id, ownerId]);
  return id;
}
export async function setLabellisee(id: number, labellisee: boolean): Promise<void> {
  await ensureOrg();
  await query(`UPDATE organisations SET labellisee=$2 WHERE id=$1`, [id, labellisee]);
}

// --- inc.2 : espace membre + publications ---

export async function listMyOrganisations(userId: number): Promise<OrgMembership[]> {
  await ensureOrg();
  const rows = await query<any>(
    `SELECT o.id,o.name,o.type,o.region,o.descr AS "desc",o.budget,o.benevoles,o.annee,
            o.adresse,o.telephone,o.email,o.site,o.labellisee,o.image, m.role
     FROM org_members m JOIN organisations o ON o.id=m.org_id
     WHERE m.user_id=$1 ORDER BY o.name ASC`,
    [userId]
  );
  return rows.map((r) => ({ ...mapOrg(r), role: r.role }));
}
export async function isOrgMember(orgId: number, userId: number): Promise<boolean> {
  await ensureOrg();
  const rows = await query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM org_members WHERE org_id=$1 AND user_id=$2`, [orgId, userId]
  );
  return rows[0].n > 0;
}
export async function listPublications(orgId: number): Promise<PublicationDTO[]> {
  await ensureOrg();
  const rows = await query<any>(
    `SELECT p.id,p.org_id,p.kind,p.titre,p.corps,p.created_at,
            COALESCE(NULLIF(TRIM(CONCAT(u.prenom,' ',u.nom)),''), u.email, 'Membre') AS auteur
     FROM org_publications p LEFT JOIN users u ON u.id=p.author_id
     WHERE p.org_id=$1 ORDER BY p.created_at DESC`,
    [orgId]
  );
  return rows.map((r) => ({
    id: r.id, org_id: r.org_id, kind: r.kind === "reussite" ? "reussite" : "proposition",
    titre: r.titre, corps: r.corps || "", auteur: r.auteur, created_at: r.created_at,
  }));
}
export async function createPublication(orgId: number, authorId: number, kind: string, titre: string, corps: string): Promise<number> {
  await ensureOrg();
  const k = kind === "reussite" ? "reussite" : "proposition";
  const rows = await query<{ id: number }>(
    `INSERT INTO org_publications (org_id,author_id,kind,titre,corps) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [orgId, authorId, k, titre, corps]
  );
  return rows[0].id;
}
