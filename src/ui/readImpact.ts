/**
 * What a move MEANT, read from the log lines it wrote, so the screen can make it land:
 * a verdict stamp on the decision, a banner for the big moments, and the Machine's strikes
 * one at a time. Pure: the engine's own words in, a list of moments out.
 */
import { K, type District } from "../engine/content";
import type { Game } from "../engine/engine";
import type { Delta } from "./changes";

export type Tone = "good" | "bad" | "shady" | "calm" | "gold" | "dark";

/** the verdict on a decision the player just made */
export interface Verdict {
  kind: "defused" | "played" | "honest" | "shortcut" | "walked" | "refused" | "wasted" | "backfire" | "conned" | "exposed";
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
const T = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();

export function readImpact(g: Game, lines: string[], delta: Delta): Impact {
  const out: Impact = { verdict: null, moments: [], strikes: [], muddied: [], woke: [], shake: false };
  const verdict = (v: Verdict) => (out.verdict ??= v);
  for (const l of lines) {
    let m: RegExpMatchArray | null;
    // ---- the decision ----
    if ((m = l.match(/NEGOTIATE on the (\w+) lever \(Read (\d)\): defused\. Squeeze −(\d)/)))
      verdict({ kind: "defused", title: "DEFUSED", sub: `You read the ${m[1]} lever. Squeeze −${m[3]}, Clarity +1.`, tone: "good" });
    else if ((m = l.match(/NEGOTIATE without the (\w+) layer \(Read (\d)\): you got played/))) {
      verdict({ kind: "played", title: "YOU GOT PLAYED", sub: `The lever was ${m[1]}, and your Read was ${m[2]}. Squeeze +1.`, tone: "bad" });
      out.shake = true;
    } else if (l.includes("It was an HONEST deal"))
      verdict({ kind: "honest", title: "REAL HELP", sub: "An honest deal. Trust +2, Clarity +1.", tone: "gold" });
    else if ((m = l.match(/TAKE the trap (?:to patch \w+ NOW: Squeeze −2|for fast power: \w+ clarity \+(\d))… Shady \+(\d)/)))
      verdict({ kind: "shortcut", title: "THE SHORTCUT", sub: `${m[1] ? `Clarity +${m[1]}` : "Squeeze −2"} right now. Shady +${m[2]} on you.`, tone: "shady" });
    else if (l.includes("WALK: you dodged a trap"))
      verdict({ kind: "walked", title: "WALKED AWAY", sub: "It was a trap. Safe, nothing gained.", tone: "calm" });
    else if (l.includes("WALK: it was honest help you refused"))
      verdict({ kind: "refused", title: "THAT WAS REAL HELP", sub: "You walked away from an honest deal. Trust −1.", tone: "bad" });
    else if (l.includes("NEGOTIATE on an honest deal"))
      verdict({ kind: "wasted", title: "HAGGLED IT AWAY", sub: "It was honest. The Trust is gone.", tone: "bad" });
    // ---- counterfeits (Overlord mode): these overrule the plain verdicts above ----
    if ((m = l.match(new RegExp(`It was a COUNTERFEIT: it only looked honest\\. Squeeze \\+1 in ${D}`)))) {
      out.verdict = { kind: "conned", title: "CONNED", sub: `It only looked like honest help. Squeeze +1 in ${T(m[1])}. Only Read 3 sees a counterfeit.`, tone: "bad" };
      out.shake = true;
    }
    if (l.includes("You exposed a COUNTERFEIT"))
      out.verdict = { kind: "exposed", title: "COUNTERFEIT EXPOSED", sub: "You read the blue layer: it only looked honest. Defused, and Props +1.", tone: "good" };
    if (l.includes("it was a COUNTERFEIT, and you walked"))
      out.verdict = { kind: "walked", title: "WALKED AWAY", sub: "It was a counterfeit. Safe.", tone: "calm" };
    if (l.includes("slips a counterfeit into a deal pile"))
      out.moments.push({ kind: "forged", title: "A counterfeit is out there", sub: "The Overlord slipped a fake honest deal into a pile somewhere. Only Read 3 can see it.", tone: "shady" });
    if ((m = l.match(new RegExp(`It backfires: (.+?) read it but nobody had their back\\. Squeeze \\+1 in ${D}`)))) {
      out.verdict = { kind: "backfire", title: "IT BACKFIRES", sub: `${m[1]} saw it, but nobody had their back. Squeeze +1 in ${T(m[2])}.`, tone: "bad" };
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
      out.moments.push({ kind: "captured", d: m[1] as District, title: `${T(m[1])} is captured`, sub: "Squeeze 3. The Machine holds it.", tone: "bad" });
      out.shake = true;
    }
    if ((m = l.match(/^[\s⚠]*(.+?) HAS FALLEN/)))
      out.moments.push({ kind: "fallen", title: `${m[1].trim()} has Fallen`, sub: "Too many shortcuts. The Machine moves through them now. Reach them: 2 Trust.", tone: "shady" });
    if ((m = l.match(/(.+?) reaches (.+?) and pulls them home/)))
      out.moments.push({ kind: "reached", title: `${m[2]} is home`, sub: `${m[1]} reached them and pulled them back. Props +3.`, tone: "gold" });
    if (l.includes("THE UNDERWORLD CRACKS OPEN"))
      out.moments.push({ kind: "underworld", title: "The Underworld cracks open", sub: g.ownerShown && !g.overlord ? `The Owner is ${g.ownerFace}. Trace ${K.THREADS_TO_WIN} threads and expose it.` : `Trace ${K.THREADS_TO_WIN} threads and expose it.`, tone: "dark" });
    if ((m = l.match(/MACHINE PATTERN — (.+?)\s{2}\[/)))
      out.moments.push({ kind: "pattern", title: m[1], sub: "A Machine Pattern: it tightens on its own every round.", tone: "bad" });
    if ((m = l.match(/PATTERN BROKEN — (.+?)\./)))
      out.moments.push({ kind: "broken", title: `${m[1]}: broken`, sub: "You pulled a district back out of its grip.", tone: "good" });
    if (l.includes("opens the Green Book"))
      out.moments.push({ kind: "greenbook", title: "The Green Book", sub: "A safe route. That strike lands nowhere.", tone: "good" });
    if (l.includes("THE LEAGUE FORMS"))
      out.moments.push({ kind: "league", title: "The League forms", sub: "Every family signed. Housing Squeeze −2.", tone: "gold" });
    if ((m = l.match(/^[\s⚠]*(.+?) has \d Shady chips: hand them back/)))
      out.moments.push({ kind: "sitout", title: `${m[1].trim()} sits out a turn`, sub: "Too many shortcuts. Hand the chips back.", tone: "shady" });
  }
  // waking is read off the board: Clarity went up and landed on awake
  for (const d of g.ds) if ((delta.districts[d]?.clarity ?? 0) > 0 && g.clarity[d] >= K.WAKE) out.woke.push(d);
  for (const d of out.woke) out.moments.push({ kind: "awake", d, title: `${T(d)} is awake`, sub: "Clarity 3. The porch lights come on; the Machine can't touch it.", tone: "gold" });
  if (g.result && lines.length)
    out.moments.push(
      g.result === "BLOCK_WIN"
        ? { kind: "won", title: "The block wins", sub: "Every porch light on.", tone: "gold" }
        : { kind: "lost", title: "The Machine holds the block", sub: "The lights go out, one by one.", tone: "dark" },
    );
  return out;
}
