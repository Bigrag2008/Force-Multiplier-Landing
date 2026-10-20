"use client";
import { useState } from "react";
import { CONFUSING, FEEDBACK_URL, FUN, NOTE_MAX, factsOf, feedbackText, makeFeedback, submitFeedback, type Again, type ConfusingKey } from "../game/feedback";
import type { Session } from "../game/session";
import { t, useLang } from "../i18n";

const FACE: Record<number, string> = { 1: "😐", 2: "🙂", 3: "😄", 4: "🔥" };
const FACE_WORD: Record<number, string> = { 1: "Meh", 2: "Good", 3: "Fun", 4: "Loved it" };

/** "How did it go?": three taps and one optional sentence, at the end of a game. Opt-in; no names. */
export function FeedbackCard({ s }: { s: Session }) {
  useLang();
  const [fun, setFun] = useState(0);
  const [conf, setConf] = useState<ConfusingKey[]>([]);
  const [again, setAgain] = useState<Again | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "kept" | "failed">("idle");
  const [copied, setCopied] = useState(false);
  const toggle = (k: ConfusingKey) =>
    setConf((c) => (k === "nothing" ? (c.includes("nothing") ? [] : ["nothing"]) : c.includes(k) ? c.filter((x) => x !== k) : [...c.filter((x) => x !== "nothing"), k]));
  const send = async () => {
    setState("sending");
    setState(await submitFeedback(makeFeedback(`${s.config.seed}-${s.moves.length}`, fun, conf, again ?? "maybe", note, factsOf(s))));
  };
  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-sm ${on ? "border-gold bg-gold text-night font-bold" : "border-white/25 hover:bg-white/10"}`;

  if (state === "sent" || state === "kept" || state === "failed")
    return (
      <section className="mt-5 rounded-xl border border-[#7CFFB2]/40 bg-[#7CFFB2]/10 p-4" aria-live="polite">
        <p className="font-black text-[#7CFFB2]">{t("Thank you. That helps make the game better.")}</p>
        {state !== "sent" && (
          <p className="mt-1 text-sm text-program/80">
            {state === "kept" ? t("Your answer is saved on this device.") : t("It couldn't be sent right now, so it's saved on this device.")}{" "}
            <button
              className="underline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(feedbackText());
                  setCopied(true);
                } catch {
                  window.prompt(t("Copy your saved answers:"), feedbackText());
                }
              }}
            >
              {copied ? t("Copied ✓") : t("Copy the saved answers (to send them by hand)")}
            </button>
          </p>
        )}
      </section>
    );

  return (
    <section className="mt-5 rounded-xl border border-white/20 bg-black/25 p-4" aria-labelledby="fb-title">
      <h3 id="fb-title" className="font-black text-gold">{t("How did it go?")}</h3>
      <p className="text-xs text-program/70">
        {t("Optional. No names: just your answers and how the game went (mode, players, win or lose, the deal that fooled you most).")}
      </p>

      <fieldset className="mt-3">
        <legend className="text-sm font-bold">{t("Was it fun?")}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {FUN.map((n) => (
            <button key={n} className={chip(fun === n)} aria-pressed={fun === n} onClick={() => setFun(n)}>
              <span aria-hidden>{FACE[n]}</span> {t(FACE_WORD[n])}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="text-sm font-bold">{t("Was anything confusing?")}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {(Object.keys(CONFUSING) as ConfusingKey[]).map((k) => (
            <button key={k} className={chip(conf.includes(k))} aria-pressed={conf.includes(k)} onClick={() => toggle(k)}>
              {t(CONFUSING[k])}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="text-sm font-bold">{t("Would you play again?")}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {(["yes", "maybe", "no"] as Again[]).map((a) => (
            <button key={a} className={chip(again === a)} aria-pressed={again === a} onClick={() => setAgain(a)}>
              {t({ yes: "Yes", maybe: "Maybe", no: "No" }[a])}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-3 block text-sm font-bold" htmlFor="fb-note">
        {t("One thing you'd change (optional)")}
      </label>
      <textarea id="fb-note" maxLength={NOTE_MAX} className="mt-1 h-16 w-full rounded-lg border border-white/20 bg-black/40 p-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} />
      <p className="text-right text-[11px] text-program/60">{note.length}/{NOTE_MAX}</p>

      <button className="mt-1 rounded-lg bg-gold px-4 py-2 font-bold text-night disabled:opacity-50" disabled={!fun || !again || state === "sending"} onClick={send}>
        {state === "sending" ? t("Sending…") : FEEDBACK_URL ? t("Send") : t("Save my answers")}
      </button>
      {(!fun || !again) && <span className="ml-3 text-xs text-program/60">{t("Pick how fun it was and whether you'd play again.")}</span>}
    </section>
  );
}
