/**
 * What a move MEANT, read from the log lines it wrote, so the screen can make it land:
 * a verdict stamp on the decision, a banner for the big moments, and the Machine's strikes
 * one at a time. Pure: the engine's own words in, a list of moments out.
 */
import { K, type District } from "../engine/content";
import type { Game } from "../engine/engine";
import type { Delta } from "./changes";
import { t } from "../i18n";
import { titleCase } from "./theme";

export type Tone = "good" | "bad" | "shady" | "calm" | "gold" | "dark";

/** the verdict on a decision the player just made */
export interface Verdict {
  kind: "defused" | "played" | "honest" | "shortcut" | "walked" | "refused" | "wasted" | "backfire" | "conned" | "exposed" | "close";
  title: string;
  sub: string;
  tone: Tone;
}
/** a moment big enough for a banner */
export interface Moment {
  kind: "fallen" | "reached" | "captured" | "awake" | "underworld" | "pattern" | "broken" | "greenbook" | "league" | "sitout" | "won" | "lost" | "forged";
  title: string;
  sub: string;
  tone: Tone;
  d?: District;
}
export interface Impact {
  verdict: Verdict | null;
  moments: Moment[];
  /** districts the Machine hit, in order, so they can shake one after another */
  strikes: District[];
  /** districts that lost Clarity to the Machine */
  muddied: District[];
  /** districts that woke up on this move */
  woke: District[];
  /** the screen shakes for the worst of it */
  shake: boolean;
}

const D = "(LENDING|HOUSING|LABOR|HEALTH|EDUCATION)";
/** a district key as a name, in the current language (the regexes above still read the English log) */
const T = (d: string) => titleCase(d);

export function readImpact(g: Game, lines: string[], delta: Delta): Impact {
  const out: Impact = { verdict: null, moments: [], strikes: [], muddied: [], woke: [], shake: false };
  const verdict = (v: Verdict) => (out.verdict ??= v);
  for (const l of lines) {
    let m: RegExpMatchArray | null;
    // ---- the decision ----
    if ((m = l.match(/NEGOTIATE on the (\w+) lever \(Read (\d)\): defused\. Squeeze −(\d)/)))
      verdict({ kind: "defused", title: t("DEFUSED"), sub: t("You read the {lever} lever. Squeeze −{n}, Clarity +1.", { lever: t(m[1]), n: m[3] }), tone: "good" });
    else if ((m = l.match(/NEGOTIATE one layer short of the (\w+) lever \(Read (\d)\): rolled (\d)/)))
      verdict({ kind: "close", title: t("TALKED THEM DOWN"), sub: t("One layer short of the {lever} lever, and you rolled {n}. Squeeze −1.", { lever: t(m[1]), n: m[3] }), tone: "good" });
    else if ((m = l.match(/NEGOTIATE without the (\w+) layer \(Read (\d)\): you got played/))) {
      verdict({ kind: "played", title: t("YOU GOT PLAYED"), sub: t("The lever was {lever}, and your Read was {n}. Squeeze +1.", { lever: t(m[1]), n: m[2] }), tone: "bad" });
      out.shake = true;
    } else if (l.includes("It was an HONEST deal"))
      verdict({ kind: "honest", title: t("REAL HELP"), sub: t("An honest deal. Trust +2, Clarity +1."), tone: "gold" });
    else if ((m = l.match(/TAKE the trap (?:to patch \w+ NOW: Squeeze −2|for fast power: \w+ clarity \+(\d))… Shady \+(\d)/)))
      verdict({ kind: "shortcut", title: t("THE SHORTCUT"), sub: t("{gain} right now. Shady +{n} on you.", { gain: m[1] ? t("Clarity +{n}", { n: m[1] }) : t("Squeeze −2"), n: m[2] }), tone: "shady" });
    else if (l.includes("WALK: you dodged a trap"))
      verdict({ kind: "walked", title: t("WALKED AWAY"), sub: t("It was a trap. Safe, nothing gained."), tone: "calm" });
    else if (l.includes("WALK: it was honest help you refused"))
      verdict({ kind: "refused", title: t("THAT WAS REAL HELP"), sub: t("You walked away from an honest deal. Trust −1."), tone: "bad" });
    else if (l.includes("NEGOTIATE on an honest deal"))
      verdict({ kind: "wasted", title: t("HAGGLED IT AWAY"), sub: t("It was honest. The Trust is gone."), tone: "bad" });
    // ---- counterfeits (Overlord mode): these overrule the plain verdicts above ----
    if ((m = l.match(new RegExp(`It was a COUNTERFEIT: it only looked honest\\. Squeeze \\+1 in ${D}`)))) {
      out.verdict = { kind: "conned", title: t("CONNED"), sub: t("It only looked like honest help. Squeeze +1 in {d}. Only Read 3 sees a counterfeit.", { d: T(m[1]) }), tone: "bad" };
      out.shake = true;
    }
    if (l.includes("You exposed a COUNTERFEIT"))
      out.verdict = { kind: "exposed", title: t("COUNTERFEIT EXPOSED"), sub: t("You read the blue layer: it only looked honest. Defused, and Props +1."), tone: "good" };
    if (l.includes("it was a COUNTERFEIT, and you walked"))
      out.verdict = { kind: "walked", title: t("WALKED AWAY"), sub: t("It was a counterfeit. Safe."), tone: "calm" };
    if (l.includes("slips a counterfeit into a deal pile"))
      out.moments.push({ kind: "forged", title: t("A counterfeit is out there"), sub: t("The Overlord slipped a fake honest deal into a pile somewhere. Only Read 3 can see it."), tone: "shady" });
    if ((m = l.match(new RegExp(`It backfires: (.+?) read it but nobody had their back\\. Squeeze \\+1 in ${D}`)))) {
      out.verdict = { kind: "backfire", title: t("IT BACKFIRES"), sub: t("{name} saw it, but nobody had their back. Squeeze +1 in {d}.", { name: m[1], d: T(m[2]) }), tone: "bad" };
      out.shake = true;
    }

    // ---- the Machine ----
    if ((m = l.match(new RegExp(`(?:The Machine strikes ${D}|strikes ${D} for the Machine|tightens on ${D}|strongest work in ${D}|tightens again on ${D})`)))) {
      const d = m.slice(1).find(Boolean) as District;
      out.strikes.push(d);
    }
    if (l.includes("extra LENDING hit")) out.strikes.push("LENDING");
    if ((m = l.match(new RegExp(`(?:muddies ${D}|covers its tracks in ${D})`)))) out.muddied.push(m.slice(1).find(Boolean) as District);
    if ((m = l.match(new RegExp(`The Machine strikes ${D}\\. Squeeze \\d/\\d, Clarity −1`)))) out.muddied.push(m[1] as District);

    // ---- the big moments ----
    if ((m = l.match(new RegExp(`✖ ${D} CAPTURED`)))) {
      out.moments.push({ kind: "captured", d: m[1] as District, title: t("{d} is captured", { d: T(m[1]) }), sub: t("Squeeze 3. The Machine holds it."), tone: "bad" });
      out.shake = true;
    }
    if ((m = l.match(/^[\s⚠]*(.+?) HAS FALLEN/)))
      out.moments.push({ kind: "fallen", title: t("{name} has Fallen", { name: m[1].trim() }), sub: t("Too many shortcuts. The Machine moves through them now. Reach them: 2 Trust."), tone: "shady" });
    if ((m = l.match(/(.+?) reaches (.+?) and pulls them home/)))
      out.moments.push({ kind: "reached", title: t("{name} is home", { name: m[2] }), sub: t("{name} reached them and pulled them back. Props +3.", { name: m[1] }), tone: "gold" });
    if (l.includes("THE UNDERWORLD CRACKS OPEN"))
      out.moments.push({ kind: "underworld", title: t("The Underworld cracks open"), sub: g.ownerShown && !g.overlord ? t("The Owner is {face}. Trace {n} threads and expose it.", { face: t(g.ownerFace), n: K.THREADS_TO_WIN }) : t("Trace {n} threads and expose it.", { n: K.THREADS_TO_WIN }), tone: "dark" });
    if ((m = l.match(/MACHINE PATTERN — (.+?)\s{2}\[/)))
      out.moments.push({ kind: "pattern", title: t(m[1]), sub: t("A Machine Pattern: it tightens on its own every round."), tone: "bad" });
    if ((m = l.match(/PATTERN BROKEN — (.+?)\./)))
      out.moments.push({ kind: "broken", title: t("{pattern}: broken", { pattern: t(m[1]) }), sub: t("You pulled a district back out of its grip."), tone: "good" });
    if (l.includes("opens the Green Book"))
      out.moments.push({ kind: "greenbook", title: t("The Green Book"), sub: t("A safe route. That strike lands nowhere."), tone: "good" });
    if (l.includes("THE LEAGUE FORMS"))
      out.moments.push({ kind: "league", title: t("The League forms"), sub: t("Every family signed. Housing Squeeze −2."), tone: "gold" });
    if ((m = l.match(/^[\s⚠]*(.+?) has \d Shady chips: hand them back/)))
      out.moments.push({ kind: "sitout", title: t("{name} sits out a turn", { name: m[1].trim() }), sub: t("Too many shortcuts. Hand the chips back."), tone: "shady" });
  }
  // waking is read off the board: Clarity went up and landed on awake
  for (const d of g.ds) if ((delta.districts[d]?.clarity ?? 0) > 0 && g.clarity[d] >= K.WAKE) out.woke.push(d);
  for (const d of out.woke) out.moments.push({ kind: "awake", d, title: t("{d} is awake", { d: T(d) }), sub: t("Clarity 3. The porch lights come on; the Machine can't touch it."), tone: "gold" });
  if (g.result && lines.length)
    out.moments.push(
      g.result === "BLOCK_WIN"
        ? { kind: "won", title: t("The block wins"), sub: t("Every porch light on."), tone: "gold" }
        : { kind: "lost", title: t("The Machine holds the block"), sub: t("The lights go out, one by one."), tone: "dark" },
    );
  return out;
}
