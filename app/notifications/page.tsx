"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { NotificationDTO } from "@/lib/data";
import "@/components/MemberBoards.css";

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/app/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
    // Marque comme lues à l'ouverture de la page.
    fetch("/app/api/notifications/read", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="board-head">
        <h1>Notifications</h1>
      </div>

      {loading ? (
        <p className="board-empty">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="board-empty">Aucune notification pour l'instant. Suivez des idées pour être tenu informé des échanges.</p>
      ) : (
        <div className="notif-list">
          {items.map((n) => {
            const inner = (
              <div className={`notif-item${n.read ? "" : " unread"}`}>
                <span className="notif-dot" aria-hidden="true" />
                <div className="notif-body">
                  <p>{n.message}</p>
                  <small>{fmt(n.created_at)}</small>
                </div>
              </div>
            );
            return n.idea_id ? (
              <Link key={n.id} href={`/idees/${n.idea_id}`} className="notif-link">{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
