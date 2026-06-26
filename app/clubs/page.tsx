"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import ImagePicker from "@/components/ImagePicker";
import { keywordsFromText } from "@/lib/keywords";
import "@/components/MemberBoards.css";

type Club = { id: number; name: string; theme: string | null; descr: string; members: number; grad: string; image: string | null };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Clubs", create: "Créer un club",
    intro1: "Les Clubs réunissent des citoyens autour d'une thématique ou d'un territoire. Rejoignez un club pour échanger et partager.",
    introLeader: "En tant que Leader, vous pouvez créer et animer vos propres clubs.",
    introNot: "La création de clubs est réservée aux Refondateurs Certifiés (Leaders).",
    loading: "Chargement des clubs…", empty: "Aucun club pour le moment.",
    member: "membre", members: "membres",
    reqName: "Le nom du club est requis.", createErr: "Création impossible.", creating: "Création…", createBtn: "Créer",
    fName: "Nom du club", fTheme: "Thème", fDesc: "Description", fImage: "Image",
    phTheme: "Ex. Transition écologique, Quartier…", phDesc: "Présentez l'objet du club…", close: "Fermer",
  },
  en: {
    title: "Clubs", create: "Create a club",
    intro1: "Clubs bring citizens together around a theme or a territory. Join a club to share and exchange.",
    introLeader: "As a Leader, you can create and run your own clubs.",
    introNot: "Creating clubs is reserved for Certified Refounders (Leaders).",
    loading: "Loading clubs…", empty: "No club yet.",
    member: "member", members: "members",
    reqName: "The club name is required.", createErr: "Could not create.", creating: "Creating…", createBtn: "Create",
    fName: "Club name", fTheme: "Theme", fDesc: "Description", fImage: "Image",
    phTheme: "E.g. Ecological transition, Neighbourhood…", phDesc: "Describe the club's purpose…", close: "Close",
  },
  it: {
    title: "Club", create: "Crea un club",
    intro1: "I Club riuniscono i cittadini attorno a un tema o a un territorio. Unisciti a un club per scambiare e condividere.",
    introLeader: "In quanto Leader, puoi creare e animare i tuoi club.",
    introNot: "La creazione di club è riservata ai Rifondatori Certificati (Leader).",
    loading: "Caricamento dei club…", empty: "Nessun club per ora.",
    member: "membro", members: "membri",
    reqName: "Il nome del club è obbligatorio.", createErr: "Creazione impossibile.", creating: "Creazione…", createBtn: "Crea",
    fName: "Nome del club", fTheme: "Tema", fDesc: "Descrizione", fImage: "Immagine",
    phTheme: "Es. Transizione ecologica, Quartiere…", phDesc: "Presenta lo scopo del club…", close: "Chiudi",
  },
};

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "C";
}
function clubHeader(c: Club) {
  if (c.image) return <div style={{ height: 96, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.05), rgba(40,28,52,.4)), url(\"${c.image}\")`, backgroundSize: "cover", backgroundPosition: "center" }} />;
  return <div style={{ height: 96, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 30, fontFamily: "var(--font-display),cursive" }}>{initials(c.name)}</div>;
}

export default function ClubsPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", theme: "", descr: "", image: null as string | null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/app/api/clubs").then((r) => r.json()).then((d) => setClubs(d.clubs || [])).catch(() => {}).finally(() => setLoading(false));
    fetch("/app/api/auth/me").then((r) => r.json()).then((d) => setNiveau(d.user?.niveau ?? 0)).catch(() => {});
  }, []);

  const isLeader = niveau >= 3;

  async function create() {
    if (busy) return;
    if (!form.name.trim()) { setError(tr.reqName); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/app/api/clubs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || tr.createErr); setBusy(false); return; }
      router.push(`/clubs/${d.id}`);
    } catch { setError(tr.createErr); setBusy(false); }
  }

  return (
    <AppShell>
      <div className="board-head">
        <h1>{tr.title}</h1>
        {isLeader && <button className="btn btn-coral" onClick={() => setOpen(true)}>{tr.create}</button>}
      </div>
      <p style={{ maxWidth: 760, color: "#5E4A73", margin: "0 0 18px", lineHeight: 1.6 }}>
        {tr.intro1} {isLeader ? tr.introLeader : tr.introNot}
      </p>

      {loading ? <p className="board-empty">{tr.loading}</p>
      : clubs.length === 0 ? <p className="board-empty">{tr.empty}</p>
      : (
        <div className="idees-grid">
          {clubs.map((c) => (
            <Link key={c.id} href={`/clubs/${c.id}`} className="icard">
              {clubHeader(c)}
              <div className="bd">
                {c.theme && <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "#9C919E" }}>{c.theme}</span>}
                <h3 style={{ marginTop: 4 }}>{c.name}</h3>
                <p style={{ color: "#9C919E", fontSize: 13 }}>{c.members} {c.members > 1 ? tr.members : tr.member}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{tr.create}</h2><button className="modal-x" onClick={() => setOpen(false)} aria-label={tr.close}>×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>{tr.fName}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mfield"><label>{tr.fTheme}</label><input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder={tr.phTheme} /></div>
              <div className="mfield"><label>{tr.fDesc}</label><textarea value={form.descr} onChange={(e) => setForm({ ...form, descr: e.target.value })} placeholder={tr.phDesc} /></div>
              <div className="mfield"><label>{tr.fImage}</label><ImagePicker seed={keywordsFromText(form.name, form.descr) || form.name.trim()} value={form.image} onPick={(u) => setForm({ ...form, image: u })} /></div>
              {error && <p className="msg">{error}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={create} disabled={busy}>{busy ? tr.creating : tr.createBtn}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
