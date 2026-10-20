/** Your City editions: the same game, set somewhere else. */
import { describe, expect, it } from "vitest";
import { C, DISTRICTS } from "../src/engine/content";
import { blankEdition, checkEdition, encodeEdition, historyOf, readEdition, WEST_DAYTON, type Edition } from "../src/engine/edition";
import { newGame } from "../src/engine/engine";
import { Session } from "../src/game/session";

function eastSide(): Edition {
  const ed = blankEdition();
  ed.name = "East Side Test Edition";
  ed.city = "Testville, Ohio";
  ed.area = "the East Side";
  for (const d of DISTRICTS) ed.districts[d] = { sub: `${d} nickname`, flavor: `What ${d} is like on the East Side.` };
  for (const k of Object.keys(ed.places) as (keyof Edition["places"])[]) ed.places[k] = { name: `East ${k}`, where: "Main Street", flavor: "people go" };
  ed.history = { HOUSING: [{ title: "The Rent Strike", year: "1969", place: "Testville", story: "Tenants withheld rent together.", lesson: "Together.", source: "Testville Library archive" }] };
  ed.historyMode = "replace";
  ed.resources = [{ name: "Testville Credit Union", what: "small loans at a fair rate", where: "Main St" }];
  return ed;
}

describe("Your City editions", () => {
  it("West Dayton is a complete edition; a blank one lists what's missing", () => {
    expect(checkEdition(WEST_DAYTON)).toEqual([]);
    expect(checkEdition(blankEdition()).length).toBeGreaterThan(10);
    expect(checkEdition(eastSide())).toEqual([]);
  });

  it("a history card needs a source", () => {
    const ed = eastSide();
    ed.history.HOUSING![0].source = "";
    expect(checkEdition(ed).some((p) => p.includes("source"))).toBe(true);
  });

  it("shares as a code or a file, and junk is refused", () => {
    const ed = eastSide();
    const code = encodeEdition(ed);
    expect(code).toMatch(/^SNE1\.[A-Za-z0-9_-]+$/);
    expect(readEdition(code)).toEqual(ed);
    expect(readEdition(JSON.stringify(ed, null, 1))).toEqual(ed);
    expect(readEdition("hello")).toBeNull();
    expect(readEdition('{"v":1}')).toBeNull();
  });

  it("the game uses the edition's places and history; the default game is West Dayton, unchanged", () => {
    const g = newGame({ seed: 4, scenario: "A Quiet Year", roster: C.roster.slice(0, 3), edition: eastSide() });
    g.commons(g.players[0], "CHURCH");
    expect(g.log.at(-1)).toContain("gathers at East CHURCH (Main Street)");
    expect(g.places.CHURCH.bonus).toBe(C.places.CHURCH.bonus); // what the place does stays the same
    expect(historyOf(eastSide()).HOUSING.map((h) => h.title)).toEqual(["The Rent Strike"]);
    expect(historyOf(eastSide()).LABOR).toEqual(C.history.LABOR); // replace only where you wrote some
    const base = newGame({ seed: 4, scenario: "A Quiet Year", roster: C.roster.slice(0, 3) });
    expect(base.ed).toBe(WEST_DAYTON);
    expect(base.places.CHURCH.name).toBe(C.places.CHURCH.name);
  });

  it("the edition travels with the game: a save rebuilds it", () => {
    const config = { mode: "coop" as const, roster: C.roster.slice(0, 2), seed: 8, scenario: "A Quiet Year", edition: eastSide() };
    const s = new Session(config);
    if (s.phase === "cookout") s.apply({ t: "cookout", call: false });
    s.apply({ t: "act", a: { k: "commons", place: "MARKET" } });
    const r = Session.replay(config, s.moves);
    expect(r.g.log).toEqual(s.g.log);
    expect(r.g.ed.name).toBe("East Side Test Edition");
  });
});
