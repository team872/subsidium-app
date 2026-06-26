"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";

type Photo = { id: number; thumb: string; full: string; alt: string; credit: string };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: { ph: "Mots-clés (pré-remplis depuis votre texte)", search: "Rechercher", gen: "✨ Générer (IA)", genBusy: "Génération…", searching: "Recherche…", none: "Aucune image. Essayez d'autres mots-clés.", noKey: "Recherche d'images indisponible (clé Pexels non configurée).", genOff: "Génération IA non configurée (clé fal.ai requise).", genFail: "La génération n'a pas abouti (réessayez ou vérifiez le solde fal.ai).", remove: "Retirer", hint: "Choisissez une photo libre de droit ou générez une illustration." },
  en: { ph: "Keywords (prefilled from your text)", search: "Search", gen: "✨ Generate (AI)", genBusy: "Generating…", searching: "Searching…", none: "No image. Try other keywords.", noKey: "Image search unavailable (Pexels key not configured).", genOff: "AI generation not configured (fal.ai key required).", genFail: "Generation failed (retry or check your fal.ai balance).", remove: "Remove", hint: "Pick a royalty-free photo or generate an illustration." },
  it: { ph: "Parole chiave (precompilate dal testo)", search: "Cerca", gen: "✨ Genera (IA)", genBusy: "Generazione…", searching: "Ricerca…", none: "Nessuna immagine. Prova altre parole chiave.", noKey: "Ricerca immagini non disponibile (chiave Pexels non configurata).", genOff: "Generazione IA non configurata (chiave fal.ai richiesta).", genFail: "Generazione non riuscita (riprova o controlla il saldo fal.ai).", remove: "Rimuovi", hint: "Scegli una foto royalty-free o genera un'illustrazione." },
};

export default function ImagePicker({ seed, value, onPick }: { seed: string; value: string | null; onPick: (url: string | null) => void }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [q, setQ] = useState(seed || "");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [touched, setTouched] = useState(false);

  async function search() {
    const query = (q || seed || "").trim();
    if (!query) return;
    setLoading(true); setNoKey(false); setTouched(true);
    try {
      const r = await fetch(`/app/api/images/search?q=${encodeURIComponent(query)}`);
      const d = await r.json();
      if (d.configured === false) setNoKey(true);
      setPhotos(d.photos || []);
    } catch {}
    setLoading(false);
  }
  async function generate() {
    const prompt = (q || seed || "").trim();
    if (!prompt) return;
    setGenBusy(true); setGenMsg("");
    try {
      const r = await fetch("/app/api/images/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const d = await r.json();
      if (d.configured === false) setGenMsg(tr.genOff);
      else if (d.url) onPick(d.url);
      else setGenMsg(tr.genFail);
    } catch { setGenMsg(tr.genFail); }
    setGenBusy(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.ph}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); search(); } }}
          style={{ flex: "1 1 200px", border: "1px solid #E3D7CC", borderRadius: 10, padding: "9px 12px", color: "#372646" }} />
        <button type="button" className="btn btn-ghost" onClick={search} disabled={loading}>{loading ? tr.searching : tr.search}</button>
        <button type="button" className="btn btn-ghost" onClick={generate} disabled={genBusy} title="FLUX · fal.ai">{genBusy ? tr.genBusy : tr.gen}</button>
      </div>

      {value && (
        <div style={{ position: "relative", marginBottom: 8, borderRadius: 12, overflow: "hidden", border: "2px solid #5E8A57" }}>
          <img src={value} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
          <button type="button" onClick={() => onPick(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(40,28,52,.78)", color: "#fff", border: "none", borderRadius: 999, padding: "4px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}>{tr.remove}</button>
        </div>
      )}

      {noKey && <p className="msg">{tr.noKey}</p>}
      {genMsg && <p className="msg">{genMsg}</p>}

      {photos.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px,1fr))", gap: 8, maxHeight: 220, overflowY: "auto" }}>
          {photos.map((p) => (
            <button type="button" key={p.id} onClick={() => onPick(p.full)} title={p.alt}
              style={{ padding: 0, border: value === p.full ? "3px solid #5E8A57" : "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "none", aspectRatio: "4 / 3" }}>
              <img src={p.thumb} alt={p.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      ) : (
        !loading && !noKey && (
          <p style={{ color: "#9C919E", fontSize: 13, margin: 0 }}>{touched ? tr.none : tr.hint}</p>
        )
      )}
    </div>
  );
}
