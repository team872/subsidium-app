"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { IdeaDTO, EventDTO } from "@/lib/data";

export default function AccueilPage() {
  const [ideas, setIdeas] = useState<IdeaDTO[]>([]);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [stats, setStats] = useState({ suivies: 0, emises: 0 });

  useEffect(() => {
    fetch("/app/api/ideas").then((r) => r.json()).then((d) => setIdeas(d.ideas || [])).catch(() => {});
    fetch("/app/api/events").then((r) => r.json()).then((d) => setEvents(d.events || [])).catch(() => {});
    fetch("/app/api/me/stats").then((r) => r.json()).then((d) => setStats({ suivies: d.suivies ?? 0, emises: d.emises ?? 0 })).catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="topbar">
        <h1>Bienvenue sur Subsidium</h1>
        <button className="icon-btn" aria-label="Réglages">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
      </div>

      <div className="stats">
        <div className="stat green">
          <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5-7-11a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 11-7 11z" /></svg></span>
          <span><span className="n">{stats.suivies}</span><span className="l">{stats.suivies > 1 ? "Idées suivies" : "Idée suivie"}</span></span>
        </div>
        <div className="stat coral">
          <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.3-1 2.5H9c0-1.2-.3-1.8-1-2.5A6 6 0 0 1 12 3z" /><path d="M9 18h6M10 21h4" /></svg></span>
          <span><span className="n">{stats.emises}</span><span className="l">{stats.emises > 1 ? "Idées émises" : "Idée émise"}</span></span>
        </div>
      </div>

      <section>
        <div className="feed-head">
          <h2>Nouvelles idées Subsidium autour de vous</h2>
          <Link href="/idees">Voir tout</Link>
        </div>
        <div className="rail">
          {ideas.slice(0, 6).map((it) => (
            <Link className="idea" key={it.id} href={`/idees/${it.id}`} style={{ textDecoration: "none" }}>
              <div className="top" style={{ background: it.color }}>
                <span className="cat">{it.cat}</span>
              </div>
              <div className="bd">
                <h3>{it.title}</h3>
                <p>{it.desc}</p>
                <div className="meta"><span>{it.messages} messages</span><span>{it.date}</span></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
        <div className="feed-head">
          <h2>Les prochains événements Subsidium</h2>
          <Link href="/evenements">Voir tout</Link>
        </div>
        <div className="rail">
          {events.slice(0, 6).map((ev) => (
            <article className="event" key={ev.id}>
              <div className="img" style={{ backgroundImage: ev.grad }}>
                <span className="tag">{ev.tag}</span>
                <span className="date"><b>{ev.day}</b><small>{ev.month}</small></span>
              </div>
              <div className="bd">
                <h3>{ev.title}</h3>
                <p>{ev.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Link className="fab" href="/idees" aria-label="Proposer une idée">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </Link>
    </AppShell>
  );
}
