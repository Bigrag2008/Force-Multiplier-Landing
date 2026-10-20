# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — a campaign's memory between chapters (CAMPAIGN.md, BOOK_ONE.md).

A campaign is a plain dict, so it saves as JSON (the website keeps it in the browser). The engine reads it
at setup (Game(campaign=state)): the board stickers, the rally after a loss, the last Family Decision and
the Book One flags. After a chapter, advance() writes what happened into it.

  state = new_state("LEDGER")
  g = sn_engine.new_game(chapter="FREEDOMS_LEDGER", campaign=state); g.run_auto()
  state = advance(state, "FREEDOMS_LEDGER", g.chapter_result(), decision="GO")
"""
import chapters as CH

MAX_STICKERS = 2      # per district, Rebuilt and Scarred together

def new_state(campaign):
    return dict(campaign=campaign, played=[], ledger=0, stickers={}, decisions={}, flags=[], unlocks=[],
                rally=False, falls=0, defend=True, quit_desk=None)

def next_chapter(state):
    """The next chapter to play, or None when the campaign is over."""
    done={p["chapter"] for p in state["played"]}
    return next((k for k in CH.CAMPAIGNS[state["campaign"]]["chapters"] if k not in done), None)

def advance(state, chapter, result, decision=None):
    """What the chapter writes into the campaign. result is Game.chapter_result(); decision is the key of the
    Family Decision the table chose (Long Ledger), or None."""
    s={**state, "played":list(state["played"]), "stickers":{d:dict(v) for d,v in state["stickers"].items()},
       "decisions":dict(state["decisions"]), "flags":list(state["flags"]), "unlocks":list(state["unlocks"])}
    ch=CH.CHAPTERS[chapter]
    gain=result["ledger"]
    if s["campaign"]=="LEDGER":
        st=s["stickers"]
        # a woken district heals a Scar first, or is Rebuilt; a captured one is Scarred (2 stickers at most)
        for d in result["rebuilt"]:
            x=st.setdefault(d,{"rebuilt":0,"scarred":0})
            if x["scarred"]: x["scarred"]-=1
            elif x["rebuilt"]+x["scarred"]<MAX_STICKERS: x["rebuilt"]+=1
        for d in result["scarred"]:
            x=st.setdefault(d,{"rebuilt":0,"scarred":0})
            if x["rebuilt"]+x["scarred"]<MAX_STICKERS: x["scarred"]+=1
        # the Fallen across generations: a later win with no Falls redeems one mark
        if result["falls"]: s["falls"]+=result["falls"]
        elif result["won"] and s["falls"]: s["falls"]-=1; gain+=2
        if decision:
            assert decision in [o["key"] for o in ch["decision"]["options"]], decision
            s["decisions"][chapter]=decision
            if (chapter,decision) in (("FREEDOMS_LEDGER","STAY"),("THE_MAP","STAY")): gain+=1
            if chapter=="THE_MAP" and decision=="MOVE":
                x=st.get("HOUSING")
                if x and x["scarred"]: x["scarred"]-=1
            if chapter=="PLANTS_CLOSE" and decision=="SELL":
                x=st.get("HOUSING")
                if x and x["rebuilt"]: x["rebuilt"]-=1
        s["stickers"]={d:x for d,x in st.items() if x["rebuilt"] or x["scarred"]}
        s["rally"]=result["rally"]
    else:   # Book One: flags
        f=set(s["flags"])
        if chapter=="B1_CHAIN":
            if result["burned"]: f.add("TERRELL")
            if result["won"]: f.add("CIVIC_ARMOR")
        if chapter=="B1_NET" and result["quit_desk"]: s["quit_desk"]=result["quit_desk"]
        if chapter=="B1_CROWN" and result["crown"]: f.add("CROWN_WORN")
        s["flags"]=sorted(f)
    s["ledger"]=max(-10,min(10,s["ledger"]+gain))
    s["unlocks"]+= [u for u in result["unlocks"] if u not in s["unlocks"]]
    s["played"].append(dict(chapter=chapter, won=result["won"], ledger=gain, decision=decision))
    return s

def let_go(state, district):
    """Chapter 5's choice, made before it starts: let one Rebuilt district go (remove a sticker),
    or keep defending (district=None: the Machine strikes Rebuilt districts first)."""
    s={**state, "stickers":{d:dict(v) for d,v in state["stickers"].items()}}
    if district:
        x=s["stickers"].get(district)
        if x and x["rebuilt"]: x["rebuilt"]-=1
        s["stickers"]={d:x for d,x in s["stickers"].items() if x["rebuilt"] or x["scarred"]}
        s["defend"]=False
    else: s["defend"]=True
    return s
