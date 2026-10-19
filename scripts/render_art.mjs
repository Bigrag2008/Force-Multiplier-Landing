/**
 * Captures the drawn art from the /art page as PNGs for the print-and-play kit
 * (game/print_kit/art/). Run with the site running (npm run build && npm start), e.g.
 *   node scripts/render_art.mjs http://localhost:3000
 * Needs Playwright (npm i -D playwright) and its Chromium.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = await import("playwright");
const site = process.argv[2] ?? "http://localhost:3000";
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "game", "print_kit", "art");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 3 });
await page.goto(`${site}/art`);
// transparent around the fans, so they sit on any paper
await page.addStyleTag({ content: "html, body { background: transparent !important; }" });
for (const el of await page.locator("[data-art]").all()) {
  const name = await el.getAttribute("data-art");
  await el.screenshot({ path: join(out, `${name}.png`), omitBackground: true });
  console.log("wrote", `${name}.png`);
}
await browser.close();
