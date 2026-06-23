"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Org = {
  id: number; name: string; type: string; region: string | null; desc: string;
  budget: number | null; benevoles: number | null; annee: number | null;
  adresse: string | null; telephone: string | null; email: string | null; site: string | null;
  labellisee: boolean; grad: string;
};

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "O";
}
const kpi: React.CSSProperties = { flex: "1 1 140px", background: "#FCF6F0", border: "1px solid #F0E6DD", borderRadius: 12, padding: "12px 14px" };
const infoBox: React.CSSProperties = { flex: "1 1 220px", border: "1px solid #EBD9CD", borderRadius: 12, padding: "12px 14px" };

export default function OrgDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/app/api/organisations/${id}`).then((r) => r.json()).then((d) => setOrg(d.org || null)).catch(() => setOrg(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppShell><Link href="/organisations" className="board-back">← Organisations</Link><p className="board-empty">Chargement…</p></AppShell>;
  if (!org) return <AppShell><Link href="/organisations" className="board-back">← Organisations</Link><p className="board-empty">Organisation introuvable.</p></AppShell>;

  return (
    <AppShell>
      <Link href="/organisations" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Annuaire des organisations
      </Link>

      <section className="idetail" style={{ maxWidth: 820 }}>
        <div style={{ height: 120, background: org.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 40, fontFamily: "var(--font-display),cursive" }}>{initials(org.name)}</div>
        <div className="body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#5E4A73", background: "#EFE8F2", borderRadius: 999, padding: "3px 10px" }}>{org.type}</span>
            {org.region && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#5E8A57", borderRadius: 999, padding: "3px 10px" }}>{org.region}</span>}
            {!org.labellisee && <span style={{ fontSize: 12, fontWeight: 700, color: "#8A5A00", background: "#FCE3B4", borderRadius: 999, padding: "3px 10px" }}>En attente de labellisation</span>}
          </div>
          <h1>{org.name}</h1>
          {org.desc && <p className="txt">{org.desc}</p>}

          {(org.budget || org.benevoles || org.annee) && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "4px 0 16px" }}>
              {org.budget != null && <div style={kpi}><div style={{ fontWeight: 800, color: "#372646" }}>{org.budget.toLocaleString("fr-FR")} €</div><small style={{ color: "#9C919E" }}>Budget annuel</small></div>}
              {org.benevoles != null && <div style={kpi}><div style={{ fontWeight: 800, color: "#372646" }}>{org.benevoles.toLocaleString("fr-FR")}</div><small style={{ color: "#9C919E" }}>Bénévoles</small></div>}
              {org.annee != null && <div style={kpi}><div style={{ fontWeight: 800, color: "#372646" }}>{org.annee}</div><small style={{ color: "#9C919E" }}>Création</small></div>}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {org.adresse && <div style={infoBox}><b style={{ color: "#372646" }}>Adresse</b><div style={{ color: "#5E4A73", fontSize: 14 }}>{org.adresse}</div></div>}
            {org.telephone && <div style={infoBox}><b style={{ color: "#372646" }}>Contact</b><div style={{ color: "#5E4A73", fontSize: 14 }}>{org.telephone}</div></div>}
            {org.email && <div style={infoBox}><b style={{ color: "#372646" }}>Adresse mail</b><div style={{ color: "#5E4A73", fontSize: 14 }}>{org.email}</div></div>}
            {org.site && <div style={infoBox}><b style={{ color: "#372646" }}>Site internet</b><div style={{ color: "#5E4A73", fontSize: 14, overflowWrap: "anywhere" }}><a href={org.site} target="_blank" rel="noreferrer" style={{ color: "#C2452F" }}>{org.site}</a></div></div>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
