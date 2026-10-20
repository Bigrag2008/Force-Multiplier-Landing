#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — balance tester.
Runs many computer-played games and reports whether the game is 'solved'.
Re-run this every time you change a rule or a constant in sn_engine.py.

  python3 balance_test.py              # 1000 games per cell
  python3 balance_test.py 300          # custom count (faster)

What it checks, and what "healthy" means:
  • every player count 2–5 sits in a 40–70% block-win band (co-op and Overlord)
  • almost no games are lost in round 1 (nobody loses before they've played)
  • "careful" play (TAKE only to save a district) beats "never TAKE"  → the shortcut
    is genuinely tempting; and "greedy" play loses more and Falls  → it's dangerous
  • NEGOTIATE wins happen on amber levers, and every win traces blue threads
    → Read 2 and Read 3 both matter
  • Owners and Scenarios spread the difficulty without any one being a lock
"""
import sys, random, collections
import sn_engine as E

ROLES=[r for _,r in E.ROSTER]; NAMES=dict((r,n) for n,r in E.ROSTER)

def roster_for(k, rng, party=False):
    if party: return [(f"Neighbor {i+1}","Neighbor") for i in range(k)]     # Block Party: no roles
    return [(NAMES[r],r) for r in rng.sample(ROLES,k)]

def run_batch(n, k, overlord=False, style="careful", seed0=0, **rules):
    st=collections.defaultdict(int); rounds=[]
    by=lambda: collections.defaultdict(lambda:[0,0])
    owner,scen,role=by(),by(),by()
    for i in range(n):
        rng=random.Random(seed0+i*7919+k*31+(1 if overlord else 0))
        g=E.new_game(overlord=overlord, seed=rng.randrange(10**9), roster=roster_for(k,rng,rules.get("party",False)), **rules)
        out=g.run_auto(style=style); win=out=="BLOCK_WIN"
        st[out]+=1; rounds.append(g.round)
        if out=="MACHINE_WIN" and g.round==1: st["r1_loss"]+=1
        log=g.log
        st["falls"]+=sum("HAS FALLEN" in l for l in log); st["fall_games"]+=any("HAS FALLEN" in l for l in log)
        st["reaches"]+=sum("pulls them home" in l for l in log)
        st["takes"]+=sum("TAKE the trap" in l for l in log)
        st["uw"]+=g.uw_open
        for lv in ("red","amber","blue"): st["neg_"+lv]+=sum(f"on the {lv} lever" in l for l in log)
        st["played"]+=sum("got played" in l for l in log)
        st["traces"]+=sum("traces the blue thread" in l for l in log)
        st["timeout"]+=any("clock ran out" in l for l in log)
        if win: st["win_rounds"]+=g.round
        if not overlord:
            owner[g.owner][0]+=1; owner[g.owner][1]+=win
            scen[g.scenario][0]+=1; scen[g.scenario][1]+=win
        for p in g.blk(): role[p.role][0]+=1; role[p.role][1]+=win
    return st, rounds, owner, scen, role

def chapter_report(n, chapter="THE_MAP"):
    """Win rate by player count, and whether organizing matters: the same bot that never signs."""
    rows=[]
    for k in (2,3,4,5):
        def batch(sign):
            st=collections.Counter(); ob=E.Game.block_ai
            if not sign:
                def ai(self,pl,style="careful"):
                    a=ob(self,pl,style)
                    if a[0]=="league": self.league_formed=True; a=ob(self,pl,style); self.league_formed=False
                    return a
                E.Game.block_ai=ai
            for i in range(n):
                rng=random.Random(i*7919+k*31)
                g=E.new_game(seed=rng.randrange(10**9),roster=roster_for(k,rng),chapter=chapter); g.run_auto()
                r=g.chapter_result(); st["win"]+=r["won"]; st["league"]+=r["league"]
                st["broke"]+=r["redlining_broken"]; st["ledger"]+=r["ledger"]; st["r1"]+=g.round==1 and not r["won"]
            E.Game.block_ai=ob; return st
        a=batch(True); b=batch(False)
        print(f"  {k} players  win {pct(a['win'],n)}  never-organize {pct(b['win'],n)}  League formed {pct(a['league'],n)}  "
              f"REDLINING broken {pct(a['broke'],n)}  Ledger {a['ledger']/n:+.1f}  r1-loss {pct(a['r1'],n)}")
        rows.append((k,a['win']/n,b['win']/n,a['r1']/n))
    return rows

def pct(a,b): return f"{100*a/b:5.1f}%" if b else "   -  "
def wr(st,n): return st["BLOCK_WIN"]/n

def line(label, n, st, rounds):
    w=st['BLOCK_WIN']
    return (f"  {label:<10} win {pct(w,n)}  rounds {sum(rounds)/n:4.1f} (wins avg {st['win_rounds']/w if w else 0:4.1f})  "
            f"r1-loss {pct(st['r1_loss'],n)}  clock-outs {pct(st['timeout'],n)}  UW opened {pct(st['uw'],n)}  "
            f"Fall-games {pct(st['fall_games'],n)}  reaches/game {st['reaches']/n:.2f}")

if __name__=="__main__":
    n=int(sys.argv[1]) if len(sys.argv)>1 and sys.argv[1].isdigit() else 1000
    print("THE SECOND NUMBER — balance report (v4)")
    print(f"{n} computer-played games per row. Rosters are random role subsets.\n")
    verdict=[]
    for mode,ov in (("CO-OP",False),("OVERLORD",True)):
        print(f"=== {mode} — by player count (careful bot) ===")
        for k in (2,3,4,5):
            st,rounds,*_=run_batch(n,k,overlord=ov)
            print(line(f"{k} players",n,st,rounds))
            w=wr(st,n); ok=0.40<=w<=0.70 and st["r1_loss"]/n<0.02
            verdict.append((f"{mode} {k}p",w,ok))
        print()

    print("=== BLOCK PARTY: the 25-minute intro (3 districts, 8 rounds) ===")
    party_ok=[]
    for k in (2,3,4,5):
        row=[]
        for style in ("careful","human"):
            st,rounds,*_=run_batch(n,k,style=style,party=True); row.append(wr(st,n))
            print(line(f"{k}p {style}",n,st,rounds))
        party_ok.append((k,row))
    print()

    print("=== HOUSE RULES (co-op, 4 players, human-like bot) ===")
    base,_r,*_=run_batch(n,4,style="human")
    house=[]
    for name,rules in (("none",{}),("fine-print dice",dict(fine_print=True)),("Terrell rule",dict(terrell=True)),
                       ("endless deals",dict(endless=True)),("all three",dict(fine_print=True,terrell=True,endless=True)),
                       ("close reads",dict(partial=True)),("Render?",dict(render=True))):
        st,rounds,*_=run_batch(n,4,style="human",**rules) if rules else (base,_r)
        house.append((name,wr(st,n)))
        print(line(name,n,st,rounds))
    print()

    print("=== IS THE SHORTCUT TEMPTING? (co-op, 4 players) ===")
    style_wr={}
    for style in ("never","careful","human","greedy"):
        st,rounds,*_=run_batch(n,4,style=style)
        style_wr[style]=wr(st,n)
        print(line(style,n,st,rounds)+f"  TAKEs/game {st['takes']/n:.1f}")
    print()

    st,rounds,owner,scen,role=run_batch(n*2,4,style="human")
    tot=st["neg_red"]+st["neg_amber"]+st["neg_blue"]
    print("=== DOES DEEPER READ MATTER? (co-op, 4 players, human-like bot) ===")
    print(f"  successful NEGOTIATEs by lever:  red {pct(st['neg_red'],tot)}  amber {pct(st['neg_amber'],tot)}  "
          f"blue {pct(st['neg_blue'],tot)}")
    print(f"  Underworld threads traced (needs Read 3 / blue): {st['traces']/(n*2):.2f} per game · every win needs {E.THREADS_TO_WIN}")
    print("\n=== OWNERS (co-op, 4 players, human-like bot) ===")
    for o,(c,w) in sorted(owner.items()): print(f"  {o:<16}{pct(w,c)}")
    print("\n=== SCENARIOS (co-op, 4 players, human-like bot) ===")
    for s,(c,w) in sorted(scen.items(),key=lambda x:-x[1][1]/x[1][0]): print(f"  {s:<18}{pct(w,c)}")
    print("\n=== ROLES — block win rate when the role is at the table (co-op, 4 players, human-like bot) ===")
    for r,(c,w) in sorted(role.items()): print(f"  {r:<12}{pct(w,c)}")

    print("\n=== CHAPTER 3: THE MAP (careful bot) ===")
    chap=chapter_report(n)

    print("\n--- verdict ---")
    for k,(care,human) in party_ok:
        ok=0.50<=care<=0.85 and 0.50<=human<=0.85
        print(f"  Block Party {k}p {'healthy' if ok else 'NEEDS TUNING'}  (careful {care*100:.0f}% · human {human*100:.0f}%)")
    for name,w in house:
        print(f"  House rules: {name:<16} {'healthy' if 0.40<=w<=0.70 else 'NEEDS TUNING'}  ({w*100:.0f}% block wins)")
    for name,w,ok in verdict:
        print(f"  {name:<12} {'healthy' if ok else 'NEEDS TUNING'}  ({w*100:.0f}% block wins)")
    tempt = style_wr["careful"]>style_wr["never"] and style_wr["greedy"]<style_wr["careful"]
    print(f"  Shortcut     {'tempting AND dangerous' if tempt else 'NEEDS TUNING'}  "
          f"(never {style_wr['never']*100:.0f}% · careful {style_wr['careful']*100:.0f}% · greedy {style_wr['greedy']*100:.0f}%)")
    for k,w,never,r1 in chap:
        ok=0.40<=w<=0.70 and w>never and r1<0.02
        print(f"  Chapter 3 {k}p {'healthy' if ok else 'NEEDS TUNING'}  ({w*100:.0f}% wins; organizing worth {100*(w-never):+.0f} pts)")
    deep = tot and st['neg_amber']/tot>=0.15
    print(f"  Deep Read   {'matters' if deep else 'NEEDS TUNING'}  (amber = {pct(st['neg_amber'],tot).strip()} of defusals; "
          f"blue/Read 3 is required to trace every winning thread)")
