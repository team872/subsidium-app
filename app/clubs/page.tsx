"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import "@/components/MemberBoards.css";

type Club = { id: number; name: string; theme: string | null; descr: string; members: number; grad: string };

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "C";
}

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", theme: "", descr: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/app/api/clubs").then((r) => r.json()).then((d) => setClubs(d.clubs || [])).catch(() => {}).finally(() => setLoading(false));
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => setNiveau(d.user?.niveau ?? 0)).catch(() => {});
  }, []);

  const isLeader = niveau >= 3;

  async function create() {
    if (busy) return;
    if (!form.name.trim()) { setError("Le nom du club est requis."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/clubs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Création impossible."); setBusy(false); return; }
      router.push(`/clubs/${d.id}`);
    } catch { setError("Création impossible."); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>Clubs</h1>
        {isLeader && <button className="btn btn-coral" onClick={() => setOpen(true)}>Créer un club</button>}
      </div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>
        Les Clubs réunissent des citoyens autour d'une thématique ou d'un territoire. Rejoignez un club pour échanger
        et partager. {isLeader ? "En tant que Leader, vous pouvez créer et animer vos propres clubs." : "La création de clubs est réservée aux Refondateurs Certifiés (Leaders)."}
      </p>

      {loading ? <p className="board-empty">Chargement des clubs…</p>
      : clubs.length === 0 ? <p className="board-empty">Aucun club pour le moment.</p>
      : (
        <div className="idees-grid">
          {clubs.map((c) => (
            <Link key={c.id} href={`/clubs/${c.id}`} className="icard">
              <div style={{ height: 96, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(c.name)}</div>
              <div className="bd">
                {c.theme && <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{c.theme}</span>}
                <h3 style={{ marginTop: 4 }}>{c.name}</h3>
                <p style={{ color: "#9C919E", fontSize: 13 }}>{c.members} membre{c.members > 1 ? "s" : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Créer un club</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label="Fermer">×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>Nom du club</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mfield"><label>Thème</label><input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Ex. Transition écologique, Quartier…" /></div>
              <div className="mfield"><label>Description</label><textarea value={form.descr} onChange={(e) => setForm({ ...form, descr: e.target.value })} placeholder="Présentez l'objet du club…" /></div>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={create} disabled={busy}>{busy ? "Création…" : "Créer"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
