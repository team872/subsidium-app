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
type Pub = { id: number; kind: "proposition" | "reussite"; titre: string; corps: string; auteur: string; created_at: string };

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "O";
}
function fdate(s: string) { try { return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } }
const kpi: React.CSSProperties = { flex: "1 1 140px", background: "#FCF6F0", border: "1px solid #F0E6DD", borderRadius: 12, padding: "12px 14px" };
const infoBox: React.CSSProperties = { flex: "1 1 220px", border: "1px solid #EBD9CD", borderRadius: 12, padding: "12px 14px" };

export default function OrgDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [kind, setKind] = useState<"proposition" | "reussite">("proposition");
  const [titre, setTitre] = useState("");
  const [corps, setCorps] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/app/api/organisations/${id}`).then((r) => r.json()).then((d) => setOrg(d.org || null)).catch(() => setOrg(null)).finally(() => setLoading(false));
    fetch(`/app/api/organisations/${id}/publications`).then((r) => r.json()).then((d) => setPubs(d.publications || [])).catch(() => {});
    fetch(`/app/api/organisations/mine`).then((r) => r.json()).then((d) => setIsMember((d.organisations || []).some((o: any) => o.id === id))).catch(() => {});
  }, [id]);

  async function publier() {
    if (busy) return;
    if (!titre.trim()) { setErr("Le titre est requis."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/organisations/${id}/publications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, titre, corps }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Publication impossible."); setBusy(false); return; }
      setTitre(""); setCorps("");
      const rr = await fetch(`/app/api/organisations/${id}/publications`).then((x) => x.json());
      setPubs(rr.publications || []);
    } catch { setErr("Publication impossible."); }
    setBusy(false);
  }

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
            {isMember && <span style={{ fontSize: 12, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "3px 10px" }}>Vous êtes membre</span>}
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

      <section style={{ maxWidth: 820, marginTop: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>Propositions & réussites</h2>

        {isMember && (
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: 16, marginBottom: 16, background: "#FCF9F6" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button type="button" className={kind === "proposition" ? "btn btn-coral" : "btn btn-ghost"} onClick={() => setKind("proposition")}>Proposition</button>
              <button type="button" className={kind === "reussite" ? "btn btn-coral" : "btn btn-ghost"} onClick={() => setKind("reussite")}>Réussite</button>
            </div>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre de la publication…" style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", marginBottom: 8, color: "#372646" }} />
            <textarea value={corps} onChange={(e) => setCorps(e.target.value)} placeholder="Décrivez votre proposition ou votre réussite…" rows={3} style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
            {err && <p className="msg" style={{ marginTop: 6 }}>{err}</p>}
            <div style={{ marginTop: 10 }}><button className="btn btn-coral" onClick={publier} disabled={busy}>{busy ? "Publication…" : "Publier"}</button></div>
          </div>
        )}

        {pubs.length === 0 ? (
          <p className="board-empty">Aucune publication pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pubs.map((p) => (
              <div key={p.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "14px 16px", background: "#fff" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", borderRadius: 999, padding: "2px 8px", color: p.kind === "reussite" ? "#1E6B1E" : "#5E4A73", background: p.kind === "reussite" ? "#DBF0D9" : "#EFE8F2" }}>{p.kind === "reussite" ? "Réussite" : "Proposition"}</span>
                  <span style={{ color: "#9C919E", fontSize: 12.5 }}>{p.auteur} · {fdate(p.created_at)}</span>
                </div>
                <div style={{ fontWeight: 700, color: "#372646", marginBottom: 2 }}>{p.titre}</div>
                {p.corps && <p style={{ color: "#5E4A73", fontSize: 14, margin: 0, whiteSpace: "pre-wrap" }}>{p.corps}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
