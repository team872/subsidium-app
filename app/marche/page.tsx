"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import { useNiveau } from "@/components/useNiveau";
import { peutPorterInitiative, prochaineEtape } from "@/lib/niveau";
import "@/components/MemberBoards.css";

type Offre = { id: number; title: string; provider: string; desc: string; price: string; grad: string; image: string | null };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Offres et services Subsidium",
    gated: "La Market-place est réservée aux Initiateurs. Réalisez votre auto-évaluation pour y accéder.",
    loading: "Chargement des offres…", empty: "Aucune offre disponible pour le moment.",
    reqMsg: "Détaillez votre demande.", sendErr: "Envoi impossible.",
    contact: "Contact Subsidium", fNom: "Nom", fPrenom: "Prénom", fMail: "Adresse mail", fMsg: "Votre message",
    phMsg: "Détaillez la demande que vous souhaitez faire à Subsidium…",
    sentTitle: "✓ Demande envoyée", sentBody: "Votre demande a bien été transmise à Subsidium. Vous serez recontacté·e prochainement.",
    contactBtn: "Contacter Subsidium", send: "Envoyer", sending: "Envoi…", close: "Fermer",
  },
  en: {
    title: "Subsidium offers and services",
    gated: "The Marketplace is reserved for Initiators. Complete your self-assessment to access it.",
    loading: "Loading offers…", empty: "No offer available at the moment.",
    reqMsg: "Please detail your request.", sendErr: "Could not send.",
    contact: "Contact Subsidium", fNom: "Last name", fPrenom: "First name", fMail: "Email address", fMsg: "Your message",
    phMsg: "Detail the request you'd like to make to Subsidium…",
    sentTitle: "✓ Request sent", sentBody: "Your request has been sent to Subsidium. You will be contacted shortly.",
    contactBtn: "Contact Subsidium", send: "Send", sending: "Sending…", close: "Close",
  },
  it: {
    title: "Offerte e servizi Subsidium",
    gated: "Il Marketplace è riservato agli Iniziatori. Completa la tua autovalutazione per accedervi.",
    loading: "Caricamento delle offerte…", empty: "Nessuna offerta disponibile al momento.",
    reqMsg: "Descrivi la tua richiesta.", sendErr: "Invio impossibile.",
    contact: "Contatta Subsidium", fNom: "Cognome", fPrenom: "Nome", fMail: "Indirizzo e-mail", fMsg: "Il tuo messaggio",
    phMsg: "Descrivi la richiesta che vuoi fare a Subsidium…",
    sentTitle: "✓ Richiesta inviata", sentBody: "La tua richiesta è stata inviata a Subsidium. Sarai ricontattato a breve.",
    contactBtn: "Contatta Subsidium", send: "Invia", sending: "Invio…", close: "Chiudi",
  },
};

const pricePill: React.CSSProperties = { background: "#FBE7DC", color: "#C2452F", fontWeight: 700, borderRadius: 999, padding: "7px 16px", display: "inline-block", fontSize: 14 };

function headerStyle(grad: string, image: string | null, h: number, rounded = false): React.CSSProperties {
  const base: React.CSSProperties = { height: h, ...(rounded ? { borderTopLeftRadius: 22, borderTopRightRadius: 22 } : {}) };
  if (image) {
    return { ...base, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.08), rgba(40,28,52,.42)), url("${image}")`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { ...base, background: grad };
}

export default function MarchePage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
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
    if (!message.trim()) { setError(tr.reqMsg); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch(`/app/api/offres/${sel.id}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...me, message: message.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || tr.sendErr); setBusy(false); return; }
      setSent(true); setContact(false);
    } catch { setError(tr.sendErr); }
    setBusy(false);
  }

  if (ready && !peutPorterInitiative(rang)) {
    const etape = prochaineEtape(rang, undefined, undefined, lang);
    return (
      <AppShell>
        <div className="board-head"><h1>{tr.title}</h1></div>
        <p className="board-empty">{tr.gated}</p>
        {etape && <Link href={etape.href} className="btn btn-coral" style={{ display: "inline-block" }}>{etape.label}</Link>}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="board-head"><h1>{tr.title}</h1></div>

      {loading ? <p className="board-empty">{tr.loading}</p>
      : offres.length === 0 ? <p className="board-empty">{tr.empty}</p>
      : (
        <div className="idees-grid">
          {offres.map((o) => (
            <div key={o.id} className="icard" role="button" tabIndex={0} onClick={() => openOffre(o)} style={{ cursor: "pointer" }}>
              <div style={headerStyle(o.grad, o.image, 120)} />
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
            <div style={{ ...headerStyle(sel.grad, sel.image, 150, true), position: "relative" }}>
              <button className="modal-x" onClick={close} aria-label={tr.close} style={{ position: "absolute", top: 14, right: 16 }}>×</button>
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
                  <h2 style={{ fontFamily: "var(--font-display),cursive", fontStyle: "italic", fontSize: "1.3rem", color: "#372646", margin: "4px 0 12px" }}>{tr.contact}</h2>
                  <div className="mfield"><label>{tr.fNom}</label><input value={me.nom} onChange={(e) => setMe({ ...me, nom: e.target.value })} /></div>
                  <div className="mfield"><label>{tr.fPrenom}</label><input value={me.prenom} onChange={(e) => setMe({ ...me, prenom: e.target.value })} /></div>
                  <div className="mfield"><label>{tr.fMail}</label><input value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} /></div>
                  <div className="mfield"><label>{tr.fMsg}</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={tr.phMsg} /></div>
                  {error && <p className="msg">{error}</p>}
                </>
              )}
              {sent && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <h2 style={{ color: "#1E6B1E", margin: "0 0 6px" }}>{tr.sentTitle}</h2>
                  <p style={{ color: "#5E4A73" }}>{tr.sentBody}</p>
                </div>
              )}
            </div>
            {!sent && (
              <div className="modal-foot" style={{ justifyContent: contact ? "flex-end" : "space-between", alignItems: "center", gap: 12 }}>
                {!contact && <span style={pricePill}>{sel.price}</span>}
                {!contact ? (
                  <button className="btn btn-coral" onClick={() => { setContact(true); setError(""); }}>{tr.contactBtn}</button>
                ) : (
                  <button className="btn btn-coral" onClick={send} disabled={busy}>{busy ? tr.sending : tr.send}</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
