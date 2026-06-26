import { query, ensureDb } from "./db";

// Visuels des cartes : colonne `image` (URL) sur events/ideas + recherche d'images
// libres de droit (Pexels) activée dès que PEXELS_API_KEY est défini côté serveur.
// Génération d'illustration IA (FLUX via fal.ai) activée dès que FAL_KEY est défini.
// Tant que les clés sont absentes, l'app retombe proprement sur le dégradé de marque.

let ready: Promise<void> | null = null;
export function ensureImageCols(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init() {
  await ensureDb();
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS image TEXT`);
  await query(`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS image TEXT`);
}

export type StockPhoto = { id: number; thumb: string; full: string; alt: string; credit: string };

// Recherche de photos libres de droit via Pexels (usage commercial autorisé, sans
// attribution obligatoire). Renvoie [] si la clé n'est pas configurée.
export async function pexelsSearch(q: string, n = 8): Promise<StockPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !q.trim()) return [];
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?per_page=${n}&orientation=landscape&query=${encodeURIComponent(q)}`,
      { headers: { Authorization: key }, cache: "no-store" }
    );
    if (!r.ok) return [];
    const d: any = await r.json();
    return (d.photos || []).map((p: any) => ({
      id: p.id,
      thumb: p.src?.medium || p.src?.small || "",
      full: p.src?.large || p.src?.medium || "",
      alt: p.alt || q,
      credit: p.photographer || "Pexels",
    }));
  } catch {
    return [];
  }
}

export function pexelsConfigured(): boolean {
  return !!process.env.PEXELS_API_KEY;
}

// --- Génération d'illustration IA : FLUX.1 [schnell] via fal.ai ---
export function falConfigured(): boolean {
  return !!process.env.FAL_KEY;
}
export async function falGenerate(prompt: string): Promise<string | null> {
  const key = process.env.FAL_KEY;
  if (!key || !prompt.trim()) return null;
  try {
    const r = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
      body: JSON.stringify({
        prompt: `${prompt}, photorealistic editorial photograph, civic community, natural light`,
        image_size: "landscape_16_9",
        num_images: 1,
        num_inference_steps: 4,
      }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const d: any = await r.json();
    return d?.images?.[0]?.url || null;
  } catch {
    return null;
  }
}

export async function setEventImage(id: number, url: string | null): Promise<void> {
  await ensureImageCols();
  await query(`UPDATE events SET image=$2 WHERE id=$1`, [id, url]);
}
export async function setIdeaImage(id: number, url: string | null): Promise<void> {
  await ensureImageCols();
  await query(`UPDATE ideas SET image=$2 WHERE id=$1`, [id, url]);
}

// Requête Pexels par type d'événement (en anglais : meilleurs résultats civiques).
const TAG_QUERY: Record<string, string> = {
  "Nouveauté": "city community announcement",
  "Concertation": "town hall meeting citizens",
  "Forum": "community fair people",
  "Atelier": "community workshop participatory",
  "Rencontre": "community gathering café",
  "Récit": "volunteers community project",
};

// Illustration automatique : remplit le champ image (events/idees) vides via Pexels.
// Choix déterministe (id % n) pour varier les photos d'une carte à l'autre.
export async function autoIllustrateEvents(): Promise<number> {
  if (!pexelsConfigured()) return 0;
  await ensureImageCols();
  const rows = await query<{ id: number; tag: string; title: string }>(`SELECT id, tag, title FROM events WHERE image IS NULL ORDER BY id`);
  let n = 0;
  for (const r of rows) {
    const q = TAG_QUERY[r.tag] || "community local event";
    const photos = await pexelsSearch(q, 6);
    if (photos.length) {
      await setEventImage(r.id, photos[r.id % photos.length].full);
      n++;
    }
  }
  return n;
}
export async function autoIllustrateIdeas(): Promise<number> {
  if (!pexelsConfigured()) return 0;
  await ensureImageCols();
  const rows = await query<{ id: number; cat: string; title: string }>(`SELECT id, cat, title FROM ideas WHERE image IS NULL ORDER BY id`);
  let n = 0;
  for (const r of rows) {
    const photos = await pexelsSearch(`${r.cat} community local`, 6);
    if (photos.length) {
      await setIdeaImage(r.id, photos[r.id % photos.length].full);
      n++;
    }
  }
  return n;
}

// --- Événements de démo réalistes (idempotent par titre) ---
const G = [
  "linear-gradient(135deg,#E8A98F,#C85A48)",
  "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)",
  "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)",
  "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];
const RICH_EVENTS = [
  { tag: "Concertation", title: "Concertation citoyenne : réaménagement des berges de la Garonne", descr: "La métropole invite les habitants à imaginer ensemble les futurs usages des berges : promenades, espaces verts, mobilités douces. Trois ateliers et une plateforme de contributions en ligne.", day: "12", month: "SEPT" },
  { tag: "Atelier", title: "Atelier participatif : construire le budget participatif de mon quartier", descr: "Un après-midi pour comprendre le budget participatif, déposer ses idées de projets de proximité et apprendre à mobiliser ses voisins. Ouvert à tous, sans inscription préalable.", day: "27", month: "SEPT" },
  { tag: "Forum", title: "Forum des associations solidaires de Haute-Garonne", descr: "Plus de 60 structures réunies pour présenter leurs actions, recruter des bénévoles et nouer des partenariats. Stands, tables rondes et speed-meeting de l'engagement.", day: "04", month: "OCT" },
  { tag: "Rencontre", title: "Café citoyen : la transition écologique près de chez vous", descr: "Échange convivial autour des initiatives locales de transition : compostage de quartier, énergie citoyenne, mobilités. Venez partager vos questions et vos projets.", day: "15", month: "OCT" },
  { tag: "Récit", title: "Récit d'initiative : comment sont nés les Jardins solidaires du Mirail", descr: "Les fondatrices racontent le parcours du projet, de l'idée déposée sur SUBSIDIUM jusqu'au jardin d'insertion qui nourrit aujourd'hui le quartier. Retours d'expérience et conseils.", day: "23", month: "OCT" },
  { tag: "Concertation", title: "Réunion publique : plan de mobilité douce de la métropole", descr: "Présentation du futur réseau cyclable et piéton, suivie d'un temps de questions-réponses avec les élus et les services techniques. Vos avis nourriront le schéma définitif.", day: "06", month: "NOV" },
  { tag: "Atelier", title: "Fresque du climat : atelier collectif ouvert à tous", descr: "Trois heures pour comprendre, de façon ludique et collaborative, les causes et conséquences du changement climatique, et identifier des leviers d'action à l'échelle locale.", day: "19", month: "NOV" },
  { tag: "Rencontre", title: "Rencontre des porteurs de projets SUBSIDIUM", descr: "Soirée de mise en réseau entre Initiateurs et organisations labellisées : pitchs d'une minute, ateliers de maillage et cocktail. L'occasion de trouver des partenaires pour vos initiatives.", day: "02", month: "DÉC" },
];

let eventsSeeded = false;
export async function ensureRichEvents(): Promise<void> {
  if (eventsSeeded) return;
  await ensureImageCols();
  for (let i = 0; i < RICH_EVENTS.length; i++) {
    const e = RICH_EVENTS[i];
    const ex = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM events WHERE title=$1`, [e.title]);
    if (ex[0].n === 0) {
      await query(
        `INSERT INTO events (tag,title,descr,day,month,grad) VALUES ($1,$2,$3,$4,$5,$6)`,
        [e.tag, e.title, e.descr, e.day, e.month, G[i % G.length]]
      );
    }
  }
  eventsSeeded = true;
}
