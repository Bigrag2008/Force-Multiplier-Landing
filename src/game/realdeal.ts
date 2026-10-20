/**
 * Bring your own deal: the second number of a real offer from your own life. Pure math, no network:
 * the page that uses it keeps everything on the device.
 *
 *  payments   rent-to-own, store financing, a car or installment loan, buy-now-pay-later
 *  fee        a payday loan, cash advance, pawn, refund advance (a flat fee to borrow for a few days)
 *  monthly    a phone plan, subscription or insurance (the advertised price vs what you're charged)
 */
export type Kind = "payments" | "fee" | "monthly";
export type Often = "week" | "2weeks" | "month";
export const PER_YEAR: Record<Often, number> = { week: 52, "2weeks": 26, month: 12 };

export interface PaymentsDeal { kind: "payments"; cash: number; down: number; payment: number; often: Often; count: number; fees: number }
export interface FeeDeal { kind: "fee"; amount: number; fee: number; days: number; rollovers: number }
export interface MonthlyDeal { kind: "monthly"; advertised: number; charged: number; months: number; fees: number }
export type RealDeal = PaymentsDeal | FeeDeal | MonthlyDeal;

export interface Reading {
  /** everything you'd pay */
  total: number;
  /** what it looks like it costs: the cash price, the amount borrowed, the advertised price */
  looks: number;
  /** the second number: total − looks */
  extra: number;
  /** the yearly rate it really charges, when it's a loan (null for a plan) */
  apr: number | null;
  /** the math, written out so it can be checked by hand */
  math: string;
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/**
 * The yearly rate of a loan: the rate per period r at which `count` payments of `payment` are worth
 * `financed` today, times periods per year. Found by halving the interval; 0 if there's no interest.
 */
export function yearlyRate(financed: number, payment: number, count: number, perYear: number): number {
  if (financed <= 0 || payment <= 0 || count <= 0 || payment * count <= financed) return 0;
  const worth = (r: number) => (payment * (1 - Math.pow(1 + r, -count))) / r;
  let lo = 1e-9;
  let hi = 10; // 1,000% a period: past any real deal
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (worth(mid) > financed) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * perYear * 100;
}

export function readDeal(deal: RealDeal): Reading {
  if (deal.kind === "payments") {
    const paid = deal.payment * deal.count;
    const total = deal.down + paid + deal.fees;
    // an upfront fee is part of the price of the money: you're really financing less
    const financed = deal.cash - deal.down - deal.fees;
    return {
      total,
      looks: deal.cash,
      extra: total - deal.cash,
      apr: yearlyRate(financed, deal.payment, deal.count, PER_YEAR[deal.often]),
      math: `${money(deal.down)} down + ${money(deal.payment)} × ${deal.count} payments${deal.fees ? ` + ${money(deal.fees)} in fees` : ""} = ${money(total)}`,
    };
  }
  if (deal.kind === "fee") {
    const times = 1 + deal.rollovers;
    const fees = deal.fee * times;
    const apr = deal.amount > 0 && deal.days > 0 ? (deal.fee / deal.amount) * (365 / deal.days) * 100 : 0;
    return {
      total: deal.amount + fees,
      looks: deal.amount,
      extra: fees,
      apr,
      math: `${money(deal.fee)} fee × ${times} time${times === 1 ? "" : "s"} = ${money(fees)} to borrow ${money(deal.amount)}`,
    };
  }
  const total = deal.charged * deal.months + deal.fees;
  const looks = deal.advertised * deal.months;
  return {
    total,
    looks,
    extra: total - looks,
    apr: null,
    math: `${money(deal.charged)} a month × ${deal.months} months${deal.fees ? ` + ${money(deal.fees)} in fees` : ""} = ${money(total)}`,
  };
}

/** 36% a year: the cap the Military Lending Act puts on loans to service members, and many states use */
export const FAIR_CAP = 36;

export function verdict(r: Reading): { tone: "bad" | "warn" | "ok"; text: string } {
  if (r.apr !== null && r.apr > FAIR_CAP)
    return { tone: "bad", text: `About ${fmtRate(r.apr)} a year. That's over ${FAIR_CAP}%, the cap the law puts on loans to service members. This is priced like a trap.` };
  if (r.extra > 0 && r.looks > 0 && r.extra / r.looks >= 0.25)
    return { tone: "warn", text: `You'd pay ${Math.round((r.extra / r.looks) * 100)}% more than it looks like it costs.` };
  if (r.extra > 0) return { tone: "warn", text: "There's a second number. Make sure it's worth it to you." };
  return { tone: "ok", text: "No hidden cost in these numbers. Read the rest of the paper anyway." };
}

export const fmtRate = (apr: number) => (apr >= 1000 ? "over 999%" : `${apr >= 100 ? Math.round(apr) : apr.toFixed(1)}%`);
