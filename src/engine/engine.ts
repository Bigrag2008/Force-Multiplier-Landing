/**
 * THE SECOND NUMBER — rules engine, TypeScript port of game/sn_engine.py.
 *
 * The Python engine is the source of truth (balance tester, rule checks). This port
 * mirrors it method for method and must reproduce its golden games exactly
 * (tests/parity.test.ts). Change both together, then run `npm run golden && npm test`.
 */
import { C, DISTRICTS, K, type Card, type Chapter, type Choice, type District, type HistoryCard, type PlaceKey } from "./content";
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
  | { k: "face"; d: District; choice: Choice; card?: Card }
  | { k: "teach"; t: Player; d: District; response?: boolean }
  | { k: "commons"; place: PlaceKey }
  | { k: "reach"; t: Player }
  | { k: "history"; d: District }
  | { k: "trace"; d: District }
  | { k: "expose_uw" }
  | { k: "league" }
  | { k: "m_extract"; d: District }
  | { k: "m_obscure"; d: District }
  | { k: "m_tempt"; t: Player | null }
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
  freeTeach = false;
  shopAround = false;
  practice = false;
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

  constructor(o: GameOptions = {}) {
    this.rng = new Rng(o.seed ?? Math.floor(Math.random() * 2 ** 31));
    this.chapter = o.chapter ? C.chapters[o.chapter] : null;
    this.overlord = !!o.overlord;
    this.ownerShown = this.overlord;
    const ch = this.chapter;
    this.scenario = ch ? `Chapter ${ch.number}: ${ch.title}` : o.scenario || this.rng.choice(Object.keys(C.scenarios));
    this.deck = Object.fromEntries(DISTRICTS.map((d) => [d, (ch && ch.decks[d]) || C.deck[d]])) as Record<District, Card[]>;
    if (ch) for (const [d, p] of Object.entries(ch.pressure)) this.pressure[d as District] = p as number;
    const start: Record<string, Partial<Record<District, number>>> = {
      "The Eviction Wave": { HOUSING: 2 },
      "The Closure": { EDUCATION: 3 },
      "The Plants Close": { LABOR: 2 },
      "The Hospital Closes": { HEALTH: 2 },
    };
    for (const [d, p] of Object.entries(start[this.scenario] || {})) this.pressure[d as District] = p as number;
    this.grace = this.scenario === "The Audit" ? 1 : 0;
    this.owner = this.overlord ? "The Overlord" : ch ? ch.owner : o.owner || this.rng.choice(Object.keys(C.owners));
    this.ownerFace = ch && !this.overlord ? ch.face : this.owner;
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
    return K.ACTIONS[this.n()];
  }
  totalClarity() {
    return DISTRICTS.reduce((s, d) => s + this.clarity[d], 0);
  }
  awake() {
    return DISTRICTS.filter((d) => this.clarity[d] >= K.WAKE).length;
  }
  captured() {
    return DISTRICTS.filter((d) => this.pressure[d] >= K.CAPTURE).length;
  }
  gripped(d: District) {
    return this.pressure[d] >= K.GRIP;
  }
  activePatterns() {
    return C.patterns.filter((p) => p.combo.every((d) => this.gripped(d)));
  }
  threadsNeeded() {
    return K.THREADS_TO_WIN;
  }
  canTrace(pl: Player, d: District) {
    return this.uwOpen && pl.sight[d] >= 3 && this.clarity[d] >= K.WAKE && !this.threads.has(d);
  }
  canExpose() {
    return this.uwOpen && this.threads.size >= this.threadsNeeded();
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
    return this.rng.choice(this.deck[d]);
  }
  startTurn(pl: Player) {
    pl.freeTeach = false;
    pl.shopAround = false;
    pl.practice = false;
  }
  dealsFor(pl: Player, d: District) {
    if (pl.shopAround) {
      pl.shopAround = false;
      return this.rng.sample(this.deck[d], 2);
    }
    return [this.draw(d)];
  }
  face(pl: Player, d: District, choice: Choice, card?: Card) {
    card = card || this.draw(d);
    const trap = card.trap;
    const lever = this.lever(d, card);
    const see = pl.sight[d];
    this.emit(`${pl.name} faces a deal in ${d}: "${card.front}"  → ${choice}`);
    if (choice === "TAKE") {
      if (!trap) {
        pl.trust += 2;
        this.clarity[d] = Math.min(K.WAKE, this.clarity[d] + 1);
        pl.legend += 1;
        this.emit(`  It was an HONEST deal — real help. Trust +2, ${d} clarity +1, Props +1.`);
      } else {
        const cost = this.takeCost();
        pl.corruption += cost;
        if (this.pressure[d] > 0) {
          this.pressure[d] = Math.max(0, this.pressure[d] - 2);
          this.emit(`  TAKE the trap to patch ${d} NOW: Squeeze −2… Shady +${cost} on you. (Props +0)`);
        } else {
          this.clarity[d] = Math.min(K.WAKE, this.clarity[d] + 2);
          this.emit(`  TAKE the trap for fast power: ${d} clarity +2… Shady +${cost} on you. (Props +0)`);
        }
      }
    } else if (choice === "WALK") {
      if (trap) this.emit(`  WALK: you dodged a trap. Safe, nothing gained.`);
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
      if (trap && see >= lever) {
        const amt = pl.role === "Organizer" ? 2 : 1;
        this.pressure[d] = Math.max(0, this.pressure[d] - amt);
        this.clarity[d] = Math.min(K.WAKE, this.clarity[d] + 1);
        pl.legend += 2;
        this.emit(
          `  NEGOTIATE on the ${LEVER_NAME[lever]} lever (Read ${see}): defused. ` +
            `Squeeze −${amt}, ${d} clarity +1, Props +2.`,
        );
      } else if (trap) {
        this.pressure[d] = Math.min(K.CAPTURE, this.pressure[d] + 1);
        this.emit(
          `  NEGOTIATE without the ${LEVER_NAME[lever]} layer (Read ${see}): you got played. ` +
            `Squeeze +1, Trust −${cost}.`,
        );
        if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
      } else {
        this.emit(`  NEGOTIATE on an honest deal: you haggled away real help. Trust −${cost}.`);
      }
    }
    pl.trust = Math.min(pl.trust, K.MAX_TRUST);
    if (pl.corruption >= K.FLIP && !pl.flipped) {
      pl.flipped = true;
      this.emit(`  ⚠⚠ ${pl.name} HAS FALLEN. The Machine now moves through them.`);
    }
  }
  teach(pl: Player, t: Player, d: District, response = true) {
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
    this.emit(`${pl.name} teaches ${t.name} to read ${d}. Read ${old}→${t.sight[d]}${free ? " (free)" : ""}. Props +2.`);
    if (response) {
      pl.legend += 1;
      t.legend += 1;
      this.emit(`  Call and response: ${t.name} says the second number back. Props +1 each.`);
    }
  }
  commons(pl: Player, place: PlaceKey = "BARBERSHOP") {
    if (place === "KITCHEN" && this.kitchenUsed) place = "BARBERSHOP";
    pl.trust = Math.min(K.MAX_TRUST, pl.trust + 2);
    const drop = place === "CHURCH" ? 2 : 1;
    const had = pl.corruption;
    pl.corruption = Math.max(0, pl.corruption - drop);
    const P = C.places[place];
    this.emit(
      `${pl.name} gathers at ${P.name} (${P.where}). Trust +2` + (had ? `, Shady −${had - pl.corruption}` : "") + ".",
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
    const d = (pick ? pick(pl) : null) || maxBy(DISTRICTS, (x) => this.pressure[x]);
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
    const d = maxBy(DISTRICTS, (x) => [best[x] - pl.sight[x], b(this.clarity[x] >= K.WAKE)]);
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
      const d = (picks && picks[pl.name]) || this.cookoutGain(pl)[0];
      const old = pl.sight[d];
      pl.sight[d] = Math.max(old, best[d]);
      this.emit(`  ${pl.name}: Trust +2, Shady −1, Props +1` + (pl.sight[d] > old ? `, Read in ${d} ${old}→${pl.sight[d]}.` : "."));
    }
  }
  cookoutAi() {
    if (this.cookoutUsed || Math.max(...DISTRICTS.map((d) => this.pressure[d])) >= K.CAPTURE - 1) return false;
    const act = this.active();
    const gain = act.reduce((s, p) => s + this.cookoutGain(p)[1], 0);
    return gain >= act.length * this.actions() * 0.75;
  }
  sousouAi() {
    return DISTRICTS.some((d) => 0 < this.pressure[d]) && this.active().every((p) => p.trust >= 2);
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
    pl.elderUsed = true;
    this.clarity[d] = K.WAKE;
    pl.legend += 2;
    const h = (this.historyCard = this.rng.choice([...C.history[d], ...C.history.ANY]));
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
      this.emit(`[${who}] feeds the Machine in ${d}. Squeeze ${this.pressure[d]}/${K.CAPTURE}.`);
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
        this.emit(`[${who}] can't bury ${d} — the block is awake there.`);
        return;
      }
      this.covered = true;
    }
    if (this.clarity[d] > 0) {
      this.struck.add(d);
      this.clarity[d] -= 1;
      this.emit(`[${who}] buries the second number in ${d}. Clarity −1.`);
    }
  }
  mTempt(who: string, t: Player | null) {
    if (t && t.trust > 0) {
      t.trust -= 1;
      this.emit(`[${who}] whispers a sweeter deal to ${t.name}. Trust −1.`);
    }
  }
  machineAiMove(struck: Set<District> = new Set()): Action {
    let free = DISTRICTS.filter((d) => !struck.has(d));
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
    if (this.overlord) return;
    const o = this.owner;
    if (o === "The Lobbyist") {
      const best = DISTRICTS.filter(
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
      for (const p of this.active()) for (const d of DISTRICTS) if (p.sight[d] > 0) pool.push([p, d]);
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
    this.emit(`  ✖ The Machine extracts from ${d}. Squeeze ${this.pressure[d]}/${K.CAPTURE}.`);
    if (this.pressure[d] >= K.CAPTURE) this.emit(`  ✖ ${d} CAPTURED.`);
  }
  autoMachinePhase() {
    const h = K.MACHINE_HITS[this.n()];
    let hits = Math.floor(h) + (h % 1 && this.round % 2 === 0 ? 1 : 0);
    if (this.owner === "The Algorithm") hits += 1;
    if (this.ownerShown) hits += 1;
    const struck = this.struck;
    if (this.scenario === "Payday Season" && this.round % 2 === 0 && !struck.has("LENDING") && this.pressure.LENDING < K.CAPTURE) {
      struck.add("LENDING");
      this.emit(`  ✖ Payday Season: payday again — an extra LENDING hit.`);
      this.hit("LENDING");
    }
    for (let i = 0; i < Math.max(0, hits); i++) {
      const vuln = DISTRICTS.filter((d) => this.clarity[d] < K.WAKE && this.pressure[d] < K.CAPTURE && !struck.has(d));
      if (!vuln.length) break;
      const d = maxBy(vuln, (x) => [this.clarity[x], -this.pressure[x]]);
      struck.add(d);
      this.hit(d);
    }
    const building = DISTRICTS.filter((d) => 0 < this.clarity[d] && this.clarity[d] < K.WAKE && !struck.has(d));
    if (building.length) {
      const d = maxBy(building, (x) => this.clarity[x]);
      this.clarity[d] -= 1;
      struck.add(d);
      this.emit(`  ✖ The Machine muddies ${d}. Clarity −1.`);
    }
    if (this.ownerShown) {
      const exp = DISTRICTS.filter((d) => this.clarity[d] >= K.WAKE && !this.threads.has(d) && !struck.has(d));
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
    if (this.owner === "The Lobbyist") {
      const awake = DISTRICTS.filter((d) => this.clarity[d] >= K.WAKE);
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
      case "study": return this.study(pl, a.d);
      case "face": return this.face(pl, a.d, a.choice, a.card);
      case "teach": return this.teach(pl, a.t, a.d, a.response ?? true);
      case "commons": return this.commons(pl, a.place || "BARBERSHOP");
      case "reach": return this.reach(pl, a.t);
      case "history": return this.history(pl, a.d);
      case "trace": return this.trace(pl, a.d);
      case "expose_uw": return this.exposeUw(pl);
      case "league": return this.signLeague(pl);
      case "m_extract": return this.mExtract(pl.name, a.d);
      case "m_obscure": return this.mObscure(pl.name, a.d);
      case "m_tempt": return this.mTempt(pl.name, a.t);
      case "pass": return;
    }
  }

  // ================= BLOCK AI =================
  botChoice(pl: Player, d: District, card: Card, style: Style = "careful"): Choice {
    const see = pl.sight[d];
    const safe = pl.corruption + this.takeCost() < K.FLIP;
    const urgent = this.pressure[d] >= K.CAPTURE - 1;
    if (see >= 1) {
      if (!card.trap) return "TAKE";
      if (see >= card.lever && pl.trust >= this.negCost(d)) return "NEGOTIATE";
      if (style === "greedy" && pl.corruption + this.takeCost() < K.FLIP + 2) return "TAKE";
      if (style === "careful" && urgent && safe) return "TAKE";
      return "WALK";
    }
    if (style === "greedy" || (style === "careful" && urgent && safe)) return "TAKE";
    return "WALK";
  }
  botFace(pl: Player, d: District, style: Style): Action {
    const score = (c: Card) => (pl.sight[d] < 1 ? 0 : !c.trap ? 2 : pl.sight[d] >= c.lever ? 3 : 0);
    const card = maxBy(this.dealsFor(pl, d), score);
    return { k: "face", d, choice: this.botChoice(pl, d, card, style), card };
  }
  botPlace(pl: Player): PlaceKey {
    const act = this.active();
    if (pl.corruption >= 2) return "CHURCH";
    if (!this.kitchenUsed && act.reduce((s, p) => s + p.trust, 0) <= act.length) return "KITCHEN";
    if (this.uwOpen && DISTRICTS.some((x) => pl.sight[x] < 3 && this.clarity[x] >= K.WAKE && !this.threads.has(x)))
      return "ADVENTURE";
    if (act.some((p) => p !== pl && DISTRICTS.some((x) => p.sight[x] < pl.sight[x]))) return "BARBERSHOP";
    if (DISTRICTS.some((x) => pl.sight[x] === 0 && this.clarity[x] < K.WAKE)) return "ADVENTURE";
    return "MARKET";
  }
  blockAi(pl: Player, style: Style = "careful"): Action {
    if (style === "human") style = this.rng.random() < 0.2 ? "greedy" : "careful";
    if (this.canExpose()) return { k: "expose_uw" };
    for (const d of DISTRICTS) if (this.canTrace(pl, d)) return { k: "trace", d };
    const fallen = this.blk().filter((p) => p.flipped);
    if (fallen.length && pl.trust >= 2 && Math.max(...DISTRICTS.map((d) => this.pressure[d])) < K.CAPTURE - 1)
      return { k: "reach", t: fallen[0] };
    if (pl.corruption >= K.FLIP - 2 && style !== "greedy") return { k: "commons", place: this.botPlace(pl) };
    if (pl.trust < K.NEG_COST) return { k: "commons", place: this.botPlace(pl) };
    const hot = DISTRICTS.filter((d) => this.pressure[d] >= K.CAPTURE - 1 && this.clarity[d] < K.WAKE).sort(
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
      const openD = DISTRICTS.filter((d) => this.clarity[d] >= K.WAKE && !this.threads.has(d));
      if (openD.length) {
        const d = maxBy(openD, (x) => pl.sight[x]);
        const learner = this.active().find((p) => p !== pl && p.sight[d] < pl.sight[d]);
        if (pl.sight[d] >= 2 && learner && (pl.role === "Translator" || pl.trust >= 2)) return { k: "teach", t: learner, d };
        return { k: "study", d };
      }
    }
    const building = DISTRICTS.filter((d) => this.clarity[d] < K.WAKE);
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
    if (!this.uwOpen && this.totalClarity() >= K.UNDERWORLD_AT) this.openUnderworld();
  }
  machinePhase(overlordMove?: () => Action): string | null {
    this.leagueRound();
    const ov = this.ov();
    if (this.overlord && ov) {
      const moves = this.overlordMoveCount();
      for (let i = 0; i < moves; i++) this.do(ov, overlordMove ? overlordMove() : this.machineAiMove(this.struck));
      this.tighten();
    } else if (this.grace > 0) {
      this.grace -= 1;
      this.emit("  (The Machine is distracted — grace round.)");
    } else {
      this.autoMachinePhase();
      this.tighten();
    }
    this.checkPatterns();
    return this.checkEnd();
  }
  // ---- web-only glue (not in the Python engine): a person playing the Overlord moves one at a time ----
  overlordMoveCount() {
    const m = K.OVERLORD_MOVES[this.n()];
    return Math.floor(m) + (m % 1 && this.round % 2 === 0 ? 1 : 0);
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
  }
  runAuto(maxRounds?: number, style: Style = "careful") {
    maxRounds = maxRounds || K.MAX_ROUNDS;
    while (this.round < maxRounds && !this.won) {
      this.beginRound();
      const feast = this.cookoutAi();
      if (feast) this.cookout();
      for (const pl of this.players) {
        if (pl.role === "Overlord") continue;
        if (pl.flipped) this.fallenTurn(pl, this.actions());
        else if (feast) continue;
        else {
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
  chapterResult(): ChapterResult {
    const won = this.result === "BLOCK_WIN";
    const awake = DISTRICTS.filter((d) => this.clarity[d] >= K.WAKE);
    const captured = DISTRICTS.filter((d) => this.pressure[d] >= K.CAPTURE);
    const falls = this.log.filter((l) => l.includes("HAS FALLEN")).length;
    const reaches = this.log.filter((l) => l.includes("pulls them home")).length;
    let ledger = won ? 2 + awake.length : -2 - captured.length;
    ledger += reaches - falls;
    const redlining = this.activePatterns().some((p) => p.name === "REDLINING");
    const unlocks: string[] = [];
    if (this.chapter) {
      unlocks.push(...this.chapter.unlocks_always);
      if (this.leagueFormed && won) unlocks.push(...this.chapter.unlocks_if_league_won);
    }
    return { won, ledger, rebuilt: awake, scarred: captured, falls, reaches, league: this.leagueFormed, redlining_broken: !redlining, unlocks, rally: !won };
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
  if (o.overlord) g.players.push(new Player("The Owner", "Overlord"));
  return g;
}
