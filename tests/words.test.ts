/** Engine and card-data text reaches the screen in the game's plain names. */
import { describe, expect, it } from "vitest";
import { say } from "../src/game/words";

describe("Plain names", () => {
  it("translates the engine's words", () => {
    expect(say("NEGOTIATE on the red lever (Sight 2): defused. Pressure −1, HOUSING clarity +1, Legend +2.")).toBe(
      "NEGOTIATE on the red lever (Read 2): defused. Squeeze −1, HOUSING clarity +1, Props +2.",
    );
    expect(say("TAKE the trap: Corruption +2 on you.")).toBe("TAKE the trap: Shady +2 on you.");
    expect(say("Housing starts under siege (2 pressure).")).toBe("Housing starts under siege (2 squeeze).");
  });
  it("leaves other words alone", () => {
    expect(say("Most Legendary: the Sightline Corruptions")).toBe("Most Legendary: the Sightline Corruptions");
  });
});
