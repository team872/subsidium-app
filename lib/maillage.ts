import { query } from "./db";
import { ensureProjets } from "./projetsData";
import { projetsPoints } from "./mapData";

// Maillage S — appariement entre projets (« les S-Agents dialoguent »). V1 heuristique :
// pour un projet donné, on repère les projets publics les plus complémentaires selon
//  - le thème partagé,  - le territoire commun,  - la proximité de sujet (mots-clés).
// Le résultat est rendu tangible territorialement via la carte (lat/lon).

export type MaillageMatch = { id: number; title: string; theme: string | null; lieu: string | null; grad: string; score: number; reason: string; lat: number | null; lon: number | null };
export type MaillageGeo = { id: number; lat: number; lon: number; title: string; subtitle: string | null; color?: string };

const GRADS = [
  "linear-gradient(135deg,#E8A98F,#C85A48)", "linear-gradient(135deg,#8FB8C9,#5E7E91)",
  "linear-gradient(135deg,#9FC79A,#5E8A57)", "linear-gradient(135deg,#C9A8D4,#69567A)",
  "linear-gradient(135deg,#E8C98F,#C8A248)", "linear-gradient(135deg,#8FC9C0,#4E8A80)",
];

const STOP = new Set([
  "le", "la", "les", "de", "des", "du", "un", "une", "et", "pour", "avec", "dans", "sur", "par", "au", "aux", "en", "ou",
  "est", "qui", "que", "plus", "leur", "nos", "vos", "son", "ses", "une", "aux", "cette", "votre", "notre", "entre",
  "the", "of", "and", "for", "with", "from", "this", "that", "your", "our",
]);
function tokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}
function lieuTokens(s: string): string[] {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
}

export async function findMatches(projetId: number, limit = 5): Promise<MaillageMatch[]> {
  await ensureProjets();
  await projetsPoints().catch(() => {}); // backfill lat/lon idempotent
  const tgtRows = await query<any>(`SELECT id,title,theme,descr,lieu FROM projets WHERE id=$1`, [projetId]);
  const tgt = tgtRows[0];
  if (!tgt) return [];
  const cands = await query<any>(`SELECT id,title,theme,descr,lieu,lat,lon FROM projets WHERE prive=FALSE AND id<>$1`, [projetId]);
  const tgtTokens = new Set(tokens(`${tgt.title} ${tgt.descr || ""}`));
  const tgtLieu = new Set(lieuTokens(tgt.lieu || ""));
  const tgtTheme = (tgt.theme || "").toLowerCase().trim();

  const scored = cands.map((c: any) => {
    let score = 0;
    const reasons: string[] = [];
    if (tgtTheme && (c.theme || "").toLowerCase().trim() === tgtTheme) { score += 3; reasons.push("theme"); }
    const cl = new Set(lieuTokens(c.lieu || ""));
    let lieuShared = false;
    for (const tk of cl) if (tgtLieu.has(tk)) { lieuShared = true; break; }
    if (lieuShared) { score += 2; reasons.push("lieu"); }
    let overlap = 0;
    for (const tk of tokens(`${c.title} ${c.descr || ""}`)) if (tgtTokens.has(tk)) overlap++;
    if (overlap > 0) { score += Math.min(overlap, 3); reasons.push("sujet"); }
    return { c, score, reasons };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);

  return scored.map((x) => ({
    id: x.c.id, title: x.c.title, theme: x.c.theme, lieu: x.c.lieu,
    grad: GRADS[(x.c.id - 1) % GRADS.length], score: x.score, reason: x.reasons[0] || "sujet",
    lat: x.c.lat ?? null, lon: x.c.lon ?? null,
  }));
}

export async function maillageGeo(projetId: number, matches: MaillageMatch[]): Promise<MaillageGeo[]> {
  const geo: MaillageGeo[] = [];
  const t = await query<any>(`SELECT id,title,lat,lon FROM projets WHERE id=$1`, [projetId]);
  if (t[0] && t[0].lat != null && t[0].lon != null) geo.push({ id: t[0].id, lat: t[0].lat, lon: t[0].lon, title: t[0].title, subtitle: null, color: "#C2452F" });
  for (const m of matches) if (m.lat != null && m.lon != null) geo.push({ id: m.id, lat: m.lat, lon: m.lon, title: m.title, subtitle: m.theme, color: "#5E8A57" });
  return geo;
}
