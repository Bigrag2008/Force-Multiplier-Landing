"use client";
import { LINKS } from "../links";
import { t, useLang } from "../i18n";

/**
 * The doors out of the game: the novel it comes from, the real-life guide, and the list. "work" puts the guide
 * first, for a table (or a reader of their own deal) that just met the machine at their job.
 */
export function WhereNext({ lead = "novel", className = "" }: { lead?: "novel" | "work"; className?: string }) {
  useLang();
  const novel = (
    <Door key="novel" href={LINKS.novel} title={t("📖 Read the novel")}>
      {t("The Second Number, Book One: Marcus Ellison's story, the world this game comes from.")}
    </Door>
  );
  const guide = (
    <Door key="guide" href={LINKS.guide} title={t("🛡 The Third Option")}>
      {t("The real-life version: how to recognize, document and prove what's happening at your job. A Civic Armor guide.")}
    </Door>
  );
  return (
    <section className={`rounded-xl border border-gold/40 bg-gold/5 p-4 ${className}`} aria-labelledby="where-next">
      <h2 id="where-next" className="font-black text-gold">{t("Where this goes next")}</h2>
      <p className="mt-1 text-sm text-program/85">{t("You read the machine at the table. Now read it in your own life.")}</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {lead === "work" ? [guide, novel] : [novel, guide]}
        <Door href={LINKS.list} title={t("✉ Stay in the loop")}>
          {t("New chapters, the boxed game, and the Civic Armor course. A few emails a year.")}
        </Door>
      </ul>
      <p className="mt-3 text-xs text-program/70">
        {t("A Civic Armor game")} · <a className="underline" href={LINKS.hub}>{LINKS.hub.replace(/^https?:\/\//, "")}</a>
      </p>
    </section>
  );
}

function Door({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} className="block h-full rounded-lg border border-white/15 bg-white/5 p-3 hover:border-gold/60 hover:bg-gold/10">
        <span className="font-black text-gold">{title}</span>
        <span className="mt-1 block text-sm text-program/85">{children}</span>
      </a>
    </li>
  );
}
