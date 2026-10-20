/**
 * The Coach: plays along with the table and holds a new player's hand.
 *
 * Everything here is pure: it reads the game, never changes it, never draws a card
 * and never touches the random number generator. Deal advice uses only the layers
 * the player can already read, so the Coach teaches reading instead of cheating.
 */
import { K, type Card, type Choice, type District, type PlaceKey } from "../engine/content";
import { maxBy, minBy, type Game, type Player } from "../engine/engine";
import { t, tDistrictTitle } from "../i18n";
import type { Session } from "./session";

/**
 * What a shortcut costs, as far as the table can know. A hidden Owner can make it cost more
 * (the Debt Buyer does), and the Coach mustn't give that clue away before the Owner is revealed.
 */
const takeCost = (g: Game) => (g.ownerShown || g.party ? g.takeCost() : K.TAKE_CORRUPT);
const costWord = (g: Game) => (g.ownerShown || g.party ? `+${takeCost(g)}` : t("+{n} or more", { n: takeCost(g) }));
/** the Shady that ends you: the Fall, or (Block Party) sitting out a turn */
const limit = (g: Game) => (g.party ? K.BP_SIT_OUT : K.FLIP);

const T = (d: District) => tDistrictTitle(d);
const LEVER = ["", "red", "amber", "blue"];
const lev = (n: number) => t(LEVER[n]);

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
  const placeWhy = (place: PlaceKey) => `${t(g.places[place].name)}: ${t(g.places[place].bonus)}`;
  const commons = (place: PlaceKey, why: string): Advice<TurnPick> =>
    g.party
      ? { pick: { k: "commons", place: "BARBERSHOP" }, title: t("Gather with the block"), why: `${why} ${t("Gathering gives +2 Trust and −1 Shady.")}` }
      : { pick: { k: "commons", place }, title: t("Gather at {place}", { place: t(g.places[place].name) }), why: `${why} ${placeWhy(place)}` };

  if (g.canExpose())
    return { pick: { k: "expose_uw" }, title: t("Expose the Underworld — win the game"), why: t("You've traced {n} threads. Drag the one machine into the light.", { n: g.threads.size }) };
  for (const d of g.ds)
    if (g.canTrace(p, d))
      return { pick: { k: "trace", d }, title: t("Trace the thread under {d}", { d: T(d) }), why: t("{d} is awake and your Read there is 3 (blue). Each thread brings you closer to exposing the Owner: {n}/{need} so far.", { d: T(d), n: g.threads.size, need: g.threadsNeeded() }) };

  const fallen = g.blk().filter((x) => x.flipped);
  const emergency = Math.max(...g.ds.map((d) => g.pressure[d])) >= K.CAPTURE - 1;
  if (fallen.length && p.trust >= 2 && !emergency)
    return { pick: { k: "reach", t: fallen[0].name }, title: t("Reach {name}", { name: fallen[0].name }), why: t("{name} has Fallen and the Machine is moving through them. Spend 2 Trust to bring them home; it's the most legendary thing you can do (+3 Props).", { name: fallen[0].name }) };
  if (!g.party && p.corruption >= K.FLIP - 2)
    return commons("CHURCH", t("Your Shady is {n}/{max}. One more shortcut and you Fall. Step back from the edge.", { n: p.corruption, max: K.FLIP }));
  if (p.trust < K.NEG_COST)
    return commons(g.botPlace(p), t("You're out of Trust, and Trust pays for negotiating and teaching."));
  if (g.terrell && p.bare.size && p.trust < K.MAX_TRUST)
    return commons(g.botPlace(p), t("You were taught {ds} without cover. Seeing a trap isn't the same as being safe to confront it: gather with the block first, and they'll have your back.", { ds: [...p.bare].map(T).join(t(" and ")) }));

  // set-ups from the Commons this turn
  if (p.practice) {
    const d = minBy(g.ds.filter((x) => p.sight[x] < 3), (x) => [g.clarity[x] >= K.WAKE ? 1 : 0, p.sight[x]]);
    if (d) return { pick: { k: "study", d }, title: t("Study {d} (+2 Read)", { d: T(d) }), why: t("You practiced at Adventure Central, so this Study gives +2 Read. Use it now; it ends with your turn.") };
  }
  if (p.shopAround) {
    const d = maxBy(g.ds, (x) => [p.sight[x], g.pressure[x]]);
    return { pick: { k: "face", d }, title: t("Face a deal in {d} (draw 2)", { d: T(d) }), why: t("You shopped around at Gem City Market: draw two deals and face the one you can beat.") };
  }

  // emergency: a district one strike from capture
  const hot = g.ds.filter((d) => g.pressure[d] >= K.CAPTURE - 1 && g.clarity[d] < K.WAKE).sort((x, y) => g.pressure[y] - g.pressure[x]);
  if (hot.length) {
    const d = hot[0];
    const state = g.pressure[d] >= K.CAPTURE ? t("is captured") : t("is one strike from capture");
    if (p.role === "Elder" && !p.elderUsed)
      return { pick: { k: "history", d }, title: t("Teach the History of {d}", { d: T(d) }), why: t("{d} {state}. Your History wakes it at once, and an awake district is out of the Machine's reach. Two captured districts lose the game.", { d: T(d), state }) };
    if (p.sight[d] >= 1)
      return { pick: { k: "face", d }, title: t("Face a deal in {d}", { d: T(d) }), why: t("{d} {state}. You can read its red layer, so you'll know trap from honest. If your Read reaches the lever, NEGOTIATE drops the Squeeze.", { d: T(d), state }) };
    if (g.party || p.corruption + takeCost(g) < K.FLIP)
      return { pick: { k: "face", d }, title: t("Face a deal in {d}", { d: T(d) }), why: t("{d} {state} and you can't read it yet. A deal here still gives you the shortcut: TAKE a trap patches Squeeze −2 right now, at the cost of Shady. That's the hard choice this game is about.", { d: T(d), state }) };
    return { pick: { k: "study", d }, title: t("Study {d}", { d: T(d) }), why: t("{d} {state}, but you're too close to Falling to take a shortcut. Learn to read it.", { d: T(d), state }) };
  }

  // Chapter 3: organize
  if (g.hasLeague() && !g.leagueFormed && !g.league.has(p.name) && Math.max(g.pressure.HOUSING, g.pressure.LENDING) >= 1)
    return { pick: { k: "league" }, title: t("Sign the League pledge"), why: t("Every family has to sign in the same round ({n}/{need} so far), or the sellers scare them off. Sign, then make sure everyone else signs on their turn.", { n: g.league.size, need: g.leagueNeeded() }) };

  // final act: get someone to Read 3 in an awake district
  if (g.uwOpen) {
    const open = g.ds.filter((d) => g.clarity[d] >= K.WAKE && !g.threads.has(d));
    if (open.length) {
      const d = maxBy(open, (x) => p.sight[x]);
      const learner = act.find((x) => x !== p && x.sight[d] < p.sight[d]);
      if (p.sight[d] >= 2 && learner && (p.role === "Translator" || p.freeTeach || p.trust >= 2))
        return { pick: { k: "teach", d, t: learner.name }, title: t("Teach {name} to read {d}", { name: learner.name, d: T(d) }), why: t("The Underworld is open. Threads need Read 3 in an awake district; get more of the block reading {d}.", { d: T(d) }) };
      if (p.sight[d] <= 1 && actionsLeft >= 2)
        return commons("ADVENTURE", t("The Underworld is open and you need Read 3 in {d}. Practice first, then Study it.", { d: T(d) }));
      return { pick: { k: "study", d }, title: t("Study {d}", { d: T(d) }), why: t("The Underworld is open. {d} is awake: reach Read 3 (blue) there and you can trace its thread.", { d: T(d) }) };
    }
  }

  // build clarity toward the Underworld
  const building = g.ds.filter((d) => g.clarity[d] < K.WAKE);
  if (!building.length) return commons(g.botPlace(p), t("Every district is awake. Rebuild your Trust while the Underworld opens."));
  const tgt = minBy(building, (d) => [g.clarity[d], -p.sight[d]]);
  if (p.sight[tgt] >= 1) {
    const learner = act.find((x) => x !== p && x.sight[tgt] < p.sight[tgt]);
    if (learner && (p.role === "Translator" || p.freeTeach || (p.trust >= 2 && learner.sight[tgt] === 0))) {
      const free = p.role === "Translator" || p.freeTeach;
      const vars = { d: T(tgt), name: learner.name };
      return {
        pick: { k: "teach", d: tgt, t: learner.name },
        title: t("Teach {name} to read {d}", vars),
        why: free
          ? t("You read {d} better than {name}. Getting everyone reading is how the block wins, and this Teach is free. Read a second number aloud and have them say it back.", vars)
          : t("You read {d} better than {name}. Getting everyone reading is how the block wins. Read a second number aloud and have them say it back.", vars),
      };
    }
    return { pick: { k: "face", d: tgt }, title: t("Face a deal in {d}", { d: T(tgt) }), why: t("{d} has the least Clarity, and you can read its red layer. Defusing a trap or taking honest help raises Clarity toward waking it.", { d: T(tgt) }) };
  }
  if (!g.party && actionsLeft >= 2 && !p.practice)
    return commons("ADVENTURE", t("You can't read {d} yet. Practice at the park first, then Study it.", { d: T(tgt) }));
  return { pick: { k: "study", d: tgt }, title: t("Study {d}", { d: T(tgt) }), why: t("You can't read {d} yet (Read 0). Read 1 unlocks the red layer: the cost, and whether a deal is a trap at all.", { d: T(tgt) }) };
}

/** The shortcut, spelled out: what TAKE buys on a trap right now, and what it costs you. */
function shortcut(g: Game, p: Player, d: District, blind: boolean): NonNullable<Advice<Choice>["alt"]> {
  const cost = takeCost(g);
  const after = p.corruption + cost;
  const falls = !g.party && after >= K.FLIP;
  const gain = g.pressure[d] > 0 ? t("{d}'s Squeeze drops by 2 right now (negotiating only drops 1)", { d: T(d) }) : g.party ? t("{d} gets +1 Clarity right now", { d: T(d) }) : t("{d} jumps +2 Clarity right now (defusing only gives +1)", { d: T(d) });
  const warning = g.party
    ? after >= K.BP_SIT_OUT ? t("That's {n}: you'd sit out your next turn.", { n: K.BP_SIT_OUT }) : t("At {n} chips you sit out a turn.", { n: K.BP_SIT_OUT })
    : falls
      ? t("That's {n}: you'd Fall, and the Machine would play through you.", { n: K.FLIP })
      : after >= K.FLIP - 2
        ? t("One more shortcut after this and you Fall. That's how it starts.")
        : t("Shortcuts add up: at {n} you Fall.", { n: K.FLIP });
  const vars = { gain, cost: costWord(g), now: p.corruption, after: `${after}${g.ownerShown || g.party ? "" : "+"}`, limit: limit(g), warning };
  return {
    pick: "TAKE",
    falls,
    title: falls ? t("The shortcut would make you Fall") : t("The shortcut: TAKE it"),
    why: blind
      ? t("If it's a trap (most are), TAKE costs no Trust, and {gain}. The catch: {cost} Shady on you ({now} → {after} of {limit}). {warning}", vars)
      : t("TAKE costs no Trust, and {gain}. The catch: {cost} Shady on you ({now} → {after} of {limit}). {warning}", vars),
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
  const safe = g.party || p.corruption + takeCost(g) < K.FLIP;
  const cost = g.negCost(d);
  const shortcut = t("{d} is about to fall, so the shortcut is worth it: TAKE patches Squeeze −2 now. You'll carry {cost} Shady (you're at {n}/{max}).", { d: T(d), cost: costWord(g), n: p.corruption, max: limit(g) });
  if (see < 1) {
    if (urgent && safe) return { pick: "TAKE", title: t("TAKE it (the shortcut)"), why: t("You can only see the pitch. {shortcut}", { shortcut }) };
    return { pick: "WALK", title: t("WALK away"), why: t("You can only see the pitch, and most deals are traps. Walking is safe. Study {d} to read the red layer next time.", { d: T(d) }) };
  }
  if (!card.trap)
    return { pick: "TAKE", title: t("TAKE it: it's honest"), why: t("The red layer says HONEST DEAL. Take the real help: +2 Trust, +1 Clarity. Walking away from honest help costs you Trust.") };
  const lever = g.lever(d, card);
  if (g.terrell && p.bare.has(d) && !urgent)
    return { pick: "WALK", title: t("WALK away (no cover yet)"), why: t("It's a trap, and you can see it. But you were taught {d} without cover: confront it now and it backfires (+1 Squeeze). Walk, gather with the block, then come back covered.", { d: T(d) }) };
  if (see >= lever && p.trust >= cost)
    return { pick: "NEGOTIATE", title: t("NEGOTIATE: you can beat it"), why: t("It's a trap, its lever is {lever}, and your Read in {d} is {see}. That's enough. Negotiating defuses it: Squeeze down, Clarity up, +2 Props.", { lever: lev(lever), d: T(d), see }) };
  if (see >= lever)
    return urgent && safe
      ? { pick: "TAKE", title: t("TAKE it (the shortcut)"), why: t("You could beat it, but negotiating costs {cost} Trust and you have {trust}. {shortcut}", { cost, trust: p.trust, shortcut }) }
      : { pick: "WALK", title: t("WALK away"), why: t("You could beat it, but negotiating costs {cost} Trust and you have {trust}. Walk, then rebuild Trust at the Commons.", { cost, trust: p.trust }) };
  if (g.partial && see === lever - 1 && p.trust >= cost && (urgent || !safe))
    return { pick: "NEGOTIATE", title: t("NEGOTIATE: a close read"), why: t("It's a trap with a {lever} lever, one layer past your Read {see}. With Close reads on, NEGOTIATE rolls a die: 5 or 6 talks them down (Squeeze −1), anything else and you get played (Squeeze +1). One chance in three, and no Shady.", { lever: lev(lever), see }) };
  if (urgent && safe)
    return { pick: "TAKE", title: t("TAKE it (the shortcut)"), why: t("It's a trap with a {lever} lever; your Read {see} can't reach it. {shortcut}", { lever: lev(lever), see, shortcut }) };
  return { pick: "WALK", title: t("WALK away"), why: t("It's a trap and its lever is {lever}: you need Read {need} to beat it and you have {see}. Negotiating now gets you played. Walk; Study {d} to reach the lever.", { lever: lev(lever), need: lever, see, d: T(d) }) };
}

export function adviseCookout(g: Game): Advice<boolean> {
  const act = g.active();
  const gain = act.reduce((s, p) => s + g.cookoutGain(p)[1], 0);
  return g.cookoutAi()
    ? { pick: true, title: t("Call the Cookout"), why: t("Together you'd gain +{n} Read this round, more than the actions you'd give up. One person's knowledge becomes everyone's.", { n: gain }) }
    : { pick: false, title: t("Not yet"), why: gain ? t("It would only share {n} Read right now. Save it for when one of you reads much better than the others.", { n: gain }) : t("Nobody reads better than anyone else yet, so there's nothing to share. Save it.") };
}

export function adviseSousou(s: Session): Advice<boolean> {
  const g = s.g;
  const debt = g.ds.some((d) => g.pressure[d] > 0);
  if (!debt) return { pick: false, title: t("Not this round"), why: t("No district has any Squeeze to pay off yet. Keep your Trust.") };
  if (s.sousouWouldPay()) return { pick: true, title: t("Throw a hand"), why: t("This throw fills the can: {name}'s hand pays off 2 Squeeze with no Shady. Pick the district closest to falling.", { name: String(g.nextHand()?.name) }) };
  if (g.active().every((p) => p.trust >= 2)) return { pick: true, title: t("Throw a hand"), why: t("Everyone can spare 1 Trust. The pot carries over, and when it fills, the hand pays off 2 Squeeze clean.") };
  return { pick: false, title: t("Not this round"), why: t("Someone would be left with no Trust to negotiate or teach. Throw when everyone has at least 2.") };
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
  const area = t(g.ed.area);
  if (g.party) out.push(L("welcome", t("Welcome to the Block Party"), t("Every deal on {area} has a second number: the real cost hidden under the pitch. Three districts, {rounds} rounds. Learn to read the deals, teach each other, and wake {wake} of the 3 districts (Clarity 3) to win. Lose two districts to the Machine (Squeeze 3), or run out of rounds, and the block falls. Taking a trap is a shortcut: it costs {take} Shady chips, and at {sit} you sit out a turn.", { area, rounds: K.BP_ROUNDS, wake: K.BP_WAKE_TO_WIN, take: K.BP_TAKE, sit: K.BP_SIT_OUT })));
  else out.push(L("welcome", t("Welcome to the block"), t("Every deal on {area} has a second number: the real cost hidden under the pitch. Together you'll learn to read it, teach each other, and wake the five districts. Wake enough of them (total Clarity {uw}) and the Underworld opens; trace {threads} threads and expose the one machine behind it all. Lose two districts to the Machine, or run out of rounds ({max}), and the block falls.", { area, uw: K.UNDERWORLD_AT, threads: K.THREADS_TO_WIN, max: K.MAX_ROUNDS })));
  if (s.phase === "turn") {
    const p = s.player;
    out.push(L("turn", t("Your turn"), t("{name}, you have {n} actions. Your Read in each district is on your player card: at Read 0 you can't read anything; Read 1 shows the red layer (the cost), 2 the amber (the clock), 3 the blue (the connection). Trust pays for negotiating and teaching. The glowing button is my pick, with the reason. You can always choose your own.", { name: p.name, n: g.actions() })));
    if (p.role === "Elder" && !p.elderUsed) out.push(L("elder", t("The Elder's History"), t("Once per game, the Elder can teach the History of a district: it wakes at once and tells a true story about how the block fought back. Save it for a district about to fall.")));
    if (p.role === "Translator") out.push(L("translator", t("The Translator"), t("Your teaching is free. Teach everyone to read: the block wins together or not at all.")));
  }
  if (view === "deal") {
    out.push(sight >= 1
      ? L("glasses", t("Put your glasses on"), t("The hidden layers are printed in decoder ink. Drag the red reading glasses down over the card to read them, or press Put glasses on. The red layer tells you whether it's a trap, and which layer holds the lever to beat it."))
      : L("blind", t("Reading blind"), t("Your Read here is 0, so every layer is locked: all you have is the pitch, like signing a lease you can't read. Most deals are traps. Walking is safe; Study raises your Read.")));
    out.push(L("choices", t("TAKE · WALK · NEGOTIATE"), g.party
      ? t("TAKE accepts the deal: honest help gives Trust and Clarity, but a trap is a shortcut that costs you Shady (at {n} you sit out a turn). WALK is always safe on a trap. NEGOTIATE costs Trust and beats a trap only if your Read reaches its lever; otherwise you get played.", { n: K.BP_SIT_OUT })
      : t("TAKE accepts the deal: honest help gives Trust and Clarity, but a trap is a shortcut that costs you Shady (at 6 you Fall). WALK is always safe on a trap. NEGOTIATE costs Trust and beats a trap only if your Read reaches its lever; otherwise you get played.")));
  }
  if (s.phase === "machine" && g.party) out.push(L("machine", t("The Machine moves"), t("After every round, the Machine strikes the district you're closest to waking: +1 Squeeze and −1 Clarity. Squeeze 3 captures a district.")));
  else if (s.phase === "machine") out.push(L("machine", t("The Machine moves"), t("After every turn, the Machine strikes the districts you're closest to waking, at most once per district per round, and muddies your best work. Squeeze 3 captures a district. A hidden Owner bends the rules too: watch what happens and work out who it is.")));
  if (g.ds.some((d) => g.pressure[d] >= K.GRIP)) out.push(L("gripped", t("Gripped districts"), g.party
    ? t("A district at Squeeze 2 is gripped: one more strike captures it. Defuse traps there to push it back.")
    : t("A district at Squeeze 2 is gripped: one more strike captures it. Defuse traps there, or use the Elder's History, the Sou-Sou or the Green Book to hold the line.")));
  if (g.activePatterns().length) out.push(L("pattern", t("A Machine Pattern formed"), t("When the Machine grips districts together, the harm has a name: {name}. A Pattern tightens on its own every round. Break it by pulling any one of its districts below Squeeze 2.", { name: t(g.activePatterns()[0].name) })));
  if (s.phase === "sousou") out.push(L("sousou", t("The Sou-Sou"), t("A savings circle, the honest payday loan. Everyone with Trust drops 1 in the can; at {n}, the next player's hand pays off 2 Squeeze with no Shady.", { n: K.SOUSOU_HAND })));
  if (s.phase === "cookout") out.push(L("cookout", t("The Cookout"), t("Once per game, the whole block can spend a round together instead of taking actions. Everyone catches up to the best reader at the table in one district, gets Trust back and sheds Shady.")));
  if (g.uwOpen) out.push(L("underworld", t("The Underworld is open"), t("The Owner is revealed and fights in the open: an extra strike, and a cover-up each round. Get players to Read 3 (blue) in awake districts and trace {n} threads, then expose it.", { n: K.THREADS_TO_WIN })));
  if (g.blk().some((p) => p.flipped)) out.push(L("fallen", t("Someone has Fallen"), t("Too many shortcuts, and a player Falls: the Machine moves through them on their turn. They're never gone. Spend 2 Trust to Reach them and bring them home.")));
  if (!g.greenBook) out.push(L("greenbook", t("The Green Book was opened"), t("A strike that would have captured a district took a safe route instead. That was your one Green Book for the game.")));
  if (g.terrell && g.active().some((p) => p.bare.size)) out.push(L("terrell", t("The Terrell rule"), t("Teaching gives Read, but not cover. A player taught a district without cover who confronts a trap there (TAKE or NEGOTIATE) gets burned: +1 Squeeze. Any Commons, or the Cookout, covers them; the Veteran teaches the cover with the lesson. Walking is always safe.")));
  const rushed = s.pending?.k === "deal" && s.pending.cards.some((c) => c.rush) && s.config.clocks !== false;
  if (view === "deal" && rushed)
    out.push(L("rush", t("Sign now?"), t("This deal pushes a deadline: a clock counts down while you decide. Real scams do this so you sign before you can read. The deadline is fake: let it run out and the offer is still there. Read 2 in a district (amber, the clock) shows you that from the start.")));
  if (view === "deal" && g.render && s.player && s.player.face > 0)
    out.push(L("render", t("Render?"), t("In the novel, the Sight asks Marcus one word before it reads someone he loves: Render? Here, a teammate who reads a district better can read a deal for you. It costs your one Face token (the Cookout gives it back), so save it for the deal that matters.")));
  if (view === "deal" && g.partial)
    out.push(L("close", t("Close reads"), t("One layer short of a trap's lever, NEGOTIATE becomes a roll: 5 or 6 on a die talks them down (Squeeze −1); anything else and you get played. Worth it when a district is about to fall and you'd rather not take the shortcut.")));
  if (g.carry && g.round <= 1)
    out.push(L("remember", t("Your block remembers"), t("This block has played before. Districts it woke last time start stronger (Clarity +1); districts it lost carry a scar (Squeeze +1); after a loss, everyone gets +1 Trust. Wake them again to keep them strong.")));
  if (view === "deal" && g.finePrint) out.push(L("fineprint", t("The fine-print die"), t("Each trap's lever is rolled when it's drawn: 1–3 red, 4–5 amber, 6 blue. You can't memorize the deck. Read deep enough to reach whatever the die says.")));
  if (view === "deal" && g.endless) out.push(L("endless", t("Endless deals"), t("These deals are rolled fresh from templates, so the numbers change every time. Work out the second number: the math is on the red layer.")));
  if (g.overlord && g.log.some((l) => l.includes("slips a counterfeit")))
    out.push(L("counterfeit", t("Counterfeits"), t("The Overlord has {n} counterfeit deals: fake honest help, slipped on top of a pile. Below Read 3 a counterfeit reads exactly like the real thing, and taking it gets you conned (+1 Squeeze). Walking is safe; negotiating with Read 3 exposes it for an extra Prop. When one is out there, the safest reader for an \"honest\" deal is the one with Read 3.", { n: K.COUNTERFEIT_HAND })));
  if (g.hasLeague()) out.push(L("league", t("The League"), t("Chapter 3: Housing and Lending start gripped, so REDLINING is active from round 1, and the map compounds it every round. Organize: every family signs the League pledge in the same round, and the League pushes back from then on.")));
  return out;
}
