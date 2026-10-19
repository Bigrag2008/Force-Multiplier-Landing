/**
 * The game's plain-spoken names. The rules engine (and the Python engine it must match line for line)
 * still writes Sight, Corruption, Pressure and Legend, so text from the engine and the card data is
 * translated on its way to the screen.
 */
const WORDS: [RegExp, string][] = [
  [/\bSight\b/g, "Read"],
  [/\bSIGHT\b/g, "READ"],
  [/\bCorruption\b/g, "Shady"],
  [/\bCORRUPTION\b/g, "SHADY"],
  [/\bPressure\b/g, "Squeeze"],
  [/\bPRESSURE\b/g, "SQUEEZE"],
  [/\bpressure\b/g, "squeeze"],
  [/\bLegend\b/g, "Props"],
  [/\bLEGEND\b/g, "PROPS"],
];

export function say(text: string): string {
  let out = text;
  for (const [from, to] of WORDS) out = out.replace(from, to);
  return out;
}
