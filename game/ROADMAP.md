# THE SECOND NUMBER — West Dayton Edition roadmap

The game moves home: the block is **West Dayton**, the culture is Black American, and every mechanic added here comes from something real. Each item below is one commit, in order. A box is checked in the same commit that delivers it.

Every rules change also updates `RULES.md`, `test_rules.py` and the playable game, and gets a balance check with `balance_test.py` before it's committed.

---

## Part A: Mechanics from the culture

- [x] **1. The Sou-Sou** (also called a susu, "the hand," or "the club")
  A rotating savings circle. At the end of the block's turns the table may throw a hand: everyone who can puts in 1 Trust. When the pot reaches the hand size, the next player in the circle takes it and clears 2 Pressure from any district, with **no Corruption**. It's the honest version of the payday shortcut.

- [x] **2. Commons places, at West Dayton landmarks**
  The Commons action now happens *somewhere*. Each place gives the base Commons effect (+2 Trust, −1 Corruption) plus its own bonus:
  | Place | Bonus |
  |---|---|
  | Barbershop / beauty shop on West Third Street | Your next Teach this turn is free. |
  | The church | −2 Corruption instead of −1. |
  | Adventure Central at Wesleyan MetroPark | Your next Study this turn gives +2 Sight. |
  | Gem City Market (the co-op grocery on Salem Avenue) | Your next deal this turn: draw 2, face 1. |
  | Grandma's kitchen table | Once per game: every player gets +2 Trust. |

- [x] **3. The Cookout**
  Once per game, the table calls it at the start of a round. Nobody takes normal actions that round. Everyone gets +2 Trust, −1 Corruption and +1 Legend, and each player raises their Sight in one district to the best Sight anyone at the table has there. The Machine still moves.

- [x] **4. The Green Book**
  The block holds one copy. Once per game, when a Machine strike would capture a district, open it: that strike takes a safe route and lands nowhere.

- [x] **5. Call and response**
  When you Teach, read the red layer aloud and your learner says the second number back. If they do, you both gain +1 Legend.

## Part B: History and place

- [x] **6. The History deck**
  "Teach the History" draws a true story, with the community fighting back as well as being hurt. The deck includes the Contract Buyers League, the Freedman's Savings Bank, Greenwood, HOLC redlining maps, the Montgomery bus boycott and mutual-aid societies, plus Dayton's own: Paul Laurence Dunbar and the Wright brothers' print shop, and James H. McGee, Dayton's first Black mayor.

- [x] **7. The West Dayton setting**
  - Each district gets a Dayton subtitle and a line of local flavor.
  - Two Dayton scenarios: **The Hospital Closes** (Health starts under pressure) and **The Plants Close** (Labor starts under pressure).
  - Gem City Market joins the honest deals.
  - Balance is re-tuned with the new scenarios in the mix (Payday Season returns to every 2nd round, so it stays the hardest rung).

## Part C: Design documents

- [x] **8. `CAMPAIGN.md`: the Legacy campaign through the eras**
  Reconstruction → the Great Migration to Dayton → Redlining → Civil Rights → The Plants Close → Today. The same Owner wears a different face in each chapter.

- [x] **9. `ART_DIRECTION.md`: the look**
  - Palette and influences: AfriCOBRA's "Kool-Aid colors," 1970s Black Power poster art (as inspiration only), Jacob Lawrence and Romare Bearden, quilt geometry, hand-painted sign lettering, and Dayton funk record sleeves.
  - Components: Grandma's reading glasses (the lens), church hand fans (the character cards), real-paperwork deal cards, and bottle-cap tokens.

- [x] **10. `COMMUNITY.md`: doing it right**
  - Hire Black illustrators and writers.
  - Partner with Wilberforce University and Central State University.
  - Get permission before printing any real business's name.
  - Keep a fact-check list for every Dayton claim.
  - Ground rules: joy, not only harm; the Machine is a system, never a people.

## Part D: The print kit

- [x] **11. Restyle the print-and-play kit for West Dayton**
  - New palette, plus a West Dayton board with the Commons places, the Sou-Sou pot, the Cookout and the Green Book.
  - Printable reading-glasses lens frames, hand-fan character cards, paperwork-style deal cards, a token sheet, and History cards.

- [x] **12. Final balance run and docs sync**
  A fresh `balance_report.txt`, plus `RULES.md`, the brief and the README all matching the build.

## Part E: The campaign prototype

- [x] **13. Revise `CAMPAIGN.md`:** a rubber-band Ledger, healing scars, Chapter 5's choice, Chapter 1 handled with care, a standalone ending, Family Decisions, and Falls redeemed across generations.
- [x] **14. Chapter 3 content** (`chapters.py`): era Housing and Lending decks, the League, the Appraiser, and the Family Decision.
- [x] **15. Chapter 3 in the engine**, with rule checks.
- [x] **16. Chapter 3 balance:** 47–50% wins at every player count; organizing is worth +4 to +30 points.
- [x] **17. Chapter 3 playable** in the terminal game.
- [x] **18. The Chapter 3 envelope** (printable) and docs.

## Part F: The online game

- [x] **19. Its own website:** a Next.js app, now the whole repo (it replaced the Force Multiplier landing page).
- [x] **20. Content exported** from the Python source of truth to JSON.
- [x] **21. The engine in TypeScript**, locked to the Python engine by 63 golden games.
- [x] **22. The turn flow** for one device passed around the table.
- [x] **23. The playable site:** board, lens, every decision, all three modes, phone layout; tested in a real browser.
- [x] **24. The Coach, a guided first game:** the game recommends each move and says why, glows on the button it would press, and teaches each rule the first time it comes up. Deal advice uses only the layers the player can read. A table that follows it wins about 94% of *The Audit* games, against 69% for the default bot. **Learn to play** on the home page starts one.
- [x] **25. Graphics that teach:** the road-to-victory tracker (and what loses the game) across the top of the board, one icon per stat used everywhere, numbers that float off whatever a move changed, and a labeled deal card in the first-deal lesson and under every deal. From the first family playtest: the deals were fun, the start was confusing.
- [x] **25b. The story in four panels** before round 1: the block, the deals (the glasses find the real fee), the Machine (one hidden Owner behind the gears), your mission. Drawn inline in the West Dayton palette; replay it from **Story**.
- [x] **25a. From that playtest:** the shortcut made tempting (the Coach lays TAKE and its true cost beside its pick on every trap), plain names on the website (Read, Shady, Squeeze, Props), and drawn art: five district scenes and five role portraits as church fans, with [ART_BRIEF.md](ART_BRIEF.md) for commissioning the finished art (it drops in through `src/ui/art/manifest.ts`).
- [x] **26. Online play:** the table device opens a room with a four-letter code; everyone joins from their phone and plays their own seat, with deal cards private to the reader. Phones connect directly (WebRTC via PeerJS, nothing to sign up for); the table device referees every move and every device replays the same moves. Dropped phones rejoin their seats, and a reloaded table reopens the same room.
- [x] **27a. Save and continue:** every change is a move, a game is its seed plus its moves, and the browser keeps the game after every move.
- [ ] **27. Finished illustrations** (see ART_BRIEF.md).

---

## Facts to verify locally before printing
The full checklist, with permissions and partners, lives in `COMMUNITY.md`.
