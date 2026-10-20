import Link from "next/link";
import { C } from "@/engine/content";
import { ContinueLink } from "@/ui/ContinueCard";

export default function Home() {
  const colors = Object.values(C.districtColors);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex gap-2" aria-hidden>
        {colors.map((c) => (
          <span key={c} className="h-3 flex-1 rounded-full" style={{ background: c }} />
        ))}
      </div>
      <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-gold">{C.edition}</p>
      <h1 className="mt-2 text-5xl font-black leading-tight text-gold sm:text-7xl">The Second Number</h1>
      <p className="mt-4 text-xl italic">read the machine · wake the block · don&apos;t become it</p>
      <p className="mt-6 max-w-2xl text-lg text-program/90">
        A cooperative game about the hidden cost in every deal: the payday loan, the rent-to-own couch, the &ldquo;free&rdquo; first
        month. Learn to read the second number, teach your whole block to read it, and drag the one machine behind them all into the
        light. Set on the West Side of Dayton, Ohio.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ContinueLink />
        <Link href="/play" className="rounded-xl bg-gold px-6 py-3 text-lg font-black text-night hover:brightness-110">
          Play now
        </Link>
        <Link href="/learn" className="rounded-xl border-2 border-[#7CFFB2] px-6 py-3 text-lg font-black text-[#7CFFB2] hover:bg-[#7CFFB2]/10">
          Learn to play
        </Link>
        <Link href="/join" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          📱 Join a game
        </Link>
        <Link href="/how-to-play" className="rounded-xl border border-gold/60 px-6 py-3 text-lg font-bold text-gold hover:bg-gold/10">
          How to play
        </Link>
        <Link href="/deals" className="rounded-xl border border-white/30 px-6 py-3 text-lg font-bold hover:bg-white/10">
          ♾ Endless deals
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["2–5 players", "On one device, passed around the table: the cookout, the classroom, the kitchen table."],
          ["25 to 60 minutes", "Start with the Block Party (25 minutes), then the full game: co-op, Overlord, or Chapter 3 of the campaign."],
          ["Real traps", "Every deal card is a real, documented trap, with honest deals mixed in."],
        ].map(([t, d]) => (
          <li key={t} className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="font-black text-gold">{t}</p>
            <p className="mt-1 text-sm text-program/85">{d}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
