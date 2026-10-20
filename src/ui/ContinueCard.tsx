"use client";
import { useEffect, useState } from "react";
import { clearSave, loadGame, type SaveFile } from "../game/save";
import { t, useLang } from "../i18n";

function ago(at: number) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return t("just now");
  if (m < 60) return t("{n} min ago", { n: m });
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? t("1 hour ago") : t("{n} hours ago", { n: h });
  const d = Math.round(h / 24);
  return d === 1 ? t("1 day ago") : t("{n} days ago", { n: d });
}

/** read the save after the page loads (storage only exists in the browser) */
export function useSave() {
  const [save, setSave] = useState<SaveFile | null>(null);
  useEffect(() => setSave(loadGame()), []); // eslint-disable-line react-hooks/set-state-in-effect
  return [save, setSave] as const;
}

/** "Continue your game": shown when this device has a game in progress */
export function ContinueCard({ onContinue }: { onContinue: (save: SaveFile) => void }) {
  useLang();
  const [save, setSave] = useSave();
  if (!save) return null;
  return (
    <section aria-label={t("Your game in progress")} className="mx-auto mb-6 max-w-2xl rounded-2xl border-2 border-[#7CFFB2]/70 bg-[#7CFFB2]/10 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-[#7CFFB2]">{t("Game in progress")}</p>
      <p className="mt-1 text-lg font-black">
        {t(save.label.mode)} · {t("round {n}", { n: save.label.round })}
      </p>
      <p className="text-sm text-program/80">
        {save.label.names.join(", ")} · {t("saved {when}", { when: ago(save.savedAt) })}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-xl bg-[#7CFFB2] px-5 py-2 font-black text-night" onClick={() => onContinue(save)}>
          {t("Continue your game")}
        </button>
        <button
          className="rounded-xl border border-white/25 px-4 py-2 text-sm font-bold"
          onClick={() => {
            if (window.confirm(t("Throw this game away? You can't get it back."))) {
              clearSave();
              setSave(null);
            }
          }}
        >
          {t("Throw it away")}
        </button>
      </div>
      <p className="mt-2 text-xs text-program/60">{t("Starting a new game below replaces this one once you make a move.")}</p>
    </section>
  );
}

/** the home page's link back into a game in progress */
export function ContinueLink() {
  useLang();
  const [save] = useSave();
  if (!save) return null;
  return (
    <a href="/play?continue=1" className="rounded-xl bg-[#7CFFB2] px-6 py-3 text-lg font-black text-night hover:brightness-110">
      {t("Continue your game")} <span className="text-sm font-bold">({t("round {n}", { n: save.label.round })})</span>
    </a>
  );
}
