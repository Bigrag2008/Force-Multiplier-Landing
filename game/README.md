# The Second Number

A cooperative board game about reading the hidden cost in every deal, and teaching your whole block to read it too. **West Dayton Edition:** set on the West Side of Dayton, Ohio, and built from Black American culture. Part of the Individual Democracy / Civic Armor universe.

| File | What it is |
|---|---|
| `RULES.md` | The table rulebook (v4): one word per idea, the Block Party intro, the ladder, and the house rules. Matches the engine rule for rule. |
| `YOUR_CITY.md` | How to make a Your City edition: your districts, places, history and real help, on the website or as a file, and how to print it (`print_kit/build_print_and_play.py --edition my-city.json`). `editions/west-dayton.json` is the example. |
| `BOOK_ONE.md` | The novel and the game: how the Sight maps to the lens, the four-chapter *Book One* campaign, and the School Edition. |
| `deal_gen.py` | Deal templates with blanks, for endless deals and the math variant. The website rolls the same templates. |
| `The_Second_Number_BOARD_GAME.md` | The design brief: vision, soul, roadmap. |
| `ROADMAP.md` | The West Dayton Edition change list, one commit per item. |
| `ART_DIRECTION.md` | The look: palette, influences, components, drawing people. |
| `CAMPAIGN.md` | The Legacy campaign, *The Long Ledger*: six chapters, all built. |
| `chapters.py` | Every campaign chapter (The Long Ledger and Book One): setup, twist, Owner face, unlocks, Family Decision. |
| `eras/` | The era decks for Chapters 1, 2, 4 and 5, and [`FACT_CHECK.md`](eras/FACT_CHECK.md), what the historian checks before print. |
| `RULES.es.md` | The rulebook in Spanish. |
| `i18n/` | The Spanish edition's card text (`es_*.json`) and the glossary every translation follows (`GLOSSARY.md`). |
| `campaign.py` | What a family carries between chapters: the Ledger, stickers, decisions, flags. |
| `The_Long_Ledger_Chapter*.pdf`, `Book_One_Chapter*.pdf` | The printable envelope for every campaign chapter: rules, era deals, chapter cards; the lineage sheet and stickers (Long Ledger 1 and 3) or the ledger sheet (Book One 1). |
| `print_kit/build_chapter_pack.py` | Rebuilds every envelope (or one: `… THE_MAP`). |
| *(repo root)* | **The online game:** the Next.js website at the top of this repo. See the main `README.md` to run, play and deploy it. |
| `COMMUNITY.md` | People, partners, permissions and the fact-check list. |
| `deck_cards.py` | All card content: 76 deals (60 traps with levers + 16 honest), roles, Owners, scenarios, patterns, History, Commons places, the Dayton setting. |
| `sn_engine.py` | The rules engine. The single source of truth. |
| `second_number_play.py` | Playable, colorized terminal edition (hotseat, 2–5 players, co-op or Overlord). |
| `balance_test.py` | Plays thousands of computer games and reports whether the game is solved. |
| `test_rules.py` | One check per rule, pinning `RULES.md` to the code. |
| `balance_report.txt` | The latest balance run (500 games per row), with Block Party and the house rules. |
| `The_Second_Number_PRINT_AND_PLAY.pdf` | The 36-page West Dayton print-and-play kit. |
| `print_kit/build_print_and_play.py` | Rebuilds the kit from `deck_cards.py` and `RULES.md` (`--lang es`: the Spanish kit, from `RULES.es.md` and `i18n/es_*.json`). Re-run after any card or rule change. |

```bash
python3 second_number_play.py              # play
python3 second_number_play.py --auto       # watch a demo (add --overlord for 1-vs-many, --map for Chapter 3)
python3 test_rules.py                      # rule checks
python3 balance_test.py                    # balance report; re-run after any rule change
python3 print_kit/build_print_and_play.py  # rebuild the print-and-play PDF (needs reportlab + pypdf)
```

Python 3.8+, no dependencies. Run these from the `game/` folder. The online game needs Node.js 20+: from the repo root, `npm install && npm run dev`.
