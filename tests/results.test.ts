/** The teacher's view: a finished game becomes a result code, and codes add up to a class picture. */
import { describe, expect, it } from "vitest";
import { C } from "../src/engine/content";
import { addResults, classPicture, decodeAll, decodeResult, encodeResult, summarize, toCsv } from "../src/game/results";
import { Session } from "../src/game/session";

function finished(seed: number) {
  const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed, scenario: "A Quiet Year" });
  for (let i = 0; i < 5000 && s.phase !== "over"; i++) {
    const g = s.g;
    if (s.phase === "cookout") s.cookout(false);
    else if (s.phase === "turn") s.act(g.blockAi(s.player, "human"));
    else if (s.phase === "fallen") s.fallenAct(g.machineAiMove(g.struck));
    else if (s.phase === "sousou") s.sousou(false);
    else if (s.phase === "machine") s.nextRound();
  }
  return s;
}

describe("result codes and the class picture", () => {
  it("a finished game round-trips through its code, names and all", () => {
    const s = finished(3);
    const r = summarize(s, "Table 4 · 3rd period");
    expect(r.names).toEqual(C.roster.slice(0, 3).map((p) => p.name));
    expect(r.money.taken).toBe(s.g.money().taken);
    const code = encodeResult(r);
    expect(code.startsWith("SN1.")).toBe(true);
    expect(code).toMatch(/^SN1\.[A-Za-z0-9_-]+$/); // safe to paste anywhere
    expect(decodeResult(code)).toEqual(r);
  });

  it("finds every code in pasted text, and rejects junk", () => {
    const a = encodeResult(summarize(finished(4)));
    const b = encodeResult(summarize(finished(5)));
    const { results, bad } = decodeAll(`${a}\n\n  ${b}  hello`);
    expect(results).toHaveLength(2);
    expect(bad).toBe(1);
    expect(decodeResult("SN1.notreal")).toBeNull();
    expect(decodeResult("hello")).toBeNull();
  });

  it("the same game pasted twice counts once, and the class picture adds up", () => {
    const r1 = summarize(finished(6));
    const r2 = summarize(finished(7));
    const list = addResults(addResults([], [r1, r2]), [r1]);
    expect(list).toHaveLength(2);
    const pic = classPicture(list);
    expect(pic.games).toBe(2);
    expect(pic.money.taken).toBe(r1.money.taken + r2.money.taken);
    expect(pic.fooled.reduce((a, f) => a + f.times, 0)).toBe(r1.fooled.length + r2.fooled.length);
    if (pic.fooled.length) expect(pic.fooled[0].red).toBeTruthy(); // the card's own red layer, to talk through
    expect(toCsv(list).split("\n")).toHaveLength(3);
  });
});
