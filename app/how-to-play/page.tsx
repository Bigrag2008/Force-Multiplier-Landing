import Link from "next/link";
import { C, K } from "@/engine/content";

export const metadata = { title: "How to play — The Second Number" };

const sections: [string, string[]][] = [
  ["The goal", [
    "Wake districts by reading their deals. When total Clarity reaches " + K.UNDERWORLD_AT + ", the Underworld cracks open and the hidden Owner is revealed.",
    "Trace " + K.THREADS_TO_WIN + " blue threads (Sight 3 in an awake district), then Expose the Owner to win.",
    "You lose if 2 districts are captured, everyone Falls, or round " + K.MAX_ROUNDS + " ends.",
  ]],
  ["Reading a deal", [
    "Every deal has a pitch you can see, and three hidden layers: red (the cost, Sight 1), amber (the clock, Sight 2) and blue (the connection, Sight 3).",
    "Drag Grandma's red reading glasses over the card to read the layers your Sight unlocks. Locked layers stay locked.",
    "Seeing isn't beating: the red layer tells you trap or honest and shows the lever. To NEGOTIATE a trap down, your Sight must reach its lever.",
  ]],
  ["TAKE · WALK · NEGOTIATE", [
    "Honest deal: TAKE it for +2 Trust and +1 Clarity. WALKing away from real help costs Trust.",
    "Trap: TAKE is the shortcut (fixes the district now, but +" + K.TAKE_CORRUPT + " Corruption; at " + K.FLIP + " you Fall). WALK is safe. NEGOTIATE costs Trust and defuses it if your Sight reaches the lever, or you get played.",
  ]],
  ["Your turn", [
    "Study (+1 Sight), Face a deal, Teach a teammate (call and response: read the second number aloud and have them say it back), gather at the Commons, Reach a Fallen friend, and later Trace and Expose.",
    "The Commons are West Side places: " + Object.values(C.places).map((p) => `${p.name} (${p.bonus})`).join(" · "),
  ]],
  ["Together", [
    "The Sou-Sou: at the end of turns, everyone with Trust puts 1 in the can. At " + K.SOUSOU_HAND + ", the next player's hand clears 2 Pressure with no Corruption.",
    "The Cookout: once per game, skip a round's actions so everyone catches up to the best reader at the table.",
    "The Green Book: once per game, a strike that would capture a district lands nowhere.",
  ]],
  ["The Machine", [
    "After the block's turns the Machine strikes the districts closest to waking, at most once per district per round, then muddies your best unfinished work. Machine Patterns (like Redlining) tighten on their own.",
    "A hidden Owner bends the rules from round 1. Watch the board and work out who it is.",
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
