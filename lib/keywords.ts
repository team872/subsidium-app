// Extraction de mots-clés (sans IA) pour construire une requête d'image à partir d'un
// texte. Module client-safe : aucun import serveur (utilisable côté formulaire).

const STOP = new Set(
  "le la les un une des du de au aux pour par dans sur avec sans nos vos votre notre leur leurs mon ton son mes tes ses cette cet ces qui que quoi dont est sont etre avoir plus moins tres chez entre vers afin ainsi mais donc car comme tout tous toute toutes deux trois faire fait mettre mise nous vous ils elles elle lui plus selon afin lors".split(/\s+/)
);

export function imageTokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

export function keywordsFromText(title: string, desc: string, n = 4): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of [...imageTokens(title), ...imageTokens(desc)]) {
    if (!seen.has(w)) { seen.add(w); out.push(w); }
    if (out.length >= n) break;
  }
  return out.join(" ");
}
