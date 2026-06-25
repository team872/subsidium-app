import { query, ensureDb } from "./db";

// Module Énergie — le Champ des « ressources de soutien » (financements, formations, outils,
// partenaires, accompagnement, communication) qui aident les porteurs à passer à l'action.
// Table + seed auto-contenus (même pattern que projetsData / orgData).

export type ResourceDTO = { id: number; category: string; title: string; desc: string; provider: string; link: string | null; grad: string };

export const ENERGIE_CATEGORIES = ["Financement", "Formation", "Outils & méthodes", "Partenaires", "Accompagnement", "Communication"];

const GRADS = [
  "linear-gradient(135deg,#E8C98F,#C8A248)", "linear-gradient(135deg,#9FC79A,#5E8A57)",
  "linear-gradient(135deg,#8FB8C9,#5E7E91)", "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8A98F,#C85A48)", "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];

const SEED: { category: string; title: string; desc: string; provider: string; link: string | null }[] = [
  { category: "Financement", title: "Fonds d'amorçage citoyen", desc: "Une aide de démarrage pour lancer votre première initiative locale, sans dossier complexe. Idéal pour couvrir les premiers frais (matériel, communication, première rencontre).", provider: "SUBSIDIUM", link: null },
  { category: "Financement", title: "Budget participatif", desc: "Mobilisez le budget participatif de votre commune pour financer votre projet. Nous vous aidons à monter et défendre votre dossier.", provider: "Collectivités partenaires", link: null },
  { category: "Formation", title: "Parcours Leader & formations", desc: "Montez en compétences pour porter et animer un collectif : posture, méthode, mobilisation. Accès aux modules du Parcours Leader.", provider: "SUBSIDIUM", link: null },
  { category: "Outils & méthodes", title: "Boîte à outils du porteur", desc: "Modèles, check-lists et guides méthodologiques pour structurer votre projet, de l'idée à la mise en œuvre.", provider: "SUBSIDIUM", link: null },
  { category: "Partenaires", title: "Annuaire des partenaires", desc: "Trouvez des associations, collectivités et entreprises labellisées prêtes à soutenir votre action sur votre territoire.", provider: "Réseau SUBSIDIUM", link: null },
  { category: "Accompagnement", title: "Mentorat & accompagnement", desc: "Bénéficiez de l'accompagnement d'un Refondateur Certifié (Leader) pour structurer et faire grandir votre initiative.", provider: "Leaders SUBSIDIUM", link: null },
  { category: "Communication", title: "Kit de communication", desc: "Affiches, visuels et messages-types prêts à l'emploi pour faire connaître votre initiative et mobiliser autour de vous.", provider: "SUBSIDIUM", link: null },
  { category: "Accompagnement", title: "Mise en relation experts", desc: "Sollicitez des experts du réseau (juridique, financement, communication) pour lever un point de blocage précis.", provider: "Réseau SUBSIDIUM", link: null },
  { category: "Outils & méthodes", title: "Cartographie des ressources locales", desc: "Visualisez sur la carte les ressources et acteurs disponibles autour de votre projet pour activer les bons relais.", provider: "SUBSIDIUM", link: null },
];

let ready: Promise<void> | null = null;
export function ensureEnergie(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init() {
  await ensureDb();
  await query(`
    CREATE TABLE IF NOT EXISTS energie_ressources (
      id SERIAL PRIMARY KEY,
      category TEXT, title TEXT NOT NULL, descr TEXT, provider TEXT, link TEXT, grad TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  const c = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM energie_ressources`);
  if (c[0].n === 0) {
    for (let i = 0; i < SEED.length; i++) {
      const s = SEED[i];
      await query(`INSERT INTO energie_ressources (category,title,descr,provider,link,grad) VALUES ($1,$2,$3,$4,$5,$6)`,
        [s.category, s.title, s.desc, s.provider, s.link, GRADS[i % GRADS.length]]);
    }
  }
}

export async function listResources(): Promise<ResourceDTO[]> {
  await ensureEnergie();
  const rows = await query<any>(`SELECT id,category,title,descr AS "desc",provider,link,grad FROM energie_ressources ORDER BY id ASC`);
  return rows.map((r) => ({ id: r.id, category: r.category || "", title: r.title, desc: r.desc || "", provider: r.provider || "", link: r.link || null, grad: r.grad }));
}
