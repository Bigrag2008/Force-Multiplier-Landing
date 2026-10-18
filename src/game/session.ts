/**
 * The round-by-round flow of a game played in the browser (hotseat: one device,
 * passed around the table). It mirrors second_number_play.py's Table class, but as a
 * state machine the UI can step through, waiting for a person at every decision.
 */
import { K, type District } from "../engine/content";
import { newGame, type Action, type Game, type Player } from "../engine/engine";

export type Mode = "coop" | "overlord" | "chapter";
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
}

export class Session {
  g: Game;
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

  constructor(public config: SessionConfig) {
    this.g = newGame({
      overlord: config.mode === "overlord",
      chapter: config.mode === "chapter" ? "THE_MAP" : undefined,
      scenario: config.mode === "coop" ? config.scenario || undefined : undefined,
      roster: config.roster,
      seed: config.seed,
    });
    this.overlordHuman = !!config.overlordHuman;
    this.coach = !!config.coach;
    this.g.useGreenBook = () => this.autoGreenBook;
    this.startRound();
  }

  get player(): Player {
    return this.g.players[this.seat];
  }

  // ---------- round start ----------
  cookoutAvailable() {
    const g = this.g;
    return !g.cookoutUsed && g.active().length > 0 && Math.max(...Object.values(g.pressure)) < K.CAPTURE - 1;
  }
  private startRound() {
    const g = this.g;
    if (g.round >= K.MAX_ROUNDS) {
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
    if (this.g.active().some((p) => p.trust >= 1)) this.phase = "sousou";
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
