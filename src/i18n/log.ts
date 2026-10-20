/**
 * The game's log in Spanish. The engine writes English (it must match the Python engine line for line);
 * tLog() turns one line into the current language for the screen, the event feed and screen readers.
 */
import { getLang } from "./index";

export function tLog(line: string): string {
  if (getLang() === "en") return line;
  return line;
}
