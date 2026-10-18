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

- [ ] **8. `CAMPAIGN.md`: the Legacy campaign through the eras**
  Reconstruction → the Great Migration to Dayton → Redlining → Civil Rights → The Plants Close → Today. The same Owner wears a different face in each chapter.

- [ ] **9. `ART_DIRECTION.md`: the look**
  - Palette and influences: AfriCOBRA's "Kool-Aid colors," 1970s Black Power poster art (as inspiration only), Jacob Lawrence and Romare Bearden, quilt geometry, hand-painted sign lettering, and Dayton funk record sleeves.
  - Components: Grandma's reading glasses (the lens), church hand fans (the character cards), real-paperwork deal cards, and bottle-cap tokens.

- [ ] **10. `COMMUNITY.md`: doing it right**
  - Hire Black illustrators and writers.
  - Partner with Wilberforce University and Central State University.
  - Get permission before printing any real business's name.
  - Keep a fact-check list for every Dayton claim.
  - Ground rules: joy, not only harm; the Machine is a system, never a people.

## Part D: The print kit

- [ ] **11. Restyle the print-and-play kit for West Dayton**
  - New palette, plus a West Dayton board with the Commons places, the Sou-Sou pot, the Cookout and the Green Book.
  - Printable reading-glasses lens frames, hand-fan character cards, paperwork-style deal cards, a token sheet, and History cards.

- [ ] **12. Final balance run and docs sync**
  A fresh `balance_report.txt`, plus `RULES.md`, the brief and the README all matching the build.

---

## Facts to verify locally before printing
These are used in the game and should be confirmed by a Dayton historian or the business named (see `COMMUNITY.md`):
- Gem City Market's address and permission to use its name.
- Adventure Central at Wesleyan MetroPark: its current name and programs.
- Good Samaritan Hospital (northwest Dayton) closing in 2018, and how the community describes it.
- The GM Moraine plant closing (2008) and NCR moving its headquarters out of Dayton (2009).
- The 1890 *Dayton Tattler*: Paul Laurence Dunbar's paper, printed by Orville and Wilbur Wright.
- James H. McGee's years as mayor (1970–1982).
- Every History card (`deck_cards.py`, `HISTORY`): dates, places and wording. In particular: that Dayton has a 1930s HOLC map; that Dunbar and Orville Wright were Central High classmates; the Contract Buyers League outcome ("forced many sellers to renegotiate"); and Greenwood's rebuilding.
