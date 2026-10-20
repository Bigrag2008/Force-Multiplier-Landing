# Your City editions

The traps in *The Second Number* are the same everywhere: the payday loan, the rent-to-own couch, the "free" first month. The place isn't. A **Your City edition** sets the game on your own side of town, with your neighborhoods, your gathering places, your history and your real help. The rules, the deals and the balance stay exactly the same, so every edition plays like the original and can be taught the same way.

The West Dayton Edition is the first one. Its file, [`editions/west-dayton.json`](editions/west-dayton.json), is the example to copy.

## What an edition changes

| Part | What you write | What stays the same |
|---|---|---|
| **The edition** | Its name ("East Side Detroit Edition"), the city, what the board is called in play ("the East Side"), and who made it | — |
| **The five districts** | A nickname and one or two true sentences for each of Lending, Housing, Labor, Health and Education | The deals in each district |
| **Where the block gathers** | Five real places people go (a barbershop, a church, a park, a grocery, a kitchen table), with where they are and why people go | What each place does in the game (a free Teach, −2 Shady, +2 Read, draw 2 deals, everyone +2 Trust) |
| **Local history** | True stories of how your community fought back, for the Elder to tell. Each one needs a **source** | The base game's History cards, unless you choose to use only yours |
| **Real help near you** | Credit unions, free tax prep, tenant legal aid, community health centers | Shown at the end of every game, and on Read your own deal |

## How to make one

1. **Make it with your community, not just about it.** Gather the people who live there: a youth group, a class, a church, a block club. The best editions come from a room of neighbors arguing over which barbershop counts.
2. **Name the districts.** For each one, find where it happens in your city (the website's builder describes what each district stands for). Use the names people actually say. Keep the description to what's true and what neighbors would recognize, not what outsiders say about the place.
3. **Pick the five gathering places.** They have to be real and welcoming. If you name a business, ask the owner first; most are proud to be in it.
4. **Write the history, and check it.** Every story is read aloud as true, so every card needs a source you checked: a book, a newspaper archive, a museum, a historical society, or an elder by name *with their permission*. Lead with how people fought back, not only with what was done to them. Don't name private people without their family's blessing.
5. **List real help, and call first.** Only list places that are open, do what you say, and serve your neighbors. Check them again before every printing.
6. **Build it.** The easiest way is the website: **Your City editions** on the home page. Start new or start from West Dayton, fill it in, and the page tells you what's left before it can be played. It saves on your device. You can also edit a copy of `editions/west-dayton.json` by hand.
7. **Playtest it.** In setup, choose your edition under **Where you're playing**. Your district nicknames are on the board, your places are in the Commons, and the Elder tells your stories. Play a Block Party with people who know the neighborhood and fix anything that rings false.
8. **Share it.** From the builder, **Copy a share code** (it starts with `SNE1.`) or **Download as a file**. Anyone can add it under *Add an edition someone shared*. It travels with every game played in it, including online games, so other phones get it too.
9. **Print it.** Download the file, then run:

   ```
   python3 print_kit/build_print_and_play.py --edition my-city.json
   ```

   You get your own print-and-play kit: your edition's name on the cover and every page, your nicknames on the board and deal cards, your places on the board, your History cards, and an edition page in the rulebook with your districts, places, history sources and real help. The rest of the rulebook still describes West Dayton's tables; the edition page tells readers to use yours.

## What an edition can't change (yet)

- **The deals.** They're national traps, documented in the base deck. Local versions of a deal (your state's payday cap, your city's rental rules) are a good idea for a future version; until then, put them in your History cards or your real-help list.
- **The art.** The district scenes and colors are the base game's.
- **The rules and the numbers.** That's what keeps every edition fair and lets a teacher's view compare classes.

## The file, field by field

```json
{
  "v": 1,
  "id": "east-side-detroit",
  "name": "East Side Detroit Edition",
  "city": "Detroit, Michigan",
  "area": "the East Side",
  "credits": "The ___ Youth Council",
  "districts": { "LENDING": { "sub": "nickname", "flavor": "one or two true sentences" }, "HOUSING": {}, "LABOR": {}, "HEALTH": {}, "EDUCATION": {} },
  "places": { "BARBERSHOP": { "name": "", "where": "", "flavor": "" }, "CHURCH": {}, "ADVENTURE": {}, "MARKET": {}, "KITCHEN": {} },
  "history": { "HOUSING": [{ "title": "", "year": "", "place": "", "story": "", "lesson": "", "source": "" }], "ANY": [] },
  "historyMode": "add",
  "resources": [{ "name": "", "what": "", "where": "" }]
}
```

`historyMode` is `"add"` (your stories join the base game's) or `"replace"` (only yours, in each district where you wrote at least one). The place keys are the base game's five: the Barbershop (next Teach free), the Church (−2 Shady), Adventure Central (next Study +2 Read), Gem City Market (next deal: draw 2, face 1), and Grandma's Kitchen Table (once per game: everyone +2 Trust). Name yours after what's real where you live.
