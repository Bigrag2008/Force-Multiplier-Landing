# The Second Number: art brief

*For an illustrator. Read with [ART_DIRECTION.md](ART_DIRECTION.md), which sets the look; this page says what to make, at what size, and where it goes.*

**The game:** a cooperative board game, played on a website and on paper, set on the West Side of Dayton, Ohio. Neighbors learn to read the hidden cost in predatory deals (payday loans, rent-to-own, "free" first months), teach each other, and expose the one Machine behind them. It should look like the block on its best day: proud, loud, funny, stylish, and nobody's fool.

**What's there now:** flat vector placeholders drawn in code (the five district scenes, five role portraits and the four-panel story). They show the composition and palette; your art replaces them. Play the site to see them in place: choose **Learn to play**.

---

## Deliverables

### 1. Five district scenes
One wide scene per district. On the website they show as a banner strip (about 5:2, cropped to the middle), so keep the subject centered with room to crop top and bottom.

| District | Color (Kool-Aid flavor) | Scene | Landmarks to draw on (stylized, not photo-real) |
|---|---|---|---|
| **Lending** | Lime `#3FA34D` | Payday on every corner: the bank branch closed, the storefront lenders open | Check-cashing and payday storefronts with hand-painted signs; a shuttered branch |
| **Housing** | Fruit Punch `#E03C31` | Wright-Dunbar to Madden Hills: historic homes, empty lots, families who never left | The Paul Laurence Dunbar House; brick row houses on the stoop; a "For Sale" lot |
| **Labor** | Blue Raspberry `#1F7AE0` | After the plants closed (GM Moraine 2008, NCR's move 2009) | A plant gate, cold smokestacks; people who still show up for each other |
| **Health** | Grape `#8E3BB8` | A hospital gone: Good Samaritan closed in 2018 | The closed hospital; the long way to care; a neighbor checking on a neighbor |
| **Education** | Orange `#F28C1B` | Dunbar High to Central State | Dunbar High School, a school bus, Central State and Wilberforce down the road |

- **Size:** 2000 × 800 px (5:2), WebP or PNG, under 400 KB each.
- **Files:** `public/art/districts/lending.webp`, `housing.webp`, `labor.webp`, `health.webp`, `education.webp`.

### 2. Five role portraits, as church hand fans
Each role card is a **church fan**: a portrait on a round fan face with a scalloped edge and a wooden handle. Deliver the **portrait only** (the face of the fan, square); the site draws the gold scalloped frame and handle around it.

| Role | Who (from the game) | Placeholder notes |
|---|---|---|
| **The Translator** | Teaches for free; the bridge who spreads reading fastest | Young man, fade and beard; speaks two languages |
| **The Student** | Learns double when taught; the hungry one | Teen girl, puffs, backpack, a book |
| **The Elder** | Reads a little everywhere; tells the History that wakes a district | Grandmother in a church hat, pearls, and **red reading glasses** (the game's lens: keep these) |
| **The Veteran** | Shields the block from Machine hits; came home to protect it | Older man, veteran's cap, salt-and-pepper beard |
| **The Organizer** | Negotiates twice as hard: collective action | Locs, megaphone; consider a wheelchair user or a pregnant organizer (ART_DIRECTION §6) |

- **Size:** 800 × 800 px, centered head-and-shoulders (it's cropped to a circle), WebP or PNG.
- **Files:** `public/art/roles/translator.webp`, `student.webp`, `elder.webp`, `veteran.webp`, `organizer.webp`.
- The **Machine and its Owner have no face.** Draw them, if anywhere, as paperwork, gears and faceless hands. Never draw the Machine as Black people.

### 3. Optional, phase two
- **The four-panel story** (the block, the deals, the Machine, your mission): 1600 × 900 each. See `src/ui/IntroComic.tsx` for the beats.
- **Card frames** for deal cards (real paperwork: leases, receipts, hospital bills) and the History cards.
- **The board as a map-quilt** for the printed edition (ART_DIRECTION §5).

---

## Style, in short
- **Flat color, bold outlines** (Emory Douglas), **Kool-Aid brights** (AfriCOBRA), **figures in panels** (Jacob Lawrence). Funk record sleeve, not pamphlet.
- **People:** the full range of Black skin, warm and accurate; natural hair, braids, locs, fades, church hats, durags; grandmothers to teenagers. Joy first: mid-laugh, mid-argument, dressed for church or the shift.
- **Never:** caricature, minstrel-adjacent features, "ghetto" signifiers, trauma for shock, generic "African" decoration.
- **Keep the lens colors exact** wherever the glasses or decoder ink appear (ART_DIRECTION §3): the reading trick depends on them.

## Putting the art in
1. Save the files under `public/art/` with the names above.
2. List them in [`src/ui/art/manifest.ts`](../src/ui/art/manifest.ts), for example
   `districts: { LENDING: "/art/districts/lending.webp" }`, `roles: { Elder: "/art/roles/elder.webp" }`.
3. Anything not listed keeps the drawn placeholder, so art can land one piece at a time.

## Rights and credit
Commission originals; influences are inspiration, never copies. The artist is credited in the rulebook and on the site. Agree in writing on use in the website, the print-and-play kit and a manufactured edition. Prefer Black artists from Dayton or Ohio (see COMMUNITY.md).

## Drafts with an image generator
Fine for **mood boards and placeholders only**, never as final art. If you do, prompt with the scene and the style line above, name the district color, ask for "flat vector illustration, bold black outlines, no text", and review every image against §6 of ART_DIRECTION before anyone else sees it.
