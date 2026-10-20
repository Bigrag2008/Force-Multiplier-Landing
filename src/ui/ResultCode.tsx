"use client";
import { useEffect, useMemo, useState } from "react";
import { addResults, encodeResult, HISTORY, loadList, saveList, summarize } from "../game/results";
import type { Session } from "../game/session";
import { t, useLang } from "../i18n";

/**
 * The end of a game, for a classroom: the game is kept on this device (the teacher's page reads it),
 * and a result code the table can copy to their teacher. Nothing is uploaded anywhere.
 */
export function ResultCode({ s }: { s: Session }) {
  useLang();
  const [table, setTable] = useState("");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => summarize(s, table), [s, table]);
  const code = useMemo(() => encodeResult(result), [result]);
  useEffect(() => {
    // keep the finished game on this device, once (the id is the game's own, so reloads don't double it)
    saveList(HISTORY, addResults(loadList(HISTORY), [summarize(s)]));
  }, [s]);
  return (
    <details className="mt-5 rounded-xl border border-white/20 bg-black/30 p-4">
      <summary className="cursor-pointer font-black text-gold">🍎 {t("Send this game to your teacher")}</summary>
      <p className="mt-2 text-sm text-program/85">
        {t("Copy the result code and send it however your class does (a message, a form, a shared doc). Your teacher pastes it into the")}{" "}
        <a href="/teacher" className="font-bold text-gold underline">{t("teacher's view")}</a>. {t("It holds the names you typed and how the game went, nothing else.")}
      </p>
      <label className="mt-3 block text-sm">
        <span className="font-bold">{t("Your table's name (optional)")}</span>
        <input className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2" placeholder={t("Table 4, 3rd period")} value={table} onChange={(e) => (setTable(e.target.value), setCopied(false))} />
      </label>
      <textarea readOnly aria-label={t("Result code")} className="mt-3 h-20 w-full rounded-lg border border-white/20 bg-black/40 p-2 font-mono text-[11px] text-program/90" value={code} onFocus={(e) => e.target.select()} />
      <button
        className="mt-2 rounded-lg bg-gold px-4 py-2 font-bold text-night"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          } catch {
            setCopied(false); // no clipboard here: the code is selected in the box, ready to copy by hand
          }
        }}
      >
        {copied ? t("Copied ✓") : t("Copy the code")}
      </button>
    </details>
  );
}
