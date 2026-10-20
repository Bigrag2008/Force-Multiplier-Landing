# THE SECOND NUMBER — Legacy campaign: *The Long Ledger*

*One family. One block. Six eras. The same Owner, wearing a different face each time.*

**Status: built.** All six chapters are in the rules engine (`sn_engine.py`, `chapters.py`, the era decks in `eras/`), balance-tested (`balance_test.py`), and playable on the website: **Play → Campaign → The Long Ledger**. Every era card is still on the historian's list before print: see [`eras/FACT_CHECK.md`](eras/FACT_CHECK.md).

---

## The idea
You don't play five strangers. You play **one West Dayton family across six generations**, from Reconstruction to today. Each chapter is one or two games of the base game with that era's deals, twists and Owner.

What you win or lose carries forward: districts are rebuilt or scarred, the family's ledger grows or shrinks, and the young people of one chapter become the Elders of the next. In the final chapter the table learns what the base game only hints at: **the trap never went away; it changed clothes.**

## What carries between chapters
The website keeps the family on the device (one family per campaign); at the table, write it on the lineage sheet. The rules are in `campaign.py` (and its twin, `src/engine/campaign.ts`).

| Carries forward | How |
|---|---|
| **The Family Ledger** | A track from −10 to +10. Win a chapter: +2, plus +1 for each district awake at the end. Lose: −2, minus 1 for each captured district. Each Fall costs −1, each Reach earns +1. Some Family Decisions add +1. The Ledger is the family's *record*, and the final score. |
| **The community rallies** (rubber band) | The Ledger never decides how hard the next chapter is. After a **lost** chapter, everyone starts the next one with **+1 Trust**: the church, the club and the neighbors show up. After a won chapter, nothing extra. Tested: the win rate after a loss and after a win stay within a few points of each other (no spiral). |
| **Board stickers** | A district awake at the end of a chapter **first heals one Scar**, if it has one; otherwise it gets a **Rebuilt** sticker. A captured district gets a **Scarred** sticker. At most 2 stickers per district. At setup, each **Rebuilt** sticker takes 1 Squeeze off a district the era starts squeezed, or else adds Clarity 1 (never waking it); each **Scarred** sticker adds Squeeze 1 (never capturing it). |
| **Family Decisions** | After each chapter (1–5) the family makes one permanent choice. Each changes the next chapter's setup. This is where the table argues. |
| **The History the family lived** | Each chapter unlocks History cards (one always, one more for a win). In Chapter 6 the Elder's History comes from the family's own. |
| **The Fallen, across generations** | Each Fall marks the lineage. A later chapter won with no Falls **redeems** one mark: +2 on the Ledger. |
| **The lineage** | Name your characters. Between chapters, pass the roles down: the Student who survived becomes the next chapter's Elder. |

## Where to start
Start at Chapter 1 to play the family through, or play any chapter **on its own** (the website's "Play one chapter on its own"; nothing carries in or out). Chapter 1 is the most emotionally heavy era; a table new to the game can start at Chapter 2 and come back to it.

## The chapters
Each chapter is one game of the base game (Co-op) with its own deals, setup, twist and Owner. Two districts in Chapters 1, 2, 3, 4 and 5 use an **era deck** (the base deck's shape: 12 traps at levers 5 red / 4 amber / 3 blue, plus 3 honest deals, each with its real money in that era's dollars); the others use the base deck.

### Chapter 1: *Freedom's Ledger* (Reconstruction, 1865–1877)
- **Setting:** the family is newly free, before the move north. The chapter opens on **agency**: saving, learning to read, building a church and a school, buying land together. The historian and Black writers lead this chapter's content; nothing in it is written for shock.
- **Era decks:** Lending (crop liens, the furnishing store's book, the Freedman's Savings Bank) and Labor (year-long contracts, settlement at the end of the season, the Black Codes). The Freedman's Bank card **looks honest through the red and amber layers**; only Read 3 (blue) shows who controlled the money.
- **Twist:** nobody starts with Read, not even the Elder. The crop lien grips from day one: **Lending starts at Squeeze 2**.
- **The Owner's face:** *The Planter's Ledger* (plays as the Debt Buyer).
- **Unlocks:** *The Freedman's Savings Bank*; with a win, *Wilberforce University*.
- **Family Decision:** go north now, or stay one more season and save? (**Go:** Chapter 2 opens all five districts from round 1. **Stay:** Ledger +1, but Chapter 2 starts with Lending at Squeeze 1.)

### Chapter 2: *Up North* (the Great Migration to Dayton, 1910s–1940s)
- **Setting:** the family arrives on Dayton's West Side.
- **Era decks:** Labor (labor agents, employment-office fees, the foundry, strikebreaker jobs nobody told you about) and Housing (boarding houses, kitchenettes, covenants, steering).
- **Twist:** only Lending, Housing and Labor are open at first. **Health and Education open in round 3**, once the family is settled.
- **The Owner's face:** *The Labor Agent* (plays as the Lobbyist: it leans on your strongest work).
- **Unlocks:** *Dunbar, the Wrights and the Dayton Tattler*; with a win, *Maggie L. Walker's Penny Savings Bank*.
- **Family Decision:** put the savings into the church, the house or a child's schooling? (**Church:** in Chapter 3 the church takes off 3 Shady, not 2. **House:** Housing starts Chapter 3 with 1 less Squeeze. **School:** the Student starts Chapter 3 with Read 1 everywhere.)

### Chapter 3: *The Map* (redlining, 1930s–1960s)
- **Setting:** the federal maps shade the West Side red.
- **Era decks:** Housing and Lending: contract-for-deed homes, blockbusting, insurance that won't write your address, a bank that won't lend below the line; and honest ones: a Black-owned savings and loan, a mutual-aid loan, a GI Bill loan a veteran actually got.
- **Twist:** Housing and Lending start at **Squeeze 2**, so REDLINING is active from round 1, and from round 2 it compounds every round while it stands.
- **New action, the League:** like the Contract Buyers League, every family signs the pledge in the same round (an action each). **The League forms:** Housing Squeeze −2 at once, −1 every second round after, and every Housing and Lending trap can be negotiated with Read 1.
- **The Owner's face:** *The Appraiser* (plays as the Lobbyist).
- **Unlocks:** *The Redlining Maps*; *The Contract Buyers League* if the League formed and the family won.
- **Family Decision:** stay and fight for the house, or move to where the map says you can? (**Stay:** Housing keeps its stickers, and Ledger +1. **Move:** remove one Scar from Housing, but the Elder stays behind: in Chapter 4 the Elder starts with no Read and no History.)

### Chapter 4: *Voice* (civil rights and the vote, 1955–1970)
- **Setting:** the boycotts, the strikes, and Dayton electing James H. McGee mayor in 1970.
- **Era decks:** Labor and Education. Their three blue-lever traps in each are **buy-offs**: a title, a seat, a contract, a scholarship, offered to an organizer at just the wrong moment. Red and amber look fair; the trap is always in blue.
- **Twist:** the Organizer's NEGOTIATE clears **3** Squeeze. Once per game any player can **call the March** (an action): every player gathers at once (Trust +2, Shady −1, covered).
- **The Owner's face:** *The Council* (plays as the Lobbyist; on reveal it **redraws the lines**: every woken district loses 1 Clarity).
- **Unlocks:** *The Montgomery Bus Boycott* and *I AM A MAN*; with a win, *Mayor James H. McGee*.
- **Family Decision:** run for office, or keep organizing? (**Run:** in Chapter 5 the Owner's hidden hand rests for the first 3 rounds. **Organize:** the Organizer starts Chapter 5 with 5 Trust.)

### Chapter 5: *The Plants Close* (1990s–2009)
- **Setting:** GM's Moraine plant closes in 2008 and NCR leaves in 2009; subprime loans flood the block before the crash.
- **Era decks:** Housing (teaser-rate refinances, cash-out equity, foreclosure "rescue", reverse redlining) and Labor (temp agencies, severance releases, buyouts, pension cuts).
- **Twist:** Labor starts at Squeeze 2 and everyone starts with 1 Trust. **Before the chapter the family chooses: defend what you built** (the Machine strikes your Rebuilt districts first) **or let one go** (remove one Rebuilt sticker). A hard choice instead of an automatic penalty.
- **The Owner's face:** *The Algorithm* (an extra strike every round).
- **Unlocks:** *The People's Free Medical Clinics*; with a win, *Greenwood: Black Wall Street*.
- **Family Decision:** sell the house at the bottom of the market, or hold on? (**Sell:** everyone starts Chapter 6 with +2 Trust, but Housing loses a Rebuilt sticker. **Hold:** Housing keeps everything, and starts Chapter 6 with 1 more Squeeze.)

### Chapter 6: *Today* (2018–)
- **Setting:** Good Samaritan Hospital has closed; Gem City Market has opened; the family is still here.
- **Deals:** the whole base deck, Gem City Market and the honest deals included.
- **Twist:** the Elder may teach History **twice**, and the History comes from what the family unlocked.
- **The Owner's face:** *The Ledger Keeper*: one hand behind every era. Its hidden hand changes face each round: the store's book (collections), the labor agent (Read −1), the appraiser (+1 Squeeze on your strongest work), the algorithm (an extra strike). On reveal it shows every face it wore.
- **Optional bonus envelope:** if the novel is published, a sealed bonus envelope reveals the Owner from the book. The campaign never depends on it.
- **Ending:** read the Family Ledger aloud, the lineage sheet name by name, and any redeemed Falls. The rulebook's last line applies to the whole family line: *How high did you climb before you turned into the thing you were fighting?*

---

## Balance
Every chapter is tested on its own at 1–5 players (solo: 46–70%), and whole campaigns are played by bots with random Family Decisions (`python3 balance_test.py`, section CAMPAIGNS). On its own, each chapter sits between about 50% and 72% block wins; in a family campaign, the win rate after a lost chapter and after a won one stay within a few points (no spiral), and The Map, the hardest chapter, holds 40–50%.

## Still to make for print
1. **The historian's pass** on every era card ([`eras/FACT_CHECK.md`](eras/FACT_CHECK.md) lists what each writer wasn't sure of), and the financial reviewer on the Chapter 5 cards.
2. **Components:** sticker sheet, lineage sheet, Ledger track, six sealed envelopes (Chapter 3's is in the print kit: `print_kit/build_chapter_pack.py`).
3. **Sold as:** a premium expansion box, *The Long Ledger*, after the base game.
