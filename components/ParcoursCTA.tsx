"use client";

import Link from "next/link";
import { useNiveau } from "@/components/useNiveau";
import { useLang, useT } from "@/components/LangProvider";
import { prochaineEtape, NIVEAUX } from "@/lib/niveau";

const JOURNEY: Record<string, string> = { fr: "Votre parcours", en: "Your journey", it: "Il tuo percorso" };

// Bandeau contextuel de progression dans le parcours, selon le niveau effectif.
export default function ParcoursCTA() {
  const { lang } = useLang();
  const t = useT();
  const { rang, charteValidee, paye, ready } = useNiveau();
  if (!ready) return null;
  const etape = prochaineEtape(rang, charteValidee, paye, lang);
  if (!etape) return null;
  const roleKey = t(`role.${rang}`);
  const roleName = roleKey === `role.${rang}` ? NIVEAUX[rang] : roleKey;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        background: "linear-gradient(90deg,#F9F1E9,#FBE7DC)",
        border: "1px solid #EBD9CD",
        borderRadius: 16,
        padding: "14px 18px",
        margin: "0 0 22px",
      }}
    >
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", color: "#5E4A73", textTransform: "uppercase" }}>
          {JOURNEY[lang] || JOURNEY.fr} · {roleName}
        </div>
        <div style={{ color: "#372646", marginTop: 2 }}>{etape.hint}</div>
      </div>
      <Link
        href={etape.href}
        style={{
          background: "#F27B6A",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 600,
          borderRadius: 999,
          padding: "10px 18px",
          whiteSpace: "nowrap",
        }}
      >
        {etape.label}
      </Link>
    </div>
  );
}
