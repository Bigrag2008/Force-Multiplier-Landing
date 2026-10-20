"use client";
import Link from "next/link";
import { C, K } from "@/engine/content";
import { t, useLang } from "@/i18n";
import { rich } from "../_i18n/rich";

/** the sections, built at render so they come out in the current language (the numbers come from the rules) */
const sections = (): [string, string[]][] => [
  [t("Start with the Block Party"), [
    t("Three districts (Lending, Housing, Education), {rounds} rounds, about 25 minutes, no roles and no hidden Owner. Wake {wake} of the 3 to win; lose 2 to the Machine, or run out of rounds, and you lose.", { rounds: K.BP_ROUNDS, wake: K.BP_WAKE_TO_WIN }),
    t("Taking a trap costs {take} Shady chips; at {out} you sit out a turn. The Machine strikes the district closest to waking: +1 Squeeze and −1 Clarity.", { take: K.BP_TAKE, out: K.BP_SIT_OUT }),
    t("Then climb the ladder: the Full Block (all five districts, roles, the Owner, the Commons), then the Cookout, Sou-Sou and Green Book, then the house rules, then Overlord."),
  ]],
  [t("The words"), [
    t("Read: how deep you can read a district's deals (0–3). Trust: what you spend. Shady: what shortcuts put on you. Squeeze: the Machine's grip (3 captures). Clarity: how awake a district is (3 wakes it). Props: what you earn for lifting people."),
    t("Every Machine move is a strike (+1 Squeeze), a muddy (−1 Clarity) or a tempt (−1 Trust), whoever makes it."),
  ]],
  [t("The full game: the goal"), [
    t("Wake districts by reading their deals. When total Clarity reaches {n}, the Underworld cracks open and the hidden Owner is revealed.", { n: K.UNDERWORLD_AT }),
    t("Trace {n} blue threads (Read 3 in an awake district), then Expose the Owner to win.", { n: K.THREADS_TO_WIN }),
    t("You lose if 2 districts are captured, everyone Falls, or round {n} ends.", { n: K.MAX_ROUNDS }),
  ]],
  [t("Reading a deal"), [
    t("Every deal has a pitch you can see, and three hidden layers: red (the cost, Read 1), amber (the clock, Read 2) and blue (the connection, Read 3)."),
    t("Drag Grandma's red reading glasses over the card to read the layers your Read unlocks. Locked layers stay locked."),
    t("Seeing isn't beating: the red layer tells you trap or honest and shows the lever. To NEGOTIATE a trap down, your Read must reach its lever."),
  ]],
  [t("TAKE · WALK · NEGOTIATE"), [
    t("Honest deal: TAKE it for +2 Trust and +1 Clarity. WALKing away from real help costs Trust."),
    t("Trap: TAKE is the shortcut (fixes the district now, but +{shady} Shady; at {fall} you Fall). WALK is safe. NEGOTIATE costs Trust and defuses it if your Read reaches the lever, or you get played.", { shady: K.TAKE_CORRUPT, fall: K.FLIP }),
  ]],
  [t("Your turn"), [
    t("Study (+1 Read), Face a deal, Teach a teammate (call and response: read the second number aloud and have them say it back), gather at the Commons, Reach a Fallen friend, and later Trace and Expose."),
    t("The Commons are West Side places: {places}", { places: Object.values(C.places).map((p) => `${t(p.name)} (${t(p.bonus)})`).join(" · ") }),
  ]],
  [t("Together"), [
    t("The Sou-Sou: at the end of turns, everyone with Trust puts 1 in the can. At {n}, the next player's hand clears 2 Squeeze with no Shady.", { n: K.SOUSOU_HAND }),
    t("The Cookout: once per game, skip a round's actions so everyone catches up to the best reader at the table."),
    t("The Green Book: once per game, a strike that would capture a district lands nowhere."),
  ]],
  [t("The Machine"), [
    t("After the block's turns the Machine strikes the districts closest to waking, at most once per district per round, then muddies your best unfinished work. Machine Patterns (like Redlining) tighten on their own."),
    t("A hidden Owner bends the rules from round 1. Watch the board and work out who it is."),
    t("How many strikes a round depends on how many of you there are: it is printed on the round track (and shown on the board here)."),
  ]],
  [t("House rules"), [
    t("Fine-print dice: roll a d6 when a trap is drawn to set its lever (1–3 red, 4–5 amber, 6 blue), so nobody can learn the deck by heart."),
    t("The Terrell rule: teaching gives Read, not cover. Confront a trap in a district you were taught before the block has your back (any Commons, or the Veteran's lesson) and it backfires: +1 Squeeze."),
    t("Endless deals: deals are rolled from templates with new numbers every time. With the math variant, you work out the second number before the red layer opens. Try them on the Endless deals page."),
  ]],
];

export function HowToPlay() {
  useLang();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">{t("← The Second Number")}</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">{t("How to play")}</h1>
      <p className="mt-4 rounded-lg border border-[#7CFFB2]/50 bg-[#7CFFB2]/10 p-3 text-program/90">
        {rich(t("Rather learn by playing? <a>Learn to play</a> starts a guided game: the Coach glows on the move it would make, says why, and explains each rule the first time it comes up."), {
          a: (c) => <Link href="/learn" className="font-black text-[#7CFFB2] underline">{c}</Link>,
        })}
      </p>
      {sections().map(([h, ps], i) => (
        <section key={i} className="mt-8">
          <h2 className="text-xl font-black text-gold">{h}</h2>
          {ps.map((p, j) => (
            <p key={j} className="mt-2 text-program/90">{p}</p>
          ))}
        </section>
      ))}
      <p className="mt-10 italic text-program/80">{t("How high did you climb before you turned into the thing you were fighting?")}</p>
      <Link href="/play" className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-black text-night">{t("Play now")}</Link>
    </main>
  );
}
