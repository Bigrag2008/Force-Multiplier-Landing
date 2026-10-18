#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER  —  interactive edition (v3)
A playable, colorized terminal game on top of sn_engine.py (the same rules the
balance tester measures — the two can't drift).

  python3 second_number_play.py            play (color)
  python3 second_number_play.py --nocolor  play (plain)
  python3 second_number_play.py --auto     watch a computer-played demo
  python3 second_number_play.py --auto --overlord

Read the machine. Teach the block. Crack the Underworld. Don't become it.
Part of the Individual Democracy / Civic Armor universe.
"""
import random, sys, os, textwrap
import sn_engine as E

AUTO  = "--auto" in sys.argv
COLOR = "--nocolor" not in sys.argv
D, WAKE, CAPTURE, FLIP = E.DISTRICTS, E.WAKE, E.CAPTURE, E.FLIP

# ---------------- palette ----------------
def _c(code): return code if COLOR else ""
R = _c("\x1b[0m"); B = _c("\x1b[1m"); DIM = _c("\x1b[2m")
def fg(r,g,b): return _c(f"\x1b[38;2;{r};{g};{b}m")
GOLD=fg(212,175,55); GOLDB=fg(232,199,102); CREAM=fg(245,239,224); RED=fg(230,57,70)
CYAN=fg(70,196,221); GREY=fg(140,145,155); WHITE=fg(245,248,252); GREEN=fg(86,197,150)
DCOL={"LENDING":fg(70,186,130),"HOUSING":fg(210,110,80),"LABOR":fg(90,150,210),
      "HEALTH":fg(170,100,200),"EDUCATION":fg(224,170,60)}
LCOL={1:RED,2:GOLDB,3:CYAN}; LKEY={0:"",1:RED+"🔴 red"+R,2:GOLDB+"🟠 amber"+R,3:CYAN+"🔵 blue"+R}

def cls():
    if COLOR and not AUTO: os.system("cls" if os.name=="nt" else "clear")
def wrap(s, ind="    "): return textwrap.fill(s, 70, initial_indent=ind, subsequent_indent=ind)
def ask(prompt):
    if AUTO: return ""
    try: return input(prompt).strip().lower()
    except EOFError: print("\n  Later. 🔋"); sys.exit(0)
def pause(msg="  (press Enter)"):
    if not AUTO: ask(DIM+msg+R)
def bar(n,total,ch,col): return col+ch*min(n,total)+DIM+"·"*max(0,total-n)+R

class Table:
    def __init__(self, g, humans):
        self.g=g; self.humans=humans; self.seen=0
        if any(p.name in humans for p in g.blk()):
            def ask_book(d):
                self.flush()
                return ask(f"\n  {GREEN}{B}📗 A strike is about to capture {d}.{R} Open the Green Book (once per game)? "
                           f"({GOLDB}y{R}/n): ")!="n"
            g.use_green_book=ask_book

    # ---- output ----
    def flush(self):
        for s in self.g.log[self.seen:]:
            col = (RED if any(k in s for k in ("✖","⚠","played","FALLEN","clock ran out","buries","feeds","whispers","peels","collections","creeps","covers"))
                   else GOLD if "⚑" in s or "UNDERWORLD" in s
                   else GREEN if any(k in s for k in ("✦","defused","HONEST","pulls them home","⛨","traces","AWAKE"))
                   else CREAM)
            print(col+wrap(s.strip(),"  " if not s.startswith("  ") else "    ")+R)
        self.seen=len(self.g.log)

    def board(self, header=""):
        g=self.g; cls(); line=GOLD+"═"*72+R
        tag=(RED+"OVERLORD MODE"+R) if g.overlord else (CREAM+g.scenario+R)
        print(line); print(f"  {B}{GOLD}THE SECOND NUMBER{R}  {DIM}·{R}  {tag}  {DIM}·{R}  "
                           f"{CREAM}round {g.round}/{E.MAX_ROUNDS}{R}"); print(line)
        for d in D:
            c,p=g.clarity[d],g.pressure[d]
            st=(RED+B+"✖ CAPTURED"+R if p>=CAPTURE else GOLD+B+"✦ AWAKE"+R if c>=WAKE
                else RED+"● gripped"+R if g.gripped(d) else "")
            th=CYAN+" 🔵thread"+R if d in g.threads else ""
            print(f"  {DCOL[d]}{B}{d:<10}{R} Clarity {bar(c,WAKE,'●',DCOL[d])}  Machine {bar(p,CAPTURE,'▣',RED)}  {st}{th}")
        print(GOLD+"─"*72+R)
        for pl in g.players:
            if pl.role=="Overlord": print(f"  {RED}{B}{pl.name:<10}{R}{RED} ⚑ THE OVERLORD — the Machine, in the flesh{R}"); continue
            sight=" ".join(f"{DCOL[d]}{d[:3]}{pl.sight[d]}{R}" for d in D)
            if pl.flipped: print(f"  {RED}{pl.name:<8} ✖ FALLEN{R}{DIM} — the Machine moves through them (reach them back){R}"); continue
            corr=bar(pl.corruption,FLIP,'▮',RED) if pl.corruption else DIM+"·"*FLIP+R
            print(f"  {WHITE}{pl.name:<8}{R}{DIM}{pl.role:<11}{R}Trust {GOLDB}{pl.trust:<2}{R} Legend {GOLD}{pl.legend:<3}{R}"
                  f"Corr[{corr}]  Sight {sight}")
        for c,n,_ in g.active_patterns(): print(f"  {RED}{B}⚠ PATTERN{R} {RED}{n}{R} {DIM}[{' + '.join(c)}]{R}")
        if g.uw_open:
            print(f"  {GOLD}⚑ UNDERWORLD OPEN{R} — threads {CYAN}{len(g.threads)}/{g.threads_needed()}{R}"
                  + (f"   Owner: {B}{g.owner}{R} {DIM}{E.OWNERS[g.owner]}{R}" if g.owner_shown and not g.overlord else ""))
        else:
            print(f"  {DIM}Underworld cracks at total Clarity {E.UNDERWORLD_AT} (now {g.total_clarity()}).{R}")
        print(f"  {GOLD}Sou-Sou pot{R} {bar(g.pot,E.SOUSOU_HAND,'●',GOLD)}  {DIM}next hand: {g.next_hand().name if g.active() else '—'}{R}"
              f"   {GREEN if g.green_book else GREY}📗 Green Book {'ready' if g.green_book else 'used'}{R}"
              f"   {GOLD if not g.cookout_used else GREY}🍖 Cookout {'ready' if not g.cookout_used else 'had'}{R}")
        print(line)
        if header: print("  "+header)

    # ---- pickers ----
    def pick_district(self, prompt="district"):
        print("   "+"  ".join(f"{DCOL[d]}{i+1}){d}{R}" for i,d in enumerate(D)))
        try: return D[int(ask(f"   {prompt}: "))-1]
        except (ValueError,IndexError): return None
    def pick_player(self, pool, prompt):
        if not pool: return None
        print("   "+"  ".join(f"{i+1}){p.name}" for i,p in enumerate(pool)))
        try: return pool[int(ask(f"   {prompt}: "))-1]
        except (ValueError,IndexError): return None

    # ---- a live deal ----
    def show_card(self, pl, d, card, label=None):
        # the lever is printed inside the red zone, so it takes Sight 1 to see it
        lev=("" if pl.sight[d]<1 else f"   {DIM}lever: {R}{LKEY[card['lever']]}" if card["lever"]
             else f"   {GREEN}honest deal — no lever{R}")
        print(f"\n  {DCOL[d]}{B}[{pl.name}] {label or 'faces a deal'} in {d}{R}{lev}")
        print(f"  {WHITE}{B}WHAT YOU SEE:{R} {WHITE}{card['front']}{R}")
        for n,label,text in self.g.visible(pl,d,card):
            if text: print(f"  {LCOL[n]}{label}:{R} {CREAM}{text}{R}")
            else:    print(f"  {GREY}🔒 {label.split('—')[0].strip()} — need Sight {n} in {d}{R}")
        print(f"  {DIM}TAKE = accept · WALK = refuse · NEGOTIATE = spend 1 Trust; beats a trap only with Sight ≥ its lever{R}")

    def human_face(self, pl, d):
        cards=self.g.deals_for(pl,d)
        if len(cards)>1:                      # shopped at Gem City Market: pick one of two
            print(f"\n  {GREEN}You shopped around. Two deals on the table:{R}")
            for i,c in enumerate(cards): self.show_card(pl,d,c,label=f"deal {i+1}")
            card=cards[1] if ask("   face which deal (1/2): ")=="2" else cards[0]
            print(f"  {DIM}You face deal {cards.index(card)+1}.{R}")
        else:
            card=cards[0]; self.show_card(pl,d,card)
        k=ask(f"   {GOLDB}t{R})TAKE  {GOLDB}w{R})WALK  {GOLDB}n{R})NEGOTIATE: ")
        return ("face",d,{"t":"TAKE","n":"NEGOTIATE"}.get(k,"WALK"),card)

    def block_menu(self, pl, left):
        g=self.g
        print(f"\n  {WHITE}{B}▶ {pl.name}{R} {DIM}({pl.role}) — {E.ROLES[pl.role]}{R}")
        print(f"  {DIM}{left} action(s) left · Trust {pl.trust} · Corruption {pl.corruption}/{FLIP}{R}")
        opts=[f"{GOLDB}1{R})Study", f"{GOLDB}2{R})Face a deal", f"{GOLDB}3{R})Teach", f"{GOLDB}4{R})Commons"]
        if any(p.flipped for p in g.blk()): opts.append(f"{GOLDB}5{R})Reach a Fallen")
        if pl.role=="Elder" and not pl.elder_used: opts.append(f"{GOLD}h{R})History")
        if g.uw_open: opts.append(f"{CYAN}6{R})Trace a thread")
        if g.can_expose(): opts.append(f"{GOLD}{B}8{R})EXPOSE THE UNDERWORLD (win)")
        opts.append(f"{DIM}0)Pass{R}")
        print("   "+"   ".join(opts))
        while True:
            k=ask("   choose: ")
            if k=="1": d=self.pick_district("study which"); return ("study",d,None) if d else None
            if k=="2": d=self.pick_district("face a deal where"); return self.human_face(pl,d) if d else None
            if k=="3":
                t=self.pick_player([p for p in g.active() if p is not pl],"teach who"); d=t and self.pick_district()
                if not (t and d): return None
                if pl.sight[d]<=t.sight[d]:
                    print(f"  {GREY}You read {d} at Sight {pl.sight[d]}, {t.name} at {t.sight[d]}. "
                          f"You can only teach what you read better.{R}"); return None
                card=g.draw(d)
                print(f"\n  {GOLD}{B}CALL AND RESPONSE{R}  {DIM}{pl.name}, read this aloud to {t.name}:{R}")
                print(f"  {WHITE}\"{card['front']}\"{R}  {LCOL[1]}— the second number:{R} {CREAM}{card['red']}{R}")
                said=ask(f"   Did {t.name} say the second number back? ({GOLDB}y{R}/n): ")!="n"
                return ("teach",t,d,said)
            if k=="4":
                places=list(E.PLACES)
                for i,key in enumerate(places):
                    P=E.PLACES[key]; used=" (used)" if key=="KITCHEN" and g.kitchen_used else ""
                    print(f"   {GOLDB}{i+1}{R}) {P['name']} {DIM}— {P['where']}: {P['bonus']}{used}{R}")
                try: return ("commons",places[int(ask("   gather where: "))-1])
                except (ValueError,IndexError): return None
            if k=="5": t=self.pick_player([p for p in g.blk() if p.flipped],"reach who"); return ("reach",t,None) if t else None
            if k=="h" and pl.role=="Elder": d=self.pick_district("whose History"); return ("history",d,None) if d else None
            if k=="6" and g.uw_open: d=self.pick_district("trace where"); return ("trace",d,None) if d else None
            if k=="8" and g.can_expose(): return ("expose_uw",None,None)
            if k=="0": return ("pass",None,None)

    def machine_menu(self, who):
        g=self.g
        print(f"\n  {RED}{B}▶ {who.name} — move the Machine{R}  {DIM}(one move per district per round){R}")
        print(f"   {RED}1{R})Extract (+Pressure)   {RED}2{R})Obscure (−Clarity)   {RED}3{R})Tempt (−Trust)   {DIM}0)Pass{R}")
        k=ask("   choose: ")
        if k=="1": d=self.pick_district(); return ("m_extract",None,d) if d else ("pass",None,None)
        if k=="2": d=self.pick_district(); return ("m_obscure",None,d) if d else ("pass",None,None)
        if k=="3": t=self.pick_player(g.active(),"tempt who"); return ("m_tempt",t,None) if t else ("pass",None,None)
        return ("pass",None,None)

    # ---- the Cookout ----
    def call_cookout(self):
        g=self.g; act=g.active()
        if g.cookout_used or not act or max(g.pressure.values())>=CAPTURE-1: return False
        if not any(p.name in self.humans for p in act):
            if g.cookout_ai(): g.cookout(); self.flush(); return True
            return False
        self.board(f"{GOLD}— round {g.round} —{R}")
        if ask(f"\n  {GOLD}{B}Call the COOKOUT?{R} {DIM}(once per game: no actions this round; everyone +2 Trust, "
               f"−1 Corruption, and Sight in one district up to the table's best){R} (y/{GOLDB}n{R}): ")!="y": return False
        picks={}
        for p in act:
            d,gain=g.cookout_gain(p)
            print(f"   {p.name}: best catch-up is {d} (+{gain}).")
            picks[p.name]=self.pick_district(f"{p.name} catches up in") or d
        g.cookout(picks); self.flush(); pause(); return True

    # ---- the Sou-Sou ----
    def sousou(self):
        g=self.g; act=g.active()
        if not act: return
        human=any(p.name in self.humans for p in act)
        if not human:
            if g.sousou_ai(): g.throw_hand()
            return
        nxt=g.next_hand()
        print(f"\n  {GOLD}{B}THE SOU-SOU{R}  {DIM}pot {g.pot}/{E.SOUSOU_HAND} · next hand: {nxt.name}{R}")
        if ask(f"   Throw a hand? Everyone with Trust puts in 1. ({GOLDB}y{R}/n): ")!="y": return
        def pick(pl):
            print(f"   {pl.name} takes the hand: clear 2 Pressure, no Corruption.")
            return self.pick_district("pay off which district") or max(D,key=lambda x:g.pressure[x])
        g.throw_hand(pick)

    # ---- the round ----
    def player_turn(self, pl):
        g=self.g; human=pl.name in self.humans
        self.board(f"{DIM}— {pl.name}'s turn —{R}")
        if pl.flipped:
            print(f"\n  {RED}The Machine moves through {pl.name}.{R}")
            mult=2 if (g.owner=="The Debt Buyer" and not g.overlord) else 1
            for _ in range(g.actions()*mult):
                g.do(pl, self.machine_menu(pl) if human else g.machine_ai_move(g.struck)); self.flush()
            return
        left=g.actions(); g.start_turn(pl)
        while left>0 and not g.won and not pl.flipped:
            a=self.block_menu(pl,left) if human else g.block_ai(pl,"human")
            if a is None: print(f"  {GREY}(cancelled){R}"); continue
            if not human and a[0]=="face": self.show_card(pl,a[1],a[3])
            g.do(pl,a); self.flush(); left-=1
        if human and not g.won: pause("  (Enter to end turn)")

    def run(self):
        g=self.g; intro(g)
        while g.round<E.MAX_ROUNDS and not g.won:
            g.round+=1; g.struck=set(); g.covered=False
            feast=self.call_cookout()
            for pl in g.players:
                if pl.role=="Overlord" or (feast and not pl.flipped): continue
                self.player_turn(pl)
                if g.won: break
            if g.won: break
            self.sousou(); g.end_of_block_turns(); self.flush(); pause()
            self.board(RED+"— THE MACHINE MOVES —"+R)
            ov=g.ov(); human_ov=ov is not None and ov.name in self.humans
            g.machine_phase((lambda: self.machine_menu(ov)) if human_ov else None)
            self.flush(); pause()
        if not g.result: g.time_up(); self.flush()
        self.finish()

    def finish(self):
        g=self.g; self.board()
        if g.result=="BLOCK_WIN":
            print("\n"+GOLD+"★"*72+R); print(f"  {B}{GOLD}THE BLOCK WINS.{R}  Owner exposed: {B}{g.owner}{R}. It was always one machine.")
            w=[p for p in g.blk() if not p.flipped]
            if w:
                m=max(w,key=lambda p:p.legend)
                print(f"  {GOLDB}MOST LEGENDARY: {m.name} ({m.role}) — {m.legend} Legend, earned by lifting people.{R}")
            print(GOLD+"★"*72+R)
        else:
            print("\n"+RED+"✖"*72+R); print(f"  {RED}{B}{g.check_end() or 'The clock ran out. The Machine holds the block.'}{R}")
            fallen=[p for p in g.blk() if p.flipped]
            if fallen:
                print(RED+wrap(f"{fallen[0].name} won the board as the Machine — and earned 0 Legend. "
                               "The Owner just wore their face. You win nothing by becoming it.")+R)
            print(RED+"✖"*72+R)
        print(f"\n  {DIM}How high did you climb before you turned into the thing you were fighting?{R}")

def intro(g):
    cls()
    print(f"\n{GOLD}{B}      THE SECOND NUMBER{R}")
    print(f"{CREAM}      read the machine · wake the block · don't become it{R}\n")
    print("  "+((RED+"OVERLORD MODE — one player IS the Machine."+R) if g.overlord
                else f"{CREAM}Scenario: {B}{g.scenario}{R} — {E.SCENARIOS[g.scenario]}"))
    print(f"  {DIM}Seeing isn't beating: Sight 1 shows a trap; beating it takes Sight up to its lever.{R}")
    print(f"  {DIM}Wake districts → crack the Underworld at Clarity {E.UNDERWORLD_AT} → trace {g.threads_needed()} blue threads → expose the Owner.{R}")
    print(f"  {DIM}Lose if 2 districts are captured, everyone Falls, or round {E.MAX_ROUNDS} ends.{R}\n")
    pause("  (Enter to begin)")

def main():
    if AUTO:
        random.seed(int(next((a for a in sys.argv if a.isdigit()),"5")))
        g=E.new_game(overlord=("--overlord" in sys.argv), roster=E.ROSTER[:4])
        Table(g,set()).run(); return
    while True:
        cls(); print("\n"+GOLD+"═"*72+R); print(f"  {B}{GOLD}THE  SECOND  NUMBER{R}   {CREAM}a cooperative game of reading the machine{R}")
        print(GOLD+"═"*72+R)
        print(f"\n  {GOLDB}1{R}) Co-op      — the block vs the Machine")
        print(f"  {GOLDB}2{R}) Overlord   — one player IS the Machine, 1-vs-many")
        print(f"  {DIM}q) Quit{R}\n")
        ch=ask("  choose: ")
        if ch=="q": print("  Stay sharp out there. 🔋"); return
        if ch not in ("1","2"): continue
        try: k=max(2,min(5,int(ask("  How many players on the block (2–5)? ") or "4")))
        except ValueError: k=4
        g=E.new_game(overlord=(ch=="2"), roster=random.sample(E.ROSTER,k))
        humans={p.name for p in g.blk()}
        if g.overlord and ask(f"  Who plays the Overlord?  {GOLDB}1{R}) a person   {GOLDB}2{R}) the computer: ")=="1":
            humans.add(g.ov().name)
        print(f"\n  {CREAM}Crew: {', '.join(f'{p.name} the {p.role}' for p in g.blk())}{R}  {DIM}(hotseat){R}")
        pause(); Table(g,humans).run()
        if ask("\n  Play again? (y/n): ")!="y": print("  Stay sharp out there. 🔋"); return

if __name__=="__main__":
    try: main()
    except KeyboardInterrupt: print("\n  Later. 🔋")
