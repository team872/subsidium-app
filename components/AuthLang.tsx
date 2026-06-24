"use client";

import { useLang } from "./LangProvider";
import type { Lang } from "@/lib/i18n";

// Selecteur de langue compact pour les ecrans d'authentification (connexion / inscription).
export default function AuthLang() {
  const { lang, setLang, langs } = useLang();
  return (
    <div style={{ position: "absolute", top: 14, right: 16, zIndex: 5 }}>
      <select
        aria-label="Langue / Language / Lingua"
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        style={{
          border: "1px solid #EBD9CD",
          background: "#fff",
          color: "#372646",
          borderRadius: 10,
          padding: "5px 10px",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {langs.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
