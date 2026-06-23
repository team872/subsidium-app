"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProfileEditModal from "@/components/ProfileEditModal";
import type { PublicUser } from "@/lib/data";
import "@/components/Profile.css";

const initials = (u: PublicUser) =>
  (`${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || u.email)
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return ""; }
};

type Prefs = { langue: string; pays: string | null; parrainage: string; langues: { code: string; label: string }[] };

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [langSaved, setLangSaved] = useState(false);

  useEffect(() => {
    fetch("/app/api/me").then((r) => r.json()).then((d) => setUser(d.user || null)).catch(() => setUser(null)).finally(() => setLoading(false));
    fetch("/app/api/preferences").then((r) => r.json()).then((d) => { if (!d.error) setPrefs(d); }).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/app/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/connexion");
  }
  async function changeLangue(code: string) {
    setPrefs((p) => (p ? { ...p, langue: code } : p));
    try {
      await fetch("/app/api/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ langue: code }) });
      setLangSaved(true); setTimeout(() => setLangSaved(false), 1800);
    } catch {}
  }
  function copierLien() {
    if (!prefs) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const lien = `${origin}/app/connexion?parrain=${prefs.parrainage}`;
    try { navigator.clipboard.writeText(lien); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }

  if (loading) return <AppShell><p className="board-empty">Chargement de votre compte…</p></AppShell>;
  if (!user) return <AppShell><p className="board-empty">Vous devez être connecté. <Link href="/connexion">Se connecter</Link></p></AppShell>;

  const palier = user.palier || "Refondateur";
  const langueLabel = prefs?.langues.find((l) => l.code === prefs.langue)?.label || "Français";

  return (
    <AppShell>
      <div className="topbar"><h1>Mon compte Subsidium</h1></div>

      {edit && (
        <ProfileEditModal user={user} onClose={() => setEdit(false)} onSaved={(u) => { setUser(u); setEdit(false); }} />
      )}

      <div className="account-grid">
        <section className="acc-card">
          <span className="acc-avatar">{initials(user)}</span>
          <span className="acc-name">{`${user.prenom ?? ""} ${user.nom ?? ""}`.trim() || user.email}</span>
          <span className="acc-since">Inscrit(e) depuis le {fmtDate(user.created_at)}</span>

          <div className="acc-info">
            <div><label>Votre nom</label><span>{user.nom || "—"}</span></div>
            <div><label>Votre prénom</label><span>{user.prenom || "—"}</span></div>
            <div><label>Votre situation</label><span>{user.situation || "—"}</span></div>
            <div><label>Votre ville</label><span>{user.ville || "—"}</span></div>
            <div className="full"><label>Votre adresse mail</label><span>{user.email}</span></div>
            <div><label>Votre pays</label><span>{user.pays || "—"}</span></div>
            <div><label>Palier</label><span>{palier}{user.score != null ? ` · ${user.score}/60` : ""}</span></div>
          </div>

          <div className="acc-center">
            <b>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              Centre Subsidium à proximité
            </b>
            <p>Centre Subsidium {user.ville ? `de ${user.ville}` : "le plus proche"} — retrouvez les structures et centres labellisés près de chez vous.</p>
            <Link href="/organisations" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: "inline-block" }}>Voir les organisations</Link>
          </div>

          <div className="acc-actions">
            <button className="btn btn-ghost" onClick={() => setEdit(true)}>Modifier mes informations</button>
            <button className="btn btn-danger" onClick={logout}>Se déconnecter</button>
          </div>
        </section>

        <section className="acc-right">
          <div className="acc-cards2">
            {user.badge_n2 ? (
              <div className="badge-card ok">
                <span className="chk"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
                <h3>Badge Initiateur obtenu</h3>
                <p>Votre auto-évaluation vous a permis d'obtenir le badge Initiateur N2. Merci pour votre engagement.</p>
              </div>
            ) : (
              <div className="badge-card">
                <h3>Obtenir le badge Initiateur</h3>
                <p>Votre palier actuel est « {palier} ». Passez l'auto-évaluation pour viser le badge Initiateur N2.</p>
                <Link href="/auto-evaluation" className="btn btn-coral btn-sm" style={{ marginTop: 8, display: "inline-block" }}>Commencer l'auto-évaluation</Link>
              </div>
            )}

            <div className="parrain-card">
              <h3>Parrainer des amis</h3>
              <p>Invitez vos proches à rejoindre le mouvement et à agir près de chez eux.</p>
              {prefs && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontWeight: 800, color: "#372646", letterSpacing: ".04em", background: "#FCF6F0", border: "1px dashed #E3D7CC", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>{prefs.parrainage}</div>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={copierLien} style={{ marginTop: 8 }}>{copied ? "Lien copié ✔" : "Copier le lien d'invitation"}</button>
                </div>
              )}
            </div>
          </div>

          <div className="setting-row">
            <span className="lbl"><b>Abonnement</b><small>Aucun abonnement</small></span>
            <Link href="/paiement" className="btn btn-ghost btn-sm">Gérer</Link>
          </div>
          <div className="setting-row">
            <span className="lbl"><b>Choix de la langue</b><small>{langSaved ? "Enregistré ✔" : langueLabel}</small></span>
            <select value={prefs?.langue || "fr"} onChange={(e) => changeLangue(e.target.value)} disabled={!prefs} style={{ border: "1px solid #E3D7CC", borderRadius: 10, padding: "7px 10px", color: "#372646", background: "#FCF9F6", fontSize: 14 }}>
              {(prefs?.langues || [{ code: "fr", label: "Français" }]).map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="setting-row">
            <span className="lbl"><b>Préférence du pays</b><small>{user.pays || "Non renseigné"}</small></span>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEdit(true)}>Modifier</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
