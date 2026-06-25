"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import { useNiveau } from "@/components/useNiveau";
import { peutPorterInitiative, prochaineEtape } from "@/lib/niveau";
import "@/components/MemberBoards.css";

type Resource = { id: number; category: string; title: string; desc: string; provider: string; link: string | null; grad: string };
type Dict = Record<string, string>;

const CATS = ["Financement", "Formation", "Outils & méthodes", "Partenaires", "Accompagnement", "Communication"];
const CAT_KEY: Record<string, string> = { "Financement": "cFin", "Formation": "cForm", "Outils & méthodes": "cTools", "Partenaires": "cPart", "Accompagnement": "cAccomp", "Communication": "cComm" };

const DICT: Record<string, Dict> = {
  fr: {
    title: "Énergie — ressources de soutien",
    intro: "Le Champ Énergie rassemble les ressources qui soutiennent votre action : financements, formations, outils, partenaires et accompagnement.",
    gated: "Le Champ Énergie est réservé aux Initiateurs. Réalisez votre auto-évaluation pour y accéder.",
    search: "Rechercher une ressource…", allCats: "Toutes les catégories",
    loading: "Chargement des ressources…", empty: "Aucune ressource ne correspond à votre recherche.",
    by: "Proposé par", access: "Accéder →", noLink: "Disponible via votre accompagnement SUBSIDIUM. Contactez l'équipe pour l'activer.", close: "Fermer",
    cFin: "Financement", cForm: "Formation", cTools: "Outils & méthodes", cPart: "Partenaires", cAccomp: "Accompagnement", cComm: "Communication",
  },
  en: {
    title: "Energy — support resources",
    intro: "The Energy field gathers the resources that support your action: funding, training, tools, partners and mentoring.",
    gated: "The Energy field is reserved for Initiators. Complete your self-assessment to access it.",
    search: "Search a resource…", allCats: "All categories",
    loading: "Loading resources…", empty: "No resource matches your search.",
    by: "Offered by", access: "Access →", noLink: "Available through your SUBSIDIUM mentoring. Contact the team to activate it.", close: "Close",
    cFin: "Funding", cForm: "Training", cTools: "Tools & methods", cPart: "Partners", cAccomp: "Mentoring", cComm: "Communication",
  },
  it: {
    title: "Energia — risorse di supporto",
    intro: "Il Campo Energia raccoglie le risorse che sostengono la tua azione: finanziamenti, formazioni, strumenti, partner e accompagnamento.",
    gated: "Il Campo Energia è riservato agli Iniziatori. Completa la tua autovalutazione per accedervi.",
    search: "Cerca una risorsa…", allCats: "Tutte le categorie",
    loading: "Caricamento delle risorse…", empty: "Nessuna risorsa corrisponde alla ricerca.",
    by: "Proposto da", access: "Accedi →", noLink: "Disponibile tramite il tuo accompagnamento SUBSIDIUM. Contatta il team per attivarla.", close: "Chiudi",
    cFin: "Finanziamento", cForm: "Formazione", cTools: "Strumenti e metodi", cPart: "Partner", cAccomp: "Accompagnamento", cComm: "Comunicazione",
  },
};
function catLabel(c: string, tr: Dict) { return tr[CAT_KEY[c]] || c; }

export default function EnergiePage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const { rang, ready } = useNiveau();
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sel, setSel] = useState<Resource | null>(null);

  useEffect(() => {
    fetch("/app/api/energie").then((r) => r.json()).then((d) => setItems(d.resources || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => items.filter((r) => {
    if (cat && r.category !== cat) return false;
    if (q) { const s = q.toLowerCase(); if (!r.title.toLowerCase().includes(s) && !r.desc.toLowerCase().includes(s) && !r.provider.toLowerCase().includes(s)) return false; }
    return true;
  }), [items, q, cat]);

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
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 14px", lineHeight: 1.6 }}>{tr.intro}</p>

      <div className="board-tools">
        <div className="board-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.search} />
        </div>
        <select className="board-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">{tr.allCats}</option>
          {CATS.map((c) => <option key={c} value={c}>{catLabel(c, tr)}</option>)}
        </select>
      </div>

      {loading ? <p className="board-empty">{tr.loading}</p>
      : list.length === 0 ? <p className="board-empty">{tr.empty}</p>
      : (
        <div className="idees-grid">
          {list.map((r) => (
            <div key={r.id} className="icard" role="button" tabIndex={0} onClick={() => setSel(r)} style={{ cursor: "pointer" }}>
              <div style={{ height: 84, background: r.grad }} />
              <div className="bd">
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{catLabel(r.category, tr)}</span>
                <h3 style={{ marginTop: 4 }}>{r.title}</h3>
                <p style={{ color: "#5E4A73", fontSize: 13.5, lineHeight: 1.5 }}>{r.desc.length > 110 ? r.desc.slice(0, 110) + "…" : r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ height: 130, background: sel.grad, borderTopLeftRadius: 22, borderTopRightRadius: 22, position: "relative" }}>
              <button className="modal-x" onClick={() => setSel(null)} aria-label={tr.close} style={{ position: "absolute", top: 14, right: 16 }}>×</button>
            </div>
            <div className="modal-body">
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#C2452F" }}>{catLabel(sel.category, tr)}</span>
              <h2 style={{ fontFamily: "var(--font-display),cursive", fontStyle: "italic", fontSize: "1.4rem", color: "#372646", margin: "2px 0 2px" }}>{sel.title}</h2>
              <p style={{ color: "#9C919E", fontSize: 13, margin: "0 0 12px" }}>{tr.by} {sel.provider}</p>
              <p style={{ color: "#5E4A73", lineHeight: 1.6, margin: 0 }}>{sel.desc}</p>
            </div>
            <div className="modal-foot">
              {sel.link ? (
                <a href={sel.link} target="_blank" rel="noopener noreferrer" className="btn btn-coral">{tr.access}</a>
              ) : (
                <span style={{ color: "#9C919E", fontSize: 13 }}>{tr.noLink}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
