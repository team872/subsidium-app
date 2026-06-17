"use client";

import { useState } from "react";
import type { PublicUser } from "@/lib/data";
import "@/components/MemberBoards.css";

const SITUATIONS = ["Étudiant(e)", "En activité", "En recherche d'emploi", "Entrepreneur(e)", "Retraité(e)", "Autre"];
const PAYS = ["France", "Belgique", "Suisse", "Italie", "Autre"];

export default function ProfileEditModal({ user, onClose, onSaved }: { user: PublicUser; onClose: () => void; onSaved: (u: PublicUser) => void }) {
  const [nom, setNom] = useState(user.nom ?? "");
  const [prenom, setPrenom] = useState(user.prenom ?? "");
  const [situation, setSituation] = useState(user.situation ?? "");
  const [ville, setVille] = useState(user.ville ?? "");
  const [pays, setPays] = useState(user.pays ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/app/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, situation, ville, pays }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Mise à jour impossible.");
        setBusy(false);
        return;
      }
      onSaved(d.user);
    } catch {
      setError("Mise à jour impossible pour le moment.");
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Modifier mes informations</h2>
          <button className="modal-x" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="mfield">
            <label>Votre nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" />
          </div>
          <div className="mfield">
            <label>Votre prénom</label>
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" />
          </div>
          <div className="mfield">
            <label>Votre situation</label>
            <select value={situation} onChange={(e) => setSituation(e.target.value)}>
              <option value="">Sélectionner</option>
              {SITUATIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="mfield">
            <label>Votre adresse mail</label>
            <input value={user.email} disabled title="L'adresse e-mail ne peut pas être modifiée ici." />
          </div>
          <div className="mfield">
            <label>Votre ville</label>
            <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" />
          </div>
          <div className="mfield">
            <label>Votre pays</label>
            <select value={pays} onChange={(e) => setPays(e.target.value)}>
              <option value="">Sélectionner</option>
              {PAYS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          {error && <p className="msg">{error}</p>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-coral" onClick={save} disabled={busy}>{busy ? "Mise à jour…" : "Mettre à jour"}</button>
        </div>
      </div>
    </div>
  );
}
