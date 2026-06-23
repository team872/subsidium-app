"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Club = { id: number; name: string; theme: string | null; descr: string; members: number; grad: string };
type Member = { nom: string; prenom: string; role: string };
type Post = { id: number; corps: string; auteur: string; created_at: string };

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "C";
}
function fdate(s: string) { try { return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return ""; } }

export default function ClubDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [corps, setCorps] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    return fetch(`/app/api/clubs/${id}`).then((r) => r.json()).then((d) => {
      setClub(d.club || null); setMembers(d.members || []); setPosts(d.posts || []); setIsMember(!!d.isMember);
    });
  }
  useEffect(() => { load().catch(() => setClub(null)).finally(() => setLoading(false)); }, [id]);

  async function toggleJoin() {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/clubs/${id}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ join: !isMember }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Action impossible."); setBusy(false); return; }
      await load();
    } catch { setErr("Action impossible."); }
    setBusy(false);
  }
  async function publier() {
    if (busy || !corps.trim()) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/clubs/${id}/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ corps }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Publication impossible."); setBusy(false); return; }
      setCorps("");
      const rr = await fetch(`/app/api/clubs/${id}/posts`).then((x) => x.json());
      setPosts(rr.posts || []);
    } catch { setErr("Publication impossible."); }
    setBusy(false);
  }

  if (loading) return <AppShell><Link href="/clubs" className="board-back">← Clubs</Link><p className="board-empty">Chargement…</p></AppShell>;
  if (!club) return <AppShell><Link href="/clubs" className="board-back">← Clubs</Link><p className="board-empty">Club introuvable.</p></AppShell>;

  return (
    <AppShell>
      <Link href="/clubs" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Clubs
      </Link>

      <section className="idetail" style={{ maxWidth: 820 }}>
        <div style={{ height: 120, background: club.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 40, fontFamily: "var(--font-display),cursive" }}>{initials(club.name)}</div>
        <div className="body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            {club.theme && <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#5E4A73", background: "#EFE8F2", borderRadius: 999, padding: "3px 10px" }}>{club.theme}</span>}
            <span style={{ fontSize: 13, color: "#9C919E" }}>{club.members} membre{club.members > 1 ? "s" : ""}</span>
            {isMember && <span style={{ fontSize: 12, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "3px 10px" }}>Vous êtes membre</span>}
          </div>
          <h1>{club.name}</h1>
          {club.descr && <p className="txt">{club.descr}</p>}
          <div style={{ marginTop: 8 }}>
            <button className={isMember ? "btn btn-ghost" : "btn btn-coral"} onClick={toggleJoin} disabled={busy}>
              {busy ? "…" : isMember ? "Quitter le club" : "Rejoindre le club"}
            </button>
          </div>
          {err && <p className="msg" style={{ marginTop: 8 }}>{err}</p>}
        </div>
      </section>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", maxWidth: 820, marginTop: 24 }}>
        <section style={{ flex: "2 1 460px" }}>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>Mur du club</h2>
          {!isMember ? (
            <p className="board-empty">Rejoignez le club pour voir et participer aux échanges.</p>
          ) : (
            <>
              <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: 14, marginBottom: 14, background: "#FCF9F6" }}>
                <textarea value={corps} onChange={(e) => setCorps(e.target.value)} placeholder="Partagez une information, une question, une réussite…" rows={3} style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
                <div style={{ marginTop: 8 }}><button className="btn btn-coral" onClick={publier} disabled={busy || !corps.trim()}>Publier</button></div>
              </div>
              {posts.length === 0 ? <p className="board-empty">Aucun message pour le moment.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {posts.map((p) => (
                    <div key={p.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "12px 16px", background: "#fff" }}>
                      <div style={{ color: "#9C919E", fontSize: 12.5, marginBottom: 4 }}>{p.auteur} · {fdate(p.created_at)}</div>
                      <p style={{ color: "#372646", fontSize: 14, margin: 0, whiteSpace: "pre-wrap" }}>{p.corps}</p>
                    </div>
                  ))}
                </div>}
            </>
          )}
        </section>

        <section style={{ flex: "1 1 220px" }}>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>Membres</h2>
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "6px 0", background: "#fff" }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px" }}>
                <span style={{ width: 28, height: 28, borderRadius: 999, background: "#EFE8F2", color: "#5E4A73", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(`${m.prenom} ${m.nom}`)}</span>
                <span style={{ color: "#372646", fontSize: 14 }}>{`${m.prenom} ${m.nom}`.trim() || "Membre"}</span>
                {m.role === "owner" && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#C2452F" }}>Animateur</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
