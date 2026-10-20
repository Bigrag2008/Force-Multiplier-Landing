"use client";
import { useEffect } from "react";
import { initLang, LANGS, setLang, useLang } from "../i18n";

/** English / Español, on every page. The choice is kept on this device; ?lang=es in a link sets it too. */
export function LangSwitch() {
  const lang = useLang();
  useEffect(() => initLang(), []);
  return (
    <div className="no-print fixed bottom-3 left-3 z-40 flex overflow-hidden rounded-full border border-white/25 bg-night/90 text-xs shadow-lg" role="group" aria-label="Language / Idioma">
      {LANGS.map((l) => (
        <button
          key={l.id}
          lang={l.id}
          aria-pressed={lang === l.id}
          className={`px-3 py-1.5 font-bold ${lang === l.id ? "bg-gold text-night" : "text-program/80 hover:bg-white/10"}`}
          onClick={() => setLang(l.id)}
        >
          {l.name}
        </button>
      ))}
    </div>
  );
}
