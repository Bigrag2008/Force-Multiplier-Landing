import Link from "next/link";
import { C, K } from "@/engine/content";

export const metadata = { title: "How to play — The Second Number" };

const sections: [string, string[]][] = [
  ["Start with the Block Party", [
    "Three districts (Lending, Housing, Education), " + K.BP_ROUNDS + " rounds, about 25 minutes, no roles and no hidden Owner. Wake " + K.BP_WAKE_TO_WIN + " of the 3 to win; lose 2 to the Machine, or run out of rounds, and you lose.",
    "Taking a trap costs " + K.BP_TAKE + " Shady chips; at " + K.BP_SIT_OUT + " you sit out a turn. The Machine strikes the district closest to waking: +1 Squeeze and −1 Clarity.",
    "Then climb the ladder: the Full Block (all five districts, roles, the Owner, the Commons), then the Cookout, Sou-Sou and Green Book, then the house rules, then Overlord.",
  ]],
  ["The words", [
    "Read: how deep you can read a district's deals (0–3). Trust: what you spend. Shady: what shortcuts put on you. Squeeze: the Machine's grip (3 captures). Clarity: how awake a district is (3 wakes it). Props: what you earn for lifting people.",
    "Every Machine move is a strike (+1 Squeeze), a muddy (−1 Clarity) or a tempt (−1 Trust), whoever makes it.",
  ]],
  ["The full game: the goal", [
    "Wake districts by reading their deals. When total Clarity reaches " + K.UNDERWORLD_AT + ", the Underworld cracks open and the hidden Owner is revealed.",
    "Trace " + K.THREADS_TO_WIN + " blue threads (Read 3 in an awake district), then Expose the Owner to win.",
    "You lose if 2 districts are captured, everyone Falls, or round " + K.MAX_ROUNDS + " ends.",
  ]],
  ["Reading a deal", [
    "Every deal has a pitch you can see, and three hidden layers: red (the cost, Read 1), amber (the clock, Read 2) and blue (the connection, Read 3).",
    "Drag Grandma's red reading glasses over the card to read the layers your Read unlocks. Locked layers stay locked.",
    "Seeing isn't beating: the red layer tells you trap or honest and shows the lever. To NEGOTIATE a trap down, your Read must reach its lever.",
  ]],
  ["TAKE · WALK · NEGOTIATE", [
    "Honest deal: TAKE it for +2 Trust and +1 Clarity. WALKing away from real help costs Trust.",
    "Trap: TAKE is the shortcut (fixes the district now, but +" + K.TAKE_CORRUPT + " Shady; at " + K.FLIP + " you Fall). WALK is safe. NEGOTIATE costs Trust and defuses it if your Read reaches the lever, or you get played.",
  ]],
  ["Your turn", [
    "Study (+1 Read), Face a deal, Teach a teammate (call and response: read the second number aloud and have them say it back), gather at the Commons, Reach a Fallen friend, and later Trace and Expose.",
    "The Commons are West Side places: " + Object.values(C.places).map((p) => `${p.name} (${p.bonus})`).join(" · "),
  ]],
  ["Together", [
    "The Sou-Sou: at the end of turns, everyone with Trust puts 1 in the can. At " + K.SOUSOU_HAND + ", the next player's hand clears 2 Squeeze with no Shady.",
    "The Cookout: once per game, skip a round's actions so everyone catches up to the best reader at the table.",
    "The Green Book: once per game, a strike that would capture a district lands nowhere.",
  ]],
  ["The Machine", [
    "After the block's turns the Machine strikes the districts closest to waking, at most once per district per round, then muddies your best unfinished work. Machine Patterns (like Redlining) tighten on their own.",
    "A hidden Owner bends the rules from round 1. Watch the board and work out who it is.",
    "How many strikes a round depends on how many of you there are: it is printed on the round track (and shown on the board here).",
  ]],
  ["House rules", [
    "Fine-print dice: roll a d6 when a trap is drawn to set its lever (1–3 red, 4–5 amber, 6 blue), so nobody can learn the deck by heart.",
    "The Terrell rule: teaching gives Read, not cover. Confront a trap in a district you were taught before the block has your back (any Commons, or the Veteran's lesson) and it backfires: +1 Squeeze.",
    "Endless deals: deals are rolled from templates with new numbers every time. With the math variant, you work out the second number before the red layer opens. Try them on the Endless deals page.",
  ]],
];

export default function HowToPlay() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">← The Second Number</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">How to play</h1>
      <p className="mt-4 rounded-lg border border-[#7CFFB2]/50 bg-[#7CFFB2]/10 p-3 text-program/90">
        Rather learn by playing? <Link href="/learn" className="font-black text-[#7CFFB2] underline">Learn to play</Link> starts a guided game: the Coach glows on the move it would make, says why, and explains each rule the first time it comes up.
      </p>
      {sections.map(([h, ps]) => (
        <section key={h} className="mt-8">
          <h2 className="text-xl font-black text-gold">{h}</h2>
          {ps.map((p) => (
            <p key={p} className="mt-2 text-program/90">{p}</p>
          ))}
        </section>
      ))}
      <p className="mt-10 italic text-program/80">How high did you climb before you turned into the thing you were fighting?</p>
      <Link href="/play" className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-black text-night">Play now</Link>
    </main>
  );
}
