"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useNiveau } from "@/components/useNiveau";
import { peutPorterInitiative, prochaineEtape } from "@/lib/niveau";
import "@/components/MemberBoards.css";

type Offre = { id: number; title: string; provider: string; desc: string; price: string; grad: string };

const pricePill: React.CSSProperties = { background: "#FBE7DC", color: "#C2452F", fontWeight: 700, borderRadius: 999, padding: "7px 16px", display: "inline-block", fontSize: 14 };

export default function MarchePage() {
  const { rang, ready } = useNiveau();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Offre | null>(null);
  const [contact, setContact] = useState(false);
  const [me, setMe] = useState({ nom: "", prenom: "", email: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/app/api/offres").then((r) => r.json()).then((d) => setOffres(d.offres || [])).catch(() => {}).finally(() => setLoading(false));
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => { const u = d.user; if (u) setMe({ nom: u.nom || "", prenom: u.prenom || "", email: u.email || "" }); }).catch(() => {});
  }, []);

  function openOffre(o: Offre) { setSel(o); setContact(false); setSent(false); setMessage(""); setError(""); }
  function close() { setSel(null); setContact(false); }

  async function send() {
    if (busy || !sel) return;
    if (!message.trim()) { setError("Détaillez votre demande."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch(`/app/api/offres/${sel.id}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...me, message: message.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Envoi impossible."); setBusy(false); return; }
      setSent(true); setContact(false);
    } catch { setError("Envoi impossible."); }
    setBusy(false);
  }

  if (ready && !peutPorterInitiative(rang)) {
    const etape = prochaineEtape(rang);
    return (
      <AppShell>
        <div className="board-head"><h1>Offres et services Subsidium</h1></div>
        <p className="board-empty">La Market-place est réservée aux <b>Initiateurs</b>. Réalisez votre auto-évaluation pour y accéder.</p>
        {etape && <Link href={etape.href} className="btn btn-coral" style={{ display: "inline-block" }}>{etape.label}</Link>}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="board-head"><h1>Offres et services Subsidium</h1></div>

      {loading ? <p className="board-empty">Chargement des offres…</p>
      : offres.length === 0 ? <p className="board-empty">Aucune offre disponible pour le moment.</p>
      : (
        <div className="idees-grid">
          {offres.map((o) => (
            <div key={o.id} className="icard" role="button" tabIndex={0} onClick={() => openOffre(o)} style={{ cursor: "pointer" }}>
              <div style={{ height: 120, background: o.grad }} />
              <div className="bd">
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
                <div style={{ marginTop: 12 }}><span style={pricePill}>{o.price}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sel && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ height: 150, background: sel.grad, borderTopLeftRadius: 22, borderTopRightRadius: 22, position: "relative" }}>
              <button className="modal-x" onClick={close} aria-label="Fermer" style={{ position: "absolute", top: 14, right: 16 }}>×</button>
            </div>
            <div className="modal-body">
              {!contact && !sent && (
                <>
                  <h2 style={{ fontFamily: "var(--font-display),cursive", fontStyle: "italic", fontSize: "1.4rem", color: "#372646", margin: "4px 0 2px" }}>{sel.title}</h2>
                  <p style={{ color: "#9C919E", fontSize: 13, margin: "0 0 12px" }}>{sel.provider}</p>
                  <p style={{ color: "#5E4A73", lineHeight: 1.6 }}>{sel.desc}</p>
                </>
              )}
              {contact && !sent && (
                <>
                  <h2 style={{ fontFamily: "var(--font-display),cursive", fontStyle: "italic", fontSize: "1.3rem", color: "#372646", margin: "4px 0 12px" }}>Contact Subsidium</h2>
                  <div className="mfield"><label>Nom</label><input value={me.nom} onChange={(e) => setMe({ ...me, nom: e.target.value })} /></div>
                  <div className="mfield"><label>Prénom</label><input value={me.prenom} onChange={(e) => setMe({ ...me, prenom: e.target.value })} /></div>
                  <div className="mfield"><label>Adresse mail</label><input value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} /></div>
                  <div className="mfield"><label>Votre message</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Détaillez la demande que vous souhaitez faire à Subsidium…" /></div>
                  {error && <p className="msg">{error}</p>}
                </>
              )}
              {sent && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <h2 style={{ color: "#1E6B1E", margin: "0 0 6px" }}>✓ Demande envoyée</h2>
                  <p style={{ color: "#5E4A73" }}>Votre demande a bien été transmise à Subsidium. Vous serez recontacté·e prochainement.</p>
                </div>
              )}
            </div>
            {!sent && (
              <div className="modal-foot" style={{ justifyContent: contact ? "flex-end" : "space-between", alignItems: "center", gap: 12 }}>
                {!contact && <span style={pricePill}>{sel.price}</span>}
                {!contact ? (
                  <button className="btn btn-coral" onClick={() => { setContact(true); setError(""); }}>Contacter Subsidium</button>
                ) : (
                  <button className="btn btn-coral" onClick={send} disabled={busy}>{busy ? "Envoi…" : "Envoyer"}</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
