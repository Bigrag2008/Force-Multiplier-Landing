/** Moving a family to another device: the code carries the whole record, and nothing else gets in. */
import { describe, expect, it } from "vitest";
import { advance, newState } from "../src/engine/campaign";
import type { ChapterResult } from "../src/engine/engine";
import { encodeFamily, readFamily } from "../src/game/family";

const res = (o: Partial<ChapterResult> = {}): ChapterResult => ({
  won: true, ledger: 3, rebuilt: ["LABOR"], scarred: ["HEALTH"], falls: 0, reaches: 0, league: false, redlining_broken: true,
  unlocks: ["The Freedman's Savings Bank"], rally: false, burned: false, quit_desk: null, crown: null, ...o,
});

describe("family codes", () => {
  it("carry a Long Ledger family to another device unchanged", () => {
    let st = advance(newState("LEDGER"), "FREEDOMS_LEDGER", res(), "STAY");
    st = advance(st, "UP_NORTH", res({ won: false, ledger: -3, rally: true }), "SCHOOL");
    const code = encodeFamily({ state: st, lastId: "x" });
    expect(code.startsWith("SNF1.")).toBe(true);
    expect(readFamily(code)?.state).toEqual(st);
    expect(readFamily(`  ${code.slice(0, 40)}\n${code.slice(40)}  `)?.state).toEqual(st); // pasted with line breaks
  });
  it("carry Book One's flags", () => {
    const st = advance(newState("BOOK_ONE"), "B1_CHAIN", res({ burned: true }));
    expect(readFamily(encodeFamily({ state: st, lastId: null }))?.state.flags).toEqual(["CIVIC_ARMOR", "TERRELL"]);
  });
  it("turn away anything that isn't one, and clamp what a tampered code claims", () => {
    expect(readFamily("hello")).toBeNull();
    expect(readFamily("SNF1.!!!")).toBeNull();
    const bad = { v: 1, state: { ...newState("LEDGER"), ledger: 999, flags: ["ROOT", "TERRELL"], stickers: { LABOR: { rebuilt: 50, scarred: -3 }, NOWHERE: { rebuilt: 1 } }, decisions: { UP_NORTH: "LOTTERY", FREEDOMS_LEDGER: "GO" }, played: [{ chapter: "B1_NET" }, { chapter: "TODAY", won: 1 }] } };
    const code = "SNF1." + Buffer.from(JSON.stringify(bad)).toString("base64url");
    const f = readFamily(code)!;
    expect(f.state.ledger).toBe(10);
    expect(f.state.flags).toEqual(["TERRELL"]);
    expect(f.state.stickers).toEqual({ LABOR: { rebuilt: 2, scarred: 0 } });
    expect(f.state.decisions).toEqual({ FREEDOMS_LEDGER: "GO" });
    expect(f.state.played).toEqual([{ chapter: "TODAY", won: true, ledger: 0, decision: null }]);
  });
});
