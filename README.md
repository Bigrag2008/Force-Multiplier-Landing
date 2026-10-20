# The Second Number — West Dayton Edition

*Read the machine. Wake the block. Crack the Underworld. Don't become it.*

A cooperative game for 2–5 players about the hidden cost in every deal: the payday loan, the rent-to-own couch, the "free" first month. Learn to read the second number, teach your whole block to read it, and drag the one machine behind them all into the light. Set on the West Side of Dayton, Ohio, and built from Black American culture.

This repo holds everything: the **website where you play it online**, and the **game itself** (rules engine, rulebook, print-and-play kit, campaign and design docs).

| Where | What |
|---|---|
| *(this folder)* | **The online game:** a Next.js website. Play it in a browser on one device passed around the table. |
| [`game/`](game/) | **The game:** the rules engine (Python, the source of truth), the rulebook, the balance tester, the terminal edition, the print-and-play PDFs, the campaign and the design docs. Start with [`game/README.md`](game/README.md). |

## Play it on your computer
You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install        # first time only
npm run dev        # then open http://localhost:3000
```

To run the production build instead: `npm run build && npm start`.

## How to play
**First time?** Choose **Learn to play** on the home page. A four-panel comic tells the story in about 30 seconds (the block, the deals, the Machine, your mission); it opens before every guided game, the first time you play on a device, and any time from **Story** in the game's header. It starts a guided three-player **Block Party** (the 25-minute intro: 3 districts, 8 rounds, no roles) with the Coach: on every decision, the Coach glows on the move it would make and says why, and each rule is explained the first time it comes up. You can always choose your own move.

1. Open the site and choose **Play now**.
2. **Set the table:** choose a mode, then the number of players (2–5), each player's name and role, and (in co-op) a scenario. Start with *The Audit* or *A Quiet Year*.
   - **Co-op:** the block against the Machine.
   - **Overlord:** one player is the Machine, or the computer is.
   - **Campaign:** *The Long Ledger*, Chapter 3: *The Map*.
   - **Coach me as we play** is on by default; untick it to play without hints. The 🧑🏾‍🏫 Coach box in the game's header switches it on or off mid-game.
3. **Plain names.** The stats are **Read** (how well you read a district), **Shady** (what shortcuts leave on you; at 6 you Fall), **Squeeze** (the Machine's grip on a district; 3 captures it) and **Props** (respect for lifting people), on the website, in the rulebook and in the print-and-play kit alike.
4. **Read the board at a glance.** The **road to victory** across the top shows where the block is (wake the districts, open the Underworld, trace 3 threads, expose the Owner) and what loses the game. Every stat has an icon (👁 Read, ♥ Trust, a purple drop for Shady, ★ Props, a sunrise for Clarity, a red weight for Squeeze), and after each move the numbers it changed float up off the board.
5. **Take turns on one device.** The action panel shows whose turn it is and what they can do. Pass the device on when your turn ends.
6. **Read deals with the glasses.** When you face a deal, drag Grandma's red reading glasses over the card to read the layers your Read has unlocked, or press **Put glasses on**. Layers you haven't unlocked stay locked. **What's on this card?** under any deal shows a labeled card: what each layer means and how to beat a trap.
7. **Between turns** the game asks the table about the **Sou-Sou** and, at the start of a round, the **Cookout**, then shows what the Machine did.
8. **Stop any time.** The game saves itself in this browser after every move. Close the tab, and **Continue your game** on the home page (or **Play now**) picks up exactly where you left off, deal card and all. One saved game per device; it clears when the game ends.
9. **The Green Book** opens automatically when a strike would capture a district. Untick the box at the top if you'd rather save it.

**How to play** on the home page has the short rules; [`game/RULES.md`](game/RULES.md) has the full rulebook. Prefer paper? Print [`game/The_Second_Number_PRINT_AND_PLAY.pdf`](game/The_Second_Number_PRINT_AND_PLAY.pdf). **Endless deals** on the home page rolls a fresh deal every press, for practice and classrooms; **Read your own deal** works out the second number of a real offer, on the device only; the **Teacher's view** adds up a class's games from the result codes tables copy at the end of a game (no accounts, nothing uploaded); [`game/BOOK_ONE.md`](game/BOOK_ONE.md) ties the game to the novel and describes the School Edition.

## Play on everyone's phones
1. On the device that will be the table (a laptop or TV is best), choose **Play now**, set up the game and tick **📱 Play on everyone's phones**. A room opens with a four-letter code.
2. Everyone else opens the site on their phone, taps **📱 Join a game**, enters the code (or opens the join link the host shares) and picks their seat.
3. Each person plays their own seat on their own phone. Deal cards show only on the phone of the person reading them; the table shows "Reading a deal…". Seats nobody takes are played on the table device, and anyone can answer the table's questions (the Cookout, the Sou-Sou, Start round).
4. Dropped connections recover: a phone that closes or sleeps frees its seat within seconds and can rejoin; if the table device reloads, **Continue your game** reopens the same room and the phones reconnect to their seats on their own.

**How it connects:** phones talk directly to the table device (WebRTC, through [PeerJS](https://peerjs.com)). PeerJS's free public server only introduces them, so there's nothing to sign up for or run. The table device is the referee: phones send moves, it checks each one and passes it on, and every device replays the same moves (`src/net/`). Most home and phone networks connect fine; a few strict networks (some workplaces and schools) block direct connections, and then playing on one device still works. To use your own PeerJS server, add `?peer=host:port` to the page address.

## Put it online (Vercel, free tier)
1. At [vercel.com/new](https://vercel.com/new), import this repo. Vercel detects Next.js; leave the settings as they are.
2. Deploy. Every push to `main` updates the live link, and each pull request gets its own preview link.

Every page is static, so any static host works too (Netlify, Cloudflare Pages).

## How the website stays true to the rules
The Python engine ([`game/sn_engine.py`](game/sn_engine.py)) is the source of truth: the balance tester and rule checks run against it. The website uses a TypeScript port ([`src/engine/engine.ts`](src/engine/engine.ts)) that must replay the Python engine's games exactly.

| Command | What it does |
|---|---|
| `npm run content` | Re-export every card, place, scenario, chapter and tuning constant from `game/` to `src/content/content.json`. |
| `npm run golden` | Record 63 complete games from the Python engine (all modes, player counts, bot styles, scenarios and Owners) to `tests/golden.json`. |
| `npm test` | Replay every golden game in TypeScript (each log line and the final state must match), 38 tests that drive the browser turn flow through whole games, and 5 Coach tests: it never changes the game or draws a card, never peeks at hidden layers, recommends only legal moves, and a table that follows it wins far more often than the default bot. |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript. |

**After any art change:** with the site running, `node scripts/render_art.mjs http://localhost:3000` captures the drawn art from the `/art` page into `game/print_kit/art/` (needs Playwright), then `python3 game/print_kit/build_print_and_play.py` rebuilds the PDF.

**After any rules or card change:** edit the Python in `game/`, then run `npm run content`, `npm run golden` and `npm test`. If a test fails, mirror the change in `src/engine/engine.ts`.

## Layout
| Path | What |
|---|---|
| `app/` | Website pages: home, `/play`, `/learn` (the guided game; `?seed=` replays one), `/join` (a phone joining a room), `/how-to-play`. |
| `src/engine/` | The rules engine (TypeScript port), its content types and the shared RNG. |
| `src/game/session.ts` | The round-by-round flow: who acts next, and what the table is asked. |
| `src/net/` | Online play: the room's rules (who may make which move) and the PeerJS connection. |
| `src/game/moves.ts`, `save.ts` | Every change to a game as a move; a game is its seed plus its moves, which is what a save holds. |
| `src/game/coach.ts` | The Coach: the recommended move with its reason, and the lessons, all read-only. |
| `src/ui/` | The board, players, deal card and lens, action panels, the Coach box, the story comic, end screen. |
| `src/ui/art/` | The drawn district scenes and role portraits, and `manifest.ts`, where commissioned art drops in (brief: [`game/ART_BRIEF.md`](game/ART_BRIEF.md)). |
| `scripts/` | Content export, golden-game recorder, the Python twin of the shared RNG. |
| `tests/` | Parity, session and Coach tests. |
| `game/` | The game itself (see above). |

## Next steps
- Sound, and the commissioned illustrations (see `game/ART_BRIEF.md`).

Part of the Individual Democracy / Civic Armor universe.
