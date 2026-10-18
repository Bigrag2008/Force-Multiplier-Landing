# The Second Number

A cooperative board game about reading the hidden cost in every deal, and teaching your whole block to read it too. Part of the Individual Democracy / Civic Armor universe.

| File | What it is |
|---|---|
| `RULES.md` | The table rulebook (v3). Matches the engine rule for rule. |
| `The_Second_Number_BOARD_GAME.md` | The design brief: vision, soul, roadmap. |
| `deck_cards.py` | All card content: 75 deals (60 traps with levers + 15 honest), roles, Owners, scenarios, patterns. |
| `sn_engine.py` | The rules engine. The single source of truth. |
| `second_number_play.py` | Playable, colorized terminal edition (hotseat, 2–5 players, co-op or Overlord). |
| `balance_test.py` | Plays thousands of computer games and reports whether the game is solved. |
| `test_rules.py` | One check per rule, pinning `RULES.md` to the code. |
| `balance_report.txt` | The latest balance run (1,500 games per row). |
| `The_Second_Number_PRINT_AND_PLAY.pdf` | The 29-page print-and-play kit (v3). |
| `print_kit/build_print_and_play.py` | Rebuilds the kit from `deck_cards.py` and `RULES.md`. Re-run after any card or rule change. |

```bash
python3 second_number_play.py              # play
python3 second_number_play.py --auto       # watch a demo (add --overlord for 1-vs-many)
python3 test_rules.py                      # rule checks
python3 balance_test.py                    # balance report; re-run after any rule change
python3 print_kit/build_print_and_play.py  # rebuild the print-and-play PDF (needs reportlab + pypdf)
```

Python 3.8+, no dependencies.
