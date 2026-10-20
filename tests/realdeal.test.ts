/** Bring your own deal: the math must match known answers. */
import { describe, expect, it } from "vitest";
import { readDeal, verdict, yearlyRate } from "../src/game/realdeal";

describe("reading a real deal", () => {
  it("a payday loan: $56.25 to borrow $375 for 14 days is 391% a year (the Quick Cash card)", () => {
    const r = readDeal({ kind: "fee", amount: 375, fee: 56.25, days: 14, rollovers: 0 });
    expect(r.apr).toBeCloseTo(391.07, 1);
    expect(r.extra).toBe(56.25);
    expect(verdict(r).tone).toBe("bad");
    // rolled over 7 more times, like the typical borrower
    expect(readDeal({ kind: "fee", amount: 375, fee: 56.25, days: 14, rollovers: 7 }).extra).toBe(450);
  });

  it("a fair loan: $1,000 paid back at $88.85 a month for 12 months is about 12% a year", () => {
    expect(yearlyRate(1000, 88.85, 12, 12)).toBeCloseTo(12, 1);
    const r = readDeal({ kind: "payments", cash: 1000, down: 0, payment: 88.85, often: "month", count: 12, fees: 0 });
    expect(verdict(r).tone).not.toBe("bad");
  });

  it("rent-to-own: $25 a week for a year on a $400 couch", () => {
    const r = readDeal({ kind: "payments", cash: 400, down: 0, payment: 25, often: "week", count: 52, fees: 0 });
    expect(r.total).toBe(1300);
    expect(r.extra).toBe(900);
    expect(r.apr!).toBeGreaterThan(300);
    expect(r.math).toBe("$0 down + $25 × 52 payments = $1,300");
  });

  it("no interest means 0%, and paying less than the price is never a negative rate", () => {
    expect(yearlyRate(400, 100, 4, 26)).toBe(0);
    expect(yearlyRate(400, 50, 4, 26)).toBe(0);
  });

  it("a phone plan: the advertised price against what's charged", () => {
    const r = readDeal({ kind: "monthly", advertised: 30, charged: 42, months: 24, fees: 35 });
    expect(r.total).toBe(1043);
    expect(r.extra).toBe(323);
    expect(r.apr).toBeNull();
  });
});
