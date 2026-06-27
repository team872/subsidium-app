"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/feed";
import type { IdeaDTO } from "@/lib/data";
import { useLang } from "@/components/LangProvider";
import ImagePicker from "@/components/ImagePicker";
import { keywordsFromText } from "@/lib/keywords";

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  fr: {
    title: "Exprimer une idée", editTitle: "Modifier le brouillon", close: "Fermer",
    fTitle: "Titre de l'idée", phTitle: "Titre",
    fLoc: "Localisation", phLoc: "Nom de ville, département, etc.",
    fCat: "Thématique traitée", select: "Sélectionner",
    fDesc: "Description", phDesc: "Description",
    fImages: "Ajouter une image",
    reqFields: "Titre, thématique et description sont requis.",
    reqNote: "Les champs marqués * sont obligatoires.",
    pubErr: "Publication impossible.", pubErr2: "Publication impossible pour le moment.",
    needLogin: "Connectez-vous pour publier votre idée.", login: "Se connecter",
    publishing: "Publication…", publish: "Publier",
    saveDraft: "Enregistrer en brouillon", saving: "Enregistrement…",
  },
  en: {
    title: "Share an idea", editTitle: "Edit draft", close: "Close",
    fTitle: "Idea title", phTitle: "Title",
    fLoc: "Location", phLoc: "City name, department, etc.",
    fCat: "Topic", select: "Select",
    fDesc: "Description", phDesc: "Description",
    fImages: "Add an image",
    reqFields: "Title, topic and description are required.",
    reqNote: "Fields marked * are required.",
    pubErr: "Could not publish.", pubErr2: "Could not publish for now.",
    needLogin: "Log in to publish your idea.", login: "Log in",
    publishing: "Publishing…", publish: "Publish",
    saveDraft: "Save as draft", saving: "Saving…",
  },
  it: {
    title: "Esprimere un'idea", editTitle: "Modifica bozza", close: "Chiudi",
    fTitle: "Titolo dell'idea", phTitle: "Titolo",
    fLoc: "Localizzazione", phLoc: "Nome della città, dipartimento, ecc.",
    fCat: "Tematica trattata", select: "Seleziona",
    fDesc: "Descrizione", phDesc: "Descrizione",
    fImages: "Aggiungi un'immagine",
    reqFields: "Titolo, tematica e descrizione sono obbligatori.",
    reqNote: "I campi contrassegnati con * sono obbligatori.",
    pubErr: "Pubblicazione impossibile.", pubErr2: "Pubblicazione impossibile per ora.",
    needLogin: "Accedi per pubblicare la tua idea.", login: "Accedi",
    publishing: "Pubblicazione…", publish: "Pubblica",
    saveDraft: "Salva come bozza", saving: "Salvataggio…",
  },
};

// Marqueur de champ obligatoire.
function Req() {
  return <span style={{ color: "#C2452F", fontWeight: 700 }} aria-hidden="true"> *</span>;
}

export default function IdeaForm({ onClose, onCreated, edit }: { onClose: () => void; onCreated: (idea: IdeaDTO) => void; edit?: IdeaDTO }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [title, setTitle] = useState(edit?.title ?? "");
  const [location, setLocation] = useState(edit?.location ?? "");
  const [cat, setCat] = useState(edit?.cat ?? "");
  const [desc, setDesc] = useState(edit?.desc ?? "");
  const [image, setImage] = useState<string | null>(edit?.image ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);

  const missingTitle = !!error && !title.trim();
  const missingCat = !!error && !cat;
  const missingDesc = !!error && !desc.trim();

  // publish=false → enregistre / met à jour le brouillon ; publish=true → publie.
  async function submit(publish: boolean) {
    setError("");
    setNeedLogin(false);
    if (!title.trim() || !cat || !desc.trim()) {
      setError(tr.reqFields);
      return;
    }
    setBusy(true);
    try {
      const payload = edit
        ? { title, cat, desc, location, image, publish }
        : { title, cat, desc, location, image, status: publish ? "emise" : "brouillon" };
      const r = await fetch(edit ? `/app/api/ideas/${edit.id}` : "/app/api/ideas", {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (r.status === 401) {
        setNeedLogin(true);
        setBusy(false);
        return;
      }
      if (!r.ok) {
        setError(d.error || tr.pubErr);
        setBusy(false);
        return;
      }
      onCreated(d.idea);
    } catch {
      setError(tr.pubErr2);
      setBusy(false);
    }
  }

  const seed = keywordsFromText(title, desc) || title.trim();
  const errStyle = { borderColor: "#C2452F" } as const;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{edit ? tr.editTitle : tr.title}</h2>
          <button className="modal-x" onClick={onClose} aria-label={tr.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="mfield">
            <label>{tr.fTitle}<Req /></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr.phTitle} style={missingTitle ? errStyle : undefined} />
          </div>
          <div className="mfield">
            <label>{tr.fLoc}</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={tr.phLoc} />
          </div>
          <div className="mfield">
            <label>{tr.fCat}<Req /></label>
            <select value={cat} onChange={(e) => setCat(e.target.value)} style={missingCat ? errStyle : undefined}>
              <option value="">{tr.select}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="mfield">
            <label>{tr.fDesc}<Req /></label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={tr.phDesc} rows={4} style={missingDesc ? errStyle : undefined} />
          </div>
          <div className="mfield">
            <label>{tr.fImages}</label>
            <ImagePicker seed={seed} value={image} onPick={setImage} />
          </div>

          {needLogin ? (
            <p className="msg">{tr.needLogin} <a href="/app/connexion">{tr.login}</a></p>
          ) : error ? (
            <p className="msg">{error}</p>
          ) : (
            <p style={{ color: "#9C919E", fontSize: 12, margin: "4px 0 0" }}>{tr.reqNote}</p>
          )}
        </div>

        <div className="modal-foot" style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn" onClick={() => submit(false)} disabled={busy} style={{ background: "#fff", color: "#372646", border: "1px solid #E3D7CC" }}>
            {busy ? tr.saving : tr.saveDraft}
          </button>
          <button className="btn btn-coral" onClick={() => submit(true)} disabled={busy}>
            {busy ? tr.publishing : tr.publish}
          </button>
        </div>
      </div>
    </div>
  );
}
