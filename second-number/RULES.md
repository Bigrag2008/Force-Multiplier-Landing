# THE SECOND NUMBER — Rulebook (v3, West Dayton Edition)

*A cooperative game for 2–5 players, ages 12+, about 45–60 minutes.*
*Read the machine. Wake the block. Crack the Underworld. Don't become it.*

These rules match `sn_engine.py` exactly. If you change one, change the other, then re-run `python3 balance_test.py` and `python3 test_rules.py`.

---

## What's in the box
- **76 Deal cards**: 12 real traps per district (Lending, Housing, Labor, Health, Education), plus 3 honest deals each and a 4th in Health (Gem City Market).
- **5 Role cards**, **4 Owner cards** (one is shuffled face-down under the board), **7 Scenario cards**, **12 Pattern cards**, **12 History cards**.
- **The board:** five districts. Each has a Clarity track (0–3) and a Machine track (0–3).
- Player boards with Trust (0–5), Corruption (0–6) and Sight (0–3 per district) tracks.
- **A red decoder lens.** The deluxe edition adds amber and blue lenses.
- About 40 small tokens (coins, beans or beads) for the tracks.

### Reading a Deal card
| Part | What it is | You can read it at |
|---|---|---|
| Front | The pitch everyone sees | always |
| 🔴 Red | The real **cost** | Sight 1 in that district |
| 🟠 Amber | The **clock**: the deadline or your rights window | Sight 2 |
| 🔵 Blue | The **connection**: who's really behind it | Sight 3 |
| 🔑 Lever (inside the red zone) | Which layer holds the leverage to **beat** it, or "honest deal" | Sight 1 |

**Read only what your Sight allows.** Hold the lens over the zones your Sight in that district unlocks, and no deeper. On your honor, and with the table watching.

**Seeing is not beating.** Sight 1 tells you whether a deal is a trap or honest. To *negotiate* a trap down, you need Sight that reaches its **lever**: red (1), amber (2) or blue (3). Honest deals have no lever.

---

## Setup
1. Pick a **Scenario** (start with *The Audit* or *A Quiet Year*) and apply it.
2. Shuffle the **Owner** cards and slide one face-down under the board. Don't look at it.
3. Each player takes a **Role**, 2 Trust, 0 Corruption, and Sight 0 everywhere (the Elder starts with Sight 1 everywhere).
4. Look up your player count on the table below:

| Players | Actions per turn | Machine strikes per round | Overlord moves per round |
|---|---|---|---|
| 2 | 3 | 1 | 2 |
| 3 | 3 | 3 | 4 |
| 4 | 2 | 1, or 2 on even rounds | 2, or 3 on even rounds |
| 5 | 2 | 2, or 3 on even rounds | 3, or 4 on even rounds |

---

## A round
**0. The Cookout (once per game).** At the start of a round the table may call the Cookout instead of taking turns (see below).

**1. Block turns.** Each player in turn takes their actions, choosing from these (repeats allowed):

| Action | What it does |
|---|---|
| **Study** | +1 Sight in one district. +1 Legend. |
| **Face a deal** | Draw a card from a district, read what your Sight allows, then choose **TAKE / WALK / NEGOTIATE** (below). |
| **Teach** | Give a teammate +1 Sight in a district where you read *better* than they do (never above your own Sight). Costs 1 Trust; free for the Translator. +2 Legend. **Call and response:** draw a deal from that district and read its red layer aloud. If your learner says the second number back, you both gain +1 Legend. |
| **Commons** | Gather at a place on the West Side: +2 Trust (max 5) and −1 Corruption, plus that place's bonus (below). |
| **Reach** | Pull a Fallen player home: costs 2 Trust; they return with Corruption 4. +3 Legend. |
| **Trace** *(Underworld open only)* | Needs Sight 3 in a woken district. Place a blue thread there. +2 Legend. |
| **Expose** *(once enough threads are traced)* | You win. |

**2. The Sou-Sou (optional).** The table may throw a hand (see below).

**3. Check.** If total Clarity across the board is **9 or more**, the Underworld cracks open (see below).

**4. The Machine moves.**
- It **strikes** the unwoken district closest to waking: +1 Pressure. It makes as many strikes as the table says, **each on a different district**.
- It **muddies** the strongest unwoken district: −1 Clarity.
- Then the Scenario, the hidden Owner, and any Patterns act.

**5. Check for loss.** You lose if **2 districts are captured** (Pressure 3), if **everyone has Fallen**, or if **round 12 ends**. The clock is the Machine's best friend.

### The spread rule
The Machine, the Overlord and the Fallen together may act on **each district at most once per round**. The Machine spreads; it doesn't snipe.
- Patterns are the system itself, so they tighten regardless.
- A **woken** district (Clarity 3) is safe from the Machine until the Underworld opens.

---

## Facing a deal: TAKE · WALK · NEGOTIATE
| | On an **honest** deal | On a **trap** |
|---|---|---|
| **TAKE** | Real help: +2 Trust, +1 Clarity, +1 Legend | **The shortcut.** If the district has Pressure, −2 Pressure *now*; otherwise +2 Clarity *now*. Either way you take +2 Corruption and 0 Legend. |
| **WALK** | You refused real help out of fear: −1 Trust | Safe. Nothing gained. |
| **NEGOTIATE** (costs 1 Trust) | You haggled away real help. The Trust is gone. | **Sight ≥ lever:** defused. −1 Pressure (−2 for the Organizer), +1 Clarity, +2 Legend. **Sight < lever:** you got played. +1 Pressure. |

Blind (Sight 0), you see only the front. Most deals are traps, but walking away from honest help costs Trust. Learning to read is how you stop guessing.

### The shortcut, and the Fall
TAKE on a trap really is the fastest way to save a district one strike from capture. That's what makes it a temptation and not a trap card with a skull on it. But at **Corruption 6 you Fall**:
- You stay at the table, and **the Machine moves through you**. On your turn you take Machine moves (Extract, Obscure, Tempt) instead of block actions.
- Your crew can **Reach** you back.
- If the Machine wins with you Fallen, you "won the board" and earned **0 Legend**. You don't win by becoming the thing you fight.

---

## The Commons: where the block gathers
Every Commons action happens somewhere. You get the base effect plus the place's bonus. Three places set up your **next action this same turn**, so plan your turn around them.

| Place | Where | Bonus |
|---|---|---|
| **The Barbershop & Beauty Shop** | West Third Street | Your next Teach this turn is free. |
| **The Church** | on the corner, every Sunday | −2 Corruption instead of −1. |
| **Adventure Central** | Wesleyan MetroPark | Your next Study this turn gives +2 Sight. |
| **Gem City Market** | the co-op grocery on Salem Avenue | Your next deal this turn: draw 2, face 1. |
| **Grandma's Kitchen Table** | the house everybody ends up at | Once per game: every player gets +2 Trust. |

## The Cookout: once per game
Call it at the start of any round, unless a district is one strike from capture. **Nobody takes block actions that round**; the whole block shows up, eats, and compares paperwork. Each player:
- gets +2 Trust, −1 Corruption and +1 Legend, and
- raises their Sight in **one district** to the best Sight anyone at the table has there.

The Fallen don't come; the Machine still moves through them, and the Machine phase happens as usual. Call it when what one of you knows needs to become what all of you know.

## The Green Book: one safe route
The block holds one copy of the Green Book, after the guide Black travelers used for decades to find the places that would serve them safely. **Once per game**, when a Machine strike (a strike, an Extract, or a scenario hit) would **capture** a district, you may open it: that strike takes a safe route and lands nowhere. It still counts as the Machine's move on that district this round.

## The Sou-Sou: the honest payday loan
A rotating savings circle, the way families and church members have long pooled money (also called a susu, "the hand," or "the club"). At the end of the block's turns, the table may **throw a hand**:
- Everyone who has Trust puts **1 Trust** into the pot.
- When the pot reaches **4**, the next player in the circle (going around the table) **takes the hand**: clear **2 Pressure** from any district, even a captured one. That debt is paid off clean, with **no Corruption**. +1 Legend to the player who takes the hand.
- Leftover Trust stays in the pot for next time.

The Sou-Sou does what the payday shortcut does, slower and together, and nobody Falls for it.

## The Underworld: the final act
When total Clarity reaches 9, flip the Owner card. **It fights in the open:**
- The Machine gets **+1 strike** per round.
- Once per round it **covers its tracks**: −1 Clarity on a woken district that doesn't yet have a thread.

To win, trace **3 blue threads**. Each needs **Sight 3 (blue)** in a woken district. Then take the **Expose** action. The districts looked separate; down here they're one machine.

---

## The History deck
When the Elder teaches the History of a district, shuffle that district's History cards with the two "any district" cards and draw one. Read the story and its lesson aloud. These are true stories, and most of them are about how the community fought back: the Contract Buyers League, Maggie L. Walker's bank, the Memphis sanitation strike, the Black Panther Party's free clinics, Wilberforce University, Paul Laurence Dunbar and the Wright brothers' print shop, Mayor James H. McGee, and more.

## Owners (hidden from round 1, so deduce them)
- **The Algorithm:** relentless. +1 Machine strike every round.
- **The Lobbyist:** leans on your strongest unwoken district every round (+1 Pressure). On reveal, it knocks one woken district back to Clarity 1.
- **The Debt Buyer:** every TAKE on a trap costs +1 Corruption. Each round, collections calls: anyone carrying Corruption loses 1 Trust. The Fallen take double moves.
- **The Recruiter:** each round, a random player loses 1 Sight in a district they can read.

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
- *The Eviction Wave:* Housing starts at Pressure 2.
- *The Closure:* Education starts captured. Reclaim it.
- *The Hospital Closes* (Dayton, 2018): Health starts at Pressure 2, and negotiating a Health deal costs 2 Trust.
- *The Plants Close* (Dayton, 2008): Labor starts at Pressure 2, and everyone starts with 1 Trust.

## Patterns
When every district in a combination is at Pressure 2 or more, flip that Pattern card (Redlining, the Medical-Debt Spiral, and the rest). Read its explainer aloud.
- Each round, the largest active Pattern **tightens** (+1 Pressure on its weakest member).
- Pull any one of its districts back below Pressure 2 and the Pattern breaks.

## Roles
| Role | Gift |
|---|---|
| **Translator** | Teaches for free (still needs to read the district better than the learner). |
| **Student** | Gains double Sight when taught. |
| **Elder** | Starts with Sight 1 everywhere. Once per game, *Teach the History*: a district wakes instantly. Draw a History card for that district and read it aloud. |
| **Veteran** | Shields two Machine strikes per game. |
| **Organizer** | A successful NEGOTIATE drops Pressure by 2. |

## Overlord mode (optional, 1 vs. many)
One player *is* the Machine. There is no hidden Owner and no automatic Machine phase. Each round the Overlord takes the moves on the setup table (Extract +1 Pressure, Obscure −1 Clarity, Tempt −1 Trust), obeying the spread rule. After the Underworld opens, the Overlord may Obscure one woken, untraced district per round. Everything else is the same.

## Scoring
Win or lose, the most **Legendary** player is the one who lifted the most people. Legend comes only from studying, teaching, defusing, reaching and tracing, never from taking.

> *How high did you climb before you turned into the thing you were fighting?*
