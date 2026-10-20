/** Hearing from players: clean answers, no names, and nothing leaves the device unless a Sheet is connected. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { C } from "../src/engine/content";
import { factsOf, loadFeedback, makeFeedback, submitFeedback } from "../src/game/feedback";
import { Session } from "../src/game/session";

const store: Record<string, string> = {};
(globalThis as unknown as { window: unknown }).window = { localStorage: { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => void (store[k] = v) } };
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.restoreAllMocks();
});

function finished() {
  const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 7, scenario: "A Quiet Year" });
  for (let i = 0; i < 4000 && s.phase !== "over"; i++) {
    const g = s.g;
    if (s.phase === "cookout") s.cookout(false);
    else if (s.phase === "turn") s.act(g.blockAi(s.player, "careful"));
    else if (s.phase === "fallen") s.fallenAct(g.machineAiMove(g.struck));
    else if (s.phase === "sousou") s.sousou(false);
    else if (s.phase === "machine") s.nextRound();
  }
  return s;
}

describe("feedback", () => {
  it("records how the game went, never who played it", () => {
    const s = finished();
    const f = factsOf(s);
    expect(f).toMatchObject({ mode: "coop", players: 3, chapter: null, edition: "west-dayton" });
    const text = JSON.stringify(f);
    for (const p of s.g.players) expect(text).not.toContain(p.name);
  });
  it("keeps only the known chips, a short note, numbers in range", () => {
    const fb = makeFeedback("g1", 9, ["lever", "lever", "hack", "nothing"], "sure", "  a   lot\nof   words " + "x".repeat(400), factsOf(finished()));
    expect(fb.fun).toBe(4);
    expect(fb.confusing).toEqual(["lever", "nothing"]);
    expect(fb.again).toBe("maybe");
    expect(fb.note.length).toBe(280);
    expect(fb.note.startsWith("a lot of words")).toBe(true);
  });
  it("with no Sheet connected, nothing is sent: the answer is kept on the device", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const fb = makeFeedback("g2", 3, ["glasses"], "yes", "", factsOf(finished()));
    expect(await submitFeedback(fb, "")).toBe("kept");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loadFeedback().map((x) => x.id)).toEqual(["g2"]);
  });
  it("with a Sheet, it's posted once per game (answering again replaces it)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(""));
    const facts = factsOf(finished());
    await submitFeedback(makeFeedback("g3", 2, [], "no", "", facts), "https://script.google.com/macros/s/x/exec");
    expect(await submitFeedback(makeFeedback("g3", 4, [], "yes", "", facts), "https://script.google.com/macros/s/x/exec")).toBe("sent");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const [, init] = fetchSpy.mock.calls[1];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body)).fun).toBe(4);
    expect(loadFeedback()).toHaveLength(1);
    expect(loadFeedback()[0]).toMatchObject({ id: "g3", fun: 4, sent: true });
  });
  it("if sending fails, the answer is kept, not lost", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    expect(await submitFeedback(makeFeedback("g4", 3, [], "yes", "", factsOf(finished())), "https://x/exec")).toBe("failed");
    expect(loadFeedback()[0]).toMatchObject({ id: "g4" });
    expect(loadFeedback()[0].sent).toBeUndefined();
  });
});
