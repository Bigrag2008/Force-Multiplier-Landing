#!/usr/bin/env python3
"""
List every English string in the game's content that the Spanish edition needs, grouped for the
translators: game/i18n/todo_<group>.json. A translation lives in game/i18n/es_<group>.json as
{"English": "Español"}; `npm run content` merges them into src/content/es.json.

  python3 scripts/i18n_extract.py          # write the todo lists
  python3 scripts/i18n_extract.py --check  # how much is translated, by group
"""
import json, os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); GAME=os.path.join(os.path.dirname(HERE),"game")
sys.path.insert(0,GAME)
import deck_cards as D, chapters as CH, deal_gen as G

def card_strings(c):
    return [c.get(k) for k in ("front","red","amber","blue","basis","ask") if isinstance(c.get(k),str)]

groups={"base":[], "eras":[], "chapters":[]}
for d,cards in D.DECK.items():
    for c in cards: groups["base"]+=card_strings(c)
for c in D.COUNTERFEITS.values(): groups["base"]+=card_strings(c)
for d,ts in G.TEMPLATES.items():
    for t in ts:
        groups["base"]+=card_strings(t)
        groups["base"]+=[x for x in t.get("item",[]) if isinstance(x,str)]
groups["base"]+=["the numbers on this deal","what the real help is worth"]
for r,txt in D.ROLES.items(): groups["base"]+=[txt]
for o,txt in D.OWNERS.items(): groups["base"]+=[o,txt]
for s,txt in D.SCENARIOS.items(): groups["base"]+=[s,txt]
for c,n,l in D.PATTERNS: groups["base"]+=[n,l]
for d,hs in D.HISTORY.items():
    for h in hs: groups["base"]+=[h["title"],h["year"],h["place"],h["story"],h["lesson"]]
for k,p in D.PLACES.items(): groups["base"]+=[p[x] for x in ("name","where","flavor","bonus") if p.get(x)]
for d,v in D.DAYTON.items(): groups["base"]+=[v["sub"],v["flavor"]]
groups["base"]+=[D.EDITION]
for k,ch in CH.CHAPTERS.items():
    for d,cards in ch["decks"].items():
        for c in cards: groups["eras"]+=card_strings(c)
    for f in ("title","era","intro","twist","face","face_text","after"):
        if ch.get(f): groups["chapters"].append(ch[f])
    if ch.get("league"): groups["chapters"]+=[ch["league"]["name"],ch["league"]["text"]]
    if ch.get("decision"):
        groups["chapters"].append(ch["decision"]["text"])
        for o in ch["decision"]["options"]: groups["chapters"]+=[o["label"],o["text"]]
    groups["chapters"]+=ch["unlocks_always"]+ch["unlocks_if_won"]
for c in CH.CAMPAIGNS.values(): groups["chapters"]+=[c["title"],c["blurb"]]

seen=set()
for g in groups:                      # each string once, in the first group it appears in
    groups[g]=[s for s in dict.fromkeys(groups[g]) if s and s.strip() and not (s in seen or seen.add(s))]

out=os.path.join(GAME,"i18n")
if "--check" in sys.argv:
    for g,items in groups.items():
        import glob
        done={}
        for p in glob.glob(os.path.join(out,"es_*.json")): done.update(json.load(open(p,encoding="utf-8")))
        miss=[s for s in items if s not in done]
        print(f"{g:9s} {len(items)-len(miss):4d}/{len(items)} translated" + (f"  (first missing: {miss[0][:60]!r})" if miss else ""))
else:
    # split the long lists in two, so two translators can work at once
    parts={"base_a":groups["base"][:333],"base_b":groups["base"][333:],"eras_a":groups["eras"][:360],
           "eras_b":groups["eras"][360:],"chapters":groups["chapters"]}
    for g,items in parts.items():
        with open(os.path.join(out,f"todo_{g}.json"),"w",encoding="utf-8") as f: json.dump(items,f,ensure_ascii=False,indent=0)
        print(f"{g}: {len(items)} strings")
