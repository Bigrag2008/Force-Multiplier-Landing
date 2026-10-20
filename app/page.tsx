"use client";
import Link from "next/link";
import { C } from "@/engine/content";
import { ContinueLink } from "@/ui/ContinueCard";
import { t, useLang } from "@/i18n";

export default function Home() {
  useLang();
  const colors = Object.values(C.districtColors);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex gap-2" aria-hidden>
        {colors.map((c) => (
          <span key={c} className="h-3 flex-1 rounded-full" style={{ background: c }} />
        ))}
      </div>
      <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-gold">{t(C.edition)}</p>
      <h1 className="mt-2 text-5xl font-black leading-tight text-gold sm:text-7xl">{t("The Second Number")}</h1>
      <p className="mt-4 text-xl italic">{t("read the machine · wake the block · don't become it")}</p>
      <p className="mt-6 max-w-2xl text-lg text-program/90">
        {t("A cooperative game about the hidden cost in every deal: the payday loan, the rent-to-own couch, the “free” first month. Learn to read the second number, teach your whole block to read it, and drag the one machine behind them all into the light. Set on the West Side of Dayton, Ohio.")}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ContinueLink />
        <Link href="/play" className="rounded-xl bg-gold px-6 py-3 text-lg font-black text-night hover:brightness-110">
          {t("Play now")}
        </Link>
        <Link href="/learn" className="rounded-xl border-2 border-[#7CFFB2] px-6 py-3 text-lg font-black text-[#7CFFB2] hover:bg-[#7CFFB2]/10">
          {t("Learn to play")}
        </Link>
        <Link href="/join" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          {t("📱 Join a game")}
        </Link>
        <Link href="/how-to-play" className="rounded-xl border border-gold/60 px-6 py-3 text-lg font-bold text-gold hover:bg-gold/10">
          {t("How to play")}
        </Link>
        <Link href="/deals" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          {t("♾ Endless deals")}
        </Link>
        <Link href="/my-deal" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          {t("🔍 Read your own deal")}
        </Link>
        <Link href="/teacher" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          {t("🍎 Teacher's view")}
        </Link>
        <Link href="/edition" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          {t("🏘 Your City editions")}
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["1–5 players", "On one device, passed around the table: the cookout, the classroom, the kitchen table. Or alone, the night you finish the book."],
          ["25 to 60 minutes", "Start with the Block Party (25 minutes), then the full game: co-op, Overlord, or Chapter 3 of the campaign."],
          ["Real traps", "Every deal card is a real, documented trap, with honest deals mixed in."],
        ].map(([h, d]) => (
          <li key={h} className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="font-black text-gold">{t(h)}</p>
            <p className="mt-1 text-sm text-program/85">{t(d)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
