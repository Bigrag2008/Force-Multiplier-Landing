/** The website's own words in Spanish, one file per part of the site (English string → Spanish). */
import { game } from "./game";
import { panels } from "./panels";
import { setup } from "./setup";
import { pages } from "./pages";
import { log } from "./log";

export const ES_UI: Record<string, string> = { ...game, ...panels, ...setup, ...pages, ...log };
