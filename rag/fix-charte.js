// Reharmonise l'index RAG avec la Charte d'engagement a QUATRE engagements
// (Verite, Respect, Responsabilite, Esperance) — alignement AVP V2.
// 1) corrige toute mention obsolete "5 engagements"/"cinq engagements" dans les chunks ;
// 2) ajoute (ou remplace) un chunk autoritatif "Charte d'engagement".
// A EXECUTER DANS le conteneur subsidium-test (acces Ollama + volume /app/data) :
//   docker cp rag/fix-charte.js subsidium-test:/tmp/ && docker exec subsidium-test node /tmp/fix-charte.js && docker restart subsidium-test
const fs = require('fs');
const OLLAMA = process.env.OLLAMA_URL || 'http://ollama:11434';
const MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const IDX = '/app/data/rag-index.json';

async function embed(text) {
  const r = await fetch(`${OLLAMA}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt: text }),
  });
  const d = await r.json();
  if (!d.embedding) throw new Error('no embedding: ' + JSON.stringify(d).slice(0, 200));
  return d.embedding;
}

const NAMES = 'Vérité, Respect, Responsabilité, Espérance';
const CHARTE =
  "Charte d'engagement SUBSIDIUM : elle comporte exactement QUATRE engagements — " +
  "1) Vérité : parler en conscience, sans haine ni mensonge ; " +
  "2) Respect : écouter les autres et construire dans le dialogue ; " +
  "3) Responsabilité : chercher le bien commun, pas le conflit ; " +
  "4) Espérance : croire en la capacité collective à changer les choses. " +
  "Adhérer à ces quatre engagements, lors d'un court entretien avec un agent puis après paiement, " +
  "permet de devenir Refondateur. Ne pas confondre la Charte (4 engagements) avec les dimensions " +
  "de l'auto-évaluation éthique, qui ouvre le niveau Initiateur.";

(async () => {
  const idx = JSON.parse(fs.readFileSync(IDX, 'utf8'));
  let patched = 0;
  for (const c of idx) {
    if (c.text && /(\b5 engagements\b|cinq engagements)/i.test(c.text)) {
      c.text = c.text
        .replace(/\b5 engagements\b/g, `4 engagements (${NAMES})`)
        .replace(/cinq engagements/gi, `quatre engagements (${NAMES})`);
      patched++;
    }
  }
  // idempotence : retire un eventuel ancien chunk Charte, puis ajoute la version a jour
  const kept = idx.filter((c) => c.source !== "Charte d'engagement");
  kept.push({ source: "Charte d'engagement", text: CHARTE, embedding: await embed(CHARTE) });
  fs.writeFileSync(IDX, JSON.stringify(kept));
  console.log('PATCHED', patched, '| TOTAL', kept.length);
})();
