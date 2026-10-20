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
                players=[dict(name=p.name, role=p.role, trust=p.trust, corruption=p.corruption, legend=p.legend,
                              flipped=p.flipped, shields=p.shields, sight=p.sight,
                              bare=sorted(p.bare), benched=p.benched) for p in g.players])

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
PY={"party":"party","finePrint":"fine_print","terrell":"terrell","endless":"endless"}
for k in (2,3,4,5):
    for seed in (1,2,3):
        configs.append(dict(mode="coop", players=k, style=("careful","human","greedy")[seed-1], seed=seed*31+k, rot=seed,
                            rules=dict(party=True)))
for i,rules in enumerate(({"finePrint":True},{"terrell":True},{"endless":True},
                          {"finePrint":True,"terrell":True,"endless":True},{"party":True,"endless":True,"finePrint":True})):
    for k in (2,4,5):
        for style in ("careful","human"):
            configs.append(dict(mode="coop", players=k, style=style, seed=500+i*10+k, rot=i, rules=rules))

games=[]
for cfg in configs:
    g=E.new_game(overlord=cfg["mode"]=="overlord", seed=cfg["seed"], roster=[tuple(x) for x in roster(cfg["players"],cfg["rot"])],
                 chapter="THE_MAP" if cfg["mode"]=="chapter" else None, scenario=cfg.get("scenario"), owner=cfg.get("owner"),
                 **{PY[k]:v for k,v in cfg.get("rules",{}).items()})
    g.run_auto(style=cfg["style"])
    games.append(dict(config=dict(cfg, roster=roster(cfg["players"],cfg["rot"])), final=snapshot(g), log=g.log,
                      chapterResult=g.chapter_result() if g.chapter else None))
out=os.path.join(os.path.dirname(HERE),"tests","golden.json")
with open(out,"w",encoding="utf-8") as f: json.dump(games,f,ensure_ascii=False)
wins=sum(x["final"]["result"]=="BLOCK_WIN" for x in games)
print(f"wrote {out}: {len(games)} games, {sum(len(x['log']) for x in games)} log lines, {wins} block wins")
