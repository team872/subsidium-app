import { query } from "./db";
import { ensureOrg } from "./orgData";

// Market-place (espace Initiateur) : offres et services + côté émetteur (une organisation
// publie des offres et consulte les demandes de contact). Seed AVP (p160-163).
// NB (fusion 01/07) : la doctrine (Glossaire SUBSIDIUM) définit le « Champ d'Énergie » comme
// étant la Market Place — « Lieu des ressources et accompagnements ». L'ancien module Énergie
// a donc été fusionné ici : ses ressources de soutien sont amorcées comme offres du catalogue.

export type OffreDTO = { id: number; title: string; provider: string; desc: string; price: string; grad: string; image: string | null };
export type EmittedOffreDTO = OffreDTO & { contacts: number };
export type OffreContactDTO = { id: number; nom: string; prenom: string; email: string; message: string; created_at: string };

const GRADS = [
  "linear-gradient(135deg,#E8A98F,#C85A48)",
  "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)",
  "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)",
  "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];

const SEED = [
  { title: "Coaching collectif", price: "0,00 € / 5 séances", desc: "Des séances de coaching en groupe pour structurer votre engagement et avancer collectivement sur vos projets citoyens." },
  { title: "Coaching personnel", price: "0,00 € / 5 séances", desc: "Un accompagnement individuel pour clarifier vos objectifs, lever vos freins et passer à l'action avec méthode." },
  { title: "Formation mentorat au développement de projets", price: "0,00 € / 5 séances", desc: "Un parcours de mentorat pour apprendre à concevoir, financer et piloter un projet d'intérêt général." },
  { title: "Évaluation professionnelle 360", price: "0,00 €", desc: "Un bilan complet de vos compétences et de votre posture d'engagement, avec retours croisés et plan de progrès." },
  { title: "Kit de projet thématique", price: "250,00 €", desc: "Un kit clé en main (modèles, méthodes, supports) pour lancer rapidement un projet citoyen sur une thématique donnée." },
  { title: "Kit numérique – site web, réseaux sociaux, marketing digital", price: "0,00 €", desc: "Un barème et des ressources pour doter votre initiative d'une présence en ligne efficace : site, réseaux sociaux et communication." },
];

// Ressources de soutien issues de l'ancien « Champ d'Énergie » (financement, formation, outils,
// partenaires, accompagnement, communication). Repliées dans la Market-place (offres).
const ENERGIE_RESSOURCES: { title: string; provider: string; desc: string; price: string }[] = [
  { title: "Fonds d'amorçage citoyen", provider: "SUBSIDIUM", desc: "Une aide de démarrage pour lancer votre première initiative locale, sans dossier complexe. Idéal pour couvrir les premiers frais (matériel, communication, première rencontre).", price: "Sur accompagnement" },
  { title: "Budget participatif", provider: "Collectivités partenaires", desc: "Mobilisez le budget participatif de votre commune pour financer votre projet. Nous vous aidons à monter et défendre votre dossier.", price: "Sur accompagnement" },
  { title: "Parcours Leader & formations", provider: "SUBSIDIUM", desc: "Montez en compétences pour porter et animer un collectif : posture, méthode, mobilisation. Accès aux modules du Parcours Leader.", price: "Sur accompagnement" },
  { title: "Boîte à outils du porteur", provider: "SUBSIDIUM", desc: "Modèles, check-lists et guides méthodologiques pour structurer votre projet, de l'idée à la mise en œuvre.", price: "Sur accompagnement" },
  { title: "Annuaire des partenaires", provider: "Réseau SUBSIDIUM", desc: "Trouvez des associations, collectivités et entreprises labellisées prêtes à soutenir votre action sur votre territoire.", price: "Sur accompagnement" },
  { title: "Mentorat & accompagnement", provider: "Leaders SUBSIDIUM", desc: "Bénéficiez de l'accompagnement d'un Refondateur Certifié (Leader) pour structurer et faire grandir votre initiative.", price: "Sur accompagnement" },
  { title: "Kit de communication", provider: "SUBSIDIUM", desc: "Affiches, visuels et messages-types prêts à l'emploi pour faire connaître votre initiative et mobiliser autour de vous.", price: "Sur accompagnement" },
  { title: "Mise en relation experts", provider: "Réseau SUBSIDIUM", desc: "Sollicitez des experts du réseau (juridique, financement, communication) pour lever un point de blocage précis.", price: "Sur accompagnement" },
  { title: "Cartographie des ressources locales", provider: "SUBSIDIUM", desc: "Visualisez sur la carte les ressources et acteurs disponibles autour de votre projet pour activer les bons relais.", price: "Sur accompagnement" },
];

let ready: Promise<void> | null = null;
export function ensureMarket(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS offres (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, provider TEXT, descr TEXT, price TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE offres ADD COLUMN IF NOT EXISTS owner_id INT;
    ALTER TABLE offres ADD COLUMN IF NOT EXISTS org_id INT;
    ALTER TABLE offres ADD COLUMN IF NOT EXISTS image TEXT;
    CREATE TABLE IF NOT EXISTS offre_contacts (
      id SERIAL PRIMARY KEY,
      offre_id INT REFERENCES offres(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      nom TEXT, prenom TEXT, email TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  const c = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM offres`);
  if (c[0].n === 0) {
    for (const o of SEED) {
      await query(`INSERT INTO offres (title,provider,descr,price) VALUES ($1,'Subsidium',$2,$3)`, [o.title, o.desc, o.price]);
    }
  }
  // Fusion Énergie → Market-place : on amorce les ressources de soutien comme offres,
  // de façon idempotente (insérées seulement si absentes, repérées par leur titre).
  for (const e of ENERGIE_RESSOURCES) {
    await query(
      `INSERT INTO offres (title,provider,descr,price)
       SELECT $1,$2,$3,$4 WHERE NOT EXISTS (SELECT 1 FROM offres WHERE title=$1)`,
      [e.title, e.provider, e.desc, e.price]
    );
  }
}

function mapOffre(r: any): OffreDTO {
  return { id: r.id, title: r.title, provider: r.provider || "Subsidium", desc: r.desc, price: r.price, grad: GRADS[(r.id - 1) % GRADS.length], image: r.image ?? null };
}
const SELECT = `SELECT id, title, provider, descr AS "desc", price, image FROM offres`;

export async function listOffres(): Promise<OffreDTO[]> {
  await ensureMarket();
  const rows = await query<any>(`${SELECT} ORDER BY id ASC`);
  return rows.map(mapOffre);
}
export async function getOffre(id: number): Promise<OffreDTO | null> {
  await ensureMarket();
  const rows = await query<any>(`${SELECT} WHERE id=$1`, [id]);
  return rows[0] ? mapOffre(rows[0]) : null;
}
export async function createContact(
  offreId: number, userId: number, f: { nom: string; prenom: string; email: string; message: string }
): Promise<void> {
  await ensureMarket();
  await query(
    `INSERT INTO offre_contacts (offre_id,user_id,nom,prenom,email,message) VALUES ($1,$2,$3,$4,$5,$6)`,
    [offreId, userId, f.nom, f.prenom, f.email, f.message]
  );
}

// --- côté émetteur (organisation) ---

export async function createOffreForOrg(
  orgId: number, ownerId: number, f: { title: string; desc: string; price: string; image?: string | null }
): Promise<number> {
  await ensureMarket();
  await ensureOrg();
  const o = await query<{ name: string }>(`SELECT name FROM organisations WHERE id=$1`, [orgId]);
  const provider = o[0]?.name || "";
  const rows = await query<{ id: number }>(
    `INSERT INTO offres (title,provider,descr,price,owner_id,org_id,image) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [f.title, provider, f.desc, f.price, ownerId, orgId, f.image || null]
  );
  return rows[0].id;
}
export async function listOrgOffres(orgId: number): Promise<EmittedOffreDTO[]> {
  await ensureMarket();
  const rows = await query<any>(
    `SELECT id, title, provider, descr AS "desc", price, image,
       (SELECT COUNT(*)::int FROM offre_contacts c WHERE c.offre_id = offres.id) AS contacts
     FROM offres WHERE org_id=$1 ORDER BY id DESC`,
    [orgId]
  );
  return rows.map((r) => ({ ...mapOffre(r), contacts: r.contacts }));
}
export async function getOffreOrgId(offreId: number): Promise<number | null> {
  await ensureMarket();
  const rows = await query<{ org_id: number | null }>(`SELECT org_id FROM offres WHERE id=$1`, [offreId]);
  return rows[0]?.org_id ?? null;
}
export async function listContacts(offreId: number): Promise<OffreContactDTO[]> {
  await ensureMarket();
  const rows = await query<any>(
    `SELECT id,nom,prenom,email,message,created_at FROM offre_contacts WHERE offre_id=$1 ORDER BY created_at DESC`,
    [offreId]
  );
  return rows.map((r) => ({ id: r.id, nom: r.nom || "", prenom: r.prenom || "", email: r.email || "", message: r.message || "", created_at: r.created_at }));
}
