/** Online play's referee: who may make which move. */
import { describe, expect, it } from "vitest";
import { C } from "../src/engine/content";
import { cleanCode, mayMove, newRoomCode, seatsOf, waitingOn } from "../src/net/protocol";
import { Session } from "../src/game/session";

describe("The room's rules", () => {
  it("lets only the current player's phone make turn moves; anyone answers the table", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 9 });
    expect(mayMove(s, { t: "cookout", call: false }, new Set(["Nia"]))).toBe(true); // the table's question
    s.apply({ t: "cookout", call: false });
    expect(waitingOn(s)).toBe("Marcus");
    expect(mayMove(s, { t: "act", a: { k: "study", d: "LENDING" } }, new Set(["Nia"]))).toBe(false);
    expect(mayMove(s, { t: "deal", d: "LENDING" }, new Set(["Nia"]))).toBe(false);
    expect(mayMove(s, { t: "act", a: { k: "study", d: "LENDING" } }, new Set(["Marcus"]))).toBe(true);
    expect(mayMove(s, { t: "next" }, new Set(["Marcus"]))).toBe(false); // not the moment for it
  });

  it("gives a person-played Overlord a seat, and the computer's none", () => {
    const human = new Session({ mode: "overlord", roster: C.roster.slice(0, 2), seed: 3, overlordHuman: true });
    expect(seatsOf(human)).toEqual(["Marcus", "Nia", "The Owner"]);
    const computer = new Session({ mode: "overlord", roster: C.roster.slice(0, 2), seed: 3 });
    expect(seatsOf(computer)).toEqual(["Marcus", "Nia"]);
  });

  it("makes readable room codes", () => {
    for (let i = 0; i < 50; i++) expect(newRoomCode()).toMatch(/^[A-HJ-NP-Z]{4}$/);
    expect(cleanCode(" ab-cd9e ")).toBe("ABCD");
  });
});
