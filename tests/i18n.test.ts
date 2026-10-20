/** The Spanish edition: every card and chapter has Spanish, every fixed word on the site does too, and nothing disagrees. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import content from "../src/content/es.json";
import { C, DISTRICTS } from "../src/engine/content";
import { makeDeal } from "../src/engine/dealgen";
import { Rng } from "../src/engine/rng";
import { setLang, t, tCard } from "../src/i18n";
import { game } from "../src/i18n/es/game";
import { log } from "../src/i18n/es/log";
import { pages } from "../src/i18n/es/pages";
import { panels } from "../src/i18n/es/panels";
import { setup } from "../src/i18n/es/setup";

const g = globalThis as unknown as { window?: unknown };
beforeAll(() => {
  g.window ??= { localStorage: { setItem() {}, getItem: () => null }, location: { search: "" } };
  setLang("es");
});
afterAll(() => setLang("en"));

describe("Spanish edition", () => {
  it("every deal card, in every deck and every chapter, has Spanish", () => {
    const es = content as Record<string, string>;
    const cards = [...Object.values(C.deck).flat(), ...Object.values(C.chapters).flatMap((ch) => Object.values(ch.decks).flat())];
    const missing = cards.flatMap((c) => [c.front, c.red, c.amber, c.blue].filter((x) => !(x in es)));
    expect(missing).toEqual([]);
    for (const ch of Object.values(C.chapters)) for (const x of [ch.title, ch.intro, ch.twist]) expect(es[x], x).toBeTruthy();
  });

  it("the site's own dictionaries never give one English string two Spanish versions", () => {
    const seen: Record<string, string> = { ...(content as Record<string, string>) };
    const clash: string[] = [];
    for (const d of [game, panels, setup, pages, log])
      for (const [k, v] of Object.entries(d)) {
        if (k in seen && seen[k] !== v) clash.push(k);
        seen[k] = v;
      }
    expect(clash).toEqual([]);
  });

  it("every fixed string the site passes to t() has Spanish", () => {
    const es = { ...(content as Record<string, string>), ...game, ...panels, ...setup, ...pages, ...log };
    const root = join(__dirname, "..");
    const files: string[] = [];
    const walk = (p: string) => {
      for (const f of readdirSync(p)) {
        const q = join(p, f);
        if (statSync(q).isDirectory()) walk(q);
        else if (/\.tsx?$/.test(f) && !q.includes(`${join("src", "i18n")}`) && !q.includes("_i18n")) files.push(q);
      }
    };
    walk(join(root, "src"));
    walk(join(root, "app"));
    const miss: string[] = [];
    for (const f of files)
      for (const m of readFileSync(f, "utf8").matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) {
        const k = JSON.parse(`"${m[1]}"`) as string;
        if (!(k in es) && k !== "The ") miss.push(`${f.slice(root.length + 1)}: ${k}`);
      }
    expect(miss).toEqual([]);
  });

  it("an endless deal is refilled from its Spanish template with the same numbers", () => {
    for (const d of DISTRICTS)
      for (let seed = 1; seed < 30; seed++) {
        const card = makeDeal(d, new Rng(seed));
        const es = tCard(card);
        expect(es.front).not.toBe(card.front);
        const nums = (s: string) => (s.match(/\d[\d,]*/g) ?? []).sort();
        expect(nums(es.red), es.red).toEqual(nums(card.red));
        expect(es.front).not.toMatch(/\{\w+\}/);
      }
  });

  it("districts and fixed words switch with the language", () => {
    expect(t("The second number, this game")).not.toBe("The second number, this game");
    setLang("en");
    expect(t("Study")).toBe("Study");
    setLang("es");
  });
});
