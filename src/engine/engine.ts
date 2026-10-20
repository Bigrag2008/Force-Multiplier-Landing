/**
 * THE SECOND NUMBER — rules engine, TypeScript port of game/sn_engine.py.
 *
 * The Python engine is the source of truth (balance tester, rule checks). This port
 * mirrors it method for method and must reproduce its golden games exactly
 * (tests/parity.test.ts). Change both together, then run `npm run golden && npm test`.
 */
import { C, DISTRICTS, K, type Card, type Chapter, type Choice, type District, type HistoryCard, type PlaceKey } from "./content";
import { makeDeal } from "./dealgen";
import { historyOf, localCards, placesOf, WEST_DAYTON, type Edition } from "./edition";
import { Rng } from "./rng";

export const LAYERS: [number, "red" | "amber" | "blue", string][] = [
  [1, "red", "🔴 RED — the cost"],
  [2, "amber", "🟠 AMBER — the clock"],
  [3, "blue", "🔵 BLUE — the connection"],
];
export const LEVER_NAME: Record<number, string> = { 0: "—", 1: "red", 2: "amber", 3: "blue" };
export type Style = "careful" | "never" | "greedy" | "human";

export type Action =
  | { k: "study"; d: District }
  | { k: "face"; d: District; choice: Choice; card?: Card; by?: Player | null }
  | { k: "teach"; t: Player; d: District; response?: boolean }
  | { k: "commons"; place: PlaceKey }
  | { k: "reach"; t: Player }
  | { k: "history"; d: District }
  | { k: "trace"; d: District }
  | { k: "expose_uw" }
  | { k: "league" }
  | { k: "march" }
  | { k: "leave_desk" }
  | { k: "m_extract"; d: District }
  | { k: "m_obscure"; d: District }
  | { k: "m_tempt"; t: Player | null }
  | { k: "m_counterfeit"; d: District }
  | { k: "pass" };

type Key = number | number[];
function cmp(a: Key, b: Key): number {
  const x = Array.isArray(a) ? a : [a];
  const y = Array.isArray(b) ? b : [b];
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return x.length - y.length;
}
/** Python's max(seq, key=...): the FIRST element with the largest key. */
export function maxBy<T>(seq: readonly T[], key: (x: T) => Key): T {
  let best = seq[0];
  for (const x of seq.slice(1)) if (cmp(key(x), key(best)) > 0) best = x;
  return best;
}
/** Python's min(seq, key=...): the FIRST element with the smallest key. */
export function minBy<T>(seq: readonly T[], key: (x: T) => Key): T {
  let best = seq[0];
  for (const x of seq.slice(1)) if (cmp(key(x), key(best)) < 0) best = x;
  return best;
}
const b = (x: boolean) => (x ? 1 : 0);
const perDistrict = (v: (d: District) => number) =>
  Object.fromEntries(DISTRICTS.map((d) => [d, v(d)])) as Record<District, number>;

export class Player {
  trust = K.START_TRUST;
  sight: Record<District, number>;
  corruption = 0;
  legend = 0;
  flipped = false;
  shields: number;
  elderUsed = false;
  /** Chapter 6 (Today): the Elder may teach History twice */
  historyLeft = 1;
  freeTeach = false;
  shopAround = false;
  practice = false;
  /** the Terrell rule: districts this player was taught without cover */
  bare = new Set<District>();
  /** Block Party: sits out their next turn */
  benched = false;
  /** "Render?": Face tokens (set by newGame when the rule is on) */
  face = 0;
  constructor(public name: string, public role: string) {
    this.sight = perDistrict(() => (role === "Elder" ? 1 : 0));
    this.shields = role === "Veteran" ? 2 : 0;
  }
}

export interface GameOptions {
  overlord?: boolean;
  scenario?: string;
  owner?: string;
  seed?: number;
  chapter?: string;
  /** Block Party: the 25-minute intro (3 districts, 8 rounds, no Owner) */
  party?: boolean;
  /** the fine-print die sets each trap's lever */
  finePrint?: boolean;
  /** the Terrell rule: a lesson without cover can backfire */
  terrell?: boolean;
  /** deals rolled from templates instead of the printed deck */
  endless?: boolean;
  /** a Your City edition: the places and History cards where this game happens (default: West Dayton) */
  edition?: Edition;
  /** Close reads: one layer short of the lever, NEGOTIATE rolls for it */
  partial?: boolean;
  /** "Render?": a teammate who reads better can read a deal for you, once per Face token */
  render?: boolean;
  /** a block that remembers: last game's woken districts and scars (see remember()) */
  carry?: Carry | null;
  /** a campaign's memory carried into a chapter (src/engine/campaign.ts) */
  campaign?: CampaignState | null;
}

/** what a family carries between chapters (game/campaign.py) */
export interface CampaignState {
  campaign: "LEDGER" | "BOOK_ONE";
  played: { chapter: string; won: boolean; ledger: number; decision: string | null }[];
  ledger: number;
  stickers: Partial<Record<District, { rebuilt: number; scarred: number }>>;
  decisions: Record<string, string>;
  flags: string[];
  unlocks: string[];
  rally: boolean;
  falls: number;
  defend: boolean;
  quit_desk: string | null;
}

/** what a block remembers between games */
export interface Carry {
  clarity?: Partial<Record<District, number>>;
  pressure?: Partial<Record<District, number>>;
  /** after a loss, the community rallies: everyone +1 Trust */
  rally?: boolean;
}

/** one deal decision, and its real money */
export interface Signed {
  who: string;
  d: District;
  out: "help" | "taken" | "dodged" | "refused" | "defused" | "played" | "wasted" | "conned" | "partial";
  front: string;
  dollars: number;
  basis: string;
}
export interface Money {
  /** traps signed (the shortcuts) */
  taken: number;
  /** traps negotiated without the Read to beat them */
  played: number;
  /** honest help walked away from, or haggled away */
  refused: number;
  /** traps walked away from */
  dodged: number;
  /** traps read and beaten */
  defused: number;
  /** honest help taken */
  help: number;
  shortcuts: number;
  worst: Signed | null;
  playedMost: { who: string; times: number } | null;
}

export interface ChapterResult {
  won: boolean;
  ledger: number;
  rebuilt: District[];
  scarred: District[];
  falls: number;
  reaches: number;
  league: boolean;
  redlining_broken: boolean;
  unlocks: string[];
  rally: boolean;
  burned: boolean;
  quit_desk: string | null;
  crown: string | null;
}

export class Game {
  rng: Rng;
  chapter: Chapter | null;
  overlord: boolean;
  clarity = perDistrict(() => 0);
  pressure = perDistrict(() => 0);
  round = 0;
  uwOpen = false;
  ownerShown: boolean;
  threads = new Set<District>();
  struck = new Set<District>();
  covered = false;
  pot = 0;
  circle = 0;
  kitchenUsed = false;
  cookoutUsed = false;
  greenBook = true;
  useGreenBook: (d: District) => boolean = () => true;
  won = false;
  result: "BLOCK_WIN" | "MACHINE_WIN" | null = null;
  log: string[] = [];
  patternsSeen = new Set<string>();
  scenario: string;
  deck: Record<District, Card[]>;
  league = new Set<string>();
  leagueFormed = false;
  grace: number;
  owner: string;
  ownerFace: string;
  players: Player[] = [];
  historyCard: HistoryCard | null = null;
  party: boolean;
  finePrint: boolean;
  terrell: boolean;
  endless: boolean;
  /** the districts in play (Block Party uses three) */
  ds: District[];
  maxRounds: number;
  /** every card drawn, in order (endless and fine-print cards aren't in the deck) */
  dealt: Card[] = [];
  partial: boolean;
  render: boolean;
  carry: Carry | null;
  /** where this game happens: its districts' names, its gathering places, its History deck */
  ed: Edition;
  places: typeof C.places;
  historyDeck: Record<District | "ANY", HistoryCard[]>;
  /** every deal decision, with its real money (see money()) */
  signed: Signed[] = [];
  /** Overlord mode: counterfeit deals waiting on top of piles, one slipped this round, and how many are left */
  counterfeits = new Set<District>();
  forged = false;
  forgeries = K.COUNTERFEIT_HAND;
  /** what the family carries in (campaign.ts) */
  campaign: Partial<CampaignState>;
  /** Chapter 2: districts that open later */
  late: Partial<Record<District, number>> = {};
  /** Chapter 4: the March, once per game */
  marched = false;
  /** Chapter 5: Rebuilt districts the Machine strikes first */
  defend: District[] = [];
  /** Book One 4: who has taught */
  taught = new Set<string>();
  /** Book One 2: the Desk */
  desk: string | null = null;
  deskLeft: string | null = null;
  deskOffered = false;
  /** Book One 3: the Crown */
  crowned: string | null = null;
  crownOffered = false;
  crownRefused = false;
  /** the Terrell rule backfired, for the ledger */
  backfires = 0;
  /** Chapter 5 after "run for office": rounds the Owner's hidden hand rests */
  handRests = 0;
  humanOverlord = false;

  constructor(o: GameOptions = {}) {
    this.rng = new Rng(o.seed ?? Math.floor(Math.random() * 2 ** 31));
    const ch0 = o.chapter ? C.chapters[o.chapter] : null;
    let overlord = !!o.overlord;
    let party = !!o.party;
    let finePrint = !!o.finePrint;
    let terrell = !!o.terrell;
    let endless = !!o.endless;
    if (ch0) {
      // a chapter sets its own mode and house rules
      overlord = ch0.mode === "overlord";
      party = ch0.mode === "party";
      finePrint = ch0.rules.fine_print ?? finePrint;
      terrell = ch0.rules.terrell ?? terrell;
      endless = ch0.rules.endless ?? endless;
    }
    this.party = party && !overlord && (!ch0 || ch0.mode === "party");
    this.finePrint = finePrint;
    this.terrell = terrell;
    this.endless = endless;
    this.partial = !!o.partial;
    this.render = !!o.render;
    this.carry = o.carry ?? null;
    this.ed = o.edition ?? WEST_DAYTON;
    this.places = placesOf(this.ed);
    this.historyDeck = historyOf(this.ed);
    this.ds = this.party ? [...K.BP_DISTRICTS] : [...DISTRICTS];
    this.maxRounds = this.party ? K.BP_ROUNDS : K.MAX_ROUNDS;
    this.chapter = ch0;
    this.campaign = o.campaign ?? {};
    this.overlord = overlord;
    this.ownerShown = this.overlord;
    const ch = this.chapter;
    this.scenario = ch ? `Chapter ${ch.number}: ${ch.title}` : this.party ? "Block Party" : o.scenario || this.rng.choice(Object.keys(C.scenarios));
    // a Your City edition's local deals join the base deck (not Chapter 3's era decks)
    this.deck = Object.fromEntries(
      DISTRICTS.map((d) => [d, (ch && ch.decks[d]) || (localCards(this.ed, d).length ? [...C.deck[d], ...localCards(this.ed, d)] : C.deck[d])]),
    ) as Record<District, Card[]>;
    if (ch) {
      for (const [d, p] of Object.entries(ch.pressure)) this.pressure[d as District] = p as number;
      if (ch.late && this.decided("FREEDOMS_LEDGER") !== "GO") {
        this.late = { ...ch.late };
        this.ds = this.ds.filter((d) => !(d in this.late));
      }
    }
    const start: Record<string, Partial<Record<District, number>>> = {
      "The Eviction Wave": { HOUSING: 2 },
      "The Closure": { EDUCATION: 3 },
      "The Plants Close": { LABOR: 2 },
      "The Hospital Closes": { HEALTH: 2 },
    };
    for (const [d, p] of Object.entries(start[this.scenario] || {})) this.pressure[d as District] = p as number;
    this.grace = this.scenario === "The Audit" ? 1 : 0;
    this.owner = this.overlord ? "The Overlord" : this.party ? "No Owner" : ch ? ch.owner : o.owner || this.rng.choice(Object.keys(C.owners));
    if (this.party) this.greenBook = false;
    this.ownerFace = ch && !this.overlord ? ch.face : this.owner;
    this.remember();
    if (ch) this.carryIn();
    this.handRests = ch && ch.key === "PLANTS_CLOSE" && this.decided("VOICE") === "RUN" ? 3 : 0;
  }

  // ---- the campaign: what a family carries into a chapter (campaign.ts, CAMPAIGN.md, BOOK_ONE.md) ----
  decided(chapter: string): string | undefined {
    return this.campaign.decisions?.[chapter];
  }
  flag(f: string) {
    return (this.campaign.flags ?? []).includes(f);
  }
  /**
   * Board stickers (Rebuilt: Clarity +1 each, or Squeeze −1 where the era starts it squeezed; Scarred: Squeeze +1
   * each, never a capture), and the last Family Decision. Player effects are applied in newGame.
   */
  carryIn() {
    const c = this.campaign;
    const ch = this.chapter!;
    if (!c || !Object.keys(c).length || ch.campaign !== "LEDGER") return;
    const st = c.stickers ?? {};
    for (const d of this.ds) {
      const s = st[d];
      if (!s) continue;
      for (let i = 0; i < (s.rebuilt ?? 0); i++) {
        // what the family built resists the era's grip first
        if (this.pressure[d] > 0) this.pressure[d] -= 1;
        else this.clarity[d] = Math.min(K.WAKE - 1, this.clarity[d] + 1);
      }
      if (s.scarred) this.pressure[d] = Math.min(K.CAPTURE - 1, this.pressure[d] + s.scarred);
    }
    if (ch.key === "UP_NORTH" && this.decided("FREEDOMS_LEDGER") === "STAY") this.pressure.LENDING = Math.min(K.CAPTURE - 1, this.pressure.LENDING + 1);
    if (ch.key === "THE_MAP" && this.decided("UP_NORTH") === "HOUSE") this.pressure.HOUSING = Math.max(0, this.pressure.HOUSING - 1);
    if (ch.key === "TODAY" && this.decided("PLANTS_CLOSE") === "HOLD") this.pressure.HOUSING = Math.min(K.CAPTURE - 1, this.pressure.HOUSING + 1);
    if (ch.defend_choice && c.defend) this.defend = this.ds.filter((d) => st[d]?.rebuilt);
    const kept = this.ds.filter((d) => st[d]?.rebuilt || st[d]?.scarred);
    if (kept.length)
      this.emit(
        "🏘 The family's board: " +
          kept.map((d) => `${d}` + (st[d]!.rebuilt ? ` Rebuilt ×${st[d]!.rebuilt}` : "") + (st[d]!.scarred ? ` Scarred ×${st[d]!.scarred}` : "")).join("; ") +
          ".",
      );
  }

  /** Chapter effects at the start of a round, before anyone acts. offerDesk: false when the table is asked instead. */
  roundStart(offerDesk = true) {
    for (const d of DISTRICTS) {
      const r = this.late[d];
      if (r !== undefined && this.round >= r) {
        delete this.late[d];
        this.ds = DISTRICTS.filter((x) => this.ds.includes(x) || x === d);
        this.emit(`✦ The family is settled: ${d} opens.`);
      }
    }
    if (offerDesk && this.deskDue()) {
      this.deskOffered = true;
      const pl = this.deskAi();
      if (pl) this.takeDesk(pl);
    }
    this.deskPaycheck();
    if (this.crowned) {
      const hit = this.active().filter((p) => p.name !== this.crowned && p.trust > 0);
      for (const p of hit) p.trust -= 1;
      if (hit.length) this.emit(`  👑 ${this.crowned} wears the Crown. Everyone else pays for it: ${hit.map((p) => p.name).join(", ")} lose 1 Trust.`);
    }
  }
  /** the Desk's +1 Trust a round (the table's question takes the Desk after roundStart, then pays it here) */
  deskPaycheck() {
    const pl = this.desk ? this.byName(this.desk) : null;
    if (pl && pl.trust < K.MAX_TRUST) {
      pl.trust += 1;
      this.emit(`  ${pl.name} draws a county paycheck at the Desk. Trust +1.`);
    }
  }
  byName(name: string) {
    return this.players.find((p) => p.name === name) ?? null;
  }

  // ---- the Desk (Book One, Chapter 2) ----
  deskDue() {
    return !!this.chapter?.desk && this.round === 2 && !this.deskOffered;
  }
  /** The bot table gives the Desk to whoever reads least: they lose the least by not facing deals. */
  deskAi(): Player | null {
    const act = this.active();
    if (act.length < 2) return null;
    return minBy(act, (p) => this.ds.reduce((s, d) => s + p.sight[d], 0));
  }
  takeDesk(pl: Player) {
    this.desk = pl.name;
    this.emit(`🪑 ${pl.name} takes the Desk: a county job. +1 Trust every round, but no facing deals and no teaching while you sit there.`);
  }
  leaveDesk(pl: Player) {
    if (this.desk !== pl.name) return this.emit(`  ${pl.name} isn't at the Desk.`);
    this.desk = null;
    this.deskLeft = pl.name;
    pl.legend += 1;
    this.emit(`${pl.name} quits the Desk, for good. Props +1.`);
  }

  // ---- the Crown (Book One, Chapter 3) ----
  /** The Overlord's one offer. Wear it: you can't Fall, and everyone else loses 1 Trust a round. Refuse: one extra Overlord move this round. */
  offerCrown(pl: Player, wear?: boolean) {
    if (this.crownOffered || !this.chapter?.crown) return;
    this.crownOffered = true;
    this.emit(`👑 The Owner offers ${pl.name} the Crown: a way up, out of the life.`);
    if (wear ?? this.crownAi(pl)) {
      this.crowned = pl.name;
      this.emit(`  ${pl.name} puts it on. They can't Fall now, and the whole block pays for it every round.`);
    } else {
      this.crownRefused = true;
      pl.legend += 2;
      this.emit(`  ${pl.name} refuses the Crown. Props +2. The Owner takes it out on the block: one extra move this round.`);
    }
  }
  /** a bot near the edge takes the safety */
  crownAi(pl: Player) {
    return pl.corruption >= K.FLIP - 2;
  }
  /** The computer Overlord offers it from round 3, to whoever carries the most Shady. */
  crownTarget(): Player | null {
    if (this.crownOffered || this.round < 3 || !this.chapter?.crown) return null;
    const act = this.active();
    return act.length ? maxBy(act, (p) => [p.corruption, -p.trust]) : null;
  }

  // ---- the March (Chapter 4) ----
  canMarch() {
    return !!this.chapter?.march && !this.marched;
  }
  march(pl: Player) {
    if (!this.canMarch()) return this.emit("  The March has already happened.");
    this.marched = true;
    pl.legend += 2;
    this.emit(`✊🏾 ${pl.name} calls the March. The whole family walks together. Props +2.`);
    for (const p of this.active()) {
      p.trust = Math.min(K.MAX_TRUST, p.trust + 2);
      const had = p.corruption;
      p.corruption = Math.max(0, had - 1);
      this.emit(`  ${p.name}: Trust +2` + (had ? ", Shady −1" : "") + "." + this.cover(p));
    }
  }
  marchAi() {
    const act = this.active();
    return this.canMarch() && this.round >= 2 && act.reduce((s, p) => s + p.trust, 0) <= act.length;
  }

  // ---- the Empty Throne (Book One, Chapter 4) ----
  /** Why you can't Expose yet, or null. */
  throneBlocks(): string | null {
    if (!this.chapter?.throne) return null;
    const act = this.active();
    const idle = act.filter((p) => !this.taught.has(p.name)).map((p) => p.name);
    if (idle.length) return `everyone has to teach first (${idle.join(", ")} hasn't)`;
    const tot = act.reduce((s, p) => s + p.legend, 0);
    const top = maxBy(act, (p) => p.legend);
    if (tot && top.legend * 2 > tot) return `${top.name} holds more than half the table's Props: no neck for a crown`;
    return null;
  }

  /**
   * A block that remembers: districts woken last game start a step ahead (Clarity +1), captured ones carry
   * a scar (Squeeze +1). The full co-op game only.
   */
  remember() {
    const c = this.carry;
    if (!c || this.overlord || this.chapter || this.party) return;
    for (const [d, n] of Object.entries(c.clarity ?? {}) as [District, number][])
      if (this.ds.includes(d) && n > 0) this.clarity[d] = Math.min(K.WAKE - 1, this.clarity[d] + n);
    for (const [d, n] of Object.entries(c.pressure ?? {}) as [District, number][])
      if (this.ds.includes(d) && n > 0) this.pressure[d] = Math.min(K.CAPTURE - 1, this.pressure[d] + n);
    const strong = this.ds.filter((d) => c.clarity?.[d]);
    const scars = this.ds.filter((d) => c.pressure?.[d]);
    if (strong.length || scars.length || c.rally) {
      const parts = [
        ...(strong.length ? [`${strong.join(", ")} start${strong.length === 1 ? "s" : ""} stronger (Clarity +1)`] : []),
        ...(scars.length ? [`${scars.join(", ")} carr${scars.length === 1 ? "ies" : "y"} a scar (Squeeze +1)`] : []),
        ...(c.rally ? ["after last game, the community rallies (everyone +1 Trust)"] : []),
      ];
      this.emit(`🏘 The block remembers: ${parts.join("; ")}.`);
    }
  }

  // ---- helpers ----
  emit(s: string) {
    this.log.push(s);
  }
  blk() {
    return this.players.filter((p) => p.role !== "Overlord");
  }
  active() {
    return this.blk().filter((p) => !p.flipped);
  }
  ov() {
    return this.players.find((p) => p.role === "Overlord") ?? null;
  }
  n() {
    return Math.max(1, Math.min(5, this.blk().length));
  }
  actions() {
    return (this.party ? K.BP_ACTIONS : K.ACTIONS)[this.n()];
  }
  totalClarity() {
    return this.ds.reduce((s, d) => s + this.clarity[d], 0);
  }
  awake() {
    return this.ds.filter((d) => this.clarity[d] >= K.WAKE).length;
  }
  captured() {
    return this.ds.filter((d) => this.pressure[d] >= K.CAPTURE).length;
  }
  gripped(d: District) {
    return this.pressure[d] >= K.GRIP;
  }
  activePatterns() {
    if (this.party) return []; // no Patterns in Block Party
    return C.patterns.filter((p) => p.combo.every((d) => this.gripped(d)));
  }
  threadsNeeded() {
    return K.THREADS_TO_WIN;
  }
  canTrace(pl: Player, d: District) {
    return this.uwOpen && pl.sight[d] >= 3 && this.clarity[d] >= K.WAKE && !this.threads.has(d);
  }
  canExpose() {
    return this.uwOpen && this.threads.size >= this.threadsNeeded() && !this.throneBlocks();
  }
  lever(d: District, card: Card) {
    if (this.leagueFormed && (d === "HOUSING" || d === "LENDING") && card.trap) return Math.min(card.lever, 1);
    return card.lever;
  }

  // ---- the League (Chapter 3) ----
  hasLeague() {
    return !!(this.chapter && this.chapter.league);
  }
  leagueNeeded() {
    return Math.max(2, this.active().length);
  }
  signLeague(pl: Player) {
    if (!this.hasLeague() || this.leagueFormed) {
      this.emit("  There's no League to sign right now.");
      return;
    }
    if (this.league.has(pl.name)) {
      this.emit(`  ${pl.name} has already signed.`);
      return;
    }
    this.league.add(pl.name);
    pl.legend += 1;
    this.emit(
      `${pl.name} signs the League pledge: we withhold together. ` +
        `Signatures ${this.league.size}/${this.leagueNeeded()}. Props +1.`,
    );
    this.tryFormLeague();
  }
  tryFormLeague() {
    if (this.leagueFormed || !this.hasLeague() || this.league.size < this.leagueNeeded()) return;
    this.leagueFormed = true;
    const before = this.pressure.HOUSING;
    this.pressure.HOUSING = Math.max(0, before - 2);
    this.emit(
      `✦ THE LEAGUE FORMS. Housing Squeeze ${before}→${this.pressure.HOUSING}. ` +
        `The families read their contracts together: every Housing and Lending trap can now be ` +
        `negotiated with Read 1.`,
    );
  }
  leagueRound() {
    if (!this.hasLeague()) return;
    if (this.leagueFormed && this.round % 2 === 0) {
      const d = maxBy(K.LEAGUE_PUSH, (x) => this.pressure[x]);
      if (this.pressure[d] > 0) {
        this.pressure[d] -= 1;
        this.emit(`  ✦ The League withholds together: Squeeze in ${d} −1 (${this.pressure[d]}/${K.CAPTURE}).`);
      }
    } else if (this.league.size) {
      this.emit(
        `  ⚑ The sellers scare families off: the pledges fall apart (${this.league.size}/` +
          `${this.leagueNeeded()} signed). Everyone has to sign in the same round.`,
      );
      this.league = new Set();
    }
  }
  negCost(d: District) {
    return K.NEG_COST + (this.scenario === "The Hospital Closes" && d === "HEALTH" ? 1 : 0);
  }
  takeCost() {
    if (this.party) return K.BP_TAKE;
    return K.TAKE_CORRUPT + (this.owner === "The Debt Buyer" ? 1 : 0);
  }
  visible(pl: Player, d: District, card: Card): [number, string, string | null][] {
    return LAYERS.map(([n, k, lab]) => [n, lab, pl.sight[d] >= n ? card[k] : null]);
  }

  // ================= BLOCK ACTIONS =================
  study(pl: Player, d: District) {
    if (pl.sight[d] >= 3) {
      this.emit(`${pl.name} already reads ${d} fully.`);
      return;
    }
    const g = pl.practice ? 2 : 1;
    pl.practice = false;
    pl.sight[d] = Math.min(3, pl.sight[d] + g);
    pl.legend += 1;
    this.emit(
      `${pl.name} studies ${d}${g === 2 ? " (practiced at Adventure Central)" : ""}. ` +
        `Read now ${pl.sight[d]}/3. Props +1.`,
    );
  }
  draw(d: District) {
    if (this.counterfeits.has(d)) {
      // the Overlord's counterfeit is on top of the pile
      this.counterfeits.delete(d);
      const card = { ...C.counterfeits[d] };
      this.dealt.push(card);
      return card;
    }
    return this.dress(this.endless ? makeDeal(d, this.rng) : this.rng.choice(this.deck[d]));
  }
  /** The deal as this player can read it (or a teammate rendering it for them: see): below Read 3, a counterfeit looks like honest help. */
  looks(pl: Player, d: District, card: Card, see?: number): Card {
    return card.counterfeit && (see ?? pl.sight[d]) < 3 ? { ...card, trap: false, lever: 0 } : card;
  }
  /** "Render?": a teammate who reads this district better reads the deal for you, once per Face token. */
  canRender(pl: Player, by: Player | null | undefined, d: District): by is Player {
    return this.render && !!by && by !== pl && pl.face > 0 && !by.flipped && by.role !== "Overlord" && by.sight[d] > pl.sight[d];
  }
  /** the fine-print die: roll which layer holds a trap's lever, so the deck can't be learned by heart */
  dress(card: Card) {
    if (this.finePrint && card.trap) {
      const die = Math.floor(this.rng.random() * 6) + 1;
      card = { ...card, lever: K.FINE_PRINT_DIE[die], die };
    }
    this.dealt.push(card);
    return card;
  }
  startTurn(pl: Player) {
    pl.freeTeach = false;
    pl.shopAround = false;
    pl.practice = false;
  }
  dealsFor(pl: Player, d: District) {
    if (pl.shopAround) {
      pl.shopAround = false;
      if (this.endless || this.counterfeits.has(d)) return [this.draw(d), this.draw(d)];
      return this.rng.sample(this.deck[d], 2).map((c) => this.dress(c));
    }
    return [this.draw(d)];
  }
  face(pl: Player, d: District, choice: Choice, card?: Card, by?: Player | null) {
    if (this.desk === pl.name) return this.emit(`  ${pl.name} is at the Desk and can't face deals. Quit the Desk first (an action).`);
    card = card || this.draw(d);
    const trap = card.trap;
    const lever = this.lever(d, card);
    let see = pl.sight[d];
    this.emit(`${pl.name} faces a deal in ${d}: "${card.front}"  → ${choice}`);
    if (this.canRender(pl, by, d)) {
      pl.face -= 1;
      see = by.sight[d];
      this.emit(`  Render? ${pl.name} lets ${by.name} read it for them (Read ${see}). Face left: ${pl.face}.`);
    }
    if (card.die !== undefined) this.emit(`  (The fine print: rolled ${card.die}, so the lever sits in ${LEVER_NAME[card.lever]}.)`);
    const bare = this.terrell && trap && pl.bare.has(d) && choice !== "WALK";
    let out: Signed["out"] | null = null;
    const fake = !!card.counterfeit;
    if (choice === "TAKE" && fake) {
      // conned: you took it for honest help
      out = "conned";
      const lost = Math.min(pl.trust, K.CON_TRUST);
      pl.trust -= lost;
      if (this.pressure[d] < K.CAPTURE) this.pressure[d] += 1;
      this.emit(`  It was a COUNTERFEIT: it only looked honest. Squeeze +1 in ${d} (${this.pressure[d]}/${K.CAPTURE})` + (lost ? `, Trust −${lost}.` : "."));
      if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
    } else if (choice === "TAKE") {
      if (!trap) {
        pl.trust += 2;
        this.clarity[d] = Math.min(K.WAKE, this.clarity[d] + 1);
        pl.legend += 1;
        out = "help";
        this.emit(`  It was an HONEST deal — real help. Trust +2, ${d} clarity +1, Props +1.`);
      } else {
        const cost = this.takeCost();
        pl.corruption += cost;
        out = "taken";
        if (this.pressure[d] > 0) {
          this.pressure[d] = Math.max(0, this.pressure[d] - 2);
          this.emit(`  TAKE the trap to patch ${d} NOW: Squeeze −2… Shady +${cost} on you. (Props +0)`);
        } else {
          const rush = this.party ? 1 : 2;
          this.clarity[d] = Math.min(K.WAKE, this.clarity[d] + rush);
          this.emit(`  TAKE the trap for fast power: ${d} clarity +${rush}… Shady +${cost} on you. (Props +0)`);
        }
      }
    } else if (choice === "WALK") {
      out = trap ? "dodged" : "refused";
      if (fake) this.emit(`  WALK: it was a COUNTERFEIT, and you walked. Safe.`);
      else if (trap) this.emit(`  WALK: you dodged a trap. Safe, nothing gained.`);
      else {
        pl.trust = Math.max(0, pl.trust - 1);
        this.emit(`  WALK: it was honest help you refused out of fear. Trust −1.`);
      }
    } else {
      const cost = this.negCost(d);
      if (pl.trust < cost) {
        this.emit(`  ${pl.name} hasn't the Trust to negotiate with — the deal walks.`);
        return;
      }
      pl.trust -= cost;
      let roll = 0;
      if (trap && see >= lever) {
        const amt = pl.role === "Organizer" ? (this.chapter?.organizer_clears ?? 2) : 1;
        out = "defused";
        this.pressure[d] = Math.max(0, this.pressure[d] - amt);
        this.clarity[d] = Math.min(K.WAKE, this.clarity[d] + 1);
        pl.legend += 2;
        this.emit(
          `  NEGOTIATE on the ${LEVER_NAME[lever]} lever (Read ${see}): defused. ` +
            `Squeeze −${amt}, ${d} clarity +1, Props +2.`,
        );
        if (fake) {
          pl.legend += 1;
          this.emit(`  You exposed a COUNTERFEIT: it only looked like honest help. Props +1.`);
        }
      } else if (trap && this.partial && see === lever - 1 && (roll = Math.floor(this.rng.random() * 6) + 1) >= K.CLOSE_READ) {
        // a close read: one layer short, and you talked them down
        out = "partial";
        this.pressure[d] = Math.max(0, this.pressure[d] - 1);
        pl.legend += 1;
        this.emit(`  NEGOTIATE one layer short of the ${LEVER_NAME[lever]} lever (Read ${see}): rolled ${roll}, you talked them down. Squeeze −1, Props +1.`);
      } else if (trap) {
        if (this.partial && see === lever - 1) this.emit(`  A close read (Read ${see}, the lever's ${LEVER_NAME[lever]}): rolled ${roll}, not enough.`);
        out = "played";
        this.pressure[d] = Math.min(K.CAPTURE, this.pressure[d] + 1);
        this.emit(
          `  NEGOTIATE without the ${LEVER_NAME[lever]} layer (Read ${see}): you got played. ` +
            `Squeeze +1, Trust −${cost}.`,
        );
        if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
      } else {
        out = "wasted";
        this.emit(`  NEGOTIATE on an honest deal: you haggled away real help. Trust −${cost}.`);
      }
    }
    pl.trust = Math.min(pl.trust, K.MAX_TRUST);
    this.signed.push({ who: pl.name, d, out: out!, front: card.front, dollars: card.dollars ?? 0, basis: card.basis ?? "" });
    if (bare) {
      pl.bare.delete(d);
      this.backfires += 1;
      if (this.pressure[d] < K.CAPTURE) {
        this.pressure[d] += 1;
        this.emit(`  ⚠ It backfires: ${pl.name} read it but nobody had their back. Squeeze +1 in ${d} (${this.pressure[d]}/${K.CAPTURE}).`);
        if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
      }
    }
    if (this.party) {
      if (pl.corruption >= K.BP_SIT_OUT) {
        pl.corruption = 0;
        pl.benched = true;
        this.emit(`  ⚠ ${pl.name} has ${K.BP_SIT_OUT} Shady chips: hand them back and sit out your next turn.`);
      }
    } else if (pl.corruption >= K.FLIP && !pl.flipped && pl.name === this.crowned) {
      this.emit(`  👑 ${pl.name} has ${pl.corruption} Shady, and the Crown keeps them standing.`);
    } else if (pl.corruption >= K.FLIP && !pl.flipped) {
      pl.flipped = true;
      this.emit(`  ⚠⚠ ${pl.name} HAS FALLEN. The Machine now moves through them.`);
    }
  }
  teach(pl: Player, t: Player, d: District, response = true, chained = false) {
    if (this.desk === pl.name) return this.emit(`  ${pl.name} is at the Desk: no time to teach. Quit the Desk first (an action).`);
    const free = pl.role === "Translator" || pl.freeTeach;
    if (pl.sight[d] <= t.sight[d]) {
      this.emit(`  ${pl.name} can't teach ${t.name} ${d} — you can only teach what you read better.`);
      return;
    }
    if (!free && pl.trust < 1) {
      this.emit(`  ${pl.name} lacks Trust to teach.`);
      return;
    }
    const g = t.role === "Student" ? 2 : 1;
    const old = t.sight[d];
    t.sight[d] = Math.min(pl.sight[d], t.sight[d] + g);
    if (!free) pl.trust -= 1;
    else if (pl.role !== "Translator") pl.freeTeach = false;
    pl.legend += 2;
    this.taught.add(pl.name);
    this.emit(`${pl.name} teaches ${t.name} to read ${d}. Read ${old}→${t.sight[d]}${free ? " (free)" : ""}. Props +2.`);
    if (this.terrell) {
      if (pl.role === "Veteran") this.emit(`  The Veteran teaches the cover with it: ${t.name} is covered in ${d}.`);
      else if (this.flag("CIVIC_ARMOR")) this.emit(`  Civic Armor: the cover comes with the lesson. ${t.name} is covered in ${d}.`);
      else {
        t.bare.add(d);
        this.emit(`  No cover yet: if ${t.name} confronts a trap in ${d} before the block has their back, it backfires.`);
      }
    }
    if (response) {
      pl.legend += 1;
      t.legend += 1;
      this.emit(`  Call and response: ${t.name} says the second number back. Props +1 each.`);
      if (this.chapter?.chain && !chained) {
        const cand = this.active().filter((p) => p !== pl && p !== t && p.sight[d] < t.sight[d]);
        if (cand.length) {
          const nxt = minBy(cand, (p) => p.sight[d]);
          this.emit(`  ⛓ The Chain: ${t.name} turns and teaches ${nxt.name}, right there, for free.`);
          const had = t.freeTeach;
          t.freeTeach = true;
          this.teach(t, nxt, d, true, true);
          t.freeTeach = had;
        }
      }
    }
  }
  commons(pl: Player, place: PlaceKey = "BARBERSHOP") {
    if (place === "KITCHEN" && this.kitchenUsed) place = "BARBERSHOP";
    pl.trust = Math.min(K.MAX_TRUST, pl.trust + 2);
    const drop = place === "CHURCH" ? (this.decided("UP_NORTH") === "CHURCH" && this.chapter?.key === "THE_MAP" ? 3 : 2) : 1;
    const had = pl.corruption;
    pl.corruption = Math.max(0, pl.corruption - drop);
    const covered = this.cover(pl);
    if (this.party) {
      this.emit(`${pl.name} gathers with the block. Trust +2` + (had ? `, Shady −${had - pl.corruption}` : "") + "." + covered);
      return;
    }
    const P = this.places[place];
    this.emit(
      `${pl.name} gathers at ${P.name} (${P.where}). Trust +2` + (had ? `, Shady −${had - pl.corruption}` : "") + "." + covered,
    );
    if (place === "BARBERSHOP") {
      pl.freeTeach = true;
      this.emit("  Somebody in the chair can help: your next Teach this turn is free.");
    } else if (place === "MARKET") {
      pl.shopAround = true;
      this.emit("  You shop around: your next deal this turn, draw 2 and face 1.");
    } else if (place === "ADVENTURE") {
      pl.practice = true;
      this.emit("  Practice in the park: your next Study this turn gives +2 Read.");
    } else if (place === "KITCHEN") {
      this.kitchenUsed = true;
      for (const p of this.active()) p.trust = Math.min(K.MAX_TRUST, p.trust + 2);
      this.emit("  Grandma feeds the whole block. Every player +2 Trust. (Once per game.)");
    }
  }

  /** the Terrell rule: gathering with the block covers what you were taught */
  cover(pl: Player) {
    if (!pl.bare.size) return "";
    pl.bare = new Set();
    return " The block has their back now: covered.";
  }

  // ---- the Sou-Sou ----
  nextHand() {
    const act = this.active();
    return act.length ? act[this.circle % act.length] : null;
  }
  throwHand(pick?: (pl: Player) => District | null) {
    const payers = this.active().filter((p) => p.trust >= 1);
    for (const p of payers) p.trust -= 1;
    this.pot += payers.length;
    this.emit(`The block throws a hand in the Sou-Sou: ${payers.length} Trust in. Pot ${this.pot}/${K.SOUSOU_HAND}.`);
    if (this.pot < K.SOUSOU_HAND) return;
    const pl = this.nextHand()!;
    this.circle += 1;
    this.pot -= K.SOUSOU_HAND;
    const d = (pick ? pick(pl) : null) || maxBy(this.ds, (x) => this.pressure[x]);
    const before = this.pressure[d];
    this.pressure[d] = Math.max(0, before - 2);
    pl.legend += 1;
    this.emit(
      `  It's ${pl.name}'s hand. The debt in ${d} gets paid off clean: ` +
        `Squeeze ${before}→${this.pressure[d]}, no Shady. Props +1.`,
    );
  }

  // ---- the Cookout ----
  best() {
    return perDistrict((d) => Math.max(...this.active().map((p) => p.sight[d])));
  }
  cookoutGain(pl: Player): [District, number] {
    const best = this.best();
    const d = maxBy(this.ds, (x) => [best[x] - pl.sight[x], b(this.clarity[x] >= K.WAKE)]);
    return [d, best[d] - pl.sight[d]];
  }
  cookout(picks?: Record<string, District>) {
    this.cookoutUsed = true;
    this.emit("🍖 THE COOKOUT. Everybody's invited. Nobody works this round — the block eats, laughs, and compares paperwork.");
    const best = this.best();
    for (const pl of this.active()) {
      pl.trust = Math.min(K.MAX_TRUST, pl.trust + 2);
      pl.corruption = Math.max(0, pl.corruption - 1);
      pl.legend += 1;
      if (this.render) pl.face = K.FACE_TOKENS;
      const d = (picks && picks[pl.name]) || this.cookoutGain(pl)[0];
      const old = pl.sight[d];
      pl.sight[d] = Math.max(old, best[d]);
      this.emit(`  ${pl.name}: Trust +2, Shady −1, Props +1` + (pl.sight[d] > old ? `, Read in ${d} ${old}→${pl.sight[d]}.` : ".") + this.cover(pl));
    }
  }
  cookoutAi() {
    if (this.party || this.cookoutUsed || Math.max(...this.ds.map((d) => this.pressure[d])) >= K.CAPTURE - 1) return false;
    const act = this.active();
    const gain = act.reduce((s, p) => s + this.cookoutGain(p)[1], 0);
    return gain >= act.length * this.actions() * 0.75;
  }
  sousouAi() {
    if (this.party) return false;
    return this.ds.some((d) => 0 < this.pressure[d]) && this.active().every((p) => p.trust >= 2);
  }
  reach(pl: Player, t: Player) {
    if (pl.trust < 2) {
      this.emit(`  ${pl.name} needs 2 Trust to reach someone.`);
      return;
    }
    pl.trust -= 2;
    t.flipped = false;
    t.corruption = K.FLIP - 2;
    pl.legend += 3;
    this.emit(`${pl.name} reaches ${t.name} and pulls them home. Props +3.`);
  }
  history(pl: Player, d: District) {
    if (pl.role !== "Elder" || pl.elderUsed) {
      this.emit("  No History to teach.");
      return;
    }
    pl.historyLeft -= 1;
    pl.elderUsed = pl.historyLeft <= 0;
    this.clarity[d] = K.WAKE;
    pl.legend += 2;
    const pool = [...this.historyDeck[d], ...this.historyDeck.ANY];
    const mine = pool.filter((h) => (this.campaign.unlocks ?? []).includes(h.title)); // Today: the family's own History
    const h = (this.historyCard = this.rng.choice(mine.length ? mine : pool));
    this.emit(`${pl.name} teaches the History of ${d}: ${h.title} (${h.year}, ${h.place}).`);
    this.emit(`  ${h.story}`);
    this.emit(`  "${h.lesson}"  ${d} AWAKE. Props +2.`);
  }
  trace(pl: Player, d: District) {
    if (!this.canTrace(pl, d)) {
      this.emit(`  ${pl.name} can't trace ${d} (needs the Underworld open, Read 3, and ${d} awake).`);
      return;
    }
    this.threads.add(d);
    pl.legend += 2;
    this.emit(
      `${pl.name} traces the blue thread under ${d} down into the Underworld. ` +
        `Threads ${this.threads.size}/${this.threadsNeeded()}. Props +2.`,
    );
  }
  exposeUw(pl: Player) {
    if (!this.canExpose()) {
      this.emit(`  Not enough threads traced to expose the Owner (${this.threads.size}/${this.threadsNeeded()}).`);
      return;
    }
    this.emit(`${pl.name} drags the UNDERWORLD into the light. One Owner — ${this.ownerFace}. It was always one machine.`);
    this.won = true;
    this.result = "BLOCK_WIN";
  }

  // ================= MACHINE / FALLEN / OVERLORD =================
  safeRoute(d: District) {
    if (this.greenBook && this.pressure[d] === K.CAPTURE - 1 && this.useGreenBook(d)) {
      this.greenBook = false;
      this.emit(`  📗 The block opens the Green Book: a safe route around ${d}. That strike lands nowhere.`);
      return true;
    }
    return false;
  }
  mExtract(who: string, d: District) {
    if (this.struck.has(d)) {
      this.emit(`[${who}] already moved on ${d} this round — the Machine spreads, it doesn't snipe.`);
      return;
    }
    this.struck.add(d);
    if (this.safeRoute(d)) return;
    if (this.pressure[d] < K.CAPTURE) {
      this.pressure[d] += 1;
      this.emit(`[${who}] strikes ${d} for the Machine. Squeeze ${this.pressure[d]}/${K.CAPTURE}.`);
      if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
    }
  }
  mObscure(who: string, d: District) {
    if (this.struck.has(d)) {
      this.emit(`[${who}] already moved on ${d} this round — the Machine spreads, it doesn't snipe.`);
      return;
    }
    if (this.clarity[d] >= K.WAKE) {
      if (!this.uwOpen || this.covered || this.threads.has(d)) {
        this.emit(`[${who}] can't muddy ${d} — the block is awake there.`);
        return;
      }
      this.covered = true;
    }
    if (this.clarity[d] > 0) {
      this.struck.add(d);
      this.clarity[d] -= 1;
      this.emit(`[${who}] muddies ${d}: the second number gets buried. Clarity −1.`);
    }
  }
  /**
   * Overlord: slip a fake honest deal onto a district's pile. One of the Overlord's moves, at most one a
   * round, from a hand of K.COUNTERFEIT_HAND. It doesn't use the district's move. The block isn't told where.
   */
  mCounterfeit(who: string, d: District) {
    if (this.forged) return this.emit(`[${who}] has already slipped a counterfeit in this round.`);
    if (this.forgeries < 1) return this.emit(`[${who}] has no counterfeits left.`);
    if (this.counterfeits.has(d)) return this.emit(`[${who}] already has a counterfeit waiting there.`);
    this.counterfeits.add(d);
    this.forged = true;
    this.forgeries -= 1;
    this.emit(`[${who}] slips a counterfeit into a deal pile somewhere on the block.`);
  }
  canCounterfeit(d?: District) {
    return this.overlord && !this.forged && this.forgeries > 0 && (d === undefined || !this.counterfeits.has(d));
  }
  /** The computer Overlord: the Machine's move, or a counterfeit when no capture is on the line. */
  overlordAiMove(struck: Set<District> = new Set()): Action {
    const a = this.machineAiMove(struck);
    if (a.k === "m_extract" && this.pressure[a.d] === K.CAPTURE - 1) return a; // a capture comes first
    return this.overlordCounterfeit() ?? a;
  }
  /** where the block reads well enough to trust a deal and not well enough to see through it (from round 2) */
  overlordCounterfeit(): Action | null {
    if (this.forged || this.forgeries < 1 || this.round < 2) return null;
    const fooled = (x: District) => this.active().filter((p) => 1 <= p.sight[x] && p.sight[x] < 3).length;
    const cand = this.ds.filter((d) => !this.counterfeits.has(d) && this.clarity[d] < K.WAKE && fooled(d));
    return cand.length ? { k: "m_counterfeit", d: maxBy(cand, fooled) } : null;
  }
  mTempt(who: string, t: Player | null) {
    if (t && t.trust > 0) {
      t.trust -= 1;
      this.emit(`[${who}] tempts ${t.name} with a sweeter deal. Trust −1.`);
    }
  }
  machineAiMove(struck: Set<District> = new Set()): Action {
    let free = this.ds.filter((d) => !struck.has(d));
    const near = free.filter((d) => this.pressure[d] === K.CAPTURE - 1);
    if (near.length) return { k: "m_extract", d: near[0] };
    if (this.uwOpen && !this.covered) {
      const exp = free.filter((d) => this.clarity[d] >= K.WAKE && !this.threads.has(d));
      if (exp.length) return { k: "m_obscure", d: exp[0] };
    }
    const vuln = free.filter((d) => 0 < this.clarity[d] && this.clarity[d] < K.WAKE && this.pressure[d] < K.CAPTURE);
    if (vuln.length) {
      const d = maxBy(vuln, (x) => this.clarity[x]);
      return this.clarity[d] >= 2 ? { k: "m_obscure", d } : { k: "m_extract", d };
    }
    const act = this.active();
    const t = act.length ? maxBy(act, (p) => p.trust) : null;
    if (t && t.trust > 0) return { k: "m_tempt", t };
    free = free.filter((d) => this.pressure[d] < K.CAPTURE);
    return free.length ? { k: "m_extract", d: minBy(free, (x) => this.pressure[x]) } : { k: "pass" };
  }
  ownerPassive() {
    if (this.overlord || this.round <= this.handRests) return;
    let o: string | undefined = this.owner;
    if (o === "The Ledger Keeper") o = ({ 1: "The Debt Buyer", 2: "The Recruiter", 3: "The Lobbyist" } as Record<number, string>)[this.round % 4]; // one hand, every era's face
    if (o === "The Lobbyist") {
      const best = this.ds.filter(
        (d) => 0 < this.clarity[d] && this.clarity[d] < K.WAKE && this.pressure[d] < K.CAPTURE && !this.struck.has(d),
      );
      if (best.length) {
        const d = maxBy(best, (x) => this.clarity[x]);
        this.struck.add(d);
        this.pressure[d] += 1;
        this.emit(`  ⚑ (hidden hand) the squeeze creeps onto your strongest work in ${d}. ${this.pressure[d]}/${K.CAPTURE}.`);
        if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
      }
    } else if (o === "The Recruiter") {
      const pool: [Player, District][] = [];
      for (const p of this.active()) for (const d of this.ds) if (p.sight[d] > 0) pool.push([p, d]);
      if (pool.length) {
        const [p, d] = this.rng.choice(pool);
        p.sight[d] -= 1;
        this.emit(`  ⚑ (hidden hand) a recruiter peels ${p.name} away from ${d}. Read −1.`);
      }
    } else if (o === "The Debt Buyer") {
      const owed = this.active().filter((p) => p.corruption > 0 && p.trust > 0);
      for (const p of owed) p.trust -= 1;
      if (owed.length) this.emit(`  ⚑ (hidden hand) collections calls: ${owed.map((p) => p.name).join(", ")} lose 1 Trust.`);
    }
  }
  hit(d: District) {
    const vet = this.active().find((p) => p.role === "Veteran" && p.shields > 0);
    if (vet) {
      vet.shields -= 1;
      this.emit(`  ⛨ ${vet.name} shields ${d}. (${vet.shields} left)`);
      return;
    }
    if (this.safeRoute(d)) return;
    this.pressure[d] += 1;
    this.emit(`  ✖ The Machine strikes ${d}. Squeeze ${this.pressure[d]}/${K.CAPTURE}.`);
    if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
  }
  /** Block Party: the Machine hits the districts closest to waking, +1 Squeeze and −1 Clarity each */
  partyMachinePhase() {
    for (let i = 0; i < this.strikes(); i++) {
      const vuln = this.ds.filter((d) => this.clarity[d] < K.WAKE && this.pressure[d] < K.CAPTURE);
      if (!vuln.length) break;
      const d = maxBy(vuln, (x) => [this.clarity[x], -this.pressure[x]]);
      this.struck.add(d);
      this.pressure[d] += 1;
      const had = this.clarity[d];
      this.clarity[d] = Math.max(0, had - 1);
      this.emit(`  ✖ The Machine strikes ${d}. Squeeze ${this.pressure[d]}/${K.CAPTURE}` + (had ? ", Clarity −1." : "."));
      if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
    }
  }
  /** this round's strikes, carrying the remainder: 1.5 = 1, 2, 1, 2… */
  strikes() {
    const h = (this.party ? K.BP_HITS : K.MACHINE_HITS)[this.n()];
    return Math.floor(h * this.round) - Math.floor(h * (this.round - 1));
  }
  autoMachinePhase() {
    let hits = this.strikes();
    if (this.owner === "The Algorithm" && this.round > this.handRests) hits += 1;
    if (this.owner === "The Ledger Keeper" && this.round % 4 === 0) hits += 1; // wearing the Algorithm's face
    if (this.desk && this.round % 2 === 0) {
      hits += 1;
      this.emit(`  ✖ The Desk's paperwork feeds the Machine: an extra strike while ${this.desk} sits there.`);
    }
    if (this.round === 1 && this.chapter?.throne && this.flag("CROWN_WORN")) {
      hits += 1;
      this.emit("  ✖ Somebody wore the Crown last chapter. The Machine remembers: an extra strike.");
    }
    if (this.ownerShown) hits += 1;
    const struck = this.struck;
    if (this.scenario === "Payday Season" && this.round % 2 === 0 && !struck.has("LENDING") && this.pressure.LENDING < K.CAPTURE) {
      struck.add("LENDING");
      this.emit(`  ✖ Payday Season: payday again — an extra LENDING hit.`);
      this.hit("LENDING");
    }
    for (let i = 0; i < Math.max(0, hits); i++) {
      const vuln = this.ds.filter((d) => this.clarity[d] < K.WAKE && this.pressure[d] < K.CAPTURE && !struck.has(d));
      if (!vuln.length) break;
      const d = maxBy(vuln, (x) => [b(this.defend.includes(x)), this.clarity[x], -this.pressure[x]]);
      struck.add(d);
      this.hit(d);
    }
    const building = this.ds.filter((d) => 0 < this.clarity[d] && this.clarity[d] < K.WAKE && !struck.has(d));
    if (building.length) {
      const d = maxBy(building, (x) => this.clarity[x]);
      this.clarity[d] -= 1;
      struck.add(d);
      this.emit(`  ✖ The Machine muddies ${d}. Clarity −1.`);
    }
    if (this.ownerShown) {
      const exp = this.ds.filter((d) => this.clarity[d] >= K.WAKE && !this.threads.has(d) && !struck.has(d));
      if (exp.length && !this.covered) {
        const d = this.rng.choice(exp);
        this.clarity[d] -= 1;
        this.covered = true;
        struck.add(d);
        this.emit(`  ⚑ The Owner covers its tracks in ${d}. Clarity −1 (no longer awake).`);
      }
    }
    this.ownerPassive();
  }
  fallenTurn(pl: Player, n: number) {
    const mult = this.owner === "The Debt Buyer" && !this.overlord ? 2 : 1;
    for (let i = 0; i < n * mult; i++) this.do(pl, this.machineAiMove(this.struck));
  }
  revealOwner() {
    this.ownerShown = true;
    const text = this.chapter ? this.chapter.face_text : `${this.owner} — ${C.owners[this.owner]}`;
    this.emit(`⚑ THE UNDERWORLD CRACKS OPEN. The Owner is ${text}`);
    this.emit(`  Trace ${this.threadsNeeded()} threads (Read 3 in a woken district) and expose it before it buries you.`);
    if (this.owner === "The Lobbyist" && this.chapter?.reveal === "all") {
      const awake = this.ds.filter((d) => this.clarity[d] >= K.WAKE); // the Council redraws the lines
      for (const d of awake) this.clarity[d] -= 1;
      if (awake.length) this.emit(`  ✖ ${this.ownerFace} redraws the lines: ${awake.join(", ")} lose${awake.length === 1 ? "s" : ""} 1 Clarity.`);
    } else if (this.owner === "The Lobbyist") {
      const awake = this.ds.filter((d) => this.clarity[d] >= K.WAKE);
      if (awake.length) {
        const d = this.rng.choice(awake);
        this.clarity[d] = 1;
        this.emit(`  ✖ ${this.ownerFace} re-captures ${d}.`);
      }
    }
  }
  openUnderworld() {
    this.uwOpen = true;
    if (this.overlord) this.emit(`⚑ THE UNDERWORLD CRACKS OPEN. Trace ${this.threadsNeeded()} threads and expose the Overlord.`);
    else this.revealOwner();
  }
  tighten() {
    this.mapCompounds();
    const aps = this.activePatterns();
    if (!aps.length) return;
    const p = maxBy(aps, (x) => x.combo.length);
    const cand = p.combo.filter((d) => this.pressure[d] < K.CAPTURE);
    if (cand.length) {
      const d = minBy(cand, (x) => this.pressure[x]);
      this.pressure[d] += 1;
      this.emit(`  ⚠ ${p.name} tightens on ${d}. Squeeze ${this.pressure[d]}/${K.CAPTURE}.`);
      if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
    }
  }
  mapCompounds() {
    if (!this.hasLeague() || this.round < 2) return;
    if (!this.activePatterns().some((p) => p.name === "REDLINING")) return;
    const d = minBy<District>(["HOUSING", "LENDING"], (x) => this.pressure[x]);
    if (this.pressure[d] < K.CAPTURE) {
      this.pressure[d] += 1;
      this.emit(`  ⚠ The map compounds: REDLINING tightens again on ${d}. Squeeze ${this.pressure[d]}/${K.CAPTURE}.`);
      if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
    }
  }
  checkPatterns() {
    if (this.party) return;
    const aps = this.activePatterns();
    const active = new Set(aps.map((p) => p.name));
    for (const p of aps) {
      if (!this.patternsSeen.has(p.name)) {
        this.patternsSeen.add(p.name);
        this.emit(`⚠⚠ MACHINE PATTERN — ${p.name}  [${p.combo.join(" + ")}]: ${p.lesson}`);
      }
    }
    for (const p of C.patterns) {
      if (this.patternsSeen.has(p.name) && !active.has(p.name)) {
        this.patternsSeen.delete(p.name);
        this.emit(`✦ PATTERN BROKEN — ${p.name}.`);
      }
    }
  }
  checkEnd(): string | null {
    if (this.captured() >= K.LOSE_CAPTURED) {
      this.won = true;
      this.result = "MACHINE_WIN";
      return "Two districts fell. The Machine holds the block.";
    }
    if (!this.active().length) {
      this.won = true;
      this.result = "MACHINE_WIN";
      return "The whole block fell. The Machine won wearing your faces.";
    }
    return null;
  }

  // ================= DISPATCH =================
  do(pl: Player, a: Action) {
    switch (a.k) {
      case "study": this.study(pl, a.d); break;
      case "face": this.face(pl, a.d, a.choice, a.card, a.by); break;
      case "teach": this.teach(pl, a.t, a.d, a.response ?? true); break;
      case "commons": this.commons(pl, a.place || "BARBERSHOP"); break;
      case "reach": this.reach(pl, a.t); break;
      case "history": this.history(pl, a.d); break;
      case "trace": this.trace(pl, a.d); break;
      case "expose_uw": this.exposeUw(pl); break;
      case "league": this.signLeague(pl); break;
      case "march": this.march(pl); break;
      case "leave_desk": this.leaveDesk(pl); break;
      case "m_extract": this.mExtract(pl.name, a.d); break;
      case "m_obscure": this.mObscure(pl.name, a.d); break;
      case "m_tempt": this.mTempt(pl.name, a.t); break;
      case "m_counterfeit": this.mCounterfeit(pl.name, a.d); break;
      case "pass": break;
    }
    this.checkPartyWin();
  }
  /** Block Party: wake 2 of the 3 districts and the block wins on the spot */
  checkPartyWin() {
    if (this.party && !this.won && this.awake() >= K.BP_WAKE_TO_WIN) {
      this.won = true;
      this.result = "BLOCK_WIN";
      this.emit(`✦ ${this.awake()} of ${this.ds.length} districts awake. The block party goes all night: you win.`);
    }
  }

  // ================= BLOCK AI =================
  botChoice(pl: Player, d: District, card: Card, style: Style = "careful", seeAs?: number): Choice {
    const see = seeAs ?? pl.sight[d];
    card = this.looks(pl, d, card, see);
    const safe = pl.corruption + this.takeCost() < K.FLIP;
    const urgent = this.pressure[d] >= K.CAPTURE - 1;
    if (see >= 1) {
      if (!card.trap) return "TAKE";
      if (this.terrell && pl.bare.has(d) && !urgent) return "WALK";
      if (see >= card.lever && pl.trust >= this.negCost(d)) return "NEGOTIATE";
      if (style === "greedy" && pl.corruption + this.takeCost() < K.FLIP + 2) return "TAKE";
      if (style === "careful" && urgent && safe) return "TAKE";
      if (this.partial && urgent && see === card.lever - 1 && pl.trust >= this.negCost(d) && style !== "greedy") return "NEGOTIATE"; // try a close read
      return "WALK";
    }
    if (style === "greedy" || (style === "careful" && urgent && safe)) return "TAKE";
    return "WALK";
  }
  botFace(pl: Player, d: District, style: Style): Action {
    const score = (c: Card) => ((c = this.looks(pl, d, c)), pl.sight[d] < 1 ? 0 : !c.trap ? 2 : pl.sight[d] >= c.lever ? 3 : 0);
    const card = maxBy(this.dealsFor(pl, d), score);
    const by = this.botRenderer(pl, d);
    return { k: "face", d, choice: this.botChoice(pl, d, card, style, by ? by.sight[d] : undefined), card, by };
  }
  /** who a bot asks to read a deal for it: the best reader, when it can't read the district or it's urgent */
  botRenderer(pl: Player, d: District): Player | null {
    if (!this.render || pl.face < 1) return null;
    const others = this.active().filter((p) => p !== pl);
    const best = others.length ? maxBy(others, (p) => p.sight[d]) : null;
    return best && this.canRender(pl, best, d) && (pl.sight[d] === 0 || this.pressure[d] >= K.CAPTURE - 1) ? best : null;
  }
  botPlace(pl: Player): PlaceKey {
    const act = this.active();
    if (pl.corruption >= 2) return "CHURCH";
    if (!this.kitchenUsed && act.reduce((s, p) => s + p.trust, 0) <= act.length) return "KITCHEN";
    if (this.uwOpen && this.ds.some((x) => pl.sight[x] < 3 && this.clarity[x] >= K.WAKE && !this.threads.has(x)))
      return "ADVENTURE";
    if (act.some((p) => p !== pl && this.ds.some((x) => p.sight[x] < pl.sight[x]))) return "BARBERSHOP";
    if (this.ds.some((x) => pl.sight[x] === 0 && this.clarity[x] < K.WAKE)) return "ADVENTURE";
    return "MARKET";
  }
  /** The chapter twists around the base bot: the Desk, the March, everyone teaches for the Empty Throne. */
  blockAi(pl: Player, style: Style = "careful"): Action {
    if (this.desk === pl.name) {
      const hot = this.ds.some((d) => this.pressure[d] >= K.CAPTURE - 1 && pl.sight[d] >= 2);
      if (this.round >= 6 || hot) return { k: "leave_desk" };
    }
    if (this.marchAi()) return { k: "march" };
    if (this.chapter?.throne && !this.taught.has(pl.name) && pl.trust >= 1) {
      for (const d of this.ds) {
        const t = this.active().find((p) => p !== pl && p.sight[d] < pl.sight[d]);
        if (t) return { k: "teach", t, d };
      }
    }
    if (this.uwOpen && this.threads.size >= this.threadsNeeded() && this.throneBlocks()) {
      const top = maxBy(this.active(), (p) => p.legend);
      if (pl === top) return { k: "commons", place: this.botPlace(pl) }; // the leader steps back
    }
    const a = this.baseBlockAi(pl, style);
    if ((a.k === "face" || a.k === "teach") && this.desk === pl.name) {
      // at the Desk: study instead
      const d = a.d;
      return pl.sight[d] < 3 ? { k: "study", d } : { k: "commons", place: this.botPlace(pl) };
    }
    return a;
  }
  baseBlockAi(pl: Player, style: Style = "careful"): Action {
    if (style === "human") style = this.rng.random() < 0.2 ? "greedy" : "careful";
    if (this.canExpose()) return { k: "expose_uw" };
    for (const d of this.ds) if (this.canTrace(pl, d)) return { k: "trace", d };
    const fallen = this.blk().filter((p) => p.flipped);
    if (fallen.length && pl.trust >= 2 && Math.max(...this.ds.map((d) => this.pressure[d])) < K.CAPTURE - 1)
      return { k: "reach", t: fallen[0] };
    if (pl.corruption >= K.FLIP - 2 && style !== "greedy") return { k: "commons", place: this.botPlace(pl) };
    if (pl.trust < K.NEG_COST) return { k: "commons", place: this.botPlace(pl) };
    if (this.terrell && pl.bare.size && pl.trust < K.MAX_TRUST) return { k: "commons", place: this.botPlace(pl) };
    const hot = this.ds.filter((d) => this.pressure[d] >= K.CAPTURE - 1 && this.clarity[d] < K.WAKE).sort(
      (x, y) => -this.pressure[x] - -this.pressure[y],
    );
    if (hot.length) {
      const d = hot[0];
      if (pl.role === "Elder" && !pl.elderUsed) return { k: "history", d };
      if (pl.sight[d] >= 1 || style !== "never") return this.botFace(pl, d, style);
      return { k: "study", d };
    }
    if (this.hasLeague() && !this.leagueFormed && !this.league.has(pl.name) && Math.max(this.pressure.HOUSING, this.pressure.LENDING) >= 1)
      return { k: "league" };
    if (this.uwOpen) {
      const openD = this.ds.filter((d) => this.clarity[d] >= K.WAKE && !this.threads.has(d));
      if (openD.length) {
        const d = maxBy(openD, (x) => pl.sight[x]);
        const learner = this.active().find((p) => p !== pl && p.sight[d] < pl.sight[d]);
        if (pl.sight[d] >= 2 && learner && (pl.role === "Translator" || pl.trust >= 2)) return { k: "teach", t: learner, d };
        return { k: "study", d };
      }
    }
    const building = this.ds.filter((d) => this.clarity[d] < K.WAKE);
    if (!building.length) return { k: "commons", place: this.botPlace(pl) };
    const tgt = minBy(building, (d) => [this.clarity[d], -pl.sight[d]]);
    if (pl.sight[tgt] >= 1) {
      const learner = this.active().find((p) => p.sight[tgt] < pl.sight[tgt] && p !== pl);
      if (learner && (pl.role === "Translator" || (pl.trust >= 2 && learner.sight[tgt] === 0)))
        return { k: "teach", t: learner, d: tgt };
      if (pl.sight[tgt] === 1 && pl.role !== "Elder" && this.rng.random() < 0.35) return { k: "study", d: tgt };
      return this.botFace(pl, tgt, style);
    }
    if (style === "greedy") return this.botFace(pl, tgt, style);
    return { k: "study", d: tgt };
  }

  // ================= ROUND FLOW =================
  endOfBlockTurns() {
    this.checkPatterns();
    if (!this.uwOpen && !this.party && this.totalClarity() >= K.UNDERWORLD_AT) this.openUnderworld();
  }
  machinePhase(overlordMove?: () => Action): string | null {
    this.leagueRound();
    const ov = this.ov();
    if (this.overlord && ov) {
      if (this.chapter?.crown && !this.humanOverlord) {
        const t = this.crownTarget();
        if (t) this.offerCrown(t);
      }
      const moves = this.overlordMoveCount();
      for (let i = 0; i < moves; i++) this.do(ov, overlordMove ? overlordMove() : this.overlordAiMove(this.struck));
      this.tighten();
    } else if (this.grace > 0) {
      this.grace -= 1;
      this.emit("  (The Machine is distracted — grace round.)");
    } else if (this.party) this.partyMachinePhase();
    else {
      this.autoMachinePhase();
      this.tighten();
    }
    this.checkPatterns();
    return this.checkEnd();
  }
  // ---- web-only glue (not in the Python engine): a person playing the Overlord moves one at a time ----
  overlordMoveCount() {
    const m = K.OVERLORD_MOVES[this.n()];
    let moves = Math.floor(m * this.round) - Math.floor(m * (this.round - 1)); // carry the remainder
    if (this.crownRefused) {
      moves += 1;
      this.crownRefused = false;
    }
    return moves;
  }
  /** After a person's Overlord moves: the same wrap-up machinePhase() does. */
  finishOverlordPhase(): string | null {
    this.tighten();
    this.checkPatterns();
    return this.checkEnd();
  }
  beginRound() {
    this.round += 1;
    this.struck = new Set();
    this.covered = false;
    this.forged = false;
  }
  runAuto(maxRounds?: number, style: Style = "careful") {
    maxRounds = maxRounds || this.maxRounds;
    while (this.round < maxRounds && !this.won) {
      this.beginRound();
      this.roundStart();
      const feast = this.cookoutAi();
      if (feast) this.cookout();
      for (const pl of this.players) {
        if (pl.role === "Overlord") continue;
        if (pl.flipped) this.fallenTurn(pl, this.actions());
        else if (feast) continue;
        else if (pl.benched) {
          pl.benched = false;
          this.emit(`${pl.name} sits this turn out.`);
        } else {
          this.startTurn(pl);
          for (let i = 0; i < this.actions(); i++) {
            this.do(pl, this.blockAi(pl, style));
            if (this.won || pl.flipped) break;
          }
        }
        if (this.won) break;
      }
      if (this.won) break;
      if (this.sousouAi()) this.throwHand();
      this.endOfBlockTurns();
      if (this.machinePhase()) break;
    }
    if (!this.result) this.timeUp();
    return this.result;
  }
  /** The real money behind the game's decisions: what the block signed, read its way out of, and walked away from. */
  money(): Money {
    const tot = (o: Signed["out"]) => this.signed.filter((x) => x.out === o).reduce((a, x) => a + x.dollars, 0);
    const conned = tot("conned");
    const taken = this.signed.filter((x) => x.out === "taken");
    const played: Record<string, number> = {};
    for (const x of this.signed) if (x.out === "played" || x.out === "conned") played[x.who] = (played[x.who] ?? 0) + 1;
    const most = Object.entries(played).length ? maxBy(Object.entries(played), (kv) => kv[1]) : null;
    return {
      taken: tot("taken"), played: tot("played") + conned, refused: tot("refused") + tot("wasted"),
      dodged: tot("dodged"), defused: tot("defused") + tot("partial"), help: tot("help"),
      shortcuts: taken.length, worst: taken.length ? maxBy(taken, (x) => x.dollars) : null,
      playedMost: most ? { who: most[0], times: most[1] } : null,
    };
  }
  chapterResult(): ChapterResult {
    const won = this.result === "BLOCK_WIN";
    const awake = this.ds.filter((d) => this.clarity[d] >= K.WAKE);
    const captured = this.ds.filter((d) => this.pressure[d] >= K.CAPTURE);
    const falls = this.log.filter((l) => l.includes("HAS FALLEN")).length;
    const reaches = this.log.filter((l) => l.includes("pulls them home")).length;
    let ledger = won ? 2 + awake.length : -2 - captured.length;
    ledger += reaches - falls;
    const redlining = this.activePatterns().some((p) => p.name === "REDLINING");
    const unlocks: string[] = [];
    if (this.chapter) {
      unlocks.push(...this.chapter.unlocks_always);
      if (won && (this.leagueFormed || !this.hasLeague())) unlocks.push(...this.chapter.unlocks_if_won);
    }
    return {
      won, ledger, rebuilt: awake, scarred: captured, falls, reaches, league: this.leagueFormed, redlining_broken: !redlining, unlocks,
      rally: !won, burned: this.backfires > 0, quit_desk: this.deskLeft, crown: this.crowned,
    };
  }
  timeUp() {
    this.won = true;
    this.result = "MACHINE_WIN";
    this.emit("⏳ The clock ran out. The Machine doesn't need to win — it only needs you to run out of time.");
  }
}

export interface NewGameOptions extends GameOptions {
  roster?: { name: string; role: string }[];
}
export function newGame(o: NewGameOptions = {}) {
  const g = new Game(o);
  g.players = (o.roster || C.roster).map((r) => new Player(r.name, r.role));
  if (g.scenario === "The Plants Close") for (const p of g.players) p.trust = 1;
  if (g.chapter) carryPlayers(g);
  for (const p of g.players) p.face = g.render ? K.FACE_TOKENS : 0;
  if (g.carry?.rally && !g.overlord && !g.chapter && !g.party) for (const p of g.players) p.trust = Math.min(K.MAX_TRUST, p.trust + 1);
  if (g.overlord) g.players.push(new Player("The Owner", "Overlord"));
  return g;
}

/** A chapter's (and the family's) effects on the players, at setup. */
function carryPlayers(g: Game) {
  const ch = g.chapter!;
  const every = (v: number) => perDistrict(() => v);
  for (const p of g.players) {
    if (ch.no_read) p.sight = every(0);
    if (ch.start_trust !== undefined && ch.start_trust !== null) p.trust = ch.start_trust;
    if (ch.history_twice) p.historyLeft = 2;
  }
  if (ch.key === "THE_MAP" && g.decided("UP_NORTH") === "SCHOOL")
    for (const p of g.players) if (p.role === "Student") p.sight = perDistrict((d) => Math.max(1, p.sight[d]));
  if (ch.key === "VOICE" && g.decided("THE_MAP") === "MOVE")
    for (const p of g.players)
      if (p.role === "Elder") {
        p.sight = every(0);
        p.elderUsed = true;
        p.historyLeft = 0;
      }
  if (ch.key === "PLANTS_CLOSE" && g.decided("VOICE") === "ORGANIZE") for (const p of g.players) if (p.role === "Organizer") p.trust = K.MAX_TRUST;
  if (ch.key === "TODAY" && g.decided("PLANTS_CLOSE") === "SELL") for (const p of g.players) p.trust = Math.min(K.MAX_TRUST, p.trust + 2);
  if (ch.key === "B1_CROWN") {
    if (g.flag("TERRELL")) for (const p of g.players) p.trust = Math.max(0, p.trust - 1);
    const q = g.campaign.quit_desk ?? "";
    for (const p of g.players) if (p.name === q) p.sight = perDistrict((d) => Math.max(1, p.sight[d]));
  }
  if (g.campaign.rally && ch.campaign === "LEDGER") for (const p of g.players) p.trust = Math.min(K.MAX_TRUST, p.trust + 1);
}
