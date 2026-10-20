"use client";
import { useState } from "react";
import { adoptFamily, encodeFamily, readFamily, type Family } from "../game/family";
import { t, useLang } from "../i18n";
import { C } from "../engine/content";

/** Copy this family as a code, for another device (a classroom switching laptops halfway through). */
export function CopyFamilyCode({ family }: { family: Family }) {
  useLang();
  const [copied, setCopied] = useState(false);
  if (!family.state.played.length) return null;
  return (
    <button
      type="button"
      className="mt-2 rounded-lg border border-gold/60 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold/10"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(encodeFamily(family));
          setCopied(true);
        } catch {
          window.prompt(t("Copy the family code:"), encodeFamily(family));
        }
      }}
    >
      {copied ? t("Family code copied ✓") : t("📋 Copy the family code (to play on another device)")}
    </button>
  );
}

/** The family's code, and a box to bring a family in from another device. */
export function FamilyCode({ family, onAdopt }: { family: Family; onAdopt: (f: Family) => void }) {
  useLang();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const bring = () => {
    const f = readFamily(text);
    if (!f) return setNote(t("That isn't a family code. It starts with SNF1."));
    const title = t(C.campaigns[f.state.campaign].title);
    if (!window.confirm(t("Bring in this {title} family ({n} chapters played)? It takes the place of the family on this device.", { title, n: f.state.played.length }))) return;
    onAdopt(adoptFamily(f));
    setText("");
    setOpen(false);
    setNote(t("The family is here. Continue it below."));
  };
  return (
    <div className="mt-3 border-t border-white/10 pt-2">
      <div className="flex flex-wrap items-center gap-3">
        <CopyFamilyCode family={family} />
        <button type="button" className="mt-2 text-xs text-program/70 underline" aria-expanded={open} onClick={() => setOpen(!open)}>
          {t("Bring a family from another device")}
        </button>
      </div>
      {open && (
        <div className="mt-2 space-y-2">
          <label className="block text-xs text-program/70" htmlFor="family-code">
            {t("Paste the family code (it starts with SNF1.)")}
          </label>
          <textarea id="family-code" className="h-16 w-full rounded-lg border border-white/20 bg-black/40 p-2 font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="button" className="rounded-lg bg-gold px-3 py-1.5 text-sm font-bold text-night disabled:opacity-50" disabled={!text.trim()} onClick={bring}>
            {t("Bring it in")}
          </button>
        </div>
      )}
      {note && <p className="mt-1 text-xs text-program/80" role="status">{note}</p>}
    </div>
  );
}
