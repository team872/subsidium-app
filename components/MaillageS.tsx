"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLang } from "@/components/LangProvider";

const CarteSubsidium = dynamic(() => import("@/components/CarteSubsidium"), {
  ssr: false,
  loading: () => <div className="board-empty">…</div>,
});

type Match = { id: number; title: string; theme: string | null; lieu: string | null; grad: string; score: number; reason: string; lat: number | null; lon: number | null };
type Geo = { id: number; lat: number; lon: number; title: string; subtitle: string | null; color?: string };
type Dict = Record<string, string>;

const DICT: Record<string, Dict> = {
  fr: {
    title: "Maillage S — projets à connecter",
    intro: "Des projets proches du vôtre, repérés par appariement (thème, territoire, sujet). Rapprochez-vous pour mutualiser et amplifier l'impact.",
    reasonTheme: "Même thème", reasonLieu: "Même territoire", reasonSujet: "Sujet proche",
    synergy: "✨ Analyse de synergie", analyzing: "Analyse…", open: "Voir le projet →",
    loading: "Recherche d'appariements…", synergyErr: "L'agent est momentanément indisponible.",
    synergyPrompt1: "En tant qu'agent SUBSIDIUM, explique comment ces deux projets citoyens pourraient collaborer et se renforcer.",
    synergyPrompt2: "Donne 1 à 2 pistes concrètes de synergie, en 2 phrases maximum.",
  },
  en: {
    title: "Maillage S — projects to connect with",
    intro: "Projects close to yours, found by matching (theme, area, topic). Connect to pool efforts and amplify impact.",
    reasonTheme: "Same theme", reasonLieu: "Same area", reasonSujet: "Related topic",
    synergy: "✨ Synergy analysis", analyzing: "Analysing…", open: "View project →",
    loading: "Looking for matches…", synergyErr: "The assistant is momentarily unavailable.",
    synergyPrompt1: "As a SUBSIDIUM agent, explain how these two citizen projects could collaborate and strengthen each other.",
    synergyPrompt2: "Give 1 to 2 concrete synergy ideas, in 2 sentences maximum.",
  },
  it: {
    title: "Maillage S — progetti da collegare",
    intro: "Progetti vicini al tuo, individuati per abbinamento (tema, territorio, argomento). Collegati per unire le forze e amplificare l'impatto.",
    reasonTheme: "Stesso tema", reasonLieu: "Stesso territorio", reasonSujet: "Argomento affine",
    synergy: "✨ Analisi di sinergia", analyzing: "Analisi…", open: "Vedi il progetto →",
    loading: "Ricerca di abbinamenti…", synergyErr: "L'assistente è momentaneamente non disponibile.",
    synergyPrompt1: "Come agente SUBSIDIUM, spiega come questi due progetti civici potrebbero collaborare e rafforzarsi.",
    synergyPrompt2: "Fornisci 1 o 2 idee concrete di sinergia, in massimo 2 frasi.",
  },
};

export default function MaillageS({ projetId, projetTitle }: { projetId: number; projetTitle: string }) {
  const { lang } = useLang();
  const tr = DICT[lang] || DICT.fr;
  const [matches, setMatches] = useState<Match[]>([]);
  const [geo, setGeo] = useState<Geo[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/app/api/projets/${projetId}/maillage`).then((r) => r.json()).then((d) => { setMatches(d.matches || []); setGeo(d.geo || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [projetId]);

  const reasonLabel = (r: string) => (r === "theme" ? tr.reasonTheme : r === "lieu" ? tr.reasonLieu : tr.reasonSujet);

  const points = useMemo(() => geo.map((g) => ({ id: g.id, lat: g.lat, lon: g.lon, title: g.title, subtitle: g.subtitle || undefined, color: g.color, href: g.color === "#C2452F" ? undefined : `/projets/${g.id}` })), [geo]);

  async function analyse(m: Match) {
    if (busy) return;
    setBusy(m.id);
    try {
      const prompt = `${tr.synergyPrompt1} Projet A : « ${projetTitle} ». Projet B : « ${m.title} ». ${tr.synergyPrompt2}`;
      const r = await fetch("/app/api/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }) });
      const d = await r.json();
      const reply = (d.reply || d.message || "").trim();
      setAnalysis((a) => ({ ...a, [m.id]: reply || tr.synergyErr }));
    } catch { setAnalysis((a) => ({ ...a, [m.id]: tr.synergyErr })); }
    setBusy(null);
  }

  if (loading) return <div style={{ maxWidth: 820, marginTop: 24 }}><h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 12px" }}>{tr.title}</h2><p className="board-empty">{tr.loading}</p></div>;
  if (matches.length === 0) return null;

  return (
    <div style={{ maxWidth: 820, marginTop: 28 }}>
      <h2 style={{ fontFamily: "var(--font-display),cursive", color: "#372646", margin: "0 0 6px" }}>{tr.title}</h2>
      <p style={{ color: "#5E4A73", margin: "0 0 14px", lineHeight: 1.6 }}>{tr.intro}</p>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 10 }}>
          {matches.map((m) => (
            <div key={m.id} style={{ border: "1px solid #EBD9CD", borderRadius: 14, background: "#fff", padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: m.grad, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#372646", fontWeight: 700, fontSize: 14.5 }}>{m.title}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1E6B1E", background: "#DBF0D9", borderRadius: 999, padding: "2px 8px" }}>{reasonLabel(m.reason)}</span>
                    {m.lieu && <span style={{ fontSize: 11, color: "#9C919E" }}>{m.lieu}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Link href={`/projets/${m.id}`} style={{ color: "#C2452F", fontWeight: 600, fontSize: 13 }}>{tr.open}</Link>
                <button type="button" className="btn btn-ghost" style={{ marginLeft: "auto", padding: "4px 10px", fontSize: 12.5 }} disabled={busy === m.id} onClick={() => analyse(m)}>{busy === m.id ? tr.analyzing : tr.synergy}</button>
              </div>
              {analysis[m.id] && (
                <p style={{ marginTop: 8, padding: "8px 12px", background: "#FBF4F8", border: "1px solid #E6D4E0", borderRadius: 10, color: "#5E2A4E", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{analysis[m.id]}</p>
              )}
            </div>
          ))}
        </div>
        {points.length > 1 && (
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <CarteSubsidium points={points as any} height={360} />
          </div>
        )}
      </div>
    </div>
  );
}
