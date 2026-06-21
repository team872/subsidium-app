import { query } from "./db";

// Market-place (espace Initiateur) : offres et services Subsidium.
// Tables creees/amorcees a la demande (auto-contenu). Donnees seed issues de l'AVP (p160-163).

export type OffreDTO = { id: number; title: string; provider: string; desc: string; price: string; grad: string };

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
}

function mapOffre(r: any): OffreDTO {
  return { id: r.id, title: r.title, provider: r.provider || "Subsidium", desc: r.desc, price: r.price, grad: GRADS[(r.id - 1) % GRADS.length] };
}
const SELECT = `SELECT id, title, provider, descr AS "desc", price FROM offres`;

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
