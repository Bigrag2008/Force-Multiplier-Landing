# The Second Number — West Dayton Edition

*Read the machine. Wake the block. Crack the Underworld. Don't become it.*

A cooperative game for 1–5 players about the hidden cost in every deal: the payday loan, the rent-to-own couch, the "free" first month. Learn to read the second number, teach your whole block to read it, and drag the one machine behind them all into the light. Set on the West Side of Dayton, Ohio, and built from Black American culture.

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
2. **Set the table:** choose a mode, then the number of players (1–5; 1 is solo, see the rulebook's Solo section), each player's name and role, and (in co-op) a scenario. Start with *The Audit* or *A Quiet Year*.
   - **Co-op:** the block against the Machine.
   - **Overlord:** one player is the Machine, or the computer is.
   - **Campaign:** *The Long Ledger* (one family, six eras) or *Book One* (four chapters that follow the novel). Play the family's next chapter (the site keeps the family on this device: its Ledger, stickers, decisions and flags), or any chapter on its own.
   - **Coach me as we play** is on by default; untick it to play without hints. The 🧑🏾‍🏫 Coach box in the game's header switches it on or off mid-game.
3. **Plain names.** The stats are **Read** (how well you read a district), **Shady** (what shortcuts leave on you; at 6 you Fall), **Squeeze** (the Machine's grip on a district; 3 captures it) and **Props** (respect for lifting people), on the website, in the rulebook and in the print-and-play kit alike.
4. **Read the board at a glance.** The **road to victory** across the top shows where the block is (wake the districts, open the Underworld, trace 3 threads, expose the Owner) and what loses the game. Every stat has an icon (👁 Read, ♥ Trust, a purple drop for Shady, ★ Props, a sunrise for Clarity, a red weight for Squeeze), and after each move the numbers it changed float up off the board.
5. **Take turns on one device.** The action panel shows whose turn it is and what they can do. Pass the device on when your turn ends.
6. **Read deals with the glasses.** When you face a deal, drag Grandma's red reading glasses over the card to read the layers your Read has unlocked, or press **Put glasses on**. Layers you haven't unlocked stay locked. **What's on this card?** under any deal shows a labeled card: what each layer means and how to beat a trap.
7. **Between turns** the game asks the table about the **Sou-Sou** and, at the start of a round, the **Cookout**, then shows what the Machine did.
8. **Stop any time.** The game saves itself in this browser after every move. Close the tab, and **Continue your game** on the home page (or **Play now**) picks up exactly where you left off, deal card and all. One saved game per device; it clears when the game ends.
9. **The Green Book** opens automatically when a strike would capture a district. Untick the box at the top if you'd rather save it.

**En español.** The whole site plays in Spanish: the **English / Español** switch at the bottom of every page (kept on the device; a link with `?lang=es` opens in Spanish, and each phone at a table can pick its own). Every card, chapter, the game log, the Coach, the teacher's guide and the rulebook are translated, with one glossary for every game word ([`game/i18n/GLOSSARY.md`](game/i18n/GLOSSARY.md)). Print: [`game/RULES.es.md`](game/RULES.es.md), [`game/The_Second_Number_PRINT_AND_PLAY_ES.pdf`](game/The_Second_Number_PRINT_AND_PLAY_ES.pdf), [`game/The_Second_Number_TEACHER_GUIDE_ES.pdf`](game/The_Second_Number_TEACHER_GUIDE_ES.pdf). How it works: the English string is the key; card text lives in `game/i18n/es_*.json` (`python3 scripts/i18n_extract.py --check` reports coverage; `npm run content` merges it), the site's own words in `src/i18n/es/`, and the log is translated line by line at display (`src/i18n/log.ts`), so the engine, saves and online play stay language-free. `tests/i18n.test.ts` fails if a card or a fixed site string has no Spanish. A native speaker's read before print is still on the list.

**Hearing from players.** At the end of every game an optional **How did it go?** card asks three taps and one sentence, and adds how the game went (no names). Answers go to a Google Sheet you own once you connect one (about 5 minutes: [`game/FEEDBACK.md`](game/FEEDBACK.md), then set `NEXT_PUBLIC_FEEDBACK_URL`); until then they stay on the player's device.

**Sound and access.** The game has sound (made in the browser, no audio files; 🔊 in the game's header mutes it). It plays by keyboard alone (a *Skip to your move* link, visible focus everywhere), reads out each move for screen readers, and has **Plain cards** for anyone the red-lens effect doesn't work for. District colors pass a color-blindness check and each district has a symbol ($ ⌂ ⚒ ✚ ✎), so color is never the only cue. Every page passes an axe accessibility audit.

**New players:** [`game/The_Second_Number_HOW_TO_PLAY.pdf`](game/The_Second_Number_HOW_TO_PLAY.pdf) is the easy guide, the rules in plain words with examples and a cheat sheet (source: [`game/HOW_TO_PLAY.md`](game/HOW_TO_PLAY.md); rebuild with `python3 game/print_kit/build_guide.py`). **How to play** on the home page has the short rules; [`game/RULES.md`](game/RULES.md) has the full rulebook. Prefer paper? Print [`game/The_Second_Number_PRINT_AND_PLAY.pdf`](game/The_Second_Number_PRINT_AND_PLAY.pdf). **Endless deals** on the home page rolls a fresh deal every press, for practice and classrooms; **Read your own deal** works out the second number of a real offer, on the device only; **Your City editions** set the game on your own side of town (your districts, gathering places, history and real help; see [`game/YOUR_CITY.md`](game/YOUR_CITY.md)); the **Teacher's guide** (`/teacher/guide`, and [`game/The_Second_Number_TEACHER_GUIDE.pdf`](game/The_Second_Number_TEACHER_GUIDE.pdf)) fits a game into one class period with learning goals and questions for after; the **Teacher's view** adds up a class's games from the result codes tables copy at the end of a game (no accounts, nothing uploaded); [`game/BOOK_ONE.md`](game/BOOK_ONE.md) ties the game to the novel and describes the School Edition.

## Play on everyone's phones
1. On the device that will be the table (a laptop or TV is best), choose **Play now**, set up the game and tick **📱 Play on everyone's phones**. A room opens with a four-letter code.
2. Everyone else opens the site on their phone, taps **📱 Join a game**, enters the code (or opens the join link the host shares) and picks their seat.
3. Each person plays their own seat on their own phone. Deal cards show only on the phone of the person reading them; the table shows "Reading a deal…". Seats nobody takes are played on the table device, and anyone can answer the table's questions (the Cookout, the Sou-Sou, Start round).
4. Dropped connections recover: a phone that closes or sleeps frees its seat within seconds and can rejoin; if the table device reloads, **Continue your game** reopens the same room and the phones reconnect to their seats on their own.

**How it connects:** phones talk directly to the table device (WebRTC, through [PeerJS](https://peerjs.com)). PeerJS's free public server only introduces them, so there's nothing to sign up for or run. The table device is the referee: phones send moves, it checks each one and passes it on, and every device replays the same moves (`src/net/`). Most home and phone networks connect fine; a few strict networks (some workplaces and schools) block direct connections, and then playing on one device still works. To use your own PeerJS server, add `?peer=host:port` to the page address.

## Put it online
Every page is static (no server code, no database), so it runs on any free host. The plan is to serve it at **play.getcivicarmor.com**, beside the Civic Armor hub at getcivicarmor.com (`hub/`, see [`hub/README.md`](hub/README.md)).

**Cloudflare Pages (free, and allowed for a site that sells things):**
1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) and choose **Workers & Pages → Create → Pages → Connect to Git**, then pick **The-Second-Number**.
2. Framework preset **None**. Build command `npm run build:static`. Build output directory `out`.
3. Environment variables: `SITE_URL` = `https://play.getcivicarmor.com` (so shared links show the preview card). Optional: `NEXT_PUBLIC_FEEDBACK_URL` (game/FEEDBACK.md) and `NEXT_PUBLIC_HUB_URL` if the hub isn't at getcivicarmor.com yet.
4. **Save and Deploy.** You get a `*.pages.dev` link in a few minutes; every push to `main` updates it.
5. **Custom domains → Set up a domain →** `play.getcivicarmor.com`. With the domain's DNS on Cloudflare, it adds the record itself.

`npm run build:static` writes the whole site to `out/` as plain files, so any static host works (Netlify: same build command, publish directory `out`).

**Vercel** also works with no settings at all (import the repo, press **Deploy**), but its free plan is for non-commercial sites only; selling the book or the game from it needs Vercel Pro.

The links out of the game (the novel, *The Third Option*, the email list) all live in [`src/links.ts`](src/links.ts).

The build copies the PDFs in `game/` into the site (`scripts/copy_pdfs.mjs`), so the print-and-play kit and the teacher's guide download from the live site at `/The_Second_Number_PRINT_AND_PLAY.pdf` and `/The_Second_Number_TEACHER_GUIDE.pdf`.

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
| `app/` | Website pages: home, `/play`, `/learn` (the guided game; `?seed=` replays one), `/join` (a phone joining a room), `/how-to-play`, `/teacher` and `/teacher/guide`. |
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
- The commissioned illustrations (see `game/ART_BRIEF.md`), and Spanish versions of the chapter envelopes.

Part of the Individual Democracy / Civic Armor universe.
