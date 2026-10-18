# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — rules engine (single source of truth).
v2: cards are decisions. Addresses the design review:
  • every deal is a choice: TAKE / WALK / NEGOTIATE, resolved by what you can SEE
  • Sight genuinely gates play (you must learn to read before you can act well)
  • honest deals are mixed in, so blind suspicion has a cost
  • corruption recovers (Commons), so players flirt with the line and actually Fall
  • roles rebalanced (Translator transfers, Student one power, Organizer defuses harder)
  • Owners act from round 1 (hidden), so they change the game
  • Overlord Underworld bug fixed — the block can win in both modes

The front-end (interactive) and the balance tester both import this. No I/O at
import; methods mutate state and append plain-text events to self.log.
"""
import random
import deck_cards as D

DISTRICTS = list(D.DECK.keys())
ROLES     = dict(D.ROLES)
PATTERNS  = list(D.PATTERNS)
OWNERS    = dict(D.OWNERS)
SCENARIOS = dict(D.SCENARIOS)

# ---- tunable constants (the balance tester sweeps these) ----
WAKE            = 3    # district clarity needed to wake it
CAPTURE         = 3    # pressure that captures a district
FLIP            = 6    # corruption that flips a player to the Machine
GRIP            = 2    # pressure at which a district counts toward a Pattern
LOSE_CAPTURED   = 2    # captured districts that lose the game
UNDERWORLD_AT   = 14   # total clarity that cracks the Underworld open
AWAKE_TO_WIN    = 4    # districts awake needed (with UW open) to expose & win
TAKE_CORRUPT    = 2    # corruption gained per TAKE on a trap
MACHINE_HITS    = 2    # base pressure hits per Machine phase (+1 per fallen)
START_TRUST     = 2

class Player:
    def __init__(self, name, role):
        self.name, self.role = name, role
        self.trust = START_TRUST
        self.sight = {d:(1 if role=="Elder" else 0) for d in DISTRICTS}
        self.corruption = 0; self.legend = 0; self.flipped = False
        self.shields = 2 if role=="Veteran" else 0; self.elder_used = False

class Game:
    def __init__(self, overlord=False, scenario=None, owner=None, verbose=False, seed=None):
        if seed is not None: random.seed(seed)
        self.overlord = overlord; self.verbose = verbose
        self.clarity  = {d:0 for d in DISTRICTS}
        self.pressure = {d:0 for d in DISTRICTS}
        self.round=0; self.uw_open=False; self.owner_shown=overlord
        self.won=False; self.result=None; self.log=[]; self.patterns_seen=set()
        self.human_overlord=False
        self.scenario = scenario or random.choice(list(SCENARIOS))
        for d,p in {"The Eviction Wave":{"HOUSING":2},"The Closure":{"EDUCATION":3}}.get(self.scenario,{}).items():
            self.pressure[d]=p
        self.grace = 1 if self.scenario=="The Audit" else 0
        self.owner = "The Overlord" if overlord else (owner or random.choice(list(OWNERS)))
        self.players=[]

    # ---- helpers ----
    def emit(self,s):
        self.log.append(s)
        if self.verbose: print(s)
    def blk(self):    return [p for p in self.players if p.role!="Overlord"]
    def active(self): return [p for p in self.blk() if not p.flipped]
    def ov(self):     return next((p for p in self.players if p.role=="Overlord"), None)
    def total_clarity(self): return sum(self.clarity.values())
    def awake(self):  return sum(1 for d in DISTRICTS if self.clarity[d]>=WAKE)
    def captured(self): return sum(1 for d in DISTRICTS if self.pressure[d]>=CAPTURE)
    def gripped(self,d): return self.pressure[d]>=GRIP
    def active_patterns(self):
        return [(c,n,l) for c,n,l in PATTERNS if all(self.gripped(d) for d in c)]
    def dbg_owner(self): return self.owner  # for tests

    # ================= BLOCK ACTIONS =================
    def study(self, pl, d):
        if pl.sight[d] >= 3:
            self.emit(f"{pl.name} already reads {d} fully."); return
        pl.sight[d]=min(3,pl.sight[d]+1); pl.legend+=1
        self.emit(f"{pl.name} studies {d}. Sight now {pl.sight[d]}/3. Legend +1.")

    def draw(self, d): return random.choice(D.DECK[d])

    def face(self, pl, d, choice, card=None):
        """Face a live deal. choice in TAKE/WALK/NEGOTIATE."""
        card=card or self.draw(d); trap=card["trap"]; see=pl.sight[d]
        self.emit(f"{pl.name} faces a deal in {d}: \"{card['front']}\"  → {choice}")
        if choice=="TAKE":
            if trap:
                pl.trust+=2
                self.pressure[d]=min(CAPTURE,self.pressure[d]+1)
                cost=TAKE_CORRUPT+(1 if (self.owner_shown and self.owner=="The Debt Buyer") else 0)
                pl.corruption+=cost
                self.emit(f"  TAKE the trap: quick Trust +2 for YOU — but Pressure +1 on {d} and Corruption +{cost}. "
                          f"(It helped you, not the block.)")
                if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
            else:
                pl.trust+=2; self.emit(f"  It was an HONEST deal — real help. Trust +2, no harm.")
        elif choice=="WALK":
            if trap: self.emit(f"  WALK: you dodged a trap. Safe, nothing gained.")
            else:
                pl.trust=max(0,pl.trust-1)
                self.emit(f"  WALK: it was honest help you refused out of fear. Trust -1.")
        else:  # NEGOTIATE
            if see<1:
                if trap:
                    self.pressure[d]=min(CAPTURE,self.pressure[d]+1); pl.trust=max(0,pl.trust-1)
                    self.emit(f"  NEGOTIATE blind: you couldn't read it and got played. Pressure +1, Trust -1.")
                    if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
                else:
                    pl.trust=max(0,pl.trust-1)
                    self.emit(f"  NEGOTIATE blind on a fair deal: you soured it. Trust -1.")
            else:
                if trap:
                    amt=2 if pl.role=="Organizer" else 1
                    self.pressure[d]=max(0,self.pressure[d]-amt)
                    self.clarity[d]=min(WAKE,self.clarity[d]+1); pl.sight[d]=min(3,pl.sight[d]+1); pl.legend+=2
                    self.emit(f"  NEGOTIATE (Sight {see}): you spotted the second number and defused it. "
                              f"Pressure -{amt}, {d} clarity +1, Sight +1, Legend +2.")
                else:
                    pl.trust+=1; self.clarity[d]=min(WAKE,self.clarity[d]+1); pl.legend+=1
                    self.emit(f"  NEGOTIATE a fair deal: confirmed it's clean. Trust +1, {d} clarity +1, Legend +1.")
        if pl.corruption>=FLIP and not pl.flipped:
            pl.flipped=True
            self.emit(f"  ⚠⚠ {pl.name} HAS FALLEN. The Machine now moves through them.")

    def teach(self, pl, t, d):
        free=(pl.role=="Translator")
        if pl.sight[d]<1: self.emit(f"  {pl.name} can't teach {d} without reading it first."); return
        if not free and pl.trust<1: self.emit(f"  {pl.name} lacks Trust to teach."); return
        g=2 if t.role=="Student" else 1; t.sight[d]=min(3,t.sight[d]+g)
        if not free: pl.trust-=1
        pl.legend+=2
        self.emit(f"{pl.name} teaches {t.name} to read {d}. Sight +{g}{' (free, Translator)' if free else ''}. Legend +2.")

    def commons(self, pl):
        pl.trust+=2; back=1 if pl.corruption>0 else 0; pl.corruption=max(0,pl.corruption-1)
        self.emit(f"{pl.name} gathers at the Commons. Trust +2{', Corruption -1' if back else ''}.")

    def reach(self, pl, t):
        if pl.trust<2: self.emit(f"  {pl.name} needs 2 Trust to reach someone."); return
        pl.trust-=2; t.flipped=False; t.corruption=FLIP-2; pl.legend+=3
        self.emit(f"{pl.name} reaches {t.name} and pulls them home. Legend +3.")

    def history(self, pl, d):
        if pl.role!="Elder" or pl.elder_used: self.emit("  No History to teach."); return
        pl.elder_used=True; self.clarity[d]=WAKE; pl.legend+=2
        self.emit(f"{pl.name} teaches the History of {d}. {d} AWAKE. Legend +2.")

    def expose_uw(self, pl):
        self.emit(f"{pl.name} drags the UNDERWORLD into the light. One Owner — {self.owner}. It was always one machine.")
        self.won=True; self.result="BLOCK_WIN"

    # ================= MACHINE / FALLEN / OVERLORD =================
    def m_extract(self, who, d):
        if self.pressure[d]<CAPTURE:
            self.pressure[d]+=1; self.emit(f"[{who}] feeds the Machine in {d}. Pressure {self.pressure[d]}/{CAPTURE}.")
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
    def m_obscure(self, who, d):
        if self.clarity[d]>0:
            self.clarity[d]-=1; self.emit(f"[{who}] buries the second number in {d}. Clarity -1.")
    def m_tempt(self, who, t):
        if t and t.trust>0: t.trust-=1; self.emit(f"[{who}] whispers a sweeter deal to {t.name}. Trust -1.")

    def machine_ai_move(self):
        near=[d for d in DISTRICTS if self.pressure[d]==CAPTURE-1]
        if near: return ("m_extract",None,near[0])
        vuln=[d for d in DISTRICTS if self.clarity[d]>0 and self.pressure[d]<CAPTURE]
        if vuln:
            d=max(vuln,key=lambda x:self.clarity[x])
            return ("m_obscure" if self.clarity[d]>=2 else "m_extract",None,d)
        t=max(self.active(),key=lambda p:p.trust,default=None)
        if t and t.trust>0: return ("m_tempt",t,None)
        return ("m_extract",None,min(DISTRICTS,key=lambda x:self.pressure[x]))

    def owner_passive(self):
        """Owner acts from round 1 (hidden). Skipped in Overlord mode."""
        if self.overlord: return
        o=self.owner
        if o=="The Lobbyist":
            best=[d for d in DISTRICTS if self.clarity[d]>0 and self.pressure[d]<CAPTURE]
            if best:
                d=max(best,key=lambda x:self.clarity[x]); self.pressure[d]+=1
                self.emit(f"  ⚑ (hidden hand) pressure creeps onto your strongest work in {d}. {self.pressure[d]}/{CAPTURE}.")
        elif o=="The Recruiter":
            built=[d for d in DISTRICTS if 0<self.clarity[d]<WAKE]
            if built:
                d=random.choice(built); self.clarity[d]-=1
                self.emit(f"  ⚑ (hidden hand) peels people from {d}. Clarity -1.")
        # Algorithm & Debt Buyer passives are applied where they bite (targeting / TAKE cost)

    def auto_machine_phase(self):
        hits=MACHINE_HITS+sum(1 for p in self.blk() if p.flipped)
        if self.owner=="The Algorithm": hits+=1   # the relentless one: an extra strike
        for _ in range(hits):
            vuln=[d for d in DISTRICTS if self.clarity[d]<WAKE and self.pressure[d]<CAPTURE]
            if not vuln: break
            # contest the block's progress: pressure the district closest to waking
            d=max(vuln,key=lambda x:self.clarity[x])
            vet=next((p for p in self.active() if p.role=="Veteran" and p.shields>0),None)
            if vet: vet.shields-=1; self.emit(f"  ⛨ {vet.name} shields {d}. ({vet.shields} left)"); continue
            self.pressure[d]+=1; self.emit(f"  ✖ The Machine extracts from {d}. Pressure {self.pressure[d]}/{CAPTURE}.")
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
        # erode the block's best unfinished work, so clarity isn't a one-way ratchet
        building=[d for d in DISTRICTS if 0<self.clarity[d]<WAKE]
        if building:
            d=max(building,key=lambda x:self.clarity[x]); self.clarity[d]-=1
            self.emit(f"  ✖ The Machine muddies {d}. Clarity -1.")
        # as the block closes on the Underworld, the Machine fights back harder
        if self.total_clarity()>=UNDERWORLD_AT-4:
            b2=[d for d in DISTRICTS if 0<self.clarity[d]<WAKE]
            if b2:
                d=max(b2,key=lambda x:self.clarity[x]); self.clarity[d]-=1
                self.emit(f"  ✖ The Machine panics near the Underworld — {d} clarity -1.")
        if self.scenario=="Payday Season" and self.pressure["LENDING"]<CAPTURE:
            self.pressure["LENDING"]+=1; self.emit(f"  ✖ Payday Season: extra LENDING hit.")
        self.owner_passive()

    def reveal_owner(self):
        self.owner_shown=True
        self.emit(f"⚑ THE UNDERWORLD CRACKS OPEN. The Owner is {self.owner} — {OWNERS[self.owner]}")
        if self.owner=="The Lobbyist":
            awake=[d for d in DISTRICTS if self.clarity[d]>=WAKE]
            if awake: d=random.choice(awake); self.clarity[d]=1; self.emit(f"  ✖ The Lobbyist re-captures {d}.")

    def tighten(self):
        aps=self.active_patterns()
        if not aps: return
        c,n,_=max(aps,key=lambda x:len(x[0]))
        cand=[d for d in c if self.pressure[d]<CAPTURE]
        if cand:
            d=min(cand,key=lambda x:self.pressure[x]); self.pressure[d]+=1
            self.emit(f"  ⚠ {n} tightens on {d}. Pressure {self.pressure[d]}/{CAPTURE}.")
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")

    def check_patterns(self):
        active={n for _,n,_ in self.active_patterns()}
        for c,n,l in self.active_patterns():
            if n not in self.patterns_seen:
                self.patterns_seen.add(n); self.emit(f"⚠⚠ MACHINE PATTERN — {n}  [{' + '.join(c)}]: {l}")
        for n in list(self.patterns_seen):
            if n not in active:
                self.patterns_seen.discard(n); self.emit(f"✦ PATTERN BROKEN — {n}.")

    def check_end(self):
        if self.captured()>=LOSE_CAPTURED: self.won=True; self.result="MACHINE_WIN"; return "Two districts fell."
        if not self.active():              self.won=True; self.result="MACHINE_WIN"; return "The whole block fell."
        return None

    # ================= DISPATCH =================
    def do(self, pl, a):
        k=a[0]
        if   k=="study":    self.study(pl,a[1])
        elif k=="face":     self.face(pl,a[1],a[2])
        elif k=="teach":    self.teach(pl,a[1],a[2])
        elif k=="commons":  self.commons(pl)
        elif k=="reach":    self.reach(pl,a[1])
        elif k=="history":  self.history(pl,a[1])
        elif k=="expose_uw":self.expose_uw(pl)
        elif k=="m_extract":self.m_extract(pl.name,a[2])
        elif k=="m_obscure":self.m_obscure(pl.name,a[2])
        elif k=="m_tempt":  self.m_tempt(pl.name,a[1])
        # "pass" -> nothing

    # ---- block AI (deliberately imperfect; leaves real losing lines) ----
    def block_ai(self, pl):
        # win if possible
        if self.uw_open and self.awake()>=AWAKE_TO_WIN: return ("expose_uw",None,None)
        # rescue a fallen friend if safe
        fallen=[p for p in self.blk() if p.flipped]
        if fallen and pl.trust>=2 and max(self.pressure.values())<CAPTURE-1:
            return ("reach",fallen[0],None)
        # recover only near the edge, so players flirt with the line
        if pl.corruption>=FLIP-1: return ("commons",None,None)
        if pl.trust<1: return ("commons",None,None)
        # urgent: a district about to capture
        hot=[d for d in DISTRICTS if self.pressure[d]==CAPTURE-1 and self.clarity[d]<WAKE]
        if hot:
            d=hot[0]
            if pl.sight[d]>=1: return ("face",d,"NEGOTIATE")      # defuse (the skilled save)
            if pl.role=="Elder" and not pl.elder_used: return ("history",d,None)
            return ("study",d,None)                               # learn, accept the risk
        # build clarity toward the Underworld
        building=[d for d in DISTRICTS if self.clarity[d]<WAKE]
        tgt=min(building,key=lambda d:self.clarity[d]) if building else DISTRICTS[0]
        if pl.sight[tgt]>=1:
            learner=next((p for p in self.active() if p.sight[tgt]==0 and p is not pl),None)
            if learner and (pl.role=="Translator" or pl.trust>=1) and random.random()<0.4:
                return ("teach",learner,tgt)
            return ("face",tgt,"NEGOTIATE")       # informed -> raises clarity
        # don't know it yet: usually study, but sometimes take the greedy shortcut
        if random.random()<0.14: return ("face",tgt,"TAKE")   # rush clarity, corrupt yourself
        return ("study",tgt,None)

    # ================= RUN (headless, for the tester) =================
    def run_auto(self, max_rounds=16):
        while self.round<max_rounds and not self.won:
            self.round+=1
            for pl in self.players:
                if pl.role=="Overlord": continue
                n=2
                for _ in range(n):
                    if pl.flipped: self.do(pl, self.machine_ai_move())
                    else:          self.do(pl, self.block_ai(pl))
                    if self.won: break
                if self.won: break
            if self.won: break
            self.check_patterns()
            if not self.uw_open and self.total_clarity()>=UNDERWORLD_AT:
                self.uw_open=True
                if self.overlord: self.emit("⚑ THE UNDERWORLD CRACKS OPEN. Expose it to break the Overlord.")
                else: self.reveal_owner()
            # machine phase
            if self.overlord and self.ov():
                for _ in range(3): self.do(self.ov(), self.machine_ai_move())
                self.tighten()
            elif self.grace>0:
                self.grace-=1
            else:
                self.auto_machine_phase(); self.tighten()
            self.check_patterns()
            if self.check_end(): break
        if not self.result: self.result="DRAW"
        return self.result

def new_game(overlord=False, scenario=None, owner=None, verbose=False, seed=None, roster=None):
    g=Game(overlord=overlord, scenario=scenario, owner=owner, verbose=verbose, seed=seed)
    roster=roster or [("Marcus","Translator"),("Nia","Student"),("Simone","Elder"),
                      ("Zay","Veteran"),("Dre","Organizer")]
    g.players=[Player(n,r) for n,r in roster]
    if overlord: g.players.append(Player("The Owner","Overlord"))
    return g
