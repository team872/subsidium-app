"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useLang } from "@/components/LangProvider";
import "@/components/MemberBoards.css";

type Statut = "todo" | "doing" | "done";
type Tache = { id: number; titre: string; description: string; statut: Statut; assignee_id: number | null; assignee: string | null; echeance: string | null; created_at: string };
type Jalon = { id: number; titre: string; fait: boolean; ordre: number; cible: string | null; created_at: string };
type Doc = { id: number; nom: string; url: string | null; note: string; auteur: string | null; created_at: string };
type Membre = { user_id: number; nom: string; prenom: string; role: string };
type Stats = { membres: number; taches: { todo: number; doing: number; done: number; total: number }; jalons: { faits: number; total: number }; docs: number; messages: number };
type Post = { id: number; corps: string; auteur: string; created_at: string };
type Data = { projet: { id: number; title: string; theme: string | null; lieu: string | null; grad: string }; role: string; isOwner: boolean; taches: Tache[]; jalons: Jalon[]; docs: Doc[]; membres: Membre[]; stats: Stats };
type Tab = "dash" | "tasks" | "team" | "talk";
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    back: "Projet", workroom: "Espace de travail", reserved: "Espace réservé au porteur et aux contributeurs du projet.",
    loading: "Chargement…", notfound: "Espace de travail indisponible.",
    tabDash: "Tableau de bord", tabTasks: "Tâches", tabTeam: "Membres & documents", tabTalk: "Discussion",
    progress: "Avancement", roadmap: "Feuille de route", members: "Membres", tasks: "Tâches", docs: "Documents", messages: "Messages",
    addJalon: "Ajouter le jalon", jalonTitle: "Nouveau jalon…", noJalon: "Aucun jalon pour l'instant.",
    todo: "À faire", doing: "En cours", done: "Fait", newTask: "Nouvelle tâche", taskTitle: "Titre de la tâche",
    descr: "Description", assignee: "Assigné à", nobody: "— Non assigné", due: "Échéance", create: "Créer", cancel: "Annuler",
    noTask: "Aucune tâche.", del: "Supprimer",
    docName: "Nom du document", docUrl: "Lien (URL)", docNote: "Note", addDoc: "Ajouter", noDoc: "Aucun document partagé.", open: "Ouvrir",
    noMember: "Aucun membre.", post: "Publier", postPh: "Partagez une avancée, une décision, un appel à contribution…", noPost: "Aucune publication pour le moment.",
    aiTitle: "Assistant SUBSIDIUM AI", aiDesc: "Bientôt : l'assistant pourra rédiger un compte-rendu, proposer des tâches à partir de la discussion et synthétiser l'avancement du projet.", aiSoon: "Bientôt disponible",
    owner: "Porteur", membre: "Contributeur", suiveur: "Suiveur",
  },
  en: {
    back: "Project", workroom: "Workspace", reserved: "This workspace is reserved for the project owner and contributors.",
    loading: "Loading…", notfound: "Workspace unavailable.",
    tabDash: "Dashboard", tabTasks: "Tasks", tabTeam: "Members & documents", tabTalk: "Discussion",
    progress: "Progress", roadmap: "Roadmap", members: "Members", tasks: "Tasks", docs: "Documents", messages: "Messages",
    addJalon: "Add milestone", jalonTitle: "New milestone…", noJalon: "No milestone yet.",
    todo: "To do", doing: "In progress", done: "Done", newTask: "New task", taskTitle: "Task title",
    descr: "Description", assignee: "Assigned to", nobody: "— Unassigned", due: "Due date", create: "Create", cancel: "Cancel",
    noTask: "No task.", del: "Delete",
    docName: "Document name", docUrl: "Link (URL)", docNote: "Note", addDoc: "Add", noDoc: "No shared document.", open: "Open",
    noMember: "No member.", post: "Post", postPh: "Share an update, a decision, a call for contribution…", noPost: "No post yet.",
    aiTitle: "SUBSIDIUM AI assistant", aiDesc: "Coming soon: the assistant will draft minutes, suggest tasks from the discussion and summarize the project's progress.", aiSoon: "Coming soon",
    owner: "Owner", membre: "Contributor", suiveur: "Follower",
  },
  it: {
    back: "Progetto", workroom: "Spazio di lavoro", reserved: "Spazio riservato al titolare e ai contributori del progetto.",
    loading: "Caricamento…", notfound: "Spazio di lavoro non disponibile.",
    tabDash: "Cruscotto", tabTasks: "Attività", tabTeam: "Membri e documenti", tabTalk: "Discussione",
    progress: "Avanzamento", roadmap: "Tabella di marcia", members: "Membri", tasks: "Attività", docs: "Documenti", messages: "Messaggi",
    addJalon: "Aggiungi tappa", jalonTitle: "Nuova tappa…", noJalon: "Nessuna tappa per ora.",
    todo: "Da fare", doing: "In corso", done: "Fatto", newTask: "Nuova attività", taskTitle: "Titolo dell'attività",
    descr: "Descrizione", assignee: "Assegnato a", nobody: "— Non assegnato", due: "Scadenza", create: "Crea", cancel: "Annulla",
    noTask: "Nessuna attività.", del: "Elimina",
    docName: "Nome del documento", docUrl: "Link (URL)", docNote: "Nota", addDoc: "Aggiungi", noDoc: "Nessun documento condiviso.", open: "Apri",
    noMember: "Nessun membro.", post: "Pubblica", postPh: "Condividi un avanzamento, una decisione, un appello…", noPost: "Nessuna pubblicazione per ora.",
    aiTitle: "Assistente SUBSIDIUM AI", aiDesc: "Presto: l'assistente potrà redigere un verbale, proporre attività dalla discussione e sintetizzare l'avanzamento del progetto.", aiSoon: "Presto disponibile",
    owner: "Titolare", membre: "Contributore", suiveur: "Follower",
  },
};

function initials(n: string) {
  return n.replace(/[^A-Za-zÀ-ſ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}

export default function WorkRoomPage() {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const params = useParams();
  const id = Number(params?.id);
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-GB" : "fr-FR";
  const fdate = (s: string | null) => { if (!s) return ""; try { return new Date(s).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }); } catch { return ""; } };

  const [data, setData] = useState<Data | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>("dash");
  const [loading, setLoading] = useState(true);
  const [reserved, setReserved] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [showTask, setShowTask] = useState(false);
  const [tform, setTform] = useState({ titre: "", description: "", assignee_id: "", echeance: "" });
  const [jtitre, setJtitre] = useState("");
  const [jcible, setJcible] = useState("");
  const [showDoc, setShowDoc] = useState(false);
  const [dform, setDform] = useState({ nom: "", url: "", note: "" });
  const [corps, setCorps] = useState("");

  const reload = useCallback(async () => {
    const r = await fetch(`/app/api/projets/${id}/workroom`);
    if (r.status === 403) { setReserved(true); return; }
    if (!r.ok) { setErr(tr.notfound); return; }
    const d = await r.json();
    setData(d);
    const p = await fetch(`/app/api/projets/${id}/posts`).then((x) => x.json()).catch(() => ({ posts: [] }));
    setPosts(p.posts || []);
  }, [id, tr.notfound]);

  useEffect(() => { reload().catch(() => setErr(tr.notfound)).finally(() => setLoading(false)); }, [reload]);

  async function api(path: string, method: string, body?: any) {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/app/api/projets/${id}/${path}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      if (!r.ok) { const d = await r.json().catch(() => ({} as any)); setErr(d.error || "Action impossible."); setBusy(false); return false; }
      await reload();
      setBusy(false); return true;
    } catch { setErr("Action impossible."); setBusy(false); return false; }
  }

  async function addTask() {
    if (!tform.titre.trim()) return;
    if (await api("workroom/taches", "POST", { titre: tform.titre, description: tform.description, assignee_id: tform.assignee_id || null, echeance: tform.echeance || null })) {
      setShowTask(false); setTform({ titre: "", description: "", assignee_id: "", echeance: "" });
    }
  }
  const moveTask = (t: Tache, statut: Statut) => api(`workroom/taches/${t.id}`, "PATCH", { statut });
  const delTask = (t: Tache) => api(`workroom/taches/${t.id}`, "DELETE");
  async function addJalon() { if (!jtitre.trim()) return; if (await api("workroom/jalons", "POST", { titre: jtitre, cible: jcible || null })) { setJtitre(""); setJcible(""); } }
  const toggleJalon = (j: Jalon) => api(`workroom/jalons/${j.id}`, "PATCH", { fait: !j.fait });
  const delJalon = (j: Jalon) => api(`workroom/jalons/${j.id}`, "DELETE");
  async function addDoc() { if (!dform.nom.trim()) return; if (await api("workroom/docs", "POST", dform)) { setShowDoc(false); setDform({ nom: "", url: "", note: "" }); } }
  const delDoc = (d: Doc) => api(`workroom/docs/${d.id}`, "DELETE");
  async function publier() { if (!corps.trim()) return; if (await api("posts", "POST", { corps })) setCorps(""); }

  if (loading) return <AppShell><Link href={`/projets/${id}`} className="board-back">← {tr.back}</Link><p className="board-empty">{tr.loading}</p></AppShell>;
  if (reserved) return <AppShell><Link href={`/projets/${id}`} className="board-back">← {tr.back}</Link><p className="board-empty">{tr.reserved}</p></AppShell>;
  if (!data) return <AppShell><Link href={`/projets/${id}`} className="board-back">← {tr.back}</Link><p className="board-empty">{err || tr.notfound}</p></AppShell>;

  const { projet, isOwner, taches, jalons, docs, membres, stats } = data;
  const pct = stats.taches.total ? Math.round((stats.taches.done / stats.taches.total) * 100) : 0;
  const ROLE: Dict = { owner: tr.owner, membre: tr.membre, suiveur: tr.suiveur };
  const tabs: [Tab, string][] = [["dash", tr.tabDash], ["tasks", tr.tabTasks], ["team", tr.tabTeam], ["talk", tr.tabTalk]];
  const cols: [Statut, string][] = [["todo", tr.todo], ["doing", tr.doing], ["done", tr.done]];

  const cardBox = (flex: number, basis: number): React.CSSProperties => ({ flex: `${flex} 1 ${basis}px`, border: "1px solid #EBD9CD", borderRadius: 16, background: "#fff", padding: "16px 18px" });
  const h3st: React.CSSProperties = { margin: "0 0 6px", color: "#372646", fontSize: 15 };
  const h2st: React.CSSProperties = { fontFamily: "var(--font-display),cursive", color: "#372646", margin: "24px 0 12px" };
  const h2st0: React.CSSProperties = { fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" };
  const xBtn: React.CSSProperties = { border: "none", background: "none", color: "#C2452F", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" };
  const stat = (label: string, val: number | string) => (<div style={{ background: "#FBF7F3", borderRadius: 10, padding: "8px 10px" }}><div style={{ fontSize: 20, fontWeight: 800, color: "#C2452F" }}>{val}</div><div style={{ fontSize: 12, color: "#5E4A73" }}>{label}</div></div>);

  return (
    <AppShell>
      <Link href={`/projets/${id}`} className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        {tr.back}
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 0 4px" }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, background: projet.grad, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontFamily: "var(--font-display),cursive" }}>{initials(projet.title)}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#C2452F" }}>{tr.workroom}</div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display),cursive", color: "#372646", fontSize: 26 }}>{projet.title}</h1>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid #EBD9CD", margin: "10px 0 18px" }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ border: "none", background: "none", cursor: "pointer", padding: "8px 12px", fontSize: 14.5, fontWeight: tab === k ? 800 : 600, color: tab === k ? "#C2452F" : "#5E4A73", borderBottom: tab === k ? "3px solid #F27B6A" : "3px solid transparent" }}>{label}</button>
        ))}
      </div>

      {err && <p className="msg" style={{ marginBottom: 12 }}>{err}</p>}

      {tab === "dash" && (
        <div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={cardBox(2, 280)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={h3st}>{tr.progress}</h3>
                <span style={{ fontWeight: 800, color: "#5E8A57", fontSize: 22 }}>{pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "#EFE8F2", overflow: "hidden", margin: "8px 0 10px" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#9FC79A,#5E8A57)" }} />
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13, color: "#5E4A73" }}>
                <span>{tr.todo}: <b>{stats.taches.todo}</b></span>
                <span>{tr.doing}: <b>{stats.taches.doing}</b></span>
                <span>{tr.done}: <b>{stats.taches.done}</b></span>
              </div>
            </div>
            <div style={cardBox(1, 220)}>
              <h3 style={h3st}>{projet.lieu || tr.tabDash}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {stat(tr.members, stats.membres)}
                {stat(tr.docs, stats.docs)}
                {stat(tr.messages, stats.messages)}
                {stat(tr.roadmap, `${stats.jalons.faits}/${stats.jalons.total}`)}
              </div>
            </div>
          </div>

          <h2 style={h2st}>{tr.roadmap}</h2>
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: "6px 0" }}>
            {jalons.length === 0 ? <div style={{ padding: "10px 16px", color: "#9C919E" }}>{tr.noJalon}</div> :
              jalons.map((j) => (
                <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: "1px solid #F3EAE2" }}>
                  <button onClick={() => isOwner && toggleJalon(j)} disabled={!isOwner || busy} style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (j.fait ? "#5E8A57" : "#CBB9A8"), background: j.fait ? "#5E8A57" : "#fff", color: "#fff", cursor: isOwner ? "pointer" : "default", flex: "0 0 auto", lineHeight: 1, fontSize: 14 }}>{j.fait ? "✓" : ""}</button>
                  <span style={{ flex: 1, color: "#372646", textDecoration: j.fait ? "line-through" : "none", opacity: j.fait ? 0.6 : 1 }}>{j.titre}</span>
                  {j.cible && <span style={{ fontSize: 12, color: "#9C919E" }}>{fdate(j.cible)}</span>}
                  {isOwner && <button onClick={() => delJalon(j)} disabled={busy} style={xBtn} aria-label={tr.del}>×</button>}
                </div>
              ))}
            {isOwner && (
              <div style={{ display: "flex", gap: 8, padding: "10px 16px", flexWrap: "wrap" }}>
                <input value={jtitre} onChange={(e) => setJtitre(e.target.value)} placeholder={tr.jalonTitle} style={{ flex: "1 1 200px", border: "1px solid #E3D7CC", borderRadius: 10, padding: "8px 12px", color: "#372646" }} />
                <input type="date" value={jcible} onChange={(e) => setJcible(e.target.value)} style={{ border: "1px solid #E3D7CC", borderRadius: 10, padding: "8px 12px", color: "#372646" }} />
                <button className="btn btn-coral" onClick={addJalon} disabled={busy || !jtitre.trim()}>{tr.addJalon}</button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 22, border: "1px dashed #D7B8C9", borderRadius: 16, padding: "16px 18px", background: "linear-gradient(135deg,#FBF4F8,#F6F0FB)", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: "1px solid #E6D4E0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✨</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 4px", color: "#5E2A4E" }}>{tr.aiTitle}</h3>
              <p style={{ margin: "0 0 10px", color: "#6B4E63", fontSize: 13.5 }}>{tr.aiDesc}</p>
              <button className="btn btn-ghost" disabled style={{ opacity: 0.7, cursor: "default" }}>{tr.aiSoon}</button>
            </div>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div>
          <div style={{ marginBottom: 14 }}><button className="btn btn-coral" onClick={() => setShowTask(true)}>{tr.newTask}</button></div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
            {cols.map(([key, label]) => {
              const list = taches.filter((t) => t.statut === key);
              return (
                <div key={key} style={{ flex: "1 1 240px", minWidth: 240 }}>
                  <div style={{ fontWeight: 800, color: "#5E4A73", fontSize: 13, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label} · {list.length}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {list.length === 0 ? <div style={{ color: "#B4A8BE", fontSize: 13, padding: "10px 0" }}>{tr.noTask}</div> :
                      list.map((t) => (
                        <div key={t.id} style={{ border: "1px solid #EBD9CD", borderRadius: 12, background: "#fff", padding: "10px 12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                            <b style={{ color: "#372646", fontSize: 14 }}>{t.titre}</b>
                            <button onClick={() => delTask(t)} disabled={busy} style={xBtn} aria-label={tr.del}>×</button>
                          </div>
                          {t.description && <p style={{ margin: "4px 0 8px", color: "#5E4A73", fontSize: 13, whiteSpace: "pre-wrap" }}>{t.description}</p>}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                            {t.assignee && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#5E8A57", background: "#E9F2E7", borderRadius: 999, padding: "2px 8px" }}>{t.assignee}</span>}
                            {t.echeance && <span style={{ fontSize: 11.5, color: "#9C919E" }}>{fdate(t.echeance)}</span>}
                            <select value={t.statut} onChange={(e) => moveTask(t, e.target.value as Statut)} disabled={busy} style={{ marginLeft: "auto", border: "1px solid #E3D7CC", borderRadius: 8, padding: "3px 6px", fontSize: 12, color: "#372646" }}>
                              {cols.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "team" && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <section style={{ flex: "1 1 240px" }}>
            <h2 style={h2st0}>{tr.members}</h2>
            <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: "6px 0" }}>
              {membres.length === 0 ? <div style={{ padding: "8px 14px", color: "#9C919E" }}>{tr.noMember}</div> :
                membres.map((m) => (
                  <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 999, background: "#EFE8F2", color: "#5E4A73", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(`${m.prenom} ${m.nom}`)}</span>
                    <span style={{ color: "#372646", fontSize: 14 }}>{`${m.prenom} ${m.nom}`.trim() || tr.membre}</span>
                    {m.role !== "suiveur" && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: m.role === "owner" ? "#C2452F" : "#5E8A57" }}>{ROLE[m.role] || m.role}</span>}
                  </div>
                ))}
            </div>
          </section>
          <section style={{ flex: "2 1 320px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={h2st0}>{tr.docs}</h2>
              <button className="btn btn-coral" onClick={() => setShowDoc(true)}>{tr.addDoc}</button>
            </div>
            {docs.length === 0 ? <p className="board-empty">{tr.noDoc}</p> :
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {docs.map((d) => (
                  <div key={d.id} style={{ border: "1px solid #EBD9CD", borderRadius: 12, background: "#fff", padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#372646", fontWeight: 700, fontSize: 14 }}>{d.nom}</div>
                      {d.note && <div style={{ color: "#5E4A73", fontSize: 13 }}>{d.note}</div>}
                      <div style={{ color: "#9C919E", fontSize: 12, marginTop: 2 }}>{d.auteur} · {fdate(d.created_at)}</div>
                    </div>
                    {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 13 }}>{tr.open}</a>}
                    <button onClick={() => delDoc(d)} disabled={busy} style={xBtn} aria-label={tr.del}>×</button>
                  </div>
                ))}
              </div>}
          </section>
        </div>
      )}

      {tab === "talk" && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: 14, marginBottom: 14, background: "#FCF9F6" }}>
            <textarea value={corps} onChange={(e) => setCorps(e.target.value)} placeholder={tr.postPh} rows={3} style={{ width: "100%", border: "1px solid #E3D7CC", borderRadius: 10, padding: "10px 12px", color: "#372646", resize: "vertical" }} />
            <div style={{ marginTop: 8 }}><button className="btn btn-coral" onClick={publier} disabled={busy || !corps.trim()}>{tr.post}</button></div>
          </div>
          {posts.length === 0 ? <p className="board-empty">{tr.noPost}</p> :
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.map((p) => (
                <div key={p.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, padding: "12px 16px", background: "#fff" }}>
                  <div style={{ color: "#9C919E", fontSize: 12.5, marginBottom: 4 }}>{p.auteur} · {fdate(p.created_at)}</div>
                  <p style={{ color: "#372646", fontSize: 14, margin: 0, whiteSpace: "pre-wrap" }}>{p.corps}</p>
                </div>
              ))}
            </div>}
        </div>
      )}

      {showTask && (
        <div className="modal-overlay" onClick={() => setShowTask(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{tr.newTask}</h2><button className="modal-x" onClick={() => setShowTask(false)} aria-label={tr.cancel}>×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>{tr.taskTitle}</label><input value={tform.titre} onChange={(e) => setTform({ ...tform, titre: e.target.value })} /></div>
              <div className="mfield"><label>{tr.descr}</label><textarea value={tform.description} onChange={(e) => setTform({ ...tform, description: e.target.value })} /></div>
              <div className="mfield"><label>{tr.assignee}</label>
                <select value={tform.assignee_id} onChange={(e) => setTform({ ...tform, assignee_id: e.target.value })}>
                  <option value="">{tr.nobody}</option>
                  {membres.map((m) => <option key={m.user_id} value={m.user_id}>{`${m.prenom} ${m.nom}`.trim() || tr.membre}</option>)}
                </select>
              </div>
              <div className="mfield"><label>{tr.due}</label><input type="date" value={tform.echeance} onChange={(e) => setTform({ ...tform, echeance: e.target.value })} /></div>
              {err && <p className="msg">{err}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={addTask} disabled={busy || !tform.titre.trim()}>{tr.create}</button></div>
          </div>
        </div>
      )}

      {showDoc && (
        <div className="modal-overlay" onClick={() => setShowDoc(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{tr.addDoc}</h2><button className="modal-x" onClick={() => setShowDoc(false)} aria-label={tr.cancel}>×</button></div>
            <div className="modal-body">
              <div className="mfield"><label>{tr.docName}</label><input value={dform.nom} onChange={(e) => setDform({ ...dform, nom: e.target.value })} /></div>
              <div className="mfield"><label>{tr.docUrl}</label><input value={dform.url} onChange={(e) => setDform({ ...dform, url: e.target.value })} placeholder="https://…" /></div>
              <div className="mfield"><label>{tr.docNote}</label><textarea value={dform.note} onChange={(e) => setDform({ ...dform, note: e.target.value })} /></div>
              {err && <p className="msg">{err}</p>}
            </div>
            <div className="modal-foot"><button className="btn btn-coral" onClick={addDoc} disabled={busy || !dform.nom.trim()}>{tr.addDoc}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
