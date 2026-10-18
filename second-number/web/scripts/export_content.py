#!/usr/bin/env python3
"""
Export the game's content and tuning constants from the Python source of truth
(deck_cards.py, chapters.py, sn_engine.py) to src/content/content.json for the web app.

  npm run content        (or: python3 scripts/export_content.py)

Re-run after any change to cards, chapters or constants. The parity tests fail
if the TypeScript engine and this file disagree with the Python engine.
"""
import json, os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); GAME=os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0,GAME)
import deck_cards as D, chapters as CH, sn_engine as E

CONST_NAMES=["WAKE","CAPTURE","FLIP","GRIP","LOSE_CAPTURED","UNDERWORLD_AT","THREADS_TO_WIN","TAKE_CORRUPT",
             "NEG_COST","START_TRUST","MAX_TRUST","MAX_ROUNDS","SOUSOU_HAND","LEAGUE_PUSH",
             "ACTIONS","MACHINE_HITS","OVERLORD_MOVES"]

def jsonable(v):
    if isinstance(v,dict): return {str(k):jsonable(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)): return [jsonable(x) for x in v]
    return v

content=dict(
    edition=D.EDITION, districts=list(D.DECK.keys()), districtColors=D.DISTRICT_COLORS,
    dayton=D.DAYTON, deck=D.DECK, roles=D.ROLES,
    patterns=[dict(combo=list(c),name=n,lesson=l) for c,n,l in D.PATTERNS],
    owners=D.OWNERS, scenarios=D.SCENARIOS, history=D.HISTORY, places=D.PLACES,
    chapters=CH.CHAPTERS, roster=[dict(name=n,role=r) for n,r in E.ROSTER],
    constants={k:getattr(E,k) for k in CONST_NAMES},
)
out=os.path.join(os.path.dirname(HERE),"src","content","content.json")
with open(out,"w",encoding="utf-8") as f: json.dump(jsonable(content),f,ensure_ascii=False,indent=1)
print(f"wrote {out}: {sum(len(v) for v in D.DECK.values())} deals, {len(CH.CHAPTERS)} chapter(s)")
