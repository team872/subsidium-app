"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import ImagePicker from "@/components/ImagePicker";
import { keywordsFromText } from "@/lib/keywords";
import "@/components/MemberBoards.css";

const CarteSubsidium = dynamic(() => import("@/components/CarteSubsidium"), {
  ssr: false,
  loading: () => <div className="board-empty">…</div>,
});

type Org = { id: number; name: string; type: string; region: string | null; desc: string; adresse: string | null; grad: string; labellisee?: boolean; image: string | null };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Organisations labellisées", create: "Créer une organisation", mine: "Mes organisations",
    pending: "En attente de labellisation", labelled: "Labellisée",
    search: "Saisissez une ville, un code postal, un département, etc.", allTypes: "Tous les types",
    list: "Liste", map: "Carte",
    loading: "Chargement des organisations…", empty: "Aucune organisation ne correspond à votre recherche.",
    reqName: "Le nom de l'organisation est requis.", createErr: "Création impossible.", creating: "Création…", createBtn: "Créer",
    fName: "Nom de l'organisation", fType: "Type", fRegion: "Région / département", fDesc: "Description", fAdresse: "Adresse", fTel: "Téléphone", fMail: "Adresse mail", fSite: "Site internet", fImage: "Image",
    phDesc: "Présentez la mission de votre organisation…",
    note: "Votre organisation sera soumise à labellisation par Subsidium avant d'apparaître dans l'annuaire.", close: "Fermer",
    tAssoc: "Association", tPublic: "Établissement public", tColl: "Collectivité territoriale", tEnt: "Entreprise", tAutre: "Autre",
    teaser: "Aperçu Visiteur : vous voyez quelques organisations d'exemple. Adhérez pour accéder à l'annuaire complet, aux coordonnées et aux fiches détaillées.", join: "Adhérer pour tout voir",
  },
  en: {
    title: "Accredited organisations", create: "Create an organisation", mine: "My organisations",
    pending: "Pending accreditation", labelled: "Accredited",
    search: "Enter a city, postcode, department, etc.", allTypes: "All types",
    list: "List", map: "Map",
    loading: "Loading organisations…", empty: "No organisation matches your search.",
    reqName: "The organisation name is required.", createErr: "Could not create.", creating: "Creating…", createBtn: "Create",
    fName: "Organisation name", fType: "Type", fRegion: "Region / department", fDesc: "Description", fAdresse: "Address", fTel: "Phone", fMail: "Email address", fSite: "Website", fImage: "Image",
    phDesc: "Describe your organisation's mission…",
    note: "Your organisation will be submitted for accreditation by Subsidium before appearing in the directory.", close: "Close",
    tAssoc: "Nonprofit", tPublic: "Public institution", tColl: "Local authority", tEnt: "Company", tAutre: "Other",
    teaser: "Visitor preview: you see a few sample organisations. Join to access the full directory, contact details and full profiles.", join: "Join to see everything",
  },
  it: {
    title: "Organizzazioni accreditate", create: "Crea un'organizzazione", mine: "Le mie organizzazioni",
    pending: "In attesa di accreditamento", labelled: "Accreditata",
    search: "Inserisci una città, un CAP, un dipartimento, ecc.", allTypes: "Tutti i tipi",
    list: "Elenco", map: "Mappa",
    loading: "Caricamento delle organizzazioni…", empty: "Nessuna organizzazione corrisponde alla ricerca.",
    reqName: "Il nome dell'organizzazione è obbligatorio.", createErr: "Creazione impossibile.", creating: "Creazione…", createBtn: "Crea",
    fName: "Nome dell'organizzazione", fType: "Tipo", fRegion: "Regione / dipartimento", fDesc: "Descrizione", fAdresse: "Indirizzo", fTel: "Telefono", fMail: "Indirizzo e-mail", fSite: "Sito web", fImage: "Immagine",
    phDesc: "Presenta la missione della tua organizzazione…",
    note: "La tua organizzazione sarà sottoposta ad accreditamento da Subsidium prima di apparire nell'elenco.", close: "Chiudi",
    tAssoc: "Associazione", tPublic: "Ente pubblico", tColl: "Ente locale", tEnt: "Azienda", tAutre: "Altro",
    teaser: "Anteprima Visitatore: vedi alcune organizzazioni di esempio. Aderisci per accedere all'elenco completo, ai contatti e alle schede dettagliate.", join: "Aderisci per vedere tutto",
  },
};

const TYPES = ["Association", "Établissement public", "Collectivité territoriale", "Entreprise", "Autre"];
const TYPE_KEY: Record<string, string> = { "Association": "tAssoc", "Établissement public": "tPublic", "Collectivité territoriale": "tColl", "Entreprise": "tEnt", "Autre": "tAutre" };
function typeLabel(t: string, tr: Dict) { return tr[TYPE_KEY[t]] || t; }

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "O";
}
function orgHeader(o: Org) {
  if (o.image) {
    return <div style={{ height: 96, flexShrink: 0, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.05), rgba(40,28,52,.4)), url("${o.image}")`, backgroundSize: "cover", backgroundPosition: "center" }} />;
  }
  return <div style={{ height: 96, flexShrink: 0, background: o.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(o.name)}</div>;
}
function OrgCard({ o, view }: { o: Org; view: "liste" | "carte" }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <Link href={`/organisations/${o.id}?vue=${view}`} className="icard">
      {orgHeader(o)}
      <div className="bd">
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{typeLabel(o.type, tr)}</span>
        <h3 style={{ marginTop: 4 }}>{o.name}</h3>
        {o.adresse && <p style={{ color: "#9C919E", fontSize: 13 }}>{o.adresse}</p>}
      </div>
    </Link>
  );
}

// Ligne compacte (sans photo) pour la colonne latérale en vue Carte.
function OrgRow({ o }: { o: Org }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  return (
    <Link href={`/organisations/${o.id}?vue=carte`} style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", border: "1px solid #EFE3DA", borderRadius: 12, padding: "10px 12px", textDecoration: "none" }}>
      <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, background: o.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "var(--font-display),cursive" }}>{initials(o.name)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#9C919E" }}>{typeLabel(o.type, tr)}</span>
        <h3 style={{ margin: "1px 0 2px", fontSize: 15, color: "#372646", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</h3>
        {o.adresse && <p style={{ margin: 0, color: "#9C919E", fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.adresse}</p>}
      </div>
    </Link>
  );
}

export default function OrganisationsPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [mine, setMine] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [allPoints, setAllPoints] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Association", region: "", desc: "", adresse: "", telephone: "", email: "", site: "", image: null as string | null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("vue");
    if (v === "liste" || v === "carte") setView(v);
  }, []);
  function changeView(v: "liste" | "carte") {
    setView(v);
    const sp = new URLSearchParams(window.location.search);
    sp.set("vue", v);
    window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
  }

  useEffect(() => {
    fetch("/app/api/organisations").then((r) => r.json()).then((d) => { setOrgs(d.organisations || []); setRestricted(!!d.restricted); setTotal(Number(d.total ?? 0)); }).catch(() => {}).finally(() => setLoading(false));
    fetch("/app/api/organisations/mine").then((r) => r.json()).then((d) => setMine(d.organisations || [])).catch(() => {});
    fetch("/app/api/organisations/geo").then((r) => r.json()).then((d) => setAllPoints(d.points || [])).catch(() => {});
  }, []);

  const list = useMemo(() => orgs.filter((o) => {
    if (type && o.type !== type) return false;
    if (q) { const s = q.toLowerCase(); if (!o.name.toLowerCase().includes(s) && !(o.adresse || "").toLowerCase().includes(s) && !(o.region || "").toLowerCase().includes(s)) return false; }
    return true;
  }), [orgs, q, type]);

  const points = useMemo(() => {
    const ids = new Set(list.map((x) => x.id));
    return allPoints.filter((p) => ids.has(p.id)).map((p) => ({ ...p, href: `${p.href}?vue=carte` }));
  }, [allPoints, list]);

  async function create() {
    if (busy) return;
    if (!form.name.trim()) { setError(tr.reqName); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/organisations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || tr.createErr); setBusy(false); return; }
      router.push(`/organisations/${d.id}`);
    } catch { setError(tr.createErr); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>{tr.title}</h1>
        {!restricted && <button className="btn btn-coral" onClick={() => setOpen(true)}>{tr.create}</button>}
      </div>

      {restricted && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", background: "#FCEFE9", border: "1px solid #F2C9B8", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <p style={{ margin: 0, flex: "1 1 280px", color: "#5E4A73", fontSize: 14, lineHeight: 1.55 }}>
            {tr.teaser}{total > list.length ? ` (+${total - list.length})` : ""}
          </p>
          <Link href="/charte" className="btn btn-coral">{tr.join}</Link>
        </div>
      )}

      {view === "liste" && mine.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 10px" }}>{tr.mine}</h2>
          <div className="idees-grid">
            {mine.map((o) => (
              <Link key={o.id} href={`/organisations/${o.id}?vue=liste`} className="icard">
                {orgHeader(o)}
                <div className="bd">
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{typeLabel(o.type, tr)}</span>
                  <h3 style={{ marginTop: 4 }}>{o.name}</h3>
                  {o.labellisee === false
                    ? <span style={{ fontSize: 12, fontWeight: 700, color: "#8A5A00", background: "#FCE3B4", borderRadius: 999, padding: "2px 8px", display: "inline-block", marginTop: 4 }}>{tr.pending}</span>
                    : <span style={{ fontSize: 12, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "2px 8px", display: "inline-block", marginTop: 4 }}>{tr.labelled}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.search} />
        </div>
        <select className="board-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{tr.allTypes}</option>
          {TYPES.map((t) => <option key={t} value={t}>{typeLabel(t, tr)}</option>)}
        </select>
        <div style={{ display: "inline-flex", border: "1px solid #E3D7CC", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
          <button type="button" onClick={() => changeView("liste")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "liste" ? "#C2452F" : "#FCF9F6", color: view === "liste" ? "#fff" : "#5E4A73" }}>{tr.list}</button>
          <button type="button" onClick={() => changeView("carte")} style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 14, fontWeight: 700, background: view === "carte" ? "#C2452F" : "#FCF9F6", color: view === "carte" ? "#fff" : "#5E4A73" }}>{tr.map}</button>
        </div>
      </div>

      {loading ? <p className="board-empty">{tr.loading}</p>
      : list.length === 0 ? <p className="board-empty">{tr.empty}</p>
      : view === "carte" ? (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {list.map((o) => <OrgRow key={o.id} o={o} />)}
          </div>
          <div style={{ flex: "2 1 440px", minWidth: 300 }}>
            <CarteSubsidium points={points} height={560} />
          </div>
        </div>
      ) : (
        <div className="idees-grid">
          {list.map((o) => <OrgCard key={o.id} o={o} view={view} />)}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{tr.create}</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label={tr.close}>×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>{tr.fName}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fType}</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{typeLabel(t, tr)}</option>)}</select></div>
              <div className="mfield"><label>{tr.fRegion}</label><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fDesc}</label><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder={tr.phDesc} /></div>
              <div className="mfield"><label>{tr.fImage}</label><ImagePicker seed={keywordsFromText(form.name, form.desc) || form.name.trim()} value={form.image} onPick={(u) => setForm({ ...form, image: u })} /></div>
              <div className="mfield"><label>{tr.fAdresse}</label><input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fTel}</label><input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fMail}</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fSite}</label><input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} /></div>
              {error && <p className="msg">{error}</p>}
              <p style={{ color: "#9C919E", fontSize: 12.5 }}>{tr.note}</p>
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={create} disabled={busy}>{busy ? tr.creating : tr.createBtn}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
