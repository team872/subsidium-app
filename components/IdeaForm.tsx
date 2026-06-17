"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/feed";
import type { IdeaDTO } from "@/lib/data";

export default function IdeaForm({ onClose, onCreated }: { onClose: () => void; onCreated: (idea: IdeaDTO) => void }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [cat, setCat] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);

  async function submit() {
    setError("");
    setNeedLogin(false);
    if (!title.trim() || !cat || !desc.trim()) {
      setError("Titre, thématique et description sont requis.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/app/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, cat, desc, location }),
      });
      const d = await r.json();
      if (r.status === 401) {
        setNeedLogin(true);
        setBusy(false);
        return;
      }
      if (!r.ok) {
        setError(d.error || "Publication impossible.");
        setBusy(false);
        return;
      }
      onCreated(d.idea);
    } catch {
      setError("Publication impossible pour le moment.");
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Exprimer une idée</h2>
          <button className="modal-x" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="mfield">
            <label>Titre de l'idée</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
          </div>
          <div className="mfield">
            <label>Localisation</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nom de ville, département, etc." />
          </div>
          <div className="mfield">
            <label>Thématique traitée</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Sélectionner</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="mfield">
            <label>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={4} />
          </div>
          <div className="mfield">
            <label>Ajouter des images</label>
            <div className="upload-zone" title="Disponible prochainement">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              <span>Bientôt disponible</span>
            </div>
          </div>

          {needLogin ? (
            <p className="msg">Connectez-vous pour publier votre idée. <a href="/app/connexion">Se connecter</a></p>
          ) : error ? (
            <p className="msg">{error}</p>
          ) : null}
        </div>

        <div className="modal-foot">
          <button className="btn btn-coral" onClick={submit} disabled={busy}>
            {busy ? "Publication…" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
