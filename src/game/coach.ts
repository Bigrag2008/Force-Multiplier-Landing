/**
 * The Coach: plays along with the table and holds a new player's hand.
 *
 * Everything here is pure: it reads the game, never changes it, never draws a card
 * and never touches the random number generator. Deal advice uses only the layers
 * the player can already read, so the Coach teaches reading instead of cheating.
 */
import { C, DISTRICTS, K, type Card, type Choice, type District, type PlaceKey } from "../engine/content";
import { maxBy, minBy, type Game, type Player } from "../engine/engine";
import type { Session } from "./session";

/**
 * What a shortcut costs, as far as the table can know. A hidden Owner can make it cost more
 * (the Debt Buyer does), and the Coach mustn't give that clue away before the Owner is revealed.
 */
const takeCost = (g: Game) => (g.ownerShown ? g.takeCost() : K.TAKE_CORRUPT);
const costWord = (g: Game) => `+${takeCost(g)}${g.ownerShown ? "" : " or more"}`;

const T = (d: District) => d.charAt(0) + d.slice(1).toLowerCase();
const LEVER = ["", "red", "amber", "blue"];

export type TurnPick =
  | { k: "study" | "face" | "history" | "trace"; d: District }
  | { k: "teach"; d: District; t: string }
  | { k: "commons"; place: PlaceKey }
  | { k: "reach"; t: string }
  | { k: "expose_uw" | "league" };

export interface Advice<P> {
  pick: P;
  title: string;
  why: string;
  /** the tempting road not taken, shown beside the pick so the choice is real */
  alt?: { pick: P; title: string; why: string; falls: boolean };
}

/** What the current player should do with their next action, and why. */
export function adviseTurn(g: Game, p: Player, actionsLeft: number): Advice<TurnPick> {
  const act = g.active();
  const placeWhy = (place: PlaceKey) => `${C.places[place].name}: ${C.places[place].bonus}`;
  const commons = (place: PlaceKey, why: string): Advice<TurnPick> => ({
    pick: { k: "commons", place },
    title: `Gather at ${C.places[place].name}`,
    why: `${why} ${placeWhy(place)}`,
  });

  if (g.canExpose())
    return { pick: { k: "expose_uw" }, title: "Expose the Underworld — win the game", why: `You've traced ${g.threads.size} threads. Drag the one machine into the light.` };
  for (const d of DISTRICTS)
    if (g.canTrace(p, d))
      return { pick: { k: "trace", d }, title: `Trace the thread under ${T(d)}`, why: `${T(d)} is awake and your Read there is 3 (blue). Each thread brings you closer to exposing the Owner: ${g.threads.size}/${g.threadsNeeded()} so far.` };

  const fallen = g.blk().filter((x) => x.flipped);
  const emergency = Math.max(...DISTRICTS.map((d) => g.pressure[d])) >= K.CAPTURE - 1;
  if (fallen.length && p.trust >= 2 && !emergency)
    return { pick: { k: "reach", t: fallen[0].name }, title: `Reach ${fallen[0].name}`, why: `${fallen[0].name} has Fallen and the Machine is moving through them. Spend 2 Trust to bring them home; it's the most legendary thing you can do (+3 Props).` };
  if (p.corruption >= K.FLIP - 2)
    return commons("CHURCH", `Your Shady is ${p.corruption}/${K.FLIP}. One more shortcut and you Fall. Step back from the edge.`);
  if (p.trust < K.NEG_COST)
    return commons(g.botPlace(p), "You're out of Trust, and Trust pays for negotiating and teaching.");

  // set-ups from the Commons this turn
  if (p.practice) {
    const d = minBy(DISTRICTS.filter((x) => p.sight[x] < 3), (x) => [g.clarity[x] >= K.WAKE ? 1 : 0, p.sight[x]]);
    if (d) return { pick: { k: "study", d }, title: `Study ${T(d)} (+2 Read)`, why: "You practiced at Adventure Central, so this Study gives +2 Read. Use it now; it ends with your turn." };
  }
  if (p.shopAround) {
    const d = maxBy(DISTRICTS, (x) => [p.sight[x], g.pressure[x]]);
    return { pick: { k: "face", d }, title: `Face a deal in ${T(d)} (draw 2)`, why: "You shopped around at Gem City Market: draw two deals and face the one you can beat." };
  }

  // emergency: a district one strike from capture
  const hot = DISTRICTS.filter((d) => g.pressure[d] >= K.CAPTURE - 1 && g.clarity[d] < K.WAKE).sort((x, y) => g.pressure[y] - g.pressure[x]);
  if (hot.length) {
    const d = hot[0];
    const state = g.pressure[d] >= K.CAPTURE ? "is captured" : "is one strike from capture";
    if (p.role === "Elder" && !p.elderUsed)
      return { pick: { k: "history", d }, title: `Teach the History of ${T(d)}`, why: `${T(d)} ${state}. Your History wakes it at once, and an awake district is out of the Machine's reach. Two captured districts lose the game.` };
    if (p.sight[d] >= 1)
      return { pick: { k: "face", d }, title: `Face a deal in ${T(d)}`, why: `${T(d)} ${state}. You can read its red layer, so you'll know trap from honest. If your Read reaches the lever, NEGOTIATE drops the Squeeze.` };
    if (p.corruption + takeCost(g) < K.FLIP)
      return { pick: { k: "face", d }, title: `Face a deal in ${T(d)}`, why: `${T(d)} ${state} and you can't read it yet. A deal here still gives you the shortcut: TAKE a trap patches Squeeze −2 right now, at the cost of Shady. That's the hard choice this game is about.` };
    return { pick: { k: "study", d }, title: `Study ${T(d)}`, why: `${T(d)} ${state}, but you're too close to Falling to take a shortcut. Learn to read it.` };
  }

  // Chapter 3: organize
  if (g.hasLeague() && !g.leagueFormed && !g.league.has(p.name) && Math.max(g.pressure.HOUSING, g.pressure.LENDING) >= 1)
    return { pick: { k: "league" }, title: "Sign the League pledge", why: `Every family has to sign in the same round (${g.league.size}/${g.leagueNeeded()} so far), or the sellers scare them off. Sign, then make sure everyone else signs on their turn.` };

  // final act: get someone to Read 3 in an awake district
  if (g.uwOpen) {
    const open = DISTRICTS.filter((d) => g.clarity[d] >= K.WAKE && !g.threads.has(d));
    if (open.length) {
      const d = maxBy(open, (x) => p.sight[x]);
      const learner = act.find((x) => x !== p && x.sight[d] < p.sight[d]);
      if (p.sight[d] >= 2 && learner && (p.role === "Translator" || p.freeTeach || p.trust >= 2))
        return { pick: { k: "teach", d, t: learner.name }, title: `Teach ${learner.name} to read ${T(d)}`, why: `The Underworld is open. Threads need Read 3 in an awake district; get more of the block reading ${T(d)}.` };
      if (p.sight[d] <= 1 && actionsLeft >= 2)
        return commons("ADVENTURE", `The Underworld is open and you need Read 3 in ${T(d)}. Practice first, then Study it.`);
      return { pick: { k: "study", d }, title: `Study ${T(d)}`, why: `The Underworld is open. ${T(d)} is awake: reach Read 3 (blue) there and you can trace its thread.` };
    }
  }

  // build clarity toward the Underworld
  const building = DISTRICTS.filter((d) => g.clarity[d] < K.WAKE);
  if (!building.length) return commons(g.botPlace(p), "Every district is awake. Rebuild your Trust while the Underworld opens.");
  const tgt = minBy(building, (d) => [g.clarity[d], -p.sight[d]]);
  if (p.sight[tgt] >= 1) {
    const learner = act.find((x) => x !== p && x.sight[tgt] < p.sight[tgt]);
    if (learner && (p.role === "Translator" || p.freeTeach || (p.trust >= 2 && learner.sight[tgt] === 0)))
      return { pick: { k: "teach", d: tgt, t: learner.name }, title: `Teach ${learner.name} to read ${T(tgt)}`, why: `You read ${T(tgt)} better than ${learner.name}. Getting everyone reading is how the block wins${p.role === "Translator" || p.freeTeach ? ", and this Teach is free" : ""}. Read a second number aloud and have them say it back.` };
    return { pick: { k: "face", d: tgt }, title: `Face a deal in ${T(tgt)}`, why: `${T(tgt)} has the least Clarity, and you can read its red layer. Defusing a trap or taking honest help raises Clarity toward waking it.` };
  }
  if (actionsLeft >= 2 && !p.practice)
    return commons("ADVENTURE", `You can't read ${T(tgt)} yet. Practice at the park first, then Study it.`);
  return { pick: { k: "study", d: tgt }, title: `Study ${T(tgt)}`, why: `You can't read ${T(tgt)} yet (Read 0). Read 1 unlocks the red layer: the cost, and whether a deal is a trap at all.` };
}

/** The shortcut, spelled out: what TAKE buys on a trap right now, and what it costs you. */
function shortcut(g: Game, p: Player, d: District, blind: boolean): NonNullable<Advice<Choice>["alt"]> {
  const cost = takeCost(g);
  const after = p.corruption + cost;
  const falls = after >= K.FLIP;
  const gain = g.pressure[d] > 0 ? `${T(d)}'s Squeeze drops by 2 right now (negotiating only drops 1)` : `${T(d)} jumps +2 Clarity right now (defusing only gives +1)`;
  const warning = falls
    ? `That's ${K.FLIP}: you'd Fall, and the Machine would play through you.`
    : after >= K.FLIP - 2
      ? "One more shortcut after this and you Fall. That's how it starts."
      : `Shortcuts add up: at ${K.FLIP} you Fall.`;
  return {
    pick: "TAKE",
    falls,
    title: falls ? "The shortcut would make you Fall" : "The shortcut: TAKE it",
    why: `${blind ? "If it's a trap (most are), " : ""}TAKE costs no Trust, and ${gain}. The catch: ${costWord(g)} Shady on you (${p.corruption} → ${after}${g.ownerShown ? "" : "+"} of ${K.FLIP}). ${warning}`,
  };
}

/** What to do with a deal in front of you, using only the layers you can read, with the shortcut beside it. */
export function adviseDeal(g: Game, p: Player, d: District, card: Card): Advice<Choice> {
  const advice = pickDeal(g, p, d, card);
  const blind = p.sight[d] < 1;
  if (advice.pick !== "TAKE" && (blind || card.trap)) advice.alt = shortcut(g, p, d, blind);
  return advice;
}

function pickDeal(g: Game, p: Player, d: District, card: Card): Advice<Choice> {
  const see = p.sight[d];
  const urgent = g.pressure[d] >= K.CAPTURE - 1;
  const safe = p.corruption + takeCost(g) < K.FLIP;
  const cost = g.negCost(d);
  const shortcut = `${T(d)} is about to fall, so the shortcut is worth it: TAKE patches Squeeze −2 now. You'll carry ${costWord(g)} Shady (you're at ${p.corruption}/${K.FLIP}).`;
  if (see < 1) {
    if (urgent && safe) return { pick: "TAKE", title: "TAKE it (the shortcut)", why: `You can only see the pitch. ${shortcut}` };
    return { pick: "WALK", title: "WALK away", why: `You can only see the pitch, and most deals are traps. Walking is safe. Study ${T(d)} to read the red layer next time.` };
  }
  if (!card.trap)
    return { pick: "TAKE", title: "TAKE it: it's honest", why: "The red layer says HONEST DEAL. Take the real help: +2 Trust, +1 Clarity. Walking away from honest help costs you Trust." };
  const lever = g.lever(d, card);
  if (see >= lever && p.trust >= cost)
    return { pick: "NEGOTIATE", title: "NEGOTIATE: you can beat it", why: `It's a trap, its lever is ${LEVER[lever]}, and your Read in ${T(d)} is ${see}. That's enough. Negotiating defuses it: Squeeze down, Clarity up, +2 Props.` };
  if (see >= lever)
    return urgent && safe
      ? { pick: "TAKE", title: "TAKE it (the shortcut)", why: `You could beat it, but negotiating costs ${cost} Trust and you have ${p.trust}. ${shortcut}` }
      : { pick: "WALK", title: "WALK away", why: `You could beat it, but negotiating costs ${cost} Trust and you have ${p.trust}. Walk, then rebuild Trust at the Commons.` };
  if (urgent && safe)
    return { pick: "TAKE", title: "TAKE it (the shortcut)", why: `It's a trap with a ${LEVER[lever]} lever; your Read ${see} can't reach it. ${shortcut}` };
  return { pick: "WALK", title: "WALK away", why: `It's a trap and its lever is ${LEVER[lever]}: you need Read ${lever} to beat it and you have ${see}. Negotiating now gets you played. Walk; Study ${T(d)} to reach the lever.` };
}

export function adviseCookout(g: Game): Advice<boolean> {
  const act = g.active();
  const gain = act.reduce((s, p) => s + g.cookoutGain(p)[1], 0);
  return g.cookoutAi()
    ? { pick: true, title: "Call the Cookout", why: `Together you'd gain +${gain} Read this round, more than the actions you'd give up. One person's knowledge becomes everyone's.` }
    : { pick: false, title: "Not yet", why: gain ? `It would only share ${gain} Read right now. Save it for when one of you reads much better than the others.` : "Nobody reads better than anyone else yet, so there's nothing to share. Save it." };
}

export function adviseSousou(s: Session): Advice<boolean> {
  const g = s.g;
  const debt = DISTRICTS.some((d) => g.pressure[d] > 0);
  if (!debt) return { pick: false, title: "Not this round", why: "No district has any Squeeze to pay off yet. Keep your Trust." };
  if (s.sousouWouldPay()) return { pick: true, title: "Throw a hand", why: `This throw fills the can: ${g.nextHand()?.name}'s hand pays off 2 Squeeze with no Shady. Pick the district closest to falling.` };
  if (g.active().every((p) => p.trust >= 2)) return { pick: true, title: "Throw a hand", why: "Everyone can spare 1 Trust. The pot carries over, and when it fills, the hand pays off 2 Squeeze clean." };
  return { pick: false, title: "Not this round", why: "Someone would be left with no Trust to negotiate or teach. Throw when everyone has at least 2." };
}

// ---------------- first-time lessons ----------------
export interface Lesson {
  id: string;
  title: string;
  body: string;
}
const L = (id: string, title: string, body: string): Lesson => ({ id, title, body });

/** Lessons whose moment has come, in the order they should be shown. */
export function lessonsDue(s: Session, view: "board" | "deal" = "board", sight = 0): Lesson[] {
  const g = s.g;
  const out: Lesson[] = [];
  out.push(L("welcome", "Welcome to the block", `Every deal on the West Side has a second number: the real cost hidden under the pitch. Together you'll learn to read it, teach each other, and wake the five districts. Wake enough of them (total Clarity ${K.UNDERWORLD_AT}) and the Underworld opens; trace ${K.THREADS_TO_WIN} threads and expose the one machine behind it all. Lose two districts to the Machine, or run out of rounds (${K.MAX_ROUNDS}), and the block falls.`));
  if (s.phase === "turn") {
    const p = s.player;
    out.push(L("turn", "Your turn", `${p.name}, you have ${g.actions()} actions. Your Read in each district is on your player card: at Read 0 you can't read anything; Read 1 shows the red layer (the cost), 2 the amber (the clock), 3 the blue (the connection). Trust pays for negotiating and teaching. The glowing button is my pick, with the reason. You can always choose your own.`));
    if (p.role === "Elder" && !p.elderUsed) out.push(L("elder", "The Elder's History", "Once per game, the Elder can teach the History of a district: it wakes at once and tells a true story about how the block fought back. Save it for a district about to fall."));
    if (p.role === "Translator") out.push(L("translator", "The Translator", "Your teaching is free. Teach everyone to read: the block wins together or not at all."));
  }
  if (view === "deal") {
    out.push(sight >= 1
      ? L("glasses", "Put your glasses on", "The hidden layers are printed in decoder ink. Drag the red reading glasses down over the card to read them, or press Put glasses on. The red layer tells you whether it's a trap, and which layer holds the lever to beat it.")
      : L("blind", "Reading blind", "Your Read here is 0, so every layer is locked: all you have is the pitch, like signing a lease you can't read. Most deals are traps. Walking is safe; Study raises your Read."));
    out.push(L("choices", "TAKE · WALK · NEGOTIATE", "TAKE accepts the deal: honest help gives Trust and Clarity, but a trap is a shortcut that costs you Shady (at 6 you Fall). WALK is always safe on a trap. NEGOTIATE costs Trust and beats a trap only if your Read reaches its lever; otherwise you get played."));
  }
  if (s.phase === "machine") out.push(L("machine", "The Machine moves", "After every turn, the Machine strikes the districts you're closest to waking, at most once per district per round, and muddies your best work. Squeeze 3 captures a district. A hidden Owner bends the rules too: watch what happens and work out who it is."));
  if (DISTRICTS.some((d) => g.pressure[d] >= K.GRIP)) out.push(L("gripped", "Gripped districts", "A district at Squeeze 2 is gripped: one more strike captures it. Defuse traps there, or use the Elder's History, the Sou-Sou or the Green Book to hold the line."));
  if (g.activePatterns().length) out.push(L("pattern", "A Machine Pattern formed", `When the Machine grips districts together, the harm has a name: ${g.activePatterns()[0].name}. A Pattern tightens on its own every round. Break it by pulling any one of its districts below Squeeze 2.`));
  if (s.phase === "sousou") out.push(L("sousou", "The Sou-Sou", `A savings circle, the honest payday loan. Everyone with Trust drops 1 in the can; at ${K.SOUSOU_HAND}, the next player's hand pays off 2 Squeeze with no Shady.`));
  if (s.phase === "cookout") out.push(L("cookout", "The Cookout", "Once per game, the whole block can spend a round together instead of taking actions. Everyone catches up to the best reader at the table in one district, gets Trust back and sheds Shady."));
  if (g.uwOpen) out.push(L("underworld", "The Underworld is open", `The Owner is revealed and fights in the open: an extra strike, and a cover-up each round. Get players to Read 3 (blue) in awake districts and trace ${K.THREADS_TO_WIN} threads, then expose it.`));
  if (g.blk().some((p) => p.flipped)) out.push(L("fallen", "Someone has Fallen", "Too many shortcuts, and a player Falls: the Machine moves through them on their turn. They're never gone. Spend 2 Trust to Reach them and bring them home."));
  if (!g.greenBook) out.push(L("greenbook", "The Green Book was opened", "A strike that would have captured a district took a safe route instead. That was your one Green Book for the game."));
  if (g.hasLeague()) out.push(L("league", "The League", "Chapter 3: Housing and Lending start gripped, so REDLINING is active from round 1, and the map compounds it every round. Organize: every family signs the League pledge in the same round, and the League pushes back from then on."));
  return out;
}
