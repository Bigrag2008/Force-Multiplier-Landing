#!/usr/bin/env python3
"""
Export the game's content and tuning constants from the Python source of truth
(deck_cards.py, chapters.py, sn_engine.py) to src/content/content.json for the web app.

  npm run content        (or: python3 scripts/export_content.py)

Re-run after any change to cards, chapters or constants. The parity tests fail
if the TypeScript engine and this file disagree with the Python engine.
"""
import json, os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); GAME=os.path.join(os.path.dirname(HERE),"game")
sys.path.insert(0,GAME)
import deck_cards as D, chapters as CH, sn_engine as E, deal_gen as G

CONST_NAMES=["WAKE","CAPTURE","FLIP","GRIP","LOSE_CAPTURED","UNDERWORLD_AT","THREADS_TO_WIN","TAKE_CORRUPT",
             "NEG_COST","START_TRUST","MAX_TRUST","MAX_ROUNDS","SOUSOU_HAND","LEAGUE_PUSH",
             "ACTIONS","MACHINE_HITS","OVERLORD_MOVES","BP_DISTRICTS","BP_ROUNDS","BP_WAKE_TO_WIN","BP_TAKE",
             "BP_SIT_OUT","BP_ACTIONS","BP_HITS","FINE_PRINT_DIE","COUNTERFEIT_HAND","CON_TRUST","CLOSE_READ","FACE_TOKENS"]

def jsonable(v):
    if isinstance(v,dict): return {str(k):jsonable(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)): return [jsonable(x) for x in v]
    return v

content=dict(
    edition=D.EDITION, districts=list(D.DECK.keys()), districtColors=D.DISTRICT_COLORS,
    dayton=D.DAYTON, deck=D.DECK, roles=D.ROLES,
    patterns=[dict(combo=list(c),name=n,lesson=l) for c,n,l in D.PATTERNS],
    owners=D.OWNERS, scenarios=D.SCENARIOS, history=D.HISTORY, places=D.PLACES,
    chapters=CH.CHAPTERS, campaigns=CH.CAMPAIGNS, roster=[dict(name=n,role=r) for n,r in E.ROSTER],
    constants={k:getattr(E,k) for k in CONST_NAMES},
    dealTemplates=G.TEMPLATES, slotOrder=list(G.SLOT_ORDER), counterfeits=D.COUNTERFEITS,
)
# the reference Your City edition (same shape as src/engine/edition.ts): a starting point for a new one
ref=dict(v=1, id="west-dayton", name=D.EDITION, city="Dayton, Ohio", area="the West Side", credits="The Second Number",
         districts={d:dict(sub=v["sub"],flavor=v["flavor"]) for d,v in D.DAYTON.items()},
         places={k:dict(name=v["name"],where=v["where"],flavor=v["flavor"]) for k,v in D.PLACES.items()},
         history={}, historyMode="add", resources=[])
os.makedirs(os.path.join(GAME,"editions"),exist_ok=True)
with open(os.path.join(GAME,"editions","west-dayton.json"),"w",encoding="utf-8") as f: json.dump(ref,f,ensure_ascii=False,indent=1)
# the Spanish edition: every game/i18n/es_*.json (English → Spanish) merged for the website
import glob
es={}
for f in sorted(glob.glob(os.path.join(GAME,"i18n","es_*.json"))):
    with open(f,encoding="utf-8") as fh: es.update(json.load(fh))
with open(os.path.join(os.path.dirname(HERE),"src","content","es.json"),"w",encoding="utf-8") as f: json.dump(es,f,ensure_ascii=False,indent=0)
out=os.path.join(os.path.dirname(HERE),"src","content","content.json")
with open(out,"w",encoding="utf-8") as f: json.dump(jsonable(content),f,ensure_ascii=False,indent=1)
print(f"wrote {out}: {sum(len(v) for v in D.DECK.values())} deals, {len(CH.CHAPTERS)} chapter(s)")
