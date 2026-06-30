"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import type { IdeaDTO, CommentDTO } from "@/lib/data";
import "@/components/MemberBoards.css";

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const ALLOWED = ["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

function fileToB64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [idea, setIdea] = useState<IdeaDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [backHref, setBackHref] = useState("/idees");
  const [niveau, setNiveau] = useState(0);
  const [porting, setPorting] = useState(false);
  const [liking, setLiking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("vue");
    if (v === "liste" || v === "carte") setBackHref(`/idees?vue=${v}`);
  }, []);

  // Niveau de l'utilisateur courant (pour proposer « Porter ce projet » aux Initiateurs).
  useEffect(() => {
    fetch("/app/api/me")
      .then((r) => r.json())
      .then((d) => setNiveau(Number(d?.user?.niveau ?? 0)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/app/api/ideas/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setIdea(d.idea || null);
        setComments(d.comments || []);
        setFollowing(!!d.following);
      })
      .catch(() => setIdea(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleFollow() {
    setError("");
    const r = await fetch(`/app/api/ideas/${id}/follow`, { method: "POST" });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "Action impossible.");
      return;
    }
    setFollowing(!!d.following);
  }

  // Soutenir / retirer le soutien (« j'aime ») — ouvert à tout compte connecté (AN056).
  async function like() {
    if (liking) return;
    setLiking(true);
    setError("");
    try {
      const r = await fetch(`/app/api/ideas/${id}/like`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Action impossible.");
        setLiking(false);
        return;
      }
      setIdea((cur) => (cur ? { ...cur, liked: !!d.liked, likes: Number(d.likes ?? cur.likes) } : cur));
    } catch {
      setError("Action impossible.");
    }
    setLiking(false);
  }

  // Passerelle : transformer cette idée (opportunité) en projet + Work Room.
  async function porter() {
    if (porting) return;
    setPorting(true);
    setError("");
    try {
      const r = await fetch(`/app/api/ideas/${id}/porter`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Transformation impossible.");
        setPorting(false);
        return;
      }
      router.push(`/projets/${d.projetId}`);
    } catch {
      setError("Transformation impossible.");
      setPorting(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError("Format non autorisé : images (PNG, JPG, GIF, WebP) ou PDF.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Fichier trop volumineux (max 5 Mo).");
      return;
    }
    setError("");
    setFile(f);
  }

  async function send() {
    const t = draft.trim();
    if ((!t && !file) || !following || sending) return;
    setError("");
    setSending(true);
    try {
      let payloadFile: { name: string; mime: string; dataB64: string } | undefined;
      if (file) {
        const dataB64 = await fileToB64(file);
        payloadFile = { name: file.name, mime: file.type, dataB64 };
      }
      const r = await fetch(`/app/api/ideas/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: t, file: payloadFile }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Envoi impossible.");
        setSending(false);
        return;
      }
      setComments((c) => [...c, d.comment]);
      setDraft("");
      setFile(null);
    } catch {
      setError("Envoi impossible.");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <AppShell>
        <Link href={backHref} className="board-back">← Toutes les idées</Link>
        <p className="board-empty">Chargement…</p>
      </AppShell>
    );
  }

  if (!idea) {
    return (
      <AppShell>
        <Link href={backHref} className="board-back">← Toutes les idées</Link>
        <p className="board-empty">Cette idée est introuvable.</p>
      </AppShell>
    );
  }

  const projetId: number | null = ((idea as unknown as { projet_id?: number | null }).projet_id) ?? null;

  return (
    <AppShell>
      <Link href={backHref} className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Toutes les idées
      </Link>

      <div className="detail-grid">
        <section className="idetail">
          {idea.image ? (
            <div style={{ height: 210, backgroundImage: `linear-gradient(180deg, rgba(40,28,52,.06), rgba(40,28,52,.45)), url(\"${idea.image}\")`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
              <span style={{ position: "absolute", left: 20, top: 16, background: idea.color, color: "#fff", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", padding: "4px 12px", borderRadius: 999 }}>{idea.cat}</span>
            </div>
          ) : (
            <div className="band" style={{ background: idea.color }}>
              <span>{idea.cat}</span>
            </div>
          )}
          <div className="body">
            <h1>{idea.title}</h1>
            <div className="meta">
              <span className="auth">Par {idea.author}</span>
              <span>· {idea.date}</span>
              {idea.location && <span>· {idea.location}</span>}
              <span>· {idea.messages} messages</span>
            </div>
            <p className="txt">{idea.desc} Les habitants du quartier soutiennent cette initiative et souhaitent la construire avec la collectivité, étape par étape, en s'appuyant sur des exemples concrets vécus sur le terrain.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <button className="btn btn-ghost" onClick={like} disabled={liking} title="Soutenir cette idée">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={idea.liked ? "#E0654E" : "none"} stroke={idea.liked ? "#E0654E" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: 6 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {idea.liked ? "Soutenue" : "Soutenir"}{idea.likes ? ` · ${idea.likes}` : ""}
              </button>
              <button className={following ? "btn btn-ghost" : "btn btn-coral"} onClick={toggleFollow}>
                {following ? "Idée suivie ✓" : "Suivre l'idée"}
              </button>
              {projetId ? (
                <Link href={`/projets/${projetId}`} className="btn btn-coral">Projet en cours — voir le projet →</Link>
              ) : niveau >= 2 ? (
                <button className="btn btn-coral" onClick={porter} disabled={porting} title="Transformer cette idée en projet (Opportunité → Projet → Work Room)">
                  {porting ? "Création du projet…" : "Porter ce projet →"}
                </button>
              ) : null}
            </div>
            {error && <p className="msg" style={{ marginTop: 12 }}>{error}</p>}
          </div>
        </section>

        <section className="echange">
          <div className="echange-head">
            <h2>Espace d'échange</h2>
            <small>{following ? "Vous suivez cette idée — participez à la discussion." : "Suivez l'idée pour participer à l'échange."}</small>
          </div>
          <div className="thread">
            {comments.length === 0 ? (
              <p className="gate">Aucun message pour l'instant. Lancez la discussion !</p>
            ) : (
              comments.map((c) => (
                <div className="comment" key={c.id}>
                  <span className="av">{initials(c.author)}</span>
                  <div className="ct">
                    <div className="top"><span className="nm">{c.author}</span><span className="tm">{fmt(c.created_at)}</span></div>
                    {c.body && <p>{c.body}</p>}
                    {c.attachment && (c.attachment.isImage ? (
                      <a className="att-img" href={`/app/api/attachments/${c.attachment.id}`} target="_blank" rel="noreferrer">
                        <img src={`/app/api/attachments/${c.attachment.id}`} alt={c.attachment.filename} />
                      </a>
                    ) : (
                      <a className="att-doc" href={`/app/api/attachments/${c.attachment.id}`} target="_blank" rel="noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                        <span>{c.attachment.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="composer-wrap">
            {file && (
              <div className="att-chip">
                <span className="att-chip-name">📎 {file.name}</span>
                <button type="button" onClick={() => setFile(null)} aria-label="Retirer la pièce jointe">×</button>
              </div>
            )}
            <div className="composer">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                onChange={onPick}
                hidden
              />
              <button
                type="button"
                className="attach-btn"
                onClick={() => fileRef.current?.click()}
                disabled={!following}
                title="Joindre une image ou un PDF (max 5 Mo)"
                aria-label="Joindre un fichier"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={following ? "Écrire un message…" : "Suivez l'idée pour écrire un message"}
                disabled={!following}
              />
              <button className="btn btn-coral" onClick={send} disabled={!following || sending || (!draft.trim() && !file)}>
                {sending ? "…" : "Envoyer"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
