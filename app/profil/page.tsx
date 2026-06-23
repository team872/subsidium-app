"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProfileEditModal from "@/components/ProfileEditModal";
import { useLang } from "@/components/LangProvider";
import type { PublicUser } from "@/lib/data";
import "@/components/Profile.css";

const initials = (u: PublicUser) =>
  (`${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || u.email)
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const LOC: Record<string, any> = {
  fr: { title: "Mon compte Subsidium", loading: "Chargement de votre compte…", mustLogin: "Vous devez être connecté.", connect: "Se connecter", since: "Inscrit(e) depuis le", name: "Votre nom", firstName: "Votre prénom", situation: "Votre situation", city: "Votre ville", email: "Votre adresse mail", country: "Votre pays", palier: "Palier", centerTitle: "Centre Subsidium à proximité", centerDesc: "Retrouvez les structures et centres labellisés près de chez vous.", seeOrgs: "Voir les organisations", modifyInfo: "Modifier mes informations", logout: "Se déconnecter", badgeOkTitle: "Badge Initiateur obtenu", badgeOkDesc: "Votre auto-évaluation vous a permis d'obtenir le badge Initiateur N2. Merci pour votre engagement.", badgeGetTitle: "Obtenir le badge Initiateur", badgeGetDesc: "Passez l'auto-évaluation pour viser le badge Initiateur N2.", startEval: "Commencer l'auto-évaluation", sponsorTitle: "Parrainer des amis", sponsorDesc: "Invitez vos proches à rejoindre le mouvement et à agir près de chez eux.", copyLink: "Copier le lien d'invitation", copied: "Lien copié ✔", subscription: "Abonnement", noSub: "Aucun abonnement", manage: "Gérer", language: "Choix de la langue", saved: "Enregistré ✔", countryPref: "Préférence du pays", notSet: "Non renseigné", modify: "Modifier" },
  en: { title: "My Subsidium account", loading: "Loading your account…", mustLogin: "You must be logged in.", connect: "Log in", since: "Member since", name: "Last name", firstName: "First name", situation: "Status", city: "City", email: "Email address", country: "Country", palier: "Tier", centerTitle: "Nearby Subsidium center", centerDesc: "Find accredited organizations and centers near you.", seeOrgs: "See organizations", modifyInfo: "Edit my information", logout: "Log out", badgeOkTitle: "Initiator badge earned", badgeOkDesc: "Your self-assessment earned you the Initiator N2 badge. Thank you for your commitment.", badgeGetTitle: "Get the Initiator badge", badgeGetDesc: "Take the self-assessment to aim for the Initiator N2 badge.", startEval: "Start the self-assessment", sponsorTitle: "Refer friends", sponsorDesc: "Invite your friends to join the movement and act near them.", copyLink: "Copy invite link", copied: "Link copied ✔", subscription: "Subscription", noSub: "No subscription", manage: "Manage", language: "Language", saved: "Saved ✔", countryPref: "Country preference", notSet: "Not set", modify: "Edit" },
  it: { title: "Il mio account Subsidium", loading: "Caricamento del tuo account…", mustLogin: "Devi aver effettuato l'accesso.", connect: "Accedi", since: "Iscritto dal", name: "Cognome", firstName: "Nome", situation: "Situazione", city: "Città", email: "Indirizzo email", country: "Paese", palier: "Livello", centerTitle: "Centro Subsidium nelle vicinanze", centerDesc: "Trova le organizzazioni e i centri accreditati vicino a te.", seeOrgs: "Vedi le organizzazioni", modifyInfo: "Modifica i miei dati", logout: "Disconnetti", badgeOkTitle: "Badge Iniziatore ottenuto", badgeOkDesc: "La tua autovalutazione ti ha permesso di ottenere il badge Iniziatore N2. Grazie per il tuo impegno.", badgeGetTitle: "Ottieni il badge Iniziatore", badgeGetDesc: "Fai l'autovalutazione per puntare al badge Iniziatore N2.", startEval: "Inizia l'autovalutazione", sponsorTitle: "Invita amici", sponsorDesc: "Invita i tuoi cari a unirsi al movimento e ad agire vicino a loro.", copyLink: "Copia il link d'invito", copied: "Link copiato ✔", subscription: "Abbonamento", noSub: "Nessun abbonamento", manage: "Gestisci", language: "Lingua", saved: "Salvato ✔", countryPref: "Preferenza del paese", notSet: "Non indicato", modify: "Modifica" },
};

export default function ProfilPage() {
  const router = useRouter();
  const { lang, setLang, langs } = useLang();
  const L = LOC[lang] || LOC.fr;
  const [user, setUser] = useState<PublicUser | null>(null);
  const [parrainage, setParrainage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [langSaved, setLangSaved] = useState(false);

  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : lang === "it" ? "it-IT" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } };

  useEffect(() => {
    fetch("/app/api/me").then((r) => r.json()).then((d) => setUser(d.user || null)).catch(() => setUser(null)).finally(() => setLoading(false));
    fetch("/app/api/preferences").then((r) => r.json()).then((d) => { if (!d.error) setParrainage(d.parrainage || ""); }).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/app/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/connexion");
  }
  function changeLangue(code: string) {
    setLang(code as any);
    setLangSaved(true); setTimeout(() => setLangSaved(false), 1800);
  }
  function copierLien() {
    if (!parrainage) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    try { navigator.clipboard.writeText(`${origin}/app/connexion?parrain=${parrainage}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }

  if (loading) return <AppShell><p className="board-empty">{L.loading}</p></AppShell>;
  if (!user) return <AppShell><p className="board-empty">{L.mustLogin} <Link href="/connexion">{L.connect}</Link></p></AppShell>;

  const palier = user.palier || "Refondateur";
  const langueLabel = langs.find((l) => l.code === lang)?.label || "Français";

  return (
    <AppShell>
      <div className="topbar"><h1>{L.title}</h1></div>

      {edit && (
        <ProfileEditModal user={user} onClose={() => setEdit(false)} onSaved={(u) => { setUser(u); setEdit(false); }} />
      )}

      <div className="account-grid">
        <section className="acc-card">
          <span className="acc-avatar">{initials(user)}</span>
          <span className="acc-name">{`${user.prenom ?? ""} ${user.nom ?? ""}`.trim() || user.email}</span>
          <span className="acc-since">{L.since} {fmtDate(user.created_at)}</span>

          <div className="acc-info">
            <div><label>{L.name}</label><span>{user.nom || "—"}</span></div>
            <div><label>{L.firstName}</label><span>{user.prenom || "—"}</span></div>
            <div><label>{L.situation}</label><span>{user.situation || "—"}</span></div>
            <div><label>{L.city}</label><span>{user.ville || "—"}</span></div>
            <div className="full"><label>{L.email}</label><span>{user.email}</span></div>
            <div><label>{L.country}</label><span>{user.pays || "—"}</span></div>
            <div><label>{L.palier}</label><span>{palier}{user.score != null ? ` · ${user.score}/60` : ""}</span></div>
          </div>

          <div className="acc-center">
            <b>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              {L.centerTitle}
            </b>
            <p>{L.centerDesc}</p>
            <Link href="/organisations" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: "inline-block" }}>{L.seeOrgs}</Link>
          </div>

          <div className="acc-actions">
            <button className="btn btn-ghost" onClick={() => setEdit(true)}>{L.modifyInfo}</button>
            <button className="btn btn-danger" onClick={logout}>{L.logout}</button>
          </div>
        </section>

        <section className="acc-right">
          <div className="acc-cards2">
            {user.badge_n2 ? (
              <div className="badge-card ok">
                <span className="chk"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
                <h3>{L.badgeOkTitle}</h3>
                <p>{L.badgeOkDesc}</p>
              </div>
            ) : (
              <div className="badge-card">
                <h3>{L.badgeGetTitle}</h3>
                <p>{L.badgeGetDesc}</p>
                <Link href="/auto-evaluation" className="btn btn-coral btn-sm" style={{ marginTop: 8, display: "inline-block" }}>{L.startEval}</Link>
              </div>
            )}

            <div className="parrain-card">
              <h3>{L.sponsorTitle}</h3>
              <p>{L.sponsorDesc}</p>
              {parrainage && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontWeight: 800, color: "#372646", letterSpacing: ".04em", background: "#FCF6F0", border: "1px dashed #E3D7CC", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>{parrainage}</div>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={copierLien} style={{ marginTop: 8 }}>{copied ? L.copied : L.copyLink}</button>
                </div>
              )}
            </div>
          </div>

          <div className="setting-row">
            <span className="lbl"><b>{L.subscription}</b><small>{L.noSub}</small></span>
            <Link href="/paiement" className="btn btn-ghost btn-sm">{L.manage}</Link>
          </div>
          <div className="setting-row">
            <span className="lbl"><b>{L.language}</b><small>{langSaved ? L.saved : langueLabel}</small></span>
            <select value={lang} onChange={(e) => changeLangue(e.target.value)} style={{ border: "1px solid #E3D7CC", borderRadius: 10, padding: "7px 10px", color: "#372646", background: "#FCF9F6", fontSize: 14 }}>
              {langs.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="setting-row">
            <span className="lbl"><b>{L.countryPref}</b><small>{user.pays || L.notSet}</small></span>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEdit(true)}>{L.modify}</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
