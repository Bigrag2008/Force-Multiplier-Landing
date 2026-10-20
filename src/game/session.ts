/**
 * The round-by-round flow of a game played in the browser (hotseat: one device,
 * passed around the table). It mirrors second_number_play.py's Table class, but as a
 * state machine the UI can step through, waiting for a person at every decision.
 */
import { K, type Card, type District } from "../engine/content";
import type { Edition } from "../engine/edition";
import { newGame, type Action, type Carry, type Game, type Player } from "../engine/engine";
import { cardFromWire, fromWire, type Move, type WireAction } from "./moves";

export type Mode = "coop" | "overlord" | "chapter" | "party";
export type Phase =
  | "cookout" // round start: call the Cookout?
  | "turn" // a block player's actions
  | "fallen" // the Machine moves through a Fallen player
  | "sousou" // end of turns: throw a hand?
  | "overlord" // a person plays the Overlord's moves
  | "machine" // the Machine has moved: read what happened
  | "over";

export interface SessionConfig {
  mode: Mode;
  roster: { name: string; role: string }[];
  scenario?: string;
  overlordHuman?: boolean;
  seed?: number;
  /** the Coach recommends moves and teaches the rules as they come up */
  coach?: boolean;
  /** house rules: the fine-print die, the Terrell rule, endless deals */
  finePrint?: boolean;
  terrell?: boolean;
  endless?: boolean;
  /** the math variant: at Read 1, work out an endless deal's second number before you see it */
  math?: boolean;
  /** "sign now" deals count down while you decide (on unless turned off) */
  clocks?: boolean;
  /** a Your City edition (the whole edition travels with the game, so saves and phones get it too) */
  edition?: Edition;
  /** house rules: Close reads, "Render?" */
  partial?: boolean;
  render?: boolean;
  /** a block that remembers: keep this game for the next one, and what this one starts with (full co-op only) */
  remember?: boolean;
  carry?: Carry;
}

/** a card drawn and waiting on the current player: kept in the session, so a reload can't redraw it */
export type Pending = { k: "deal"; d: District; cards: Card[] } | { k: "teach"; to: string; d: District; card: Card } | null;

export class Session {
  g: Game;
  /** every move so far: with the config, the whole game (see moves.ts) */
  moves: Move[] = [];
  pending: Pending = null;
  phase: Phase = "turn";
  /** index into g.players of whose turn it is */
  seat = 0;
  actionsLeft = 0;
  movesLeft = 0;
  feast = false;
  autoGreenBook = true;
  overlordHuman: boolean;
  /** first log line of the current step, so the UI can show "what just happened" */
  stepStart = 0;
  endMessage: string | null = null;
  coach: boolean;
  /** the Coach's lessons this table has already read */
  seenLessons = new Set<string>();
  /** online: the room this game is hosted in (kept in the save, so a continued game reopens it) */
  room?: string;
  /** "sign now" deals: decisions made with the fake clock running, deadlines waited out, and traps signed in the rush */
  clock = { rushed: 0, waited: 0, rushedDollars: 0 };

  constructor(public config: SessionConfig) {
    // fix the seed now, so a save or another phone can rebuild this exact game
    if (config.seed === undefined) this.config = config = { ...config, seed: Math.floor(Math.random() * 2 ** 31) };
    this.g = newGame({
      overlord: config.mode === "overlord",
      chapter: config.mode === "chapter" ? "THE_MAP" : undefined,
      scenario: config.mode === "coop" ? config.scenario || undefined : undefined,
      roster: config.roster,
      seed: config.seed,
      party: config.mode === "party",
      finePrint: !!config.finePrint,
      terrell: !!config.terrell,
      endless: !!config.endless,
      edition: config.edition,
      partial: !!config.partial,
      render: !!config.render,
      carry: config.mode === "coop" ? config.carry : undefined,
    });
    this.overlordHuman = !!config.overlordHuman;
    this.coach = !!config.coach;
    this.g.useGreenBook = () => this.autoGreenBook;
    this.startRound();
  }

  /** rebuild a game from its config and moves */
  static replay(config: SessionConfig, moves: Move[]) {
    const s = new Session(config);
    for (const m of moves) if (!s.apply(m)) throw new Error(`Move ${s.moves.length + 1} doesn't fit this game: ${JSON.stringify(m)}`);
    return s;
  }

  /** Is this move allowed right now? (online, every phone's move is checked by the host) */
  allowed(m: Move): boolean {
    switch (m.t) {
      case "cookout": return this.phase === "cookout";
      case "end": return this.phase === "turn";
      case "act": {
        if (this.phase !== "turn") return false;
        const pd = this.pending;
        if (!pd) return true;
        // with a card drawn, the only move is the one that card is for
        if (pd.k === "deal") return m.a.k === "face" && m.a.d === pd.d && !!m.a.card && pd.cards.includes(cardFromWire(this.g, m.a.card));
        return m.a.k === "teach" && m.a.t === pd.to && m.a.d === pd.d;
      }
      case "deal": return this.phase === "turn" && this.pending === null;
      case "teachCard": return this.phase === "turn" && this.pending === null && this.g.players.some((p) => p.name === m.to);
      case "fallen": return this.phase === "fallen";
      case "sousou": return this.phase === "sousou";
      case "overlord": return this.phase === "overlord";
      case "next": return this.phase === "machine";
      case "greenbook": return this.phase !== "over";
    }
  }

  /** make a move and record it; false (and nothing changes) if it isn't allowed now */
  apply(m: Move): boolean {
    if (!this.allowed(m)) return false;
    const g = this.g;
    switch (m.t) {
      case "cookout": this.cookout(m.call, m.picks); break;
      case "act": this.pending = null; this.countClock(m.a); this.act(fromWire(g, m.a)); break;
      case "end": this.pending = null; this.endTurn(); break;
      case "deal": this.pending = { k: "deal", d: m.d, cards: g.dealsFor(this.player, m.d) }; break;
      case "teachCard": this.pending = { k: "teach", to: m.to, d: m.d, card: g.draw(m.d) }; break;
      case "fallen": this.fallenAct(fromWire(g, m.a)); break;
      case "sousou": this.sousou(m.hand, m.d); break;
      case "overlord": this.overlordAct(fromWire(g, m.a)); break;
      case "next": this.nextRound(); break;
      case "greenbook": this.autoGreenBook = m.on; break;
    }
    this.moves.push(m);
    return true;
  }

  /** the record of "sign now" clocks, carried on the decision itself so every phone and every save agrees */
  private countClock(a: WireAction) {
    if (a.k !== "face" || !a.clock) return;
    this.clock[a.clock] += 1;
    const card = a.card ? cardFromWire(this.g, a.card) : null;
    if (a.clock === "rushed" && a.choice === "TAKE" && card?.trap) this.clock.rushedDollars += card.dollars ?? 0;
  }

  get player(): Player {
    return this.g.players[this.seat];
  }

  // ---------- round start ----------
  cookoutAvailable() {
    const g = this.g;
    return !g.party && !g.cookoutUsed && g.active().length > 0 && Math.max(...Object.values(g.pressure)) < K.CAPTURE - 1;
  }
  private startRound() {
    const g = this.g;
    if (g.round >= g.maxRounds) {
      g.timeUp();
      return this.finish("The clock ran out. The Machine holds the block.");
    }
    g.beginRound();
    this.feast = false;
    this.stepStart = g.log.length;
    if (this.cookoutAvailable()) this.phase = "cookout";
    else this.beginSeat(0);
  }
  /** answer the Cookout question at the start of a round */
  cookout(call: boolean, picks?: Record<string, District>) {
    if (this.phase !== "cookout") return;
    if (call) {
      this.g.cookout(picks);
      this.feast = true;
    }
    this.beginSeat(0);
  }

  // ---------- seats ----------
  private beginSeat(i: number) {
    const g = this.g;
    for (; i < g.players.length; i++) {
      const p = g.players[i];
      if (p.role === "Overlord") continue;
      if (p.flipped) {
        this.seat = i;
        this.phase = "fallen";
        const mult = g.owner === "The Debt Buyer" && !g.overlord ? 2 : 1;
        this.movesLeft = g.actions() * mult;
        return;
      }
      if (this.feast) continue;
      if (p.benched) {
        p.benched = false;
        g.emit(`${p.name} sits this turn out.`);
        continue;
      }
      this.seat = i;
      this.phase = "turn";
      this.actionsLeft = g.actions();
      g.startTurn(p);
      return;
    }
    this.afterTurns();
  }
  private nextSeat() {
    this.beginSeat(this.seat + 1);
  }

  /** a block player's action */
  act(a: Action) {
    if (this.phase !== "turn") return;
    const p = this.player;
    this.g.do(p, a);
    this.actionsLeft -= 1;
    if (this.g.won) return this.finish(null);
    if (this.actionsLeft <= 0 || p.flipped) this.nextSeat();
  }
  /** give up the rest of this turn */
  endTurn() {
    if (this.phase === "turn") this.nextSeat();
  }
  /** a Machine move made through a Fallen player */
  fallenAct(a: Action) {
    if (this.phase !== "fallen") return;
    this.g.do(this.player, a);
    this.movesLeft -= 1;
    if (this.movesLeft <= 0) this.nextSeat();
  }

  // ---------- after the block's turns ----------
  private afterTurns() {
    this.stepStart = this.g.log.length;
    if (!this.g.party && this.g.active().some((p) => p.trust >= 1)) this.phase = "sousou";
    else this.toMachine();
  }
  /** will throwing a hand now pay out? (then the UI asks which district) */
  sousouWouldPay() {
    return this.g.pot + this.g.active().filter((p) => p.trust >= 1).length >= K.SOUSOU_HAND;
  }
  sousou(throwHand: boolean, district?: District) {
    if (this.phase !== "sousou") return;
    if (throwHand) this.g.throwHand(() => district ?? null);
    this.toMachine();
  }
  private toMachine() {
    const g = this.g;
    g.endOfBlockTurns();
    if (g.overlord && this.overlordHuman) {
      g.leagueRound();
      this.movesLeft = g.overlordMoveCount();
      this.phase = "overlord";
      return;
    }
    const end = g.machinePhase();
    this.phase = "machine";
    if (end) this.finish(end);
  }
  /** a person playing the Overlord makes one move */
  overlordAct(a: Action) {
    if (this.phase !== "overlord") return;
    const ov = this.g.ov();
    if (ov) this.g.do(ov, a);
    this.movesLeft -= 1;
    if (this.movesLeft <= 0) {
      const end = this.g.finishOverlordPhase();
      this.phase = "machine";
      if (end) this.finish(end);
    }
  }
  /** after reading the Machine phase */
  nextRound() {
    if (this.phase === "machine") this.startRound();
  }

  private finish(msg: string | null) {
    this.phase = "over";
    this.endMessage = msg;
  }
}
