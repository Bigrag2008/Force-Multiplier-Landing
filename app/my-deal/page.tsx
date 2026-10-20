"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Card } from "@/engine/content";
import { fmtRate, readDeal, verdict, type Kind, type Often, type RealDeal } from "@/game/realdeal";
import { DealCard } from "@/ui/DealCard";

/** saved deals live only in this browser */
const KEY = "sn-my-deals";
interface Saved { name: string; deal: RealDeal; savedAt: number }

const KINDS: [Kind, string, string][] = [
  ["payments", "Payments", "Rent-to-own, store financing, a car or personal loan, buy now pay later"],
  ["fee", "A fee to borrow", "Payday loan, cash advance app, pawn, tax refund advance"],
  ["monthly", "A monthly plan", "Phone plan, subscription, insurance: the ad's price vs your bill"],
];
const FIELDS: Record<Kind, [string, string, string][]> = {
  payments: [
    ["cash", "Cash price", "what it costs if you pay all at once (or how much you're borrowing)"],
    ["down", "Down payment", "paid today (0 if none)"],
    ["payment", "Each payment", "how much each payment is"],
    ["count", "How many payments", "the number on the contract"],
    ["fees", "One-time fees", "sign-up, processing, delivery, 'protection' (0 if none)"],
  ],
  fee: [
    ["amount", "Amount you get", "the cash in your hand"],
    ["fee", "The fee", "what they charge for it"],
    ["days", "Days until it's due", "usually 14 for a payday loan"],
    ["rollovers", "Times you might extend it", "0 if you'll pay it all back on time"],
  ],
  monthly: [
    ["advertised", "Advertised monthly price", "the big number in the ad"],
    ["charged", "What you're really charged a month", "with taxes, fees, and after any promo ends"],
    ["months", "Months", "the contract, or how long you'll keep it"],
    ["fees", "One-time fees", "activation, setup, early-termination (0 if none)"],
  ],
};
const CLOCK: Record<Kind, string> = {
  payments: "The clock: what happens if you miss one payment? Is there a grace period, a late fee, or do they take it back? Is there a big last payment? Can you pay it off early with no penalty?",
  fee: "The clock: when is it due, and what if you can't pay all of it? Rolling it over means paying the whole fee again, every time.",
  monthly: "The clock: when does the promo price end? Is there a contract, and what does it cost to leave early?",
};
const CONNECTION: Record<Kind, string> = {
  payments: "Who's behind it: who owns this debt after you sign? Store 'financing' is often a separate lender, and contracts get sold. A credit union loan may cost far less.",
  fee: "Who's behind it: is the lender licensed in your state? Some rent an out-of-state bank to get around the cap. A credit union small loan, or your job's pay advance, may cost far less.",
  monthly: "Who's behind it: some 'taxes and fees' are real taxes; some are the company's own charges with an official-sounding name. Ask which is which.",
};
const LOOKS: Record<Kind, string> = { payments: "the cash price", fee: "the amount you get", monthly: "the advertised price" };

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function loadSaved(): Saved[] {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Saved[];
  } catch {
    return [];
  }
}
function storeSaved(list: Saved[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // no storage here: the deal still reads, it just isn't kept
  }
}

export default function MyDealPage() {
  const [kind, setKind] = useState<Kind>("payments");
  const [name, setName] = useState("");
  const [often, setOften] = useState<Often>("week");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [math, setMath] = useState(false);
  const [shown, setShown] = useState<{ name: string; deal: RealDeal; id: number } | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  useEffect(() => setSaved(loadSaved()), []); // eslint-disable-line react-hooks/set-state-in-effect

  const num = (k: string) => Number((vals[k] ?? "").replace(/[$,\s]/g, "")) || 0;
  const build = (): RealDeal | null => {
    if (kind === "payments") {
      if (!(num("cash") > 0 && num("payment") > 0 && num("count") > 0)) return null;
      return { kind, cash: num("cash"), down: num("down"), payment: num("payment"), often, count: Math.round(num("count")), fees: num("fees") };
    }
    if (kind === "fee") {
      if (!(num("amount") > 0 && num("fee") > 0 && num("days") > 0)) return null;
      return { kind, amount: num("amount"), fee: num("fee"), days: num("days"), rollovers: Math.round(num("rollovers")) };
    }
    if (!(num("advertised") > 0 && num("charged") > 0 && num("months") > 0)) return null;
    return { kind, advertised: num("advertised"), charged: num("charged"), months: Math.round(num("months")), fees: num("fees") };
  };
  const ready = build();
  const field = "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">← The Second Number</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">Read your own deal</h1>
      <p className="mt-2 max-w-2xl text-program/90">
        Got a real offer: a phone plan, a car loan, a rent-to-own receipt? Put in its numbers and read its second number with the same glasses you
        use in the game.
      </p>
      <p className="mt-2 rounded-lg border border-[#7CFFB2]/40 bg-[#7CFFB2]/10 px-3 py-2 text-sm text-program/90">
        🔒 Nothing you type leaves this device. There&apos;s no account and no upload; saved deals stay in this browser.
      </p>

      <form
        className="mt-6 space-y-4 rounded-2xl border border-gold/40 bg-black/25 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const deal = build();
          if (deal) setShown({ name: name.trim() || "My deal", deal, id: Date.now() });
        }}
      >
        <fieldset>
          <legend className="font-bold">What kind of deal?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {KINDS.map(([k, t, d]) => (
              <label key={k} className={`cursor-pointer rounded-xl border p-3 ${kind === k ? "border-gold bg-gold/10" : "border-white/20"}`}>
                <input type="radio" name="kind" className="sr-only" checked={kind === k} onChange={() => (setKind(k), setShown(null))} />
                <span className="block font-black">{t}</span>
                <span className="block text-xs text-program/75">{d}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="font-bold">What is it?</span>
          <input className={`${field} mt-1`} placeholder="Rent-to-own couch at the store on Third" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS[kind].map(([k, label, hint]) => (
            <label key={k} className="block">
              <span className="font-bold">{label}</span>
              <input className={`${field} mt-1`} inputMode="decimal" value={vals[k] ?? ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
              <span className="mt-0.5 block text-xs text-program/60">{hint}</span>
            </label>
          ))}
          {kind === "payments" && (
            <label className="block">
              <span className="font-bold">How often?</span>
              <select className={`${field} mt-1`} value={often} onChange={(e) => setOften(e.target.value as Often)}>
                <option value="week" className="text-ink">Every week</option>
                <option value="2weeks" className="text-ink">Every 2 weeks</option>
                <option value="month" className="text-ink">Every month</option>
              </select>
            </label>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={math} onChange={(e) => setMath(e.target.checked)} /> Let me work out the second number first
        </label>
        <button type="submit" disabled={!ready} className="w-full rounded-xl bg-gold px-4 py-3 text-lg font-black text-night disabled:opacity-50">
          Read it
        </button>
      </form>

      {shown && <Result key={shown.id} name={shown.name} deal={shown.deal} math={math} onSave={() => {
        const list = [{ name: shown.name, deal: shown.deal, savedAt: Date.now() }, ...saved];
        setSaved(list);
        storeSaved(list);
      }} />}

      {saved.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-black text-gold">Saved on this device</h2>
          <ul className="mt-2 space-y-2">
            {saved.map((sv, i) => {
              const r = readDeal(sv.deal);
              return (
                <li key={sv.savedAt} className="flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm">
                  <button className="text-left underline" onClick={() => setShown({ name: sv.name, deal: sv.deal, id: Date.now() })}>
                    {sv.name}
                  </button>
                  <span>
                    second number <b className="text-[#ff8a8a]">{usd(r.extra)}</b>
                    {r.apr ? <> · {fmtRate(r.apr)} a year</> : null}
                  </span>
                  <button
                    aria-label={`Delete ${sv.name}`}
                    className="rounded border border-white/20 px-2 text-xs"
                    onClick={() => {
                      const list = saved.filter((_, j) => j !== i);
                      setSaved(list);
                      storeSaved(list);
                    }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="mt-8 text-sm text-program/70">
        Practice on <Link href="/deals" className="text-gold underline">endless deals</Link>, or <Link href="/play" className="text-gold underline">play the game</Link>. This
        page does the arithmetic on the numbers you give it; it isn&apos;t financial advice. Check them against the paper.
      </p>
    </main>
  );
}

function Result({ name, deal, math, onSave }: { name: string; deal: RealDeal; math: boolean; onSave: () => void }) {
  const r = readDeal(deal);
  const v = verdict(r);
  const [kept, setKept] = useState(false);
  const rate = r.apr !== null ? ` That's about ${fmtRate(r.apr)} a year.` : "";
  const card: Card = {
    front: name,
    red: `The second number: ${usd(r.total)} in all (${r.math}). That's ${usd(r.extra)} more than ${LOOKS[deal.kind]}.${rate}`,
    amber: CLOCK[deal.kind],
    blue: CONNECTION[deal.kind],
    trap: r.extra > 0,
    lever: 1,
    ask: r.math.replace(/ = \$[\d,]+$/, " = ?"),
    answer: Math.round(r.total),
  };
  const tone = { bad: "border-[#E63946] bg-[#E63946]/15 text-[#ff8a8a]", warn: "border-[#E0A526] bg-[#E0A526]/15 text-[#ffd27a]", ok: "border-[#7CFFB2] bg-[#7CFFB2]/10 text-[#7CFFB2]" }[v.tone];
  return (
    <section className="mt-8 space-y-4" aria-live="polite">
      <div className={`rounded-xl border-2 p-4 ${tone}`}>
        <p className="text-xs font-black uppercase tracking-widest">The second number</p>
        <p className="mt-1 text-4xl font-black">{usd(r.extra)}</p>
        <p className="mt-1 text-sm text-program/90">{v.text}</p>
      </div>
      <DealCard card={card} district="LENDING" sight={3} plain heading="YOUR DEAL" formId="YOURS" math={math} />
      <button className="rounded-lg border border-gold/60 px-3 py-2 text-sm font-bold text-gold disabled:opacity-50" disabled={kept} onClick={() => (onSave(), setKept(true))}>
        {kept ? "Saved on this device" : "Save it on this device"}
      </button>
    </section>
  );
}
