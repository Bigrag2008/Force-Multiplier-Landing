# THE SECOND NUMBER — Legacy campaign: *The Long Ledger*

*One family. One block. Six eras. The same Owner, wearing a different face each time.*

**Status:** this is a design document. The base game (`RULES.md`, `sn_engine.py`) is built and balance-tested; the campaign is not yet in the engine. Each chapter below lists what has to be built, so the work can be split into pieces.

---

## The idea
You don't play five strangers. You play **one West Dayton family across six generations**, from Reconstruction to today. Each chapter is one or two games of the base game with that era's deals, twists and Owner.

What you win or lose carries forward: districts are rebuilt or scarred, the family's ledger grows or shrinks, and the young people of one chapter become the Elders of the next. In the final chapter the table learns what the base game only hints at: **the trap never went away; it changed clothes.**

## What carries between chapters
| Carries forward | How |
|---|---|
| **The Family Ledger** | A track from −10 to +10. Win a chapter: +2, plus +1 for each district awake at the end. Lose: −2, plus −1 for each captured district. Each Fall costs −1, each Reach earns +1. At the start of each chapter, every +3 on the Ledger gives the family 1 starting Trust to share out. |
| **Board stickers** | A district awake at the end of a chapter gets a **Rebuilt** sticker (it starts later chapters at Clarity 1). A captured district gets a **Scarred** sticker (it starts at Pressure 1). A district can carry several stickers. |
| **The lineage** | Each player names their character. Between chapters, a Student who survived becomes the next chapter's Elder (pass the Elder role to that player). Name the new generation on the lineage sheet. |
| **The History deck** | Cards are unlocked as the family lives them (below). A card unlocked in play is kept for every later game. |
| **Sealed envelopes** | Each chapter's deals, twist and Owner are in a sealed envelope. Open it only when the chapter begins. |

---

## The chapters

### Chapter 1 — *Freedom's Ledger* (Reconstruction, 1865–1877)
- **Setting:** the family is newly free, before the move north.
- **New deals:** sharecropping contracts with crop liens; the plantation store; and a deposit at the Freedman's Savings Bank. That deposit *looks* honest even through the red and amber layers; only blue Sight reveals who controls it.
- **Twist:** nobody starts with Sight, not even the Elder. The family learns everything at the table.
- **The Owner's face:** *The Planter's Ledger* (plays as the Debt Buyer).
- **Unlocks:** the **Sou-Sou** (mutual-aid societies) and the History card *The Freedman's Savings Bank*.

### Chapter 2 — *Up North* (the Great Migration to Dayton, 1910s–1940s)
- **Setting:** the family arrives on Dayton's West Side.
- **New deals:** labor agents who promise jobs up north; boarding-house rents; company scrip.
- **Twist:** the board starts with only three districts in play. Health and Education open in round 4, when the family is settled.
- **The Owner's face:** *The Labor Agent* (plays as the Recruiter).
- **Unlocks:** the **Commons places** (the barbershop and the church first) and the History card *Dunbar, the Wrights and the Dayton Tattler*.

### Chapter 3 — *The Map* (redlining, 1930s–1960s)
- **Setting:** the federal maps shade the West Side red.
- **New deals:** contract-for-deed homes; blockbusting offers ("sell now, before the neighborhood changes"); insurance that won't write a policy for your address.
- **Twist:** Housing and Lending start **gripped**, so REDLINING is active from round 1. Breaking it is the chapter's real goal.
- **The Owner's face:** *The Appraiser* (plays as the Lobbyist).
- **Unlocks:** the History cards *The Redlining Maps* and *The Contract Buyers League* (only if the family breaks REDLINING).

### Chapter 4 — *Voice* (civil rights and the vote, 1955–1970)
- **Setting:** the boycotts, the strikes, and Dayton electing James H. McGee as mayor in 1970.
- **New deals:** poll-tax-style fees; and "deals" offered to buy off organizers (the trap is always in blue).
- **Twist:** the Organizer's NEGOTIATE clears 3 Pressure. Once per game the family may march: every player takes one free Commons action.
- **The Owner's face:** *The Council* (a new Owner: on reveal, it re-captures the district with the most Clarity).
- **Unlocks:** the **Cookout** and the History cards *Montgomery*, *I AM A MAN* and *Mayor James H. McGee*.

### Chapter 5 — *The Plants Close* (1990s–2009)
- **Setting:** GM's Moraine plant closes in 2008 and NCR leaves in 2009; subprime loans flood the block.
- **New deals:** teaser-rate refinances; "cash out your equity"; temp agencies replacing the plant.
- **Twist:** uses the *The Plants Close* scenario. Any district with a **Rebuilt** sticker is the Machine's first target each round: it comes for what the family built.
- **The Owner's face:** *The Algorithm* (scoring, automation, risk models).
- **Unlocks:** the **Green Book** returns as an heirloom (the family remembers the old safe routes).

### Chapter 6 — *Today* (2018–)
- **Setting:** Good Samaritan Hospital closes; Gem City Market opens; and the family is still here.
- **New deals:** the whole base deck, plus Gem City Market and the honest deals.
- **Twist:** every History card the family unlocked is in play. The Elder may teach History **twice**.
- **The Owner's face:** the final reveal. In the last envelope, the faceless Owner from the novel is revealed: one hand behind every era's face. This is the novel's climax; the envelope's contents should be written with the book.
- **Ending:** read the Family Ledger aloud. The rulebook's last line applies to the whole family line: *How high did you climb before you turned into the thing you were fighting?*

---

## What has to be built
1. **Era deal decks:** about 12 new deals for each of chapters 1–5, written to the same three-layer standard and checked by the historian (see `COMMUNITY.md`).
2. **Engine support:** a `campaign` mode that loads a chapter's deck, twist and Owner, and saves and loads the Ledger, stickers and lineage between games.
3. **Two new Owners:** *The Council* (chapter 4) and the final Owner (chapter 6).
4. **Balance testing per chapter:** the tester runs each chapter with the expected stickers carried in from a typical previous chapter.
5. **Components:** sticker sheet, lineage sheet, Ledger track, six sealed envelopes.
6. **Sold as:** a premium expansion box, *The Long Ledger*, after the base game.
