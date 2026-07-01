"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import TestBar from "@/components/TestBar";
import Mascotte from "@/components/Mascotte";
import { useLang } from "@/components/LangProvider";
import { clampNiveau } from "@/lib/niveau";
import { APP_VERSION } from "@/lib/version";

type Me = { prenom: string | null; nom: string | null; email: string; niveau: number | null } | null;

const ICONS: Record<string, JSX.Element> = {
  accueil: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
  ),
  idees: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.3-1 2.5H9c0-1.2-.3-1.8-1-2.5A6 6 0 0 1 12 3z" /></svg>
  ),
  projets: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4a1 1 0 0 1 1-1h9l-2 4 2 4H5" /><path d="M4 13h11" /></svg>
  ),
  organisations: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></svg>
  ),
  missions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></svg>
  ),
  marche: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
  ),
  leader: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" /></svg>
  ),
  clubs: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  evenements: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
  ),
  notifications: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
  ),
  faq: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg>
  ),
  admin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
};

const NAV = [
  { href: "/accueil", key: "accueil", minNiveau: 0 },
  { href: "/idees", key: "idees", minNiveau: 0 },
  // Projets visible dès le visiteur (aperçu restreint côté serveur : projets officiels only).
  { href: "/projets", key: "projets", minNiveau: 0 },
  { href: "/organisations", key: "organisations", minNiveau: 0 },
  { href: "/missions", key: "missions", minNiveau: 2 },
  // « Énergie » a été fusionné dans la Market-place (doctrine : Champ d'Énergie = Market Place).
  { href: "/marche", key: "marche", minNiveau: 2 },
  { href: "/leader", key: "leader", minNiveau: 2 },
  { href: "/clubs", key: "clubs", minNiveau: 2 },
  { href: "/evenements", key: "evenements", minNiveau: 0 },
  { href: "/notifications", key: "notifications", minNiveau: 0 },
  { href: "/faq", key: "faq", minNiveau: 0 },
  { href: "/admin", key: "admin", adminOnly: true },
];

// Bandeau « Aperçu » affiché aux visiteurs NON connectés (recette AN049) :
// la consultation est ouverte sur du contenu de démonstration ; on invite à créer un compte gratuit.
const APERCU: Record<string, { t: string; d: string; cta: string; login: string }> = {
  fr: { t: "Aperçu de la plateforme", d: "vous explorez SUBSIDIUM en mode démonstration (contenus d'exemple). Créez un compte gratuit pour participer.", cta: "Créer un compte gratuit", login: "Se connecter" },
  en: { t: "Platform preview", d: "you're exploring SUBSIDIUM in demo mode (sample content). Create a free account to take part.", cta: "Create a free account", login: "Sign in" },
  it: { t: "Anteprima della piattaforma", d: "stai esplorando SUBSIDIUM in modalità demo (contenuti di esempio). Crea un account gratuito per partecipare.", cta: "Crea un account gratuito", login: "Accedi" },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [me, setMe] = useState<Me>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [isTest, setIsTest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang, langs } = useLang();

  useEffect(() => {
    fetch("/app/api/auth/me")
      .then((r) => r.json())
      .then((d) => { setMe(d.user || null); setIsTest(!!d.isTest); setIsAdmin(!!d.isAdmin); setMeLoaded(true); })
      .catch(() => setMeLoaded(true));
  }, []);

  useEffect(() => {
    fetch("/app/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnread(d.unread || 0))
      .catch(() => {});
  }, [pathname]);

  const name = me ? (`${me.prenom ?? ""} ${me.nom ?? ""}`.trim() || me.email) : "—";
  // Défaut = Visiteur (0) quand l'utilisateur n'est pas connecté / profil introuvable (recette AN040).
  const niveau = clampNiveau(me ? (me.niveau ?? 0) : 0);
  const role = t(`role.${niveau}`);
  const nav = NAV.filter((n) => (n.adminOnly ? isAdmin : niveau >= (n.minNiveau ?? 0)));
  const ap = APERCU[lang] || APERCU.fr;

  async function logout() {
    await fetch("/app/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/connexion");
  }

  return (
    <div className="app">
      <aside className={`side${open ? "" : " collapsed"}`}>
        <div className="side-top">
          <span className="side-logo">
            <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="22" r="13" fill="#F9F1E9" stroke="#372646" strokeWidth="2" />
              <g fill="none" stroke="#372646" strokeWidth="1.3" opacity=".55">
                <ellipse cx="24" cy="22" rx="5" ry="13" /><ellipse cx="24" cy="22" rx="13" ry="5" />
                <line x1="24" y1="9" x2="24" y2="35" /><line x1="11" y1="22" x2="37" y2="22" />
              </g>
              <path d="M15 39 q9 -7 18 0" fill="none" stroke="#372646" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <strong className="brandtxt" style={{ fontFamily: "var(--font-display), cursive", fontSize: "1.05rem" }}>Subsidium</strong>
          <button className="side-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <nav className="nav">
          {nav.map((n) => (
            <Link key={n.key} href={n.href} className={pathname === n.href ? "active" : ""}>
              {ICONS[n.key]}
              <span>{t(`nav.${n.key}`)}</span>
              {n.key === "notifications" && unread > 0 && (
                <i
                  aria-label={`${unread}`}
                  style={{
                    marginLeft: "auto", background: "#F27B6A", color: "#fff", borderRadius: 999,
                    fontSize: 11, fontWeight: 700, fontStyle: "normal", minWidth: 18, height: 18,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </i>
              )}
            </Link>
          ))}
        </nav>

        <div className="side-foot">
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 6px 8px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9BFD2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>
            <select value={lang} onChange={(e) => setLang(e.target.value as any)} aria-label={t("common.language")}
              style={{ flex: 1, background: "transparent", color: "#C9BFD2", border: "1px solid rgba(201,191,210,.3)", borderRadius: 8, padding: "5px 8px", fontSize: 13 }}>
              {langs.map((l) => <option key={l.code} value={l.code} style={{ color: "#372646" }}>{l.label}</option>)}
            </select>
          </div>
          <div className="who">
            <Link href="/profil" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}>
              <span className="av" />
              <span className="meta">
                <b>{name}</b>
                <small>{isAdmin ? t("common.administrator") : role}</small>
              </span>
            </Link>
            {me && (
              <button onClick={logout} aria-label={t("common.logout")} title={t("common.logout")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#C9BFD2", cursor: "pointer", opacity: 0.85, padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
              </button>
            )}
          </div>
          <div style={{ textAlign: "center", color: "#9C8FA3", fontSize: 10.5, padding: "8px 6px 2px", opacity: 0.85 }}>
            SUBSIDIUM v{APP_VERSION}
          </div>
        </div>
      </aside>

      <main className="content">
        {meLoaded && !me && (
          <div role="note" style={{ background: "#FBF4EC", border: "1px solid #EBD9CD", borderLeft: "4px solid #F27B6A", borderRadius: 12, padding: "11px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span aria-hidden="true" style={{ fontSize: 18 }}>👀</span>
            <span style={{ color: "#5E4A73", fontSize: 14, flex: "1 1 320px", lineHeight: 1.45 }}>
              <b style={{ color: "#372646" }}>{ap.t}</b> — {ap.d}
            </span>
            <a href="/app/inscription" className="btn btn-coral" style={{ padding: "7px 16px", fontSize: 13 }}>{ap.cta}</a>
            <a href="/app/connexion" style={{ color: "#C2452F", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>{ap.login}</a>
          </div>
        )}
        {children}
      </main>
      <TestBar niveau={niveau} isTest={isTest} />
      <Mascotte />
    </div>
  );
}
