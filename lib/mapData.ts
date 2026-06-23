import { query, ensureDb } from "./db";
import { ensureProjets } from "./projetsData";
import { ensureOrg } from "./orgData";

// Couche géo ISOLÉE pour la vue carte : ajoute lat/lon aux tables existantes (idempotent)
// et renvoie des points. N'édite aucun module de données existant (sécurité / non-régression).
// Backfill sans réseau : coordonnées dérivées du texte (ville) ou réparties sur la France.

const CITY: Record<string, [number, number]> = {
  lyon: [45.757, 4.832], toulouse: [43.604, 1.444], paris: [48.857, 2.352], marseille: [43.296, 5.369],
  bordeaux: [44.838, -0.579], nantes: [47.218, -1.554], lille: [50.629, 3.057], strasbourg: [48.583, 7.745],
  cugnaux: [43.536, 1.345], union: [43.654, 1.487], occitanie: [43.6, 1.44], "haute-garonne": [43.6, 1.44],
};
const SPREAD: [number, number][] = [
  [45.757, 4.832], [43.604, 1.444], [48.857, 2.352], [43.296, 5.369],
  [44.838, -0.579], [47.218, -1.554], [50.629, 3.057], [48.583, 7.745],
];
const DEFAULT: [number, number] = [43.604, 1.444];
const jit = (v: number) => v + (Math.random() - 0.5) * 0.05;

function base(text: string | null, idx: number): [number, number] {
  const s = (text || "").toLowerCase();
  for (const k of Object.keys(CITY)) if (s.includes(k)) return CITY[k];
  if (!text) return SPREAD[idx % SPREAD.length];
  return DEFAULT;
}
async function ensureCols(table: string) {
  await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`);
  await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION`);
}
async function backfill(table: string, textCol: string | null) {
  const rows = await query<{ id: number; t: string | null }>(
    `SELECT id, ${textCol ? textCol : "NULL"} AS t FROM ${table} WHERE lat IS NULL ORDER BY id`
  );
  for (let i = 0; i < rows.length; i++) {
    const [a, b] = base(rows[i].t, i);
    await query(`UPDATE ${table} SET lat=$2, lon=$3 WHERE id=$1`, [rows[i].id, jit(a), jit(b)]);
  }
}

export type GeoPoint = { id: number; lat: number; lon: number; title: string; subtitle: string | null };

export async function eventsPoints(): Promise<GeoPoint[]> {
  await ensureDb(); await ensureCols("events"); await backfill("events", null);
  return query<GeoPoint>(`SELECT id, lat, lon, title, tag AS subtitle FROM events WHERE lat IS NOT NULL ORDER BY id`);
}
export async function projetsPoints(): Promise<GeoPoint[]> {
  await ensureProjets(); await ensureCols("projets"); await backfill("projets", "lieu");
  return query<GeoPoint>(`SELECT id, lat, lon, title, theme AS subtitle FROM projets WHERE prive=FALSE AND lat IS NOT NULL ORDER BY id DESC`);
}
export async function orgsPoints(): Promise<GeoPoint[]> {
  await ensureOrg(); await ensureCols("organisations"); await backfill("organisations", "adresse");
  return query<GeoPoint>(`SELECT id, lat, lon, name AS title, type AS subtitle FROM organisations WHERE labellisee=TRUE AND lat IS NOT NULL ORDER BY name`);
}
