"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Me = { prenom: string | null; nom: string | null; email: string; palier: string | null } | null;

const ICONS: Record<string, JSX.Element> = {
  accueil: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
  ),
  idees: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.3-1 2.5H9c0-1.2-.3-1.8-1-2.5A6 6 0 0 1 12 3z" /></svg>
  ),
  evenements: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
  ),
};

const NAV = [
  { href: "/accueil", key: "accueil", label: "Accueil" },
  { href: "/idees", key: "idees", label: "Idées" },
  { href: "/evenements", key: "evenements", label: "Événements" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [me, setMe] = useState<Me>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user || null)).catch(() => {});
  }, []);

  const name = me ? (`${me.prenom ?? ""} ${me.nom ?? ""}`.trim() || me.email) : "Invité";
  const role = me?.palier || "Refondateur";

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
          <button className="side-burger" onClick={() => setOpen((o) => !o)} aria-label="Replier le menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <nav className="nav">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} className={pathname === n.href ? "active" : ""}>
              {ICONS[n.key]}
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        <div className="side-foot">
          <div className="who">
            <span className="av" />
            <span className="meta">
              <b>{name}</b>
              <small>{role}</small>
            </span>
            {me && (
              <button onClick={logout} aria-label="Se déconnecter" title="Se déconnecter" style={{ marginLeft: "auto", background: "none", border: "none", color: "#C9BFD2", cursor: "pointer", opacity: 0.85, padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
