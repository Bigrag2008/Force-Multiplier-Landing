import { C, type District } from "../engine/content";
import { DISTRICT_NAMES_ES, getLang } from "../i18n";

export const DISTRICT_COLOR = C.districtColors;
export const LAYER_COLOR: Record<number, string> = { 1: "#E63946", 2: "#E0A526", 3: "#2F8FD8" };
export const LAYER_LABEL: Record<number, string> = { 1: "The cost", 2: "The clock", 3: "The connection" };
export const LEVER_WORD: Record<number, string> = { 1: "RED", 2: "AMBER", 3: "BLUE" };
/** "LENDING" → "Lending" (or "Préstamos" in Spanish): a district key, shown as a name */
export const titleCase = (d: District | string) => {
  const s = getLang() === "es" && d in DISTRICT_NAMES_ES ? DISTRICT_NAMES_ES[d as District] : d;
  return s.charAt(0) + s.slice(1).toLowerCase();
};

/** WCAG relative luminance of a #rrggbb color */
function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
/** white or dark ink, whichever reads better on this color */
export const inkOn = (bg: string) => (contrast(bg, "#ffffff") >= contrast(bg, "#1b1b1f") ? "#ffffff" : "#1b1b1f");
/** the color, darkened by a fraction (0–1) */
function darken(hex: string, f: number) {
  return "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - f)).toString(16).padStart(2, "0")).join("");
}
/** the lightest shade of a color that small text can sit on, or be written in, at WCAG AA (4.5:1) against white */
function deepen(hex: string) {
  let c = hex;
  for (let f = 0.04; contrast(c, "#ffffff") < 4.5 && f < 0.6; f += 0.04) c = darken(hex, f);
  return c;
}
/**
 * A district's color behind small text: the color itself when white or dark ink reads on it at 4.5:1,
 * otherwise a slightly deeper shade under white text. (Red and blue are mid-tones neither ink clears.)
 */
function surface(bg: string) {
  const fg = inkOn(bg);
  return contrast(bg, fg) >= 4.5 ? { bg, fg } : { bg: deepen(bg), fg: "#ffffff" };
}
export const DISTRICT_SURFACE = Object.fromEntries(Object.entries(DISTRICT_COLOR).map(([d, c]) => [d, surface(c)])) as Record<District, { bg: string; fg: string }>;
/** a district's color for small text and numbers on white: deep enough to read at 4.5:1 */
export const DISTRICT_TEXT = Object.fromEntries(Object.entries(DISTRICT_COLOR).map(([d, c]) => [d, deepen(c)])) as Record<District, string>;
/** the Squeeze red, deep enough for text on white */
export const SQUEEZE_TEXT = deepen("#E63946");
/** a symbol per district, so a district is never told apart by color alone */
export const DISTRICT_MARK: Record<District, string> = { LENDING: "$", HOUSING: "⌂", LABOR: "⚒", HEALTH: "✚", EDUCATION: "✎" };
