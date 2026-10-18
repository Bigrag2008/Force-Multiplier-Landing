# The Second Number — online edition

The West Dayton Edition, playable in a web browser. One device is passed around the table (hotseat), the way the printed game is played: at the cookout, in a classroom, on a projector.

It is its own website, separate from the landing site in this repo, and it runs entirely in the browser: no server and no accounts.

## Run it on your computer
You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd second-number/web
npm install        # first time only
npm run dev        # then open http://localhost:3000
```

To run the production build instead: `npm run build && npm start`.

## Play
1. Open the site and choose **Play now**.
2. **Set the table:** choose a mode, then the number of players (2–5), each player's name and role, and (in co-op) a scenario. Start with *The Audit* or *A Quiet Year*.
   - **Co-op:** the block against the Machine.
   - **Overlord:** one player is the Machine, or the computer is.
   - **Campaign:** *The Long Ledger*, Chapter 3: *The Map*.
3. **Take turns on one device.** The action panel shows whose turn it is and what they can do. Pass the device on when your turn ends.
4. **Read deals with the glasses.** When you face a deal, drag the red reading glasses over the card to read the layers your Sight has unlocked, or press **Put glasses on**. Layers you haven't unlocked stay locked.
5. **Between turns** the game asks the table about the **Sou-Sou** and, at the start of a round, the **Cookout**, then shows what the Machine did.
6. **The Green Book** opens automatically when a strike would capture a district. Untick the box at the top if you'd rather save it.

**How to play** on the home page has the short rules; `../RULES.md` has the full rulebook.

## Put it online (Vercel, free tier)
1. Push this repo to GitHub (it's already there).
2. At [vercel.com/new](https://vercel.com/new), import the repo.
3. Set **Root Directory** to `second-number/web`. Vercel detects Next.js; leave the build settings as they are.
4. Deploy. Every push to the branch you choose updates the live link, and each pull request gets its own preview link.

Because every page is static, any static host works too (Netlify, Cloudflare Pages, GitHub Pages via `next export`).

## How it stays true to the rules
The Python engine (`../sn_engine.py`) is the source of truth; the balance tester and rule checks run against it. The web game uses a TypeScript port (`src/engine/engine.ts`) that must replay the Python engine's games exactly.

| Command | What it does |
|---|---|
| `npm run content` | Re-export every card, place, scenario, chapter and tuning constant from the Python files to `src/content/content.json`. |
| `npm run golden` | Record 63 complete games from the Python engine (all modes, player counts, bot styles, scenarios and Owners) to `tests/golden.json`. |
| `npm test` | Replay every golden game in TypeScript (each log line and the final state must match), plus 38 tests that drive the browser turn flow through whole games. |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript. |

**After any rules or card change:** edit the Python, then run `npm run content`, `npm run golden` and `npm test`. If a test fails, mirror the change in `src/engine/engine.ts`.

## Layout
| Path | What |
|---|---|
| `app/` | Pages: home, `/play`, `/how-to-play`. |
| `src/engine/` | The rules engine (TypeScript port), its content types and the shared RNG. |
| `src/game/session.ts` | The round-by-round flow: who acts next, and what the table is asked. |
| `src/ui/` | The board, players, deal card and lens, action panels, end screen. |
| `scripts/` | Content export, golden-game recorder, the Python twin of the shared RNG. |
| `tests/` | Parity and session tests. |

## Next steps
- **Online multiplayer:** each player joins a room from their own phone. This needs a small realtime service (for example PartyKit, Supabase Realtime, or a Node server on Fly.io); the engine and session already run anywhere JavaScript does.
- Save and resume a game in progress; a guided first game; sound and the art direction's illustrations.
