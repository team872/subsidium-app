// Regenere /app/data/rag-index.json : conserve la doctrine existante, retire l'ancienne
// 'Doctrine v2', re-embarque les nouveaux chunks via Ollama, ecrit l'index fusionne.
// A executer DANS le conteneur subsidium-test (acces Ollama + volume /app/data).
const fs = require('fs');
const OLLAMA = process.env.OLLAMA_URL || 'http://ollama:11434';
const MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const IDX = '/app/data/rag-index.json';
const NEW = '/app/data/new-chunks.json';

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

(async () => {
  const existing = JSON.parse(fs.readFileSync(IDX, 'utf8'));
  const newChunks = JSON.parse(fs.readFileSync(NEW, 'utf8'));
  const newTexts = new Set(newChunks.map((c) => c.text.trim()));
  // idempotent : on retire toute 'Doctrine v2' precedente et tout doublon de texte
  const kept = existing.filter((c) => c.source !== 'Doctrine v2' && !newTexts.has((c.text || '').trim()));
  const out = kept.slice();
  for (const c of newChunks) {
    const emb = await embed(c.text);
    out.push({ source: c.source, text: c.text, embedding: emb });
    console.log('embedded', c.source, '-', c.text.slice(0, 50));
  }
  fs.writeFileSync(IDX, JSON.stringify(out));
  console.log('TOTAL', out.length, '| was', existing.length, '| kept', kept.length, '| new', newChunks.length);
})();
