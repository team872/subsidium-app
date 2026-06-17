"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { IDEAS } from "@/lib/feed";
import "@/components/MemberBoards.css";

type Comment = { author: string; time: string; text: string; me?: boolean };

// Fil de discussion de démonstration (à remplacer par l'API).
const SEED: Comment[] = [
  { author: "Inès M.", time: "il y a 3 jours", text: "Excellente idée. Le passage devant l'école est vraiment dangereux le matin, surtout en hiver quand il fait encore nuit." },
  { author: "Marc V.", time: "il y a 2 jours", text: "On pourrait commencer par un éclairage temporaire et compter le nombre de passages pour appuyer la demande auprès de la mairie." },
  { author: "Awa S.", time: "il y a 1 jour", text: "Je connais une association de quartier qui a déjà monté un dossier similaire. Je peux les mettre en relation avec le porteur de l'idée." },
  { author: "Théo L.", time: "il y a 5 heures", text: "Partant pour aider à recenser les points noirs un soir de semaine. Qui est dispo jeudi prochain ?" },
];

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export default function IdeaDetailPage() {
  const params = useParams();
  const idx = Number(params?.id);
  const idea = Number.isInteger(idx) ? IDEAS[idx] : undefined;

  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState<Comment[]>(SEED);
  const [draft, setDraft] = useState("");

  if (!idea) {
    return (
      <AppShell>
        <Link href="/idees" className="board-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
          Toutes les idées
        </Link>
        <p className="board-empty">Cette idée est introuvable.</p>
      </AppShell>
    );
  }

  function send() {
    const t = draft.trim();
    if (!t || !following) return;
    setComments((c) => [...c, { author: "Maria Daniel", time: "à l'instant", text: t, me: true }]);
    setDraft("");
  }

  return (
    <AppShell>
      <Link href="/idees" className="board-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>
        Toutes les idées
      </Link>

      <div className="detail-grid">
        {/* ----- Idée ----- */}
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
            <button
              className={following ? "btn btn-ghost" : "btn btn-coral"}
              onClick={() => setFollowing((f) => !f)}
            >
              {following ? "Idée suivie ✓" : "Suivre l'idée"}
            </button>
          </div>
        </section>

        {/* ----- Espace d'échange ----- */}
        <section className="echange">
          <div className="echange-head">
            <h2>Espace d'échange</h2>
            <small>{following ? "Vous suivez cette idée — participez à la discussion." : "Suivez l'idée pour participer à l'échange."}</small>
          </div>
          <div className="thread">
            {comments.map((c, i) => (
              <div className="comment" key={i}>
                <span className="av" style={c.me ? { background: "linear-gradient(135deg,#69567A,#372646)" } : undefined}>{initials(c.author)}</span>
                <div className="ct">
                  <div className="top"><span className="nm">{c.author}</span><span className="tm">{c.time}</span></div>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
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
