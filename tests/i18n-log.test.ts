/** The game's log in Spanish: every line the engine writes has a rule, and English stays untouched. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import golden from "./golden.json";
import { getLang, setLang } from "../src/i18n";
import { C } from "../src/engine/content";
import { dealTemplateFor, logRuleFor, LOG_RULES, tLog } from "../src/i18n/log";

// setLang writes to window.localStorage (inside a try); give the node test a harmless one
const g = globalThis as unknown as { window?: unknown };
g.window ??= { localStorage: { setItem() {}, getItem: () => null } };

const LINES = [...new Set((golden as { log: string[] }[]).flatMap((x) => x.log))];
/** shapes the rules leave in English on purpose (none so far) */
const EXCEPTIONS: string[] = [];

describe("tLog", () => {
  beforeAll(() => setLang("es"));
  afterAll(() => setLang("en"));

  it("has a rule for every line in the golden games", () => {
    expect(getLang()).toBe("es");
    expect(LINES.length).toBeGreaterThan(1000);
    const unmatched = LINES.filter((l) => logRuleFor(l) < 0 && !EXCEPTIONS.includes(l));
    expect(unmatched).toEqual([]);
    expect(LOG_RULES.length).toBeGreaterThan(80);
  });

  it("keeps the indent and never returns an empty line", () => {
    for (const l of LINES) {
      const es = tLog(l);
      expect(es.length).toBeGreaterThan(0);
      expect(/^ */.exec(es)![0]).toBe(/^ */.exec(l)![0]);
      expect(es).not.toContain("\u0000");
    }
  });

  it("translates hand-checked lines", () => {
    const cases: [string, string][] = [
      ["Nia studies LENDING. Read now 1/3. Props +1.", "Nia estudia PRÉSTAMOS. Lectura ahora 1/3. Respeto +1."],
      ["  ✖ The Machine strikes LENDING. Squeeze 1/3.", "  ✖ La Máquina golpea PRÉSTAMOS. Presión 1/3."],
      ["  ✖ The Machine muddies HOUSING. Clarity −1.", "  ✖ La Máquina enturbia VIVIENDA. Claridad −1."],
      ["  ✖ HEALTH CAPTURED.", "  ✖ SALUD CAPTURADO."],
      ["  ⚠⚠ Zay HAS FALLEN. The Machine now moves through them.", "  ⚠⚠ Zay HA CAÍDO. Ahora la Máquina se mueve a través de esa persona."],
      ["Simone teaches Nia to read LABOR. Read 0→1. Props +2.", "Simone le enseña a Nia a leer TRABAJO. Lectura 0→1. Respeto +2."],
      ["Dre teaches Marcus to read LENDING. Read 0→1 (free). Props +2.", "Dre le enseña a Marcus a leer PRÉSTAMOS. Lectura 0→1 (gratis). Respeto +2."],
      [
        "  NEGOTIATE on the red lever (Read 1): defused. Squeeze −1, LABOR clarity +1, Props +2.",
        "  NEGOCIAR en la palanca roja (Lectura 1): desactivada. Presión −1, Claridad en TRABAJO +1, Respeto +2.",
      ],
      ["[The Owner] strikes LENDING for the Machine. Squeeze 1/3.", "[El Dueño] golpea PRÉSTAMOS para la Máquina. Presión 1/3."],
      ["  Marcus: Trust +2, Shady −1, Props +1, Read in LABOR 0→1. The block has their back now: covered.", "  Marcus: Confianza +2, Turbio −1, Respeto +1, Lectura en TRABAJO 0→1. La cuadra ya le cubre la espalda: cubierto."],
      ["The block throws a hand in the Sou-Sou: 2 Trust in. Pot 2/4.", "La cuadra echa una mano al Sou-Sou: 2 de Confianza adentro. Bote 2/4."],
      ["  📗 The block opens the Green Book: a safe route around LENDING. That strike lands nowhere.", "  📗 La cuadra abre el Libro Verde: una ruta segura alrededor de PRÉSTAMOS. Ese golpe no cae en ningún lado."],
      ["  ⛓ The Chain: Dre turns and teaches Marcus, right there, for free.", "  ⛓ La Cadena: Dre se voltea y le enseña a Marcus, ahí mismo, gratis."],
      ["🏘 The family's board: HOUSING Rebuilt ×1; LABOR Scarred ×1.", "🏘 El tablero de la familia: VIVIENDA Reconstruido ×1; TRABAJO Con cicatriz ×1."],
      ["  (The Machine is distracted — grace round.)", "  (La Máquina está distraída — ronda de gracia.)"],
      ["A line the engine never writes.", "A line the engine never writes."],
    ];
    for (const [en, es] of cases) expect(tLog(en)).toBe(es);
    // a deal: the choice is the Spanish button; the front falls back to English until it is translated
    expect(tLog('Nia faces a deal in HOUSING: "Standard lease, just sign here."  → NEGOTIATE')).toMatch(/^Nia enfrenta un trato en VIVIENDA: ".+"  → NEGOCIAR$/);
  });

  it("knows the template behind every endless deal's front", () => {
    const printed = new Set(
      [...Object.values(C.deck).flat(), ...Object.values(C.chapters).flatMap((ch) => Object.values(ch.decks).flat()), ...Object.values(C.counterfeits)].map((c) => c!.front),
    );
    const fronts = LINES.map((l) => /faces a deal in \w+: "(.*)"  → /.exec(l)?.[1]).filter((f): f is string => !!f && !printed.has(f));
    expect(fronts.length).toBeGreaterThan(0);
    expect(fronts.filter((f) => dealTemplateFor(f) < 0)).toEqual([]);
  });

  it("is the identity in English", () => {
    setLang("en");
    for (const l of LINES) expect(tLog(l)).toBe(l);
    setLang("es");
  });
});
