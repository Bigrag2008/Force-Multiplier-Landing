#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — balance tester.
Runs many computer-played games and reports whether the game is 'solved'.
Re-run this every time you change a rule or a constant in sn_engine.py.

  python3 balance_test.py              # 2000 games per mode
  python3 balance_test.py 500          # custom count
"""
import sys, collections
import sn_engine as E

def run_batch(n, overlord):
    res=collections.Counter(); rounds=[]; flips=0; takes=0; games_with_take=0
    by_owner=collections.Counter(); by_owner_win=collections.Counter()
    by_scen=collections.Counter();  by_scen_win=collections.Counter()
    for i in range(n):
        g=E.new_game(overlord=overlord, seed=i*7+ (1 if overlord else 0))
        out=g.run_auto()
        res[out]+=1; rounds.append(g.round)
        f=sum(1 for p in g.blk() if p.flipped); flips+=f
        t=sum(1 for ln in g.log if "TAKE the trap" in ln); takes+=t
        if t: games_with_take+=1
        if not overlord:
            by_owner[g.owner]+=1; by_scen[g.scenario]+=1
            if out=="BLOCK_WIN": by_owner_win[g.owner]+=1; by_scen_win[g.scenario]+=1
    return res, rounds, flips, takes, games_with_take, by_owner, by_owner_win, by_scen, by_scen_win

def pct(a,b): return f"{100*a/b:4.1f}%" if b else "  -  "

def report(title, n, overlord):
    res,rounds,flips,takes,gwt,bo,bow,bs,bsw = run_batch(n, overlord)
    bw=res["BLOCK_WIN"]; mw=res["MACHINE_WIN"]; dr=res["DRAW"]
    print(f"\n=== {title}  ({n} games) ===")
    print(f"  Block wins : {bw:5d}  ({pct(bw,n)})")
    print(f"  Machine wins: {mw:5d}  ({pct(mw,n)})")
    print(f"  Draws      : {dr:5d}  ({pct(dr,n)})")
    print(f"  avg rounds : {sum(rounds)/len(rounds):.1f}   (min {min(rounds)}, max {max(rounds)})")
    print(f"  games with ≥1 TAKE: {pct(gwt,n)}   total flips across all games: {flips}")
    if not overlord:
        print("  by Owner (win rate):   " + "  ".join(f"{o.split()[-1]}:{pct(bow[o],bo[o])}" for o in bo))
        print("  by Scenario (win rate):")
        for s in bs: print(f"      {s:<18}{pct(bsw[s],bs[s])}")
    return bw/n if n else 0

if __name__=="__main__":
    n=int(sys.argv[1]) if len(sys.argv)>1 and sys.argv[1].isdigit() else 2000
    print("THE SECOND NUMBER — balance report")
    print("A healthy game is NOT solved: neither side near 0% or 100%, games vary in length,")
    print("some players flirt with corruption (TAKE) and a few Fall.")
    coop = report("CO-OP", n, overlord=False)
    over = report("OVERLORD (block vs human-Machine AI)", n, overlord=True)
    print("\n--- verdict ---")
    def judge(name, wr):
        if wr>=0.95 or wr<=0.05: print(f"  {name}: SOLVED ({wr*100:.0f}% block wins) — needs tuning.")
        elif 0.35<=wr<=0.75:     print(f"  {name}: healthy ({wr*100:.0f}% block wins).")
        else:                    print(f"  {name}: swingy ({wr*100:.0f}% block wins) — playable, could tune.")
    judge("Co-op", coop); judge("Overlord", over)
