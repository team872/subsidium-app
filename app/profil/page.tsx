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

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    fetch("/app/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/app/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/connexion");
  }

  if (loading) {
    return <AppShell><p className="board-empty">Chargement de votre compte…</p></AppShell>;
  }
  if (!user) {
    return (
      <AppShell>
        <p className="board-empty">Vous devez être connecté. <Link href="/connexion">Se connecter</Link></p>
      </AppShell>
    );
  }

  const palier = user.palier || "Refondateur";

  return (
    <AppShell>
      <div className="topbar">
        <h1>Mon compte Subsidium</h1>
      </div>

      {edit && (
        <ProfileEditModal
          user={user}
          onClose={() => setEdit(false)}
          onSaved={(u) => { setUser(u); setEdit(false); }}
        />
      )}

      <div className="account-grid">
        {/* ----- Carte identité ----- */}
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
            <p>Centre Subsidium {user.ville ? `de ${user.ville}` : "le plus proche"} — adresse communiquée prochainement.</p>
          </div>

          <div className="acc-actions">
            <button className="btn btn-ghost" onClick={() => setEdit(true)}>Modifier mes informations</button>
            <button className="btn btn-danger" onClick={logout}>Se déconnecter</button>
          </div>
        </section>

        {/* ----- Colonne droite ----- */}
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
                <p>Votre palier actuel est « {palier} ». Poursuivez votre engagement pour viser le badge Initiateur N2.</p>
              </div>
            )}

            <div className="parrain-card">
              <h3>Parrainer des amis</h3>
              <p>Invitez vos proches à rejoindre le mouvement et à agir près de chez eux.</p>
              <button className="btn btn-ghost btn-sm" type="button" title="Bientôt disponible">En savoir plus</button>
            </div>
          </div>

          <div className="setting-row">
            <span className="lbl"><b>Abonnement</b><small>Aucun abonnement</small></span>
            <button className="btn btn-ghost btn-sm" type="button" title="Bientôt disponible">Gérer</button>
          </div>
          <div className="setting-row">
            <span className="lbl"><b>Choix de la langue</b><small>Français</small></span>
            <button className="btn btn-ghost btn-sm" type="button" title="Bientôt disponible">Modifier</button>
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
