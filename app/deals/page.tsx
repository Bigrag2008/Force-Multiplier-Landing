"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DISTRICTS, type Card, type District } from "@/engine/content";
import { makeDeal } from "@/engine/dealgen";
import { Rng } from "@/engine/rng";
import { DealCard } from "@/ui/DealCard";
import { DISTRICT_COLOR, titleCase } from "@/ui/theme";

/** Endless deals: a fresh deal every press, rolled from the templates, for practice and classrooms. */
export default function DealsPage() {
  const [rng] = useState(() => new Rng(Math.floor(Math.random() * 2 ** 31)));
  const [d, setD] = useState<District>("LENDING");
  const [card, setCard] = useState<Card | null>(null);
  const [sight, setSight] = useState(1);
  const [math, setMath] = useState(true);
  const [count, setCount] = useState(0);
  const deal = (x: District) => {
    setD(x);
    setCard(makeDeal(x, rng));
    setCount((n) => n + 1);
  };
  // dealt in the browser, so the server never renders a different card
  useEffect(() => deal("LENDING"), []); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">← The Second Number</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">Endless deals</h1>
      <p className="mt-2 max-w-2xl text-program/90">
        Every deal here is rolled fresh from a template, so the numbers are new every time and nobody can learn them by heart. Read the
        pitch, work out the second number, then put the glasses on and check. Turn the same templates on in a game with <b>Endless deals</b> in the
        house rules.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {DISTRICTS.map((x) => (
          <button key={x} className={`rounded-lg px-3 py-2 text-sm font-black text-white ${x === d ? "ring-2 ring-gold" : "opacity-80"}`} style={{ background: DISTRICT_COLOR[x] }} onClick={() => deal(x)}>
            {titleCase(x)}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          Your Read
          <select className="rounded-lg border border-white/20 bg-white/10 px-2 py-1" value={sight} onChange={(e) => setSight(+e.target.value)}>
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n} className="text-ink">{n}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={math} onChange={(e) => setMath(e.target.checked)} /> Work it out first
        </label>
        <button className="rounded-lg bg-gold px-4 py-2 font-black text-night" onClick={() => deal(d)}>
          Another deal
        </button>
        <span className="text-program/60">{count} dealt</span>
      </div>
      <div className="mt-6">{card && <DealCard key={count} card={card} district={d} sight={sight} formId={`${d.slice(0, 3)}-NEW`} math={math} />}</div>
    </main>
  );
}
