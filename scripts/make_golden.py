#!/usr/bin/env python3
"""
Record golden games from the Python engine for the TypeScript parity tests.

  npm run golden        (or: python3 scripts/make_golden.py)

Each game runs with the shared mulberry32 RNG (scripts/shared_rng.py) swapped in for
Python's `random`, so the TypeScript engine (same RNG) must reproduce every log line
and the final state exactly. Re-run after any engine change, then `npm test`.
"""
import json, os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); GAME=os.path.join(os.path.dirname(HERE),"game")
sys.path.insert(0,GAME); sys.path.insert(0,HERE)
import sn_engine as E
from shared_rng import SharedRng

E.random=SharedRng()          # the engine's only source of randomness

def roster(k, rot):
    r=E.ROSTER[rot%5:]+E.ROSTER[:rot%5]; return [list(x) for x in r[:k]]

def snapshot(g):
    return dict(result=g.result, round=g.round, scenario=g.scenario, owner=g.owner, ownerFace=g.owner_face,
                pressure=g.pressure, clarity=g.clarity, threads=sorted(g.threads), pot=g.pot, circle=g.circle,
                uwOpen=g.uw_open, greenBook=g.green_book, cookoutUsed=g.cookout_used, kitchenUsed=g.kitchen_used,
                leagueFormed=g.league_formed, money=g.money(),
                ds=g.ds, desk=g.desk, crowned=g.crowned, marched=g.marched, taught=sorted(g.taught),
                players=[dict(name=p.name, role=p.role, trust=p.trust, corruption=p.corruption, legend=p.legend,
                              flipped=p.flipped, shields=p.shields, sight=p.sight,
                              bare=sorted(p.bare), benched=p.benched, face=p.face) for p in g.players])

configs=[]
for k in (2,3,4,5):
    for style in ("careful","human","greedy","never"):
        for seed in (1,2):
            configs.append(dict(mode="coop", players=k, style=style, seed=seed*100+k, rot=seed))
    for seed in (1,2):
        configs.append(dict(mode="overlord", players=k, style="careful", seed=seed*1000+k, rot=seed))
    for seed in (1,2,3):
        configs.append(dict(mode="chapter", players=k, style=("careful","human","careful")[seed-1], seed=seed*7+k, rot=seed))
for sc in E.SCENARIOS:                      # every scenario at least once
    configs.append(dict(mode="coop", players=4, style="human", seed=99, rot=0, scenario=sc))
for ow in E.OWNERS:                         # every Owner at least once
    configs.append(dict(mode="coop", players=3, style="careful", seed=77, rot=1, owner=ow, scenario="A Quiet Year"))

# Block Party, and the house rules (fine-print dice, the Terrell rule, endless deals), alone and together
PY={"party":"party","finePrint":"fine_print","terrell":"terrell","endless":"endless","partial":"partial","render":"render","carry":"carry"}
for k in (2,3,4,5):
    for seed in (1,2,3):
        configs.append(dict(mode="coop", players=k, style=("careful","human","greedy")[seed-1], seed=seed*31+k, rot=seed,
                            rules=dict(party=True)))
for i,rules in enumerate(({"finePrint":True},{"terrell":True},{"endless":True},
                          {"finePrint":True,"terrell":True,"endless":True},{"party":True,"endless":True,"finePrint":True},
                          {"partial":True},{"render":True},{"partial":True,"render":True,"finePrint":True},
                          {"carry":{"clarity":{"HOUSING":1,"LABOR":1},"pressure":{"LENDING":1},"rally":True}})):
    for k in (2,4,5):
        for style in ("careful","human"):
            configs.append(dict(mode="coop", players=k, style=style, seed=500+i*10+k, rot=i, rules=rules))

for k in (2,3,4,5):                         # close reads, by a table that never takes the shortcut
    for seed in (1,2):
        configs.append(dict(mode="coop", players=k, style="never", seed=700+seed*10+k, rot=seed, rules={"partial":True}))
# every campaign chapter (The Long Ledger and Book One), fresh and with a family's memory carried in
import campaign as CP, chapters as CH
MID_LEDGER=dict(CP.new_state("LEDGER"), rally=True, falls=1, unlocks=["The Redlining Maps","I AM A MAN"],
                stickers={"HOUSING":{"rebuilt":1,"scarred":0},"LABOR":{"rebuilt":0,"scarred":1},"HEALTH":{"rebuilt":2,"scarred":0}},
                decisions={"FREEDOMS_LEDGER":"STAY","UP_NORTH":"SCHOOL","THE_MAP":"MOVE","VOICE":"RUN","PLANTS_CLOSE":"HOLD"})
MID_BOOK=dict(CP.new_state("BOOK_ONE"), flags=["CIVIC_ARMOR","CROWN_WORN","TERRELL"], quit_desk="Simone")
for key in CH.CHAPTERS:
    if key=="THE_MAP": continue
    for k in (2,3,4,5):
        configs.append(dict(mode="chapter", chapter=key, players=k, style=("careful","human")[k%2], seed=900+k, rot=k))
    mid=MID_BOOK if CH.CHAPTERS[key]["campaign"]=="BOOK_ONE" else MID_LEDGER
    for k in (3,5):
        configs.append(dict(mode="chapter", chapter=key, players=k, style="careful", seed=950+k, rot=k+1, campaign=mid))
configs.append(dict(mode="chapter", chapter="PLANTS_CLOSE", players=4, style="careful", seed=961, rot=2, campaign=dict(MID_LEDGER, defend=False)))
configs.append(dict(mode="chapter", chapter="UP_NORTH", players=4, style="careful", seed=962, rot=2, campaign=dict(MID_LEDGER, decisions={"FREEDOMS_LEDGER":"GO"})))
configs.append(dict(mode="chapter", chapter="TODAY", players=4, style="careful", seed=963, rot=2, campaign=dict(MID_LEDGER, decisions={"PLANTS_CLOSE":"SELL"})))
configs.append(dict(mode="chapter", chapter="THE_MAP", players=4, style="careful", seed=964, rot=2, campaign=dict(MID_LEDGER, decisions={"UP_NORTH":"CHURCH"})))
configs.append(dict(mode="chapter", chapter="THE_MAP", players=3, style="careful", seed=965, rot=2, campaign=dict(MID_LEDGER, decisions={"UP_NORTH":"HOUSE"})))
configs.append(dict(mode="chapter", chapter="PLANTS_CLOSE", players=5, style="careful", seed=966, rot=0, campaign=dict(MID_LEDGER, decisions={"VOICE":"ORGANIZE"})))

games=[]
for cfg in configs:
    g=E.new_game(overlord=cfg["mode"]=="overlord", seed=cfg["seed"], roster=[tuple(x) for x in roster(cfg["players"],cfg["rot"])],
                 chapter=cfg.get("chapter","THE_MAP") if cfg["mode"]=="chapter" else None, scenario=cfg.get("scenario"), owner=cfg.get("owner"),
                 campaign=cfg.get("campaign"),
                 **{PY[k]:v for k,v in cfg.get("rules",{}).items()})
    g.run_auto(style=cfg["style"])
    games.append(dict(config=dict(cfg, roster=roster(cfg["players"],cfg["rot"])), final=snapshot(g), log=g.log,
                      chapterResult=g.chapter_result() if g.chapter else None))
out=os.path.join(os.path.dirname(HERE),"tests","golden.json")
with open(out,"w",encoding="utf-8") as f: json.dump(games,f,ensure_ascii=False)
wins=sum(x["final"]["result"]=="BLOCK_WIN" for x in games)
print(f"wrote {out}: {len(games)} games, {sum(len(x['log']) for x in games)} log lines, {wins} block wins")

# whole campaigns, chapter by chapter: the TypeScript engine and campaign.ts must keep the same family record
runs=[]
for camp,k,seed in (("LEDGER",3,11),("LEDGER",4,12),("LEDGER",2,13),("BOOK_ONE",3,21),("BOOK_ONE",4,22)):
    st=CP.new_state(camp); steps=[]; i=0
    while (key:=CP.next_chapter(st)):
        ch=CH.CHAPTERS[key]; letgo=None
        if ch.get("defend_choice"):
            reb=sorted(d for d,x in st["stickers"].items() if x.get("rebuilt"))
            letgo=reb[0] if reb and seed%2 else None
            st=CP.let_go(st,letgo)
        g=E.new_game(seed=seed*100+i, roster=[tuple(x) for x in roster(k,seed+i)], chapter=key, campaign=st)
        g.run_auto(style="careful")
        opts=[o["key"] for o in ch["decision"]["options"]] if ch.get("decision") else []
        dec=opts[(seed+i)%len(opts)] if opts else None
        res=g.chapter_result(); st=CP.advance(st,key,res,dec)
        steps.append(dict(chapter=key, seed=seed*100+i, roster=roster(k,seed+i), letgo=letgo, decision=dec, result=res, state=st))
        i+=1
    runs.append(dict(campaign=camp, players=k, steps=steps))
out=os.path.join(os.path.dirname(HERE),"tests","campaigns.json")
with open(out,"w",encoding="utf-8") as f: json.dump(runs,f,ensure_ascii=False)
print(f"wrote {out}: {len(runs)} campaigns, {sum(len(r['steps']) for r in runs)} chapters")
