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
    title: "Exprimer une idée", close: "Fermer",
    fTitle: "Titre de l'idée", phTitle: "Titre",
    fLoc: "Localisation", phLoc: "Nom de ville, département, etc.",
    fCat: "Thématique traitée", select: "Sélectionner",
    fDesc: "Description", phDesc: "Description",
    fImages: "Ajouter une image",
    reqFields: "Titre, thématique et description sont requis.",
    pubErr: "Publication impossible.", pubErr2: "Publication impossible pour le moment.",
    needLogin: "Connectez-vous pour publier votre idée.", login: "Se connecter",
    publishing: "Publication…", publish: "Publier",
  },
  en: {
    title: "Share an idea", close: "Close",
    fTitle: "Idea title", phTitle: "Title",
    fLoc: "Location", phLoc: "City name, department, etc.",
    fCat: "Topic", select: "Select",
    fDesc: "Description", phDesc: "Description",
    fImages: "Add an image",
    reqFields: "Title, topic and description are required.",
    pubErr: "Could not publish.", pubErr2: "Could not publish for now.",
    needLogin: "Log in to publish your idea.", login: "Log in",
    publishing: "Publishing…", publish: "Publish",
  },
  it: {
    title: "Esprimere un'idea", close: "Chiudi",
    fTitle: "Titolo dell'idea", phTitle: "Titolo",
    fLoc: "Localizzazione", phLoc: "Nome della città, dipartimento, ecc.",
    fCat: "Tematica trattata", select: "Seleziona",
    fDesc: "Descrizione", phDesc: "Descrizione",
    fImages: "Aggiungi un'immagine",
    reqFields: "Titolo, tematica e descrizione sono obbligatori.",
    pubErr: "Pubblicazione impossibile.", pubErr2: "Pubblicazione impossibile per ora.",
    needLogin: "Accedi per pubblicare la tua idea.", login: "Accedi",
    publishing: "Pubblicazione…", publish: "Pubblica",
  },
};

export default function IdeaForm({ onClose, onCreated }: { onClose: () => void; onCreated: (idea: IdeaDTO) => void }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [cat, setCat] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);

  async function submit() {
    setError("");
    setNeedLogin(false);
    if (!title.trim() || !cat || !desc.trim()) {
      setError(tr.reqFields);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/app/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, cat, desc, location, image }),
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{tr.title}</h2>
          <button className="modal-x" onClick={onClose} aria-label={tr.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="mfield">
            <label>{tr.fTitle}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr.phTitle} />
          </div>
          <div className="mfield">
            <label>{tr.fLoc}</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={tr.phLoc} />
          </div>
          <div className="mfield">
            <label>{tr.fCat}</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">{tr.select}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="mfield">
            <label>{tr.fDesc}</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={tr.phDesc} rows={4} />
          </div>
          <div className="mfield">
            <label>{tr.fImages}</label>
            <ImagePicker seed={seed} value={image} onPick={setImage} />
          </div>

          {needLogin ? (
            <p className="msg">{tr.needLogin} <a href="/app/connexion">{tr.login}</a></p>
          ) : error ? (
            <p className="msg">{error}</p>
          ) : null}
        </div>

        <div className="modal-foot">
          <button className="btn btn-coral" onClick={submit} disabled={busy}>
            {busy ? tr.publishing : tr.publish}
          </button>
        </div>
      </div>
    </div>
  );
}
