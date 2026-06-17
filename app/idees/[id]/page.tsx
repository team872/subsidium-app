"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function IdeaDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [idea, setIdea] = useState<IdeaDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

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

  async function send() {
    const t = draft.trim();
    if (!t || !following) return;
    setError("");
    const r = await fetch(`/app/api/ideas/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: t }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "Envoi impossible.");
      return;
    }
    setComments((c) => [...c, d.comment]);
    setDraft("");
  }

  if (loading) {
    return (
      <AppShell>
        <Link href="/idees" className="board-back">← Toutes les idées</Link>
        <p className="board-empty">Chargement…</p>
      </AppShell>
    );
  }

  if (!idea) {
    return (
      <AppShell>
        <Link href="/idees" className="board-back">← Toutes les idées</Link>
        <p className="board-empty">Cette idée est introuvable.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link href="/idees" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Toutes les idées
      </Link>

      <div className="detail-grid">
        <section className="idetail">
          <div className="band" style={{ background: idea.color }}>
            <span>{idea.cat}</span>
          </div>
          <div className="body">
            <h1>{idea.title}</h1>
            <div className="meta">
              <span className="auth">Par {idea.author}</span>
              <span>· {idea.date}</span>
              <span>· {idea.messages} messages</span>
            </div>
            <p className="txt">{idea.desc} Les habitants du quartier soutiennent cette initiative et souhaitent la construire avec la collectivité, étape par étape, en s'appuyant sur des exemples concrets vécus sur le terrain.</p>
            <div className="thumbs">
              <span style={{ background: "linear-gradient(135deg,#E8A98F,#C85A48)" }} />
              <span style={{ background: "linear-gradient(135deg,#8FB8C9,#5E7E91)" }} />
              <span style={{ background: "linear-gradient(135deg,#9FC79A,#5E8A57)" }} />
            </div>
            <button className={following ? "btn btn-ghost" : "btn btn-coral"} onClick={toggleFollow}>
              {following ? "Idée suivie ✓" : "Suivre l'idée"}
            </button>
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
                    <p>{c.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="composer">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder={following ? "Écrire un message…" : "Suivez l'idée pour écrire un message"}
              disabled={!following}
            />
            <button className="btn btn-coral" onClick={send} disabled={!following || !draft.trim()}>Envoyer</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
