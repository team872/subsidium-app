"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Lang, LANGS, translate } from "@/lib/i18n";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; langs: typeof LANGS };
const LangContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, t: (k) => k, langs: LANGS });

export function useLang() { return useContext(LangContext); }
export function useT() { return useContext(LangContext).t; }

const VALID: Lang[] = ["fr", "en", "it"];

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    // 1) instantané depuis localStorage
    try { const l = localStorage.getItem("sub_lang") as Lang | null; if (l && VALID.includes(l)) setLangState(l); } catch {}
    // 2) source de vérité : préférence du compte
    fetch("/app/api/preferences")
      .then((r) => r.json())
      .then((d) => { if (d && VALID.includes(d.langue)) { setLangState(d.langue); try { localStorage.setItem("sub_lang", d.langue); } catch {} } })
      .catch(() => {});
  }, []);

  useEffect(() => { try { document.documentElement.lang = lang; } catch {} }, [lang]);

  const setLang = useCallback((l: Lang) => {
    if (!VALID.includes(l)) return;
    setLangState(l);
    try { localStorage.setItem("sub_lang", l); } catch {}
    fetch("/app/api/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ langue: l }) }).catch(() => {});
  }, []);

  const t = useCallback((k: string) => translate(lang, k), [lang]);

  return <LangContext.Provider value={{ lang, setLang, t, langs: LANGS }}>{children}</LangContext.Provider>;
}
