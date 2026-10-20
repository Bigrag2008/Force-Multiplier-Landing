# THE SECOND NUMBER — Rulebook (v4, West Dayton Edition)

*A cooperative game for 2–5 players, ages 12+. The Block Party intro takes about 25 minutes; the full game, 45–60.*
*Read the machine. Wake the block. Crack the Underworld. Don't become it.*

These rules match `sn_engine.py` exactly. If you change one, change the other, then re-run `python3 balance_test.py` and `python3 test_rules.py`.

**New to the game? Play the [Block Party](#block-party-the-25-minute-intro) first.** It teaches the six words below in about 25 minutes, then each step up the ladder adds one layer.

### One word for each idea
Every rule, card, board and screen uses these words and no others.

| Word | What it means | Not called |
|---|---|---|
| **Read** (0–3 per district) | How deep you can read a deal there: red, then amber, then blue. The power is called the Sight in the novel. | sight, lens level |
| **Trust** (0–5) | What you spend to negotiate and teach. | — |
| **Shady** | What shortcuts put on you. Too much and you Fall. | corruption |
| **Squeeze** (0–3 per district) | The Machine's grip. Squeeze 3 captures a district. Kept on the **Squeeze track**. | pressure, Machine track |
| **Clarity** (0–3 per district) | How awake a district is. Clarity 3 wakes it. | — |
| **Props** | What you earn for lifting people. Most Props at the end is the table's MVP. | legend, Legendary |
| **Strike** | Any Machine move that adds Squeeze, whoever makes it: the Machine, the Overlord, a Fallen player, a Scenario or an Owner. | extract, hit |
| **Muddy** | Any Machine move that takes away Clarity. | obscure, bury |
| **Tempt** | A Machine move that takes away Trust. | — |

### The ladder
1. **Block Party** (25 min): Read, Trust, Squeeze, Clarity, the lens and the shortcut. 3 districts, no roles.
2. **Full Block** (45 min): all 5 districts, Roles, a Scenario, the hidden Owner, the Commons and its places, Patterns, the Underworld.
3. **Unlocks**, one at a time, as the table likes: the Cookout, the Sou-Sou, the Green Book.
4. **House rules** for tables that know the deck: fine-print dice, the Terrell rule, endless deals, the math variant.
5. **Overlord** (one player is the Machine), then the campaign.

---

## What's in the box
- **76 Deal cards**: 12 real traps per district (Lending, Housing, Labor, Health, Education), plus 3 honest deals each and a 4th in Health (Gem City Market).
- **5 Role cards**, **4 Owner cards** (one is shuffled face-down under the board), **7 Scenario cards**, **12 Pattern cards**, **12 History cards**.
- **The board:** five districts. Each has a Clarity track (0–3) and a Squeeze track (0–3). Round track 1–12, with the Block Party's strikes printed on rounds 1–8.
- Player boards with Trust (0–5), Shady (0–6) and Read (0–3 per district) tracks.
- **A red decoder lens.** The deluxe edition adds amber and blue lenses.
- About 40 small tokens (coins, beans or beads) for the tracks.

### Reading a Deal card
| Part | What it is | You can read it at |
|---|---|---|
| Front | The pitch everyone sees | always |
| 🔴 Red | The real **cost** | Read 1 in that district |
| 🟠 Amber | The **clock**: the deadline or your rights window | Read 2 |
| 🔵 Blue | The **connection**: who's really behind it | Read 3 |
| 🔑 Lever (inside the red zone) | Which layer holds the leverage to **beat** it, or "honest deal" | Read 1 |

**Read only as deep as your Read allows.** Hold the lens over the zones your Read in that district unlocks, and no deeper. On your honor, and with the table watching.

**Seeing is not beating.** Read 1 tells you whether a deal is a trap or honest. To *negotiate* a trap down, you need Read that reaches its **lever**: red (1), amber (2) or blue (3). Honest deals have no lever.

---

## Setup
1. Pick a **Scenario** (start with *The Audit* or *A Quiet Year*) and apply it.
2. Shuffle the **Owner** cards and slide one face-down under the board. Don't look at it.
3. Each player takes a **Role**, 2 Trust, 0 Shady, and Read 0 everywhere (the Elder starts with Read 1 everywhere).
4. Look up your player count on the table below:

| Players | Actions per turn | Machine strikes per round | Overlord moves per round |
|---|---|---|---|
| 2 | 3 | 1, or 2 on even rounds | 1 in round 1, then 2 |
| 3 | 3 | 3 | 3, then 4, 4, 4 (repeat) |
| 4 | 2 | 1, or 2 on even rounds | 2, 2, 2, then 3 (repeat) |
| 5 | 2 | 2, or 3 on even rounds | 3, 3, 3, then 4 (repeat) |

You don't need to remember it: the strikes for each player count are printed on the **round track**, under every round. (We tested replacing the table with one rule, "one strike for every 4 actions the block takes." It fits 2 and 5 players, but 3 players won about 73% of games under it and 4 players dropped to about 45%, so the table stays and the board carries it. 2 players went from 1 strike to 1½, because their games ran long and soft.)

---

## A round
**0. The Cookout (once per game).** At the start of a round the table may call the Cookout instead of taking turns (see below).

**1. Block turns.** Each player in turn takes their actions, choosing from these (repeats allowed):

| Action | What it does |
|---|---|
| **Study** | +1 Read in one district. +1 Props. |
| **Face a deal** | Draw a card from a district, read what your Read allows, then choose **TAKE / WALK / NEGOTIATE** (below). |
| **Teach** | Give a teammate +1 Read in a district where you read *better* than they do (never above your own Read). Costs 1 Trust; free for the Translator. +2 Props. **Call and response:** draw a deal from that district and read its red layer aloud. If your learner says the second number back, you both gain +1 Props. |
| **Commons** | Gather at a place on the West Side: +2 Trust (max 5) and −1 Shady, plus that place's bonus (below). |
| **Reach** | Pull a Fallen player home: costs 2 Trust; they return with Shady 4. +3 Props. |
| **Trace** *(Underworld open only)* | Needs Read 3 in a woken district. Place a blue thread there. +2 Props. |
| **Expose** *(once enough threads are traced)* | You win. |

**2. The Sou-Sou (optional).** The table may throw a hand (see below).

**3. Check.** If total Clarity across the board is **9 or more**, the Underworld cracks open (see below).

**4. The Machine moves.**
- It **strikes** the unwoken district closest to waking: +1 Squeeze. It makes as many strikes as the table says, **each on a different district**.
- It **muddies** the strongest unwoken district: −1 Clarity.
- Then the Scenario, the hidden Owner, and any Patterns act.

**5. Check for loss.** You lose if **2 districts are captured** (Squeeze 3), if **everyone has Fallen**, or if **round 12 ends**. The clock is the Machine's best friend.

### The spread rule
The Machine, the Overlord and the Fallen together may act on **each district at most once per round**. The Machine spreads; it doesn't snipe.
- Patterns are the system itself, so they tighten regardless.
- A **woken** district (Clarity 3) is safe from the Machine until the Underworld opens.

---

## Facing a deal: TAKE · WALK · NEGOTIATE
| | On an **honest** deal | On a **trap** |
|---|---|---|
| **TAKE** | Real help: +2 Trust, +1 Clarity, +1 Props | **The shortcut.** If the district has Squeeze, −2 Squeeze *now*; otherwise +2 Clarity *now*. Either way you take +2 Shady and 0 Props. |
| **WALK** | You refused real help out of fear: −1 Trust | Safe. Nothing gained. |
| **NEGOTIATE** (costs 1 Trust) | You haggled away real help. The Trust is gone. | **Read ≥ lever:** defused. −1 Squeeze (−2 for the Organizer), +1 Clarity, +2 Props. **Read < lever:** you got played. +1 Squeeze. |

Blind (Read 0), you see only the front. Most deals are traps, but walking away from honest help costs Trust. Learning to read is how you stop guessing.

### The shortcut, and the Fall
TAKE on a trap really is the fastest way to save a district one strike from capture. That's what makes it a temptation and not a trap card with a skull on it. Compare it with doing it right:

| | Costs you | Buys the block |
|---|---|---|
| **NEGOTIATE** (Read ≥ lever) | 1 Trust | −1 Squeeze, +1 Clarity, +2 Props |
| **TAKE the trap** (the shortcut) | **no Trust**, but +2 Shady | **−2 Squeeze** now, or **+2 Clarity** where there's no Squeeze |

**Name the price.** Whenever you face a trap and *could* take it, say the deal out loud before you choose: *"TAKE costs no Trust and drops Housing's Squeeze by 2. The catch: +2 Shady on me, and I'm at 4."* Then the table weighs in, and you decide. (The website's Coach does this for you, with a ⚡ on the TAKE button.) While the Owner is hidden, say "+2 or more": the Debt Buyer charges extra.

But at **Shady 6 you Fall**:
- You stay at the table, and **the Machine moves through you**. On your turn you take Machine moves instead of block actions: **strike** (+1 Squeeze), **muddy** (−1 Clarity) or **tempt** (−1 Trust).
- Your crew can **Reach** you back.
- If the Machine wins with you Fallen, you "won the board" and earned **0 Props**. You don't win by becoming the thing you fight.

---

## The Commons: where the block gathers
Every Commons action happens somewhere. You get the base effect plus the place's bonus. Three places set up your **next action this same turn**, so plan your turn around them.

| Place | Where | Bonus |
|---|---|---|
| **The Barbershop & Beauty Shop** | West Third Street | Your next Teach this turn is free. |
| **The Church** | on the corner, every Sunday | −2 Shady instead of −1. |
| **Adventure Central** | Wesleyan MetroPark | Your next Study this turn gives +2 Read. |
| **Gem City Market** | the co-op grocery on Salem Avenue | Your next deal this turn: draw 2, face 1. |
| **Grandma's Kitchen Table** | the house everybody ends up at | Once per game: every player gets +2 Trust. |

## The Cookout: once per game
Call it at the start of any round, unless a district is one strike from capture. **Nobody takes block actions that round**; the whole block shows up, eats, and compares paperwork. Each player:
- gets +2 Trust, −1 Shady and +1 Props, and
- raises their Read in **one district** to the best Read anyone at the table has there.

The Fallen don't come; the Machine still moves through them, and the Machine phase happens as usual. Call it when what one of you knows needs to become what all of you know.

## The Green Book: one safe route
The block holds one copy of the Green Book, after the guide Black travelers used for decades to find the places that would serve them safely. **Once per game**, when any strike (the Machine's, a Fallen player's, or a Scenario's) would **capture** a district, you may open it: that strike takes a safe route and lands nowhere. It still counts as the Machine's move on that district this round.

## The Sou-Sou: the honest payday loan
A rotating savings circle, the way families and church members have long pooled money (also called a susu, "the hand," or "the club"). At the end of the block's turns, the table may **throw a hand**:
- Everyone who has Trust puts **1 Trust** into the pot.
- When the pot reaches **4**, the next player in the circle (going around the table) **takes the hand**: clear **2 Squeeze** from any district, even a captured one. That debt is paid off clean, with **no Shady**. +1 Props to the player who takes the hand.
- Leftover Trust stays in the pot for next time.

The Sou-Sou does what the payday shortcut does, slower and together, and nobody Falls for it.

## The Underworld: the final act
When total Clarity reaches 9, flip the Owner card. **It fights in the open:**
- The Machine gets **+1 strike** per round.
- Once per round it **covers its tracks**: −1 Clarity on a woken district that doesn't yet have a thread.

To win, trace **3 blue threads**. Each needs **Read 3 (blue)** in a woken district. Then take the **Expose** action. The districts looked separate; down here they're one machine.

---

## The History deck
When the Elder teaches the History of a district, shuffle that district's History cards with the two "any district" cards and draw one. Read the story and its lesson aloud. These are true stories, and most of them are about how the community fought back: the Contract Buyers League, Maggie L. Walker's bank, the Memphis sanitation strike, the Black Panther Party's free clinics, Wilberforce University, Paul Laurence Dunbar and the Wright brothers' print shop, Mayor James H. McGee, and more.

## Owners (hidden from round 1, so deduce them)
- **The Algorithm:** relentless. +1 Machine strike every round.
- **The Lobbyist:** leans on your strongest unwoken district every round (+1 Squeeze). On reveal, it knocks one woken district back to Clarity 1.
- **The Debt Buyer:** every TAKE on a trap costs +1 Shady. Each round, collections calls: anyone carrying Shady loses 1 Trust. The Fallen take double moves.
- **The Recruiter:** each round, a random player loses 1 Read in a district they can read.

## The block: West Dayton
Every district is a part of the West Side.

| District | On the West Side |
|---|---|
| **Lending:** payday on every corner | Where the bank branches thin out, the storefront lenders fill in. |
| **Housing:** Wright-Dunbar to Madden Hills | Historic homes, empty lots, and families who never left. |
| **Labor:** after the plants closed | GM's Moraine plant closed in 2008 and NCR moved its headquarters out in 2009. |
| **Health:** a hospital gone | Good Samaritan Hospital in northwest Dayton closed in 2018. |
| **Education:** Dunbar High to Central State | Paul Laurence Dunbar High School, Sinclair downtown, Wilberforce and Central State down the road. |

## Scenarios
**Easiest:** *The Audit* (one grace round). **Hardest:** *Payday Season* (every 2nd round, an extra Lending hit). In between, these play close to one another:
- *A Quiet Year:* no special pressure. Learn the ropes.
- *The Eviction Wave:* Housing starts at Squeeze 2.
- *The Closure:* Education starts captured. Reclaim it.
- *The Hospital Closes* (Dayton, 2018): Health starts at Squeeze 2, and negotiating a Health deal costs 2 Trust.
- *The Plants Close* (Dayton, 2008): Labor starts at Squeeze 2, and everyone starts with 1 Trust.

## Patterns
When every district in a combination is at Squeeze 2 or more, flip that Pattern card (Redlining, the Medical-Debt Spiral, and the rest). Read its explainer aloud.
- Each round, the largest active Pattern **tightens** (+1 Squeeze on its weakest member).
- Pull any one of its districts back below Squeeze 2 and the Pattern breaks.

## Roles
| Role | Gift |
|---|---|
| **Translator** | Teaches for free (still needs to read the district better than the learner). |
| **Student** | Gains double Read when taught. |
| **Elder** | Starts with Read 1 everywhere. Once per game, *Teach the History*: a district wakes instantly. Draw a History card for that district and read it aloud. |
| **Veteran** | Shields two Machine strikes per game. |
| **Organizer** | A successful NEGOTIATE drops Squeeze by 2. |

## Overlord mode (optional, 1 vs. many)
One player *is* the Machine. There is no hidden Owner and no automatic Machine phase. Each round the Overlord takes the moves on the setup table (strike +1 Squeeze, muddy −1 Clarity, tempt −1 Trust), obeying the spread rule. After the Underworld opens, the Overlord may muddy one woken, untraced district per round.

**The stranger's handwriting.** A Reader can tell when another Reader is close: their writing shows up on the paperwork, slanted and pressed too hard. Once per game, any block player may ask the Overlord *"Is that your handwriting?"* about the last deal faced. The Overlord must answer truthfully whether they struck, muddied, tempted or slipped a counterfeit in that deal's district this round. It costs the asker 1 Trust. (A table rule for a person playing the Overlord.)

**Counterfeits.** The Overlord holds **3 counterfeit deals**, fake honest help. Once per round, as one of its moves, it may slip one face-down on top of a district's deal pile without saying which (it doesn't use up that district's move under the spread rule). The next deal drawn there is the counterfeit. Its front, red and amber read like real help; only **Read 3** (blue) shows the word COUNTERFEIT.
- **TAKE** it and you're **conned**: Squeeze +1 there and Trust −1. No Shady: you didn't know you were cutting a corner.
- **WALK** is safe.
- **NEGOTIATE** with Read 3 **exposes** it: defused like any trap, plus 1 Props. Below Read 3 you get played.

When the Overlord has slipped one in, the safest reader for an "honest" deal is the one with Read 3. The Overlord's moves were retuned with counterfeits in hand (the setup table); the computer Overlord plays at 54–64% block wins.

Everything else is the same.

## Block Party: the 25-minute intro
Learn the game in one sitting. Everything not listed here is left in the box.
- **Districts:** Lending, Housing and Education only. **No** Roles, Owner, Scenario, Patterns or Underworld. No Cookout, Sou-Sou or Green Book.
- **Each turn:** 2 actions (3 if you play solo): **Study**, **Face a deal**, **Teach**, or **Gather** (+2 Trust, −1 Shady; there are no places yet).
- **Win:** wake **2 of the 3** districts (Clarity 3). You win the moment the second one wakes.
- **Lose:** 2 districts captured (Squeeze 3), or round **8** ends.
- **The shortcut:** TAKE a trap and it patches Squeeze −2 now, or +1 Clarity where there's no Squeeze. It costs **2 Shady chips**. At **3 chips**, hand them back and **sit out your next turn**. Nobody Falls in Block Party.
- **The Machine:** after everyone's turns it strikes the district closest to waking: **+1 Squeeze and −1 Clarity**. It may strike the same district more than once. Strikes per round, printed on the round track:

| Players | Rounds 1–8 |
|---|---|
| 2 | 0, 1, 1, 1, 0, 1, 1, 1 |
| 3 | 1, 2, 2, 2, 1, 2, 2, 2 |
| 4 | 3 every round |
| 5 | 4 every round |

Block Party plays at about 58–77% wins (`balance_test.py`), and careful play beats grabbing shortcuts. When you've won one, play the Full Block.

## Sign-now clocks (on by default)
Some traps push a deadline: *"Move in today," "Enroll now," "Approved!"* They're marked ⏱ (`deck_cards.RUSH`). When you draw one, the table counts down from 15 out loud while you decide. **The deadline is always fake:** if the count runs out, nothing happens. The offer is still there. If your Read in that district is 2 or more (amber, the clock), you see that from the start, so no one counts. On the website the clock runs on screen, the TAKE button becomes **SIGN NOW**, and the end of the game says how many decisions you made with the clock running.

## The dollar count (the end of every game)
Every deal card carries the real money behind it: what signing that trap typically costs one household over about a year, or what an honest deal is worth (the answer key's last column; `deck_cards.DOLLARS`). At the end of the game, add up and say out loud:
- the traps the table **signed** (its shortcuts), and the most expensive one,
- the honest help it **walked away from**,
- what it **stayed out of** by reading and walking, and who **got played**.

Win or lose, the points turn back into money. The website does the count for you. Era cards in the campaign count in their era's dollars.

## Read your own deal
After the game, take out a real offer: a phone plan, a car loan, a rent-to-own receipt. The website's **Read your own deal** page works out its second number and the yearly rate it really charges, and shows it on a deal card. Nothing you type leaves your device.

## House rules (for tables that know the deck)
Turn any of these on. Each is in the website's setup, and in `sn_engine.py` as an option.

**Fine-print dice.** Ignore the lever printed on a trap. When you draw it, roll a d6 in the open: **1–3 red, 4–5 amber, 6 blue.** The cost, clock and connection on the card stay true; only where the leverage sits changes, so the deck can't be learned by heart. (4 players: 57% wins against 51% without it, a little easier.)

**The Terrell rule.** *Seeing it isn't the same as being safe to confront it.* When you're taught a district, you get the Read but not the cover. Until the block has your back, if you **TAKE or NEGOTIATE** a trap there, it backfires: **+1 Squeeze** in that district (then you've learned it the hard way, and you're covered). **WALK** is always safe. You get covered by gathering at any **Commons** or at the **Cookout**; the **Veteran** teaches the cover with the lesson. (4 players: 56% wins, if the table gets covered before it confronts; covering also refills Trust. Confront bare and it's far harder.)

**Endless deals.** Deal cards with blanks: *"Rent-to-own: a ___ for $___ a week, ___ weeks."* Roll or pick the numbers, then work out the second number. The 25 templates (5 per district) are in `deal_gen.py`; the website rolls a fresh one every draw, and the **Endless deals** page deals them one at a time for practice. (4 players: 59% wins. The templates are a little friendlier than the printed deck, which suits a classroom.)

**The math variant.** With endless deals, at Read 1 you work out the second number yourself before you look under the red glasses ("$20 a week × 78 weeks = ?"). Good for classrooms: it's the School Edition's default.

**Close reads.** When your Read is exactly one layer short of a trap's lever (Read 1 against amber, Read 2 against blue), NEGOTIATE becomes a roll: **5 or 6** on a d6 talks them down (Squeeze −1, Props +1); anything else and you get played as usual. Two layers short, no roll. (About +0–3 points.)

**“Render?”** Each player has **1 Face token**. When you face a deal, a teammate who reads that district better may read it for you: their Read decides what you see and whether you can beat it. It costs your Face token. The Cookout gives everyone's Face back. The name is the novel's: before the Sight reads someone, it asks one word, *Render?*, and Marcus learns when to say no. (About +2 points.)

## A block that remembers (the website)
Play on as the same block. After each full co-op game, your block keeps what happened, one block per Your City edition: districts you **woke** start the next game a step ahead (**Clarity +1**), districts that were **captured** carry a **scar** (**Squeeze +1**), and after a **loss** the community rallies (everyone **+1 Trust**). Wake a scarred district to heal it. Tested over runs of 8 games: no losing spiral (2 players win 43% after a loss and 42% after a win; 4 players 50% and 55%). Block Party always starts fresh. At the table: write the woken and captured districts on the back of the rulebook and set them up next time.

## Campaigns
Two campaigns string games together, each chapter one game with its own setup and twist. Play any chapter on its own, or play them in order as one family: what you win or lose carries forward. On the website: **Play → Campaign**; the website keeps the family on the device.

**The Long Ledger** (see `CAMPAIGN.md`): one West Dayton family across six eras. **1** *Freedom's Ledger* (1865–1877), **2** *Up North* (1910s–1940s), **3** *The Map* (1930s–1960s), **4** *Voice* (1955–1970), **5** *The Plants Close* (1990s–2009), **6** *Today* (2018–). Two districts in Chapters 1–5 use an era deck. Between chapters:
- **The Family Ledger** (−10 to +10): a win is +2 and +1 per woken district; a loss is −2 and −1 per captured district; −1 per Fall, +1 per Reach.
- **Stickers:** a district woken at the end heals a Scar, or is **Rebuilt**; a captured one is **Scarred** (2 per district at most). Rebuilt takes 1 Squeeze off a district the era starts squeezed, or else adds Clarity 1; Scarred adds Squeeze 1.
- **The community rallies:** after a lost chapter, everyone starts the next with +1 Trust.
- **The Family Decision:** one choice after each chapter that changes the next one's setup.

**Chapter 3, The Map**, with its own printed envelope:
- **Setup:** swap in the era Housing and Lending decks; start both at Squeeze 2 (REDLINING is active); the Owner is *The Appraiser*.
- **The twist:** from round 2, while REDLINING is active, it tightens a second time every round.
- **The League:** an action to sign. If every player signs in the same round, it forms: Housing −2 at once, Housing −1 every second round after, and Housing and Lending traps are beatable at Read 1. If anyone hasn't signed by the Machine phase, the pledges fall apart.

**Book One** (see `BOOK_ONE.md`): four chapters that follow the novel. **1** *The Chain* (a Block Party where every lesson passes on), **2** *The Net* (the Desk), **3** *The Crown* (Overlord mode, and the Crown that keeps you from Falling while the block pays for it), **4** *The Empty Throne* (no one can Expose until everyone has taught, and nobody holds more than half the Props).

## Scoring
Win or lose, the player with the most **Props** is the one who lifted the most people. Props come only from studying, teaching, defusing, reaching and tracing, never from taking.

> *How high did you climb before you turned into the thing you were fighting?*
