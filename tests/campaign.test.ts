/**
 * Whole campaigns, chapter by chapter, recorded from the Python engine and game/campaign.py
 * (scripts/make_golden.py): every chapter's result and the family record after it must match.
 */
import { describe, expect, it } from "vitest";
import runs from "./campaigns.json";
import { advance, letGo, newState } from "../src/engine/campaign";
import { C, type District } from "../src/engine/content";
import { newGame, type CampaignState, type ChapterResult } from "../src/engine/engine";

interface Step { chapter: string; seed: number; roster: string[][]; letgo: District | null; decision: string | null; result: ChapterResult; state: CampaignState }
interface Run { campaign: "LEDGER" | "BOOK_ONE"; players: number; steps: Step[] }

describe("a family's record carries between chapters exactly as in Python", () => {
  for (const run of runs as unknown as Run[]) {
    it(`${run.campaign} with ${run.players} players`, () => {
      let st = newState(run.campaign);
      for (const step of run.steps) {
        if (C.chapters[step.chapter].defend_choice) st = letGo(st, step.letgo);
        const g = newGame({ chapter: step.chapter, campaign: st, seed: step.seed, roster: step.roster.map(([name, role]) => ({ name, role })) });
        g.runAuto(undefined, "careful");
        const res = g.chapterResult();
        expect(res, step.chapter).toEqual(step.result);
        st = advance(st, step.chapter, res, step.decision);
        expect(st, step.chapter).toEqual(step.state);
      }
    });
  }
});

