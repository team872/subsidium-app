"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";

type Actu = { id: number; tag: string; title: string; desc: string; day: string; month: string; grad: string };
const TAGS = ["Nouveauté", "Concertation", "Forum", "Atelier", "Rencontre", "Récit"];
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    intro: "Publiez des actualités qui apparaîtront sur la page « Actualités & événements ». L'assistant peut vous aider à rédiger.",
    fTag: "Catégorie", fTitle: "Titre", fSource: "Source (option)", fDesc: "Contenu",
    phTitle: "Titre de l'actualité", phSource: "Ex. SUBSIDIUM, nom d'une organisation…", phDesc: "Rédigez l'actualité (2-3 phrases)…",
    draft: "✨ Aide à la rédaction", drafting: "Rédaction…",
    publish: "Publier", update: "Enregistrer", cancel: "Annuler",
    list: "Actualités publiées", empty: "Aucune actualité pour le moment.", edit: "Modifier", del: "Supprimer",
    req: "Titre et contenu requis.", errSave: "Enregistrement impossible.",
    draftHint: "Indiquez d'abord un titre ou un sujet.", draftErr: "L'assistant est momentanément indisponible.",
    draftPrompt: "Rédige une actualité courte et engageante pour la plateforme citoyenne SUBSIDIUM sur le sujet suivant :",
    draftPrompt2: "Donne uniquement le texte de l'actualité (2 à 3 phrases), sans titre ni préambule.",
    loading: "Chargement…",
  },
  en: {
    intro: "Publish news items that appear on the “News & events” page. The assistant can help you write.",
    fTag: "Category", fTitle: "Title", fSource: "Source (optional)", fDesc: "Content",
    phTitle: "News title", phSource: "E.g. SUBSIDIUM, an organisation's name…", phDesc: "Write the news item (2-3 sentences)…",
    draft: "✨ Writing assistant", drafting: "Writing…",
    publish: "Publish", update: "Save", cancel: "Cancel",
    list: "Published news", empty: "No news yet.", edit: "Edit", del: "Delete",
    req: "Title and content are required.", errSave: "Could not save.",
    draftHint: "Enter a title or a subject first.", draftErr: "The assistant is momentarily unavailable.",
    draftPrompt: "Write a short, engaging news item for the SUBSIDIUM civic platform on the following subject:",
    draftPrompt2: "Give only the news text (2 to 3 sentences), no title or preamble.",
    loading: "Loading…",
  },
  it: {
    intro: "Pubblica notizie che appariranno nella pagina «Notizie ed eventi». L'assistente può aiutarti a scrivere.",
    fTag: "Categoria", fTitle: "Titolo", fSource: "Fonte (facolt.)", fDesc: "Contenuto",
    phTitle: "Titolo della notizia", phSource: "Es. SUBSIDIUM, nome di un'organizzazione…", phDesc: "Scrivi la notizia (2-3 frasi)…",
    draft: "✨ Assistente di scrittura", drafting: "Scrittura…",
    publish: "Pubblica", update: "Salva", cancel: "Annulla",
    list: "Notizie pubblicate", empty: "Nessuna notizia per ora.", edit: "Modifica", del: "Elimina",
    req: "Titolo e contenuto obbligatori.", errSave: "Salvataggio impossibile.",
    draftHint: "Indica prima un titolo o un argomento.", draftErr: "L'assistente è momentaneamente non disponibile.",
    draftPrompt: "Scrivi una notizia breve e coinvolgente per la piattaforma civica SUBSIDIUM sul seguente argomento:",
    draftPrompt2: "Fornisci solo il testo della notizia (2-3 frasi), senza titolo né preambolo.",
    loading: "Caricamento…",
  },
};

export default function AdminActualites() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [items, setItems] = useState<Actu[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ tag: "Nouveauté", title: "", source: "", desc: "" });
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    setLoading(true);
    fetch("/app/api/events").then((r) => r.json()).then((d) => setItems(d.events || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function reset() { setEditId(null); setForm({ tag: "Nouveauté", title: "", source: "", desc: "" }); setErr(""); }

  async function save() {
    if (busy) return;
    if (!form.title.trim() || !form.desc.trim()) { setErr(tr.req); return; }
    setBusy(true); setErr("");
    try {
      const url = editId ? `/app/api/events/${editId}` : "/app/api/events";
      const method = editId ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) { const d = await r.json().catch(() => ({} as any)); setErr(d.error || tr.errSave); setBusy(false); return; }
      reset(); load();
    } catch { setErr(tr.errSave); }
    setBusy(false);
  }

  async function draft() {
    if (drafting) return;
    const subject = form.title.trim() || form.desc.trim();
    if (!subject) { setErr(tr.draftHint); return; }
    setDrafting(true); setErr("");
    try {
      const prompt = `${tr.draftPrompt} « ${subject} ». ${tr.draftPrompt2}`;
      const r = await fetch("/app/api/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }) });
      const d = await r.json();
      const reply = (d.reply || d.message || "").trim();
      if (reply) setForm((f) => ({ ...f, desc: reply }));
      else setErr(d.error || tr.draftErr);
    } catch { setErr(tr.draftErr); }
    setDrafting(false);
  }

  function edit(a: Actu) { setEditId(a.id); setForm({ tag: a.tag, title: a.title, source: "", desc: a.desc }); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function del(id: number) {
    setBusy(true);
    try { await fetch(`/app/api/events/${id}`, { method: "DELETE" }); if (editId === id) reset(); load(); } catch {}
    setBusy(false);
  }

  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #E3D7CC", borderRadius: 10, padding: "9px 12px", color: "#372646", background: "#FCF9F6", fontSize: 14 };
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#5E4A73", margin: "10px 0 4px" };

  return (
    <div>
      <p style={{ color: "#5E4A73", maxWidth: 760, margin: "0 0 14px", lineHeight: 1.6 }}>{tr.intro}</p>

      <div style={{ border: "1px solid #EBD9CD", borderRadius: 16, background: "#fff", padding: "16px 18px", maxWidth: 760, marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={lbl}>{tr.fTag}</label>
            <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} style={inp}>
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: "2 1 280px" }}>
            <label style={lbl}>{tr.fTitle}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={tr.phTitle} style={inp} />
          </div>
        </div>
        <label style={lbl}>{tr.fSource}</label>
        <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder={tr.phSource} style={inp} />
        <label style={lbl}>{tr.fDesc}</label>
        <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder={tr.phDesc} rows={4} style={{ ...inp, resize: "vertical" }} />
        {err && <p className="msg" style={{ marginTop: 8 }}>{err}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-ghost" onClick={draft} disabled={drafting}>{drafting ? tr.drafting : tr.draft}</button>
          <button type="button" className="btn btn-coral" onClick={save} disabled={busy}>{editId ? tr.update : tr.publish}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={reset} disabled={busy}>{tr.cancel}</button>}
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{tr.list}</h2>
      {loading ? <p className="board-empty">{tr.loading}</p>
      : items.length === 0 ? <p className="board-empty">{tr.empty}</p>
      : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 760 }}>
          {items.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid #EBD9CD", borderRadius: 12, background: "#fff", padding: "10px 14px" }}>
              <div style={{ flexShrink: 0, width: 46, borderRadius: 10, backgroundImage: a.grad, color: "#fff", textAlign: "center", padding: "7px 0", lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{a.day}</div>
                <div style={{ fontSize: 10, textTransform: "uppercase" }}>{a.month}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{a.tag}</span>
                <div style={{ color: "#372646", fontWeight: 700, fontSize: 14.5 }}>{a.title}</div>
                <p style={{ color: "#5E4A73", fontSize: 13, margin: "2px 0 0", lineHeight: 1.45 }}>{a.desc}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button type="button" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 13 }} onClick={() => edit(a)}>{tr.edit}</button>
                <button type="button" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 13, color: "#C2452F" }} onClick={() => del(a.id)} disabled={busy}>{tr.del}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
