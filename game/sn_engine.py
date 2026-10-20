# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — rules engine (single source of truth).
v3: makes reading the real skill, and the shortcut a real temptation.
  • SEEING ≠ BEATING. Read 1 (red) tells you a deal is a trap. To NEGOTIATE it
    down you need Read up to the card's lever layer (red / amber / blue), so
    Read 2 and Read 3 finally matter.
  • NEGOTIATE costs 1 Trust and can fail; WALK is the safe exit; TAKE the honest
    deals. Reading the card decides which.
  • TAKE is tempting again: on a trap it patches the district NOW (Squeeze −2) or
    rushes clarity (+2) — and puts Shady on you. Shady-as-salvation.
  • The Machine scales with player count (2–5 all playable).
  • The Underworld is a final act: once it cracks open the Owner fights in the
    open, and the block must TRACE the thread (Read 3, blue) in woken districts
    before it can expose the Owner and win.
  • Owners all bite from round 1 (Debt Buyer bug fixed).

The front-end (second_number_play.py) and the balance tester both import this.
No I/O at import; methods mutate state and append plain-text events to self.log.
"""
import random
import deck_cards as D
import chapters as CH
import deal_gen as G

DISTRICTS = list(D.DECK.keys())
ROLES     = dict(D.ROLES)
PATTERNS  = list(D.PATTERNS)
OWNERS    = dict(D.OWNERS)
SCENARIOS = dict(D.SCENARIOS)
PLACES    = dict(D.PLACES)
HISTORY   = dict(D.HISTORY)
LAYERS    = [(1,"red","🔴 RED — the cost"),(2,"amber","🟠 AMBER — the clock"),(3,"blue","🔵 BLUE — the connection")]
LEVER_NAME= {0:"—",1:"red",2:"amber",3:"blue"}

# ---- tunable constants (the balance tester sweeps these) ----
WAKE            = 3    # district clarity needed to wake it
CAPTURE         = 3    # pressure that captures a district
FLIP            = 6    # corruption that flips a player to the Machine
GRIP            = 2    # pressure at which a district counts toward a Pattern
LOSE_CAPTURED   = 2    # captured districts that lose the game
UNDERWORLD_AT   = 9    # total clarity that cracks the Underworld open
THREADS_TO_WIN  = 3    # Underworld threads traced before you can expose the Owner
TAKE_CORRUPT    = 2    # corruption gained per TAKE on a trap
NEG_COST        = 1    # Trust spent to NEGOTIATE
START_TRUST     = 2
MAX_TRUST       = 5    # Trust is spent, not hoarded
MAX_ROUNDS      = 12   # the amber clock: survive past this and the Machine still wins
SOUSOU_HAND     = 4    # Trust in the Sou-Sou pot that pays out one hand
LEAGUE_PUSH     = ("HOUSING",)        # Chapter 3: where a formed League pushes back, each Machine phase
# per player count: actions per turn, Machine hits per round, Overlord actions per round
# (tuned with balance_test.py so every count plays in the 40–70% band)
ACTIONS         = {1:4, 2:3, 3:3, 4:2, 5:2}
# Strikes per round, carrying the remainder (1.5 = 1, 2, 1, 2…). Printed on the round track.
# "One strike per 4 actions" was tested (balance_test.py): it fits 2 and 5 players, but 3 players
# win ~73% under it and 4 players drop to ~45%, so the table stays a table.
MACHINE_HITS    = {1:1, 2:1.5, 3:3, 4:1.5, 5:2.5}
# Overlord moves per round, carrying the remainder like the strikes: 2 players 1 then 2, 2, 2…;
# 3 players 3, 4, 4, 4; 4 players 2, 2, 2, 3; 5 players 3, 3, 3, 4. Set with its counterfeits in hand.
OVERLORD_MOVES  = {1:1.5, 2:1.875, 3:3.75, 4:2.25, 5:3.25}
# ---- Block Party: the 25-minute intro (RULES.md) ----
BP_DISTRICTS    = ("LENDING","HOUSING","EDUCATION")
BP_ROUNDS       = 8
BP_WAKE_TO_WIN  = 2    # wake 2 of the 3 districts
BP_TAKE         = 2    # Shady chips for taking a trap
BP_SIT_OUT      = 3    # Shady chips that sit you out a turn (no Fall in Block Party)
BP_ACTIONS      = {1:3, 2:2, 3:2, 4:2, 5:2}
BP_HITS         = {1:1, 2:0.75, 3:1.75, 4:3, 5:4}   # strikes per round, carrying the remainder (repeats allowed)
COUNTERFEIT_HAND = 3   # Overlord mode: counterfeit deals per game, at most one a round; each is one of its moves
CON_TRUST       = 1    # Trust lost when you're conned by one
CLOSE_READ      = 5    # Close reads: one layer short of the lever, NEGOTIATE succeeds on this roll or higher (d6)
FACE_TOKENS     = 1    # "Render?": times each player can be read by a teammate; the Cookout gives it back
# ---- the fine-print die: which layer holds a trap's lever, rolled on every draw ----
FINE_PRINT_DIE  = {1:1, 2:1, 3:1, 4:2, 5:2, 6:3}   # 1–3 red · 4–5 amber · 6 blue

class Player:
    def __init__(self, name, role):
        self.name, self.role = name, role
        self.trust = START_TRUST
        self.sight = {d:(1 if role=="Elder" else 0) for d in DISTRICTS}
        self.corruption = 0; self.legend = 0; self.flipped = False
        self.shields = 2 if role=="Veteran" else 0; self.elder_used = False
        self.free_teach = False; self.shop_around = False; self.practice = False   # Commons set-ups, this turn only
        self.bare = set()        # the Terrell rule: districts this player was taught without cover
        self.face = 0            # "Render?": Face tokens (set by new_game when the rule is on)
        self.benched = False     # Block Party: sits out their next turn

class Game:
    def __init__(self, overlord=False, scenario=None, owner=None, verbose=False, seed=None, chapter=None,
                 party=False, fine_print=False, terrell=False, endless=False, partial=False, render=False, carry=None):
        if seed is not None: random.seed(seed)
        self.party=party and not overlord and not chapter          # Block Party: the intro game
        self.fine_print=fine_print; self.terrell=terrell; self.endless=endless
        self.partial=partial; self.render=render                   # house rules: Close reads, "Render?"
        self.carry=carry                                            # a block that remembers (see remember())
        self.ds=list(BP_DISTRICTS) if self.party else list(DISTRICTS)
        self.max_rounds=BP_ROUNDS if self.party else MAX_ROUNDS
        self.dealt=[]                                               # every card drawn, in order
        self.signed=[]                                              # every deal decision, with its real money
        self.counterfeits=set(); self.forged=False                  # Overlord: fake honest deals waiting in piles
        self.forgeries=COUNTERFEIT_HAND                             # counterfeit cards left in the Overlord's hand
        self.chapter=CH.CHAPTERS[chapter] if chapter else None
        self.overlord = overlord; self.verbose = verbose
        self.clarity  = {d:0 for d in DISTRICTS}
        self.pressure = {d:0 for d in DISTRICTS}
        self.round=0; self.uw_open=False; self.owner_shown=overlord
        self.threads=set(); self.struck=set()   # districts extracted from this round
        self.covered=False                     # the Owner's one cover-up per round
        self.pot=0; self.circle=0              # the Sou-Sou: Trust in the pot, whose hand is next
        self.kitchen_used=False                # Grandma's table feeds the block once a game
        self.cookout_used=False                # the Cookout: once a game, a whole round together
        self.green_book=True                   # one safe route, once a game
        self.use_green_book=lambda d: True     # front-ends can ask the table instead
        self.won=False; self.result=None; self.log=[]; self.patterns_seen=set()
        self.human_overlord=False
        ch=self.chapter
        self.scenario = ("Block Party" if self.party else
                         f"Chapter {ch['number']}: {ch['title']}" if ch else scenario or random.choice(list(SCENARIOS)))
        self.deck = {d:(ch["decks"].get(d,D.DECK[d]) if ch else D.DECK[d]) for d in self.ds}
        self.league=set(); self.league_formed=False                 # chapter 3: the Contract Buyers League
        if ch:
            for d,p in ch["pressure"].items(): self.pressure[d]=p
        for d,p in {"The Eviction Wave":{"HOUSING":2},"The Closure":{"EDUCATION":3},
                    "The Plants Close":{"LABOR":2},"The Hospital Closes":{"HEALTH":2}}.get(self.scenario,{}).items():
            self.pressure[d]=p
        self.grace = 1 if self.scenario=="The Audit" else 0
        self.remember()
        self.owner = ("The Overlord" if overlord else "No Owner" if self.party else
                      ch["owner"] if ch else owner or random.choice(list(OWNERS)))
        if self.party: self.green_book=False
        self.owner_face = ch["face"] if ch and not overlord else self.owner          # the Owner's era face
        self.players=[]

    def remember(self):
        """A block that remembers: districts woken last game start a step ahead (Clarity +1), captured ones
        carry a scar (Squeeze +1). carry = {"clarity": {d: n}, "pressure": {d: n}, "rally": bool}."""
        if not self.carry or self.overlord or self.chapter or self.party: return   # the full co-op game only
        for d,n in (self.carry.get("clarity") or {}).items():
            if d in self.ds and n>0: self.clarity[d]=min(WAKE-1,self.clarity[d]+n)
        for d,n in (self.carry.get("pressure") or {}).items():
            if d in self.ds and n>0: self.pressure[d]=min(CAPTURE-1,self.pressure[d]+n)
        strong=[d for d in self.ds if (self.carry.get("clarity") or {}).get(d)]
        scars=[d for d in self.ds if (self.carry.get("pressure") or {}).get(d)]
        if strong or scars or self.carry.get("rally"):
            self.emit("🏘 The block remembers: "
                      + "; ".join(([f"{', '.join(strong)} start{'s' if len(strong)==1 else ''} stronger (Clarity +1)"] if strong else [])
                                  + ([f"{', '.join(scars)} carr{'ies' if len(scars)==1 else 'y'} a scar (Squeeze +1)"] if scars else [])
                                  + (["after last game, the community rallies (everyone +1 Trust)"] if self.carry.get("rally") else []))
                      + ".")

    # ---- helpers ----
    def emit(self,s):
        self.log.append(s)
        if self.verbose: print(s)
    def blk(self):    return [p for p in self.players if p.role!="Overlord"]
    def active(self): return [p for p in self.blk() if not p.flipped]
    def ov(self):     return next((p for p in self.players if p.role=="Overlord"), None)
    def n(self):      return max(1,min(5,len(self.blk())))
    def actions(self):return (BP_ACTIONS if self.party else ACTIONS)[self.n()]
    def total_clarity(self): return sum(self.clarity.values())
    def awake(self):  return sum(1 for d in self.ds if self.clarity[d]>=WAKE)
    def captured(self): return sum(1 for d in self.ds if self.pressure[d]>=CAPTURE)
    def gripped(self,d): return self.pressure[d]>=GRIP
    def active_patterns(self):
        if self.party: return []                  # no Patterns in Block Party
        return [(c,n,l) for c,n,l in PATTERNS if all(self.gripped(d) for d in c)]
    def threads_needed(self): return THREADS_TO_WIN
    def can_trace(self,pl,d):
        return self.uw_open and pl.sight[d]>=3 and self.clarity[d]>=WAKE and d not in self.threads
    def can_expose(self): return self.uw_open and len(self.threads)>=self.threads_needed()
    def lever(self, d, card):
        """The League reads contracts together: Housing and Lending traps beatable at Read 1."""
        if self.league_formed and d in ("HOUSING","LENDING") and card["trap"]: return min(card["lever"],1)
        return card["lever"]

    # ---- the League (Chapter 3): sign the pledge to withhold together ----
    def has_league(self): return bool(self.chapter and self.chapter.get("league"))
    def league_needed(self): return max(2,len(self.active()))

    def sign_league(self, pl):
        if not self.has_league() or self.league_formed:
            self.emit("  There's no League to sign right now."); return
        if pl.name in self.league: self.emit(f"  {pl.name} has already signed."); return
        self.league.add(pl.name); pl.legend+=1
        self.emit(f"{pl.name} signs the League pledge: we withhold together. "
                  f"Signatures {len(self.league)}/{self.league_needed()}. Props +1.")
        self.try_form_league()

    def try_form_league(self):
        """It forms the moment every family has signed in the same round."""
        if self.league_formed or not self.has_league() or len(self.league)<self.league_needed(): return
        if True:
            self.league_formed=True; before=self.pressure["HOUSING"]
            self.pressure["HOUSING"]=max(0,before-2)
            self.emit(f"✦ THE LEAGUE FORMS. Housing Squeeze {before}→{self.pressure['HOUSING']}. "
                      f"The families read their contracts together: every Housing and Lending trap can now be "
                      f"negotiated with Read 1.")

    def league_round(self):
        """Each Machine phase: a formed League pushes back; a forming one draws retaliation."""
        if not self.has_league(): return
        if self.league_formed and self.round%2==0:            # withholding bites every other round
            d=max(LEAGUE_PUSH,key=lambda x:self.pressure[x])
            if self.pressure[d]>0:
                self.pressure[d]-=1
                self.emit(f"  ✦ The League withholds together: Squeeze in {d} −1 ({self.pressure[d]}/{CAPTURE}).")
        elif self.league:
            self.emit(f"  ⚑ The sellers scare families off: the pledges fall apart ({len(self.league)}/"
                      f"{self.league_needed()} signed). Everyone has to sign in the same round.")
            self.league=set()

    def neg_cost(self, d):
        return NEG_COST+(1 if self.scenario=="The Hospital Closes" and d=="HEALTH" else 0)
    def take_cost(self):
        if self.party: return BP_TAKE                           # Block Party: Shady chips
        return TAKE_CORRUPT+(1 if self.owner=="The Debt Buyer" else 0)

    # ---- what a player can see on a card (front-ends render this) ----
    def visible(self, pl, d, card):
        """[(layer_no, label, text_or_None)] — None means locked at this Read."""
        return [(n,lab,card[k] if pl.sight[d]>=n else None) for n,k,lab in LAYERS]

    # ================= BLOCK ACTIONS =================
    def study(self, pl, d):
        if pl.sight[d] >= 3:
            self.emit(f"{pl.name} already reads {d} fully."); return
        g=2 if pl.practice else 1; pl.practice=False
        pl.sight[d]=min(3,pl.sight[d]+g); pl.legend+=1
        self.emit(f"{pl.name} studies {d}{' (practiced at Adventure Central)' if g==2 else ''}. "
                  f"Read now {pl.sight[d]}/3. Props +1.")

    def draw(self, d):
        if d in self.counterfeits:                 # the Overlord's counterfeit is on top of the pile
            self.counterfeits.discard(d); card=dict(D.COUNTERFEITS[d])
            self.dealt.append(card); return card
        card=G.make_deal(d,random) if self.endless else random.choice(self.deck[d])
        return self.dress(card)

    def looks(self, pl, d, card, see=None):
        """The deal as this player can read it (or a teammate rendering it for them: see): below Read 3,
        a counterfeit looks like honest help."""
        see=pl.sight[d] if see is None else see
        return dict(card, trap=False, lever=0) if card.get("counterfeit") and see<3 else card

    def dress(self, card):
        """The fine-print die: roll which layer holds a trap's lever, so the deck can't be learned by heart."""
        if self.fine_print and card["trap"]:
            die=int(random.random()*6)+1; card=dict(card, lever=FINE_PRINT_DIE[die], die=die)
        self.dealt.append(card)
        return card

    def start_turn(self, pl):
        pl.free_teach=False; pl.shop_around=False; pl.practice=False

    def deals_for(self, pl, d):
        """The deal(s) a player looks at: two if they shopped at Gem City Market this turn."""
        if pl.shop_around:
            pl.shop_around=False
            if self.endless or d in self.counterfeits: return [self.draw(d), self.draw(d)]
            return [self.dress(c) for c in random.sample(self.deck[d],2)]
        return [self.draw(d)]

    def can_render(self, pl, by, d):
        """"Render?": a teammate who reads this district better reads the deal for you, once per Face token."""
        return (self.render and by is not None and by is not pl and pl.face>0 and not by.flipped
                and by.role!="Overlord" and by.sight[d]>pl.sight[d])

    def face(self, pl, d, choice, card=None, by=None):
        """Face a live deal. choice in TAKE/WALK/NEGOTIATE. by: the teammate rendering it for you ("Render?")."""
        card=card or self.draw(d); trap=card["trap"]; lever=self.lever(d,card); see=pl.sight[d]
        self.emit(f"{pl.name} faces a deal in {d}: \"{card['front']}\"  → {choice}")
        if self.can_render(pl,by,d):
            pl.face-=1; see=by.sight[d]
            self.emit(f"  Render? {pl.name} lets {by.name} read it for them (Read {see}). Face left: {pl.face}.")
        out=None                                   # what happened, for the money count (money())
        if "die" in card: self.emit(f"  (The fine print: rolled {card['die']}, so the lever sits in {LEVER_NAME[card['lever']]}.)")
        bare=self.terrell and trap and d in pl.bare and choice!="WALK"
        fake=card.get("counterfeit",False)
        if choice=="TAKE" and fake:                # conned: you took it for honest help
            out="conned"; lost=min(pl.trust,CON_TRUST); pl.trust-=lost
            if self.pressure[d]<CAPTURE: self.pressure[d]+=1
            self.emit(f"  It was a COUNTERFEIT: it only looked honest. Squeeze +1 in {d} ({self.pressure[d]}/{CAPTURE})"
                      + (f", Trust −{lost}." if lost else "."))
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
        elif choice=="TAKE":
            if not trap:
                pl.trust+=2; self.clarity[d]=min(WAKE,self.clarity[d]+1); pl.legend+=1; out="help"
                self.emit(f"  It was an HONEST deal — real help. Trust +2, {d} clarity +1, Props +1.")
            else:
                cost=self.take_cost(); pl.corruption+=cost; out="taken"
                if self.pressure[d]>0:
                    self.pressure[d]=max(0,self.pressure[d]-2)
                    self.emit(f"  TAKE the trap to patch {d} NOW: Squeeze −2… Shady +{cost} on you. (Props +0)")
                else:
                    rush=1 if self.party else 2               # Block Party: the shortcut is smaller
                    self.clarity[d]=min(WAKE,self.clarity[d]+rush)
                    self.emit(f"  TAKE the trap for fast power: {d} clarity +{rush}… Shady +{cost} on you. (Props +0)")
        elif choice=="WALK":
            out="dodged" if trap else "refused"
            if fake: self.emit(f"  WALK: it was a COUNTERFEIT, and you walked. Safe.")
            elif trap: self.emit(f"  WALK: you dodged a trap. Safe, nothing gained.")
            else:
                pl.trust=max(0,pl.trust-1)
                self.emit(f"  WALK: it was honest help you refused out of fear. Trust −1.")
        else:  # NEGOTIATE
            cost=self.neg_cost(d)
            if pl.trust<cost:
                self.emit(f"  {pl.name} hasn't the Trust to negotiate with — the deal walks."); return
            # (no Trust spent, no confrontation: the Terrell rule doesn't bite)
            pl.trust-=cost
            if trap and see>=lever:
                amt=2 if pl.role=="Organizer" else 1; out="defused"
                self.pressure[d]=max(0,self.pressure[d]-amt); self.clarity[d]=min(WAKE,self.clarity[d]+1)
                pl.legend+=2
                self.emit(f"  NEGOTIATE on the {LEVER_NAME[lever]} lever (Read {see}): defused. "
                          f"Squeeze −{amt}, {d} clarity +1, Props +2.")
                if fake:
                    pl.legend+=1; self.emit(f"  You exposed a COUNTERFEIT: it only looked like honest help. Props +1.")
            elif trap and self.partial and see==lever-1 and (roll:=int(random.random()*6)+1)>=CLOSE_READ:
                out="partial"; self.pressure[d]=max(0,self.pressure[d]-1); pl.legend+=1   # a close read
                self.emit(f"  NEGOTIATE one layer short of the {LEVER_NAME[lever]} lever (Read {see}): rolled {roll}, "
                          f"you talked them down. Squeeze −1, Props +1.")
            elif trap:
                if self.partial and see==lever-1:
                    self.emit(f"  A close read (Read {see}, the lever's {LEVER_NAME[lever]}): rolled {roll}, not enough.")
                out="played"; self.pressure[d]=min(CAPTURE,self.pressure[d]+1)
                self.emit(f"  NEGOTIATE without the {LEVER_NAME[lever]} layer (Read {see}): you got played. "
                          f"Squeeze +1, Trust −{cost}.")
                if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
            else:
                out="wasted"
                self.emit(f"  NEGOTIATE on an honest deal: you haggled away real help. Trust −{cost}.")
        pl.trust=min(pl.trust,MAX_TRUST)
        self.signed.append(dict(who=pl.name, d=d, out=out, front=card["front"],
                                dollars=card.get("dollars",0), basis=card.get("basis","")))
        if bare:                                   # the Terrell rule: seeing it isn't covering it
            pl.bare.discard(d)
            if self.pressure[d]<CAPTURE:
                self.pressure[d]+=1
                self.emit(f"  ⚠ It backfires: {pl.name} read it but nobody had their back. Squeeze +1 in {d} ({self.pressure[d]}/{CAPTURE}).")
                if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
        if self.party:
            if pl.corruption>=BP_SIT_OUT:
                pl.corruption=0; pl.benched=True
                self.emit(f"  ⚠ {pl.name} has {BP_SIT_OUT} Shady chips: hand them back and sit out your next turn.")
        elif pl.corruption>=FLIP and not pl.flipped:
            pl.flipped=True
            self.emit(f"  ⚠⚠ {pl.name} HAS FALLEN. The Machine now moves through them.")

    def teach(self, pl, t, d, response=True):
        """response: did the learner say the second number back? (call and response)"""
        free=(pl.role=="Translator") or pl.free_teach
        if pl.sight[d]<=t.sight[d]: self.emit(f"  {pl.name} can't teach {t.name} {d} — you can only teach what you read better."); return
        if not free and pl.trust<1: self.emit(f"  {pl.name} lacks Trust to teach."); return
        g=2 if t.role=="Student" else 1; old=t.sight[d]; t.sight[d]=min(pl.sight[d],t.sight[d]+g)
        if not free: pl.trust-=1
        elif pl.role!="Translator": pl.free_teach=False
        pl.legend+=2
        self.emit(f"{pl.name} teaches {t.name} to read {d}. Read {old}→{t.sight[d]}{' (free)' if free else ''}. Props +2.")
        if self.terrell:
            if pl.role=="Veteran": self.emit(f"  The Veteran teaches the cover with it: {t.name} is covered in {d}.")
            else:
                t.bare.add(d)
                self.emit(f"  No cover yet: if {t.name} confronts a trap in {d} before the block has their back, it backfires.")
        if response:
            pl.legend+=1; t.legend+=1
            self.emit(f"  Call and response: {t.name} says the second number back. Props +1 each.")

    def commons(self, pl, place="BARBERSHOP"):
        """+2 Trust, −1 Shady, plus the place's bonus."""
        if place=="KITCHEN" and self.kitchen_used: place="BARBERSHOP"
        pl.trust=min(MAX_TRUST,pl.trust+2)
        drop=2 if place=="CHURCH" else 1; had=pl.corruption; pl.corruption=max(0,pl.corruption-drop)
        covered=self.cover(pl)
        if self.party:
            self.emit(f"{pl.name} gathers with the block. Trust +2" + (f", Shady −{had-pl.corruption}" if had else "") + "."
                      + covered); return
        P=PLACES[place]
        self.emit(f"{pl.name} gathers at {P['name']} ({P['where']}). Trust +2"
                  + (f", Shady −{had-pl.corruption}" if had else "") + "." + covered)
        if place=="BARBERSHOP":
            pl.free_teach=True; self.emit("  Somebody in the chair can help: your next Teach this turn is free.")
        elif place=="MARKET":
            pl.shop_around=True; self.emit("  You shop around: your next deal this turn, draw 2 and face 1.")
        elif place=="ADVENTURE":
            pl.practice=True; self.emit("  Practice in the park: your next Study this turn gives +2 Read.")
        elif place=="KITCHEN":
            self.kitchen_used=True
            for p in self.active(): p.trust=min(MAX_TRUST,p.trust+2)
            self.emit("  Grandma feeds the whole block. Every player +2 Trust. (Once per game.)")

    def cover(self, pl):
        """The Terrell rule: gathering with the block covers what you were taught."""
        if not pl.bare: return ""
        pl.bare=set(); return " The block has their back now: covered."

    # ---- the Sou-Sou: a rotating savings circle, the honest payday loan ----
    def next_hand(self):
        act=self.active()
        return act[self.circle%len(act)] if act else None

    def throw_hand(self, pick=None):
        """Everyone who can puts 1 Trust in the pot. A full pot pays the next player's hand:
        clear 2 Squeeze from one district, no Shady. pick(pl) -> district."""
        payers=[p for p in self.active() if p.trust>=1]
        for p in payers: p.trust-=1
        self.pot+=len(payers)
        self.emit(f"The block throws a hand in the Sou-Sou: {len(payers)} Trust in. Pot {self.pot}/{SOUSOU_HAND}.")
        if self.pot<SOUSOU_HAND: return
        pl=self.next_hand(); self.circle+=1; self.pot-=SOUSOU_HAND
        d=(pick(pl) if pick else None) or max(self.ds,key=lambda x:self.pressure[x])
        before=self.pressure[d]; self.pressure[d]=max(0,before-2); pl.legend+=1
        self.emit(f"  It's {pl.name}'s hand. The debt in {d} gets paid off clean: "
                  f"Squeeze {before}→{self.pressure[d]}, no Shady. Props +1.")

    # ---- the Cookout: once per game, the whole round is spent together ----
    def cookout_gain(self, pl):
        """The district where this player gains most by reading off the best reader at the table."""
        best={d:max(p.sight[d] for p in self.active()) for d in self.ds}
        d=max(self.ds,key=lambda x:(best[x]-pl.sight[x], self.clarity[x]>=WAKE))
        return d, best[d]-pl.sight[d]

    def cookout(self, picks=None):
        """No block actions this round. Everyone +2 Trust, −1 Shady, and raises their
        Read in one district to the table's best there. picks: {player name: district}."""
        self.cookout_used=True
        self.emit("🍖 THE COOKOUT. Everybody's invited. Nobody works this round — the block eats, laughs, and compares paperwork.")
        best={d:max(p.sight[d] for p in self.active()) for d in self.ds}
        for pl in self.active():
            pl.trust=min(MAX_TRUST,pl.trust+2); pl.corruption=max(0,pl.corruption-1); pl.legend+=1
            if self.render: pl.face=FACE_TOKENS
            d=(picks or {}).get(pl.name) or self.cookout_gain(pl)[0]
            old=pl.sight[d]; pl.sight[d]=max(old,best[d])
            self.emit(f"  {pl.name}: Trust +2, Shady −1, Props +1"
                      + (f", Read in {d} {old}→{pl.sight[d]}." if pl.sight[d]>old else ".") + self.cover(pl))

    def cookout_ai(self):
        """Call it when the table's knowledge is lopsided enough to be worth a whole round."""
        if self.party or self.cookout_used or max(self.pressure.values())>=CAPTURE-1: return False
        act=self.active(); gain=sum(self.cookout_gain(p)[1] for p in act)
        return gain>=len(act)*self.actions()*0.75

    def sousou_ai(self):
        """Throw when there's debt to pay and nobody goes broke putting in."""
        act=self.active()
        if self.party: return False
        return (any(0<self.pressure[d] for d in self.ds)
                and all(p.trust>=2 for p in act))

    def reach(self, pl, t):
        if pl.trust<2: self.emit(f"  {pl.name} needs 2 Trust to reach someone."); return
        pl.trust-=2; t.flipped=False; t.corruption=FLIP-2; pl.legend+=3
        self.emit(f"{pl.name} reaches {t.name} and pulls them home. Props +3.")

    def history(self, pl, d):
        if pl.role!="Elder" or pl.elder_used: self.emit("  No History to teach."); return
        pl.elder_used=True; self.clarity[d]=WAKE; pl.legend+=2
        h=self.history_card=random.choice(HISTORY[d]+HISTORY["ANY"])
        self.emit(f"{pl.name} teaches the History of {d}: {h['title']} ({h['year']}, {h['place']}).")
        self.emit(f"  {h['story']}")
        self.emit(f"  \"{h['lesson']}\"  {d} AWAKE. Props +2.")

    def trace(self, pl, d):
        if not self.can_trace(pl,d):
            self.emit(f"  {pl.name} can't trace {d} (needs the Underworld open, Read 3, and {d} awake)."); return
        self.threads.add(d); pl.legend+=2
        self.emit(f"{pl.name} traces the blue thread under {d} down into the Underworld. "
                  f"Threads {len(self.threads)}/{self.threads_needed()}. Props +2.")

    def expose_uw(self, pl):
        if not self.can_expose():
            self.emit(f"  Not enough threads traced to expose the Owner ({len(self.threads)}/{self.threads_needed()})."); return
        self.emit(f"{pl.name} drags the UNDERWORLD into the light. One Owner — {self.owner_face}. It was always one machine.")
        self.won=True; self.result="BLOCK_WIN"

    # ================= MACHINE / FALLEN / OVERLORD =================
    def safe_route(self, d):
        """The Green Book: once per game, a strike that would capture a district lands nowhere."""
        if self.green_book and self.pressure[d]==CAPTURE-1 and self.use_green_book(d):
            self.green_book=False
            self.emit(f"  📗 The block opens the Green Book: a safe route around {d}. That strike lands nowhere.")
            return True
        return False

    def m_extract(self, who, d):
        if d in self.struck:
            self.emit(f"[{who}] already moved on {d} this round — the Machine spreads, it doesn't snipe."); return
        self.struck.add(d)
        if self.safe_route(d): return
        if self.pressure[d]<CAPTURE:
            self.pressure[d]+=1; self.emit(f"[{who}] strikes {d} for the Machine. Squeeze {self.pressure[d]}/{CAPTURE}.")
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
    def m_obscure(self, who, d):
        if d in self.struck:
            self.emit(f"[{who}] already moved on {d} this round — the Machine spreads, it doesn't snipe."); return
        if self.clarity[d]>=WAKE:   # a woken district is out of reach — except one cover-up per round, in the open
            if not self.uw_open or self.covered or d in self.threads:
                self.emit(f"[{who}] can't muddy {d} — the block is awake there."); return
            self.covered=True
        if self.clarity[d]>0:
            self.struck.add(d); self.clarity[d]-=1; self.emit(f"[{who}] muddies {d}: the second number gets buried. Clarity −1.")
    def m_counterfeit(self, who, d):
        """Overlord: slip a fake honest deal onto a district's pile. One of the Overlord's moves, at most one a
        round, from a hand of COUNTERFEIT_HAND. It doesn't use the district's move. The block isn't told where."""
        if self.forged: self.emit(f"[{who}] has already slipped a counterfeit in this round."); return
        if self.forgeries<1: self.emit(f"[{who}] has no counterfeits left."); return
        if d in self.counterfeits: self.emit(f"[{who}] already has a counterfeit waiting there."); return
        self.counterfeits.add(d); self.forged=True; self.forgeries-=1
        self.emit(f"[{who}] slips a counterfeit into a deal pile somewhere on the block.")

    def m_tempt(self, who, t):
        if t and t.trust>0: t.trust-=1; self.emit(f"[{who}] tempts {t.name} with a sweeter deal. Trust −1.")

    def machine_ai_move(self, struck=()):
        """The Machine's choice for a Fallen player or the computer Overlord.
        Obeys the spread rule: at most one Machine move per district per round."""
        free=[d for d in self.ds if d not in struck]
        near=[d for d in free if self.pressure[d]==CAPTURE-1]
        if near: return ("m_extract",None,near[0])
        if self.uw_open and not self.covered:   # protect the Owner: bury a woken district before it's traced
            exp=[d for d in free if self.clarity[d]>=WAKE and d not in self.threads]
            if exp: return ("m_obscure",None,exp[0])
        vuln=[d for d in free if 0<self.clarity[d]<WAKE and self.pressure[d]<CAPTURE]
        if vuln:
            d=max(vuln,key=lambda x:self.clarity[x])
            return ("m_obscure" if self.clarity[d]>=2 else "m_extract",None,d)
        t=max(self.active(),key=lambda p:p.trust,default=None)
        if t and t.trust>0: return ("m_tempt",t,None)
        free=[d for d in free if self.pressure[d]<CAPTURE]
        return ("m_extract",None,min(free,key=lambda x:self.pressure[x])) if free else ("pass",None,None)

    def overlord_ai_move(self, struck=()):
        """The computer Overlord: the Machine's move, or a counterfeit when no capture is on the line."""
        a=self.machine_ai_move(struck)
        if a[0]=="m_extract" and self.pressure[a[2]]==CAPTURE-1: return a       # a capture comes first
        return self.overlord_counterfeit() or a

    def overlord_counterfeit(self):
        """The computer Overlord's counterfeit (from round 2): where the block reads well enough to trust
        a deal and not well enough to see through it. None if there's nowhere worth it."""
        if self.forged or self.forgeries<1 or self.round<2: return None
        fooled=lambda x: sum(1<=p.sight[x]<3 for p in self.active())
        cand=[d for d in self.ds if d not in self.counterfeits and self.clarity[d]<WAKE and fooled(d)]
        return ("m_counterfeit",None,max(cand,key=fooled)) if cand else None

    def owner_passive(self):
        """Owner acts from round 1 (hidden). Skipped in Overlord mode."""
        if self.overlord: return
        o=self.owner
        if o=="The Lobbyist":
            best=[d for d in self.ds if 0<self.clarity[d]<WAKE and self.pressure[d]<CAPTURE and d not in self.struck]
            if best:
                d=max(best,key=lambda x:self.clarity[x]); self.struck.add(d); self.pressure[d]+=1
                self.emit(f"  ⚑ (hidden hand) the squeeze creeps onto your strongest work in {d}. {self.pressure[d]}/{CAPTURE}.")
                if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")
        elif o=="The Recruiter":
            pool=[(p,d) for p in self.active() for d in self.ds if p.sight[d]>0]
            if pool:
                p,d=random.choice(pool); p.sight[d]-=1
                self.emit(f"  ⚑ (hidden hand) a recruiter peels {p.name} away from {d}. Read −1.")
        elif o=="The Debt Buyer":
            owed=[p for p in self.active() if p.corruption>0 and p.trust>0]
            for p in owed: p.trust-=1
            if owed: self.emit(f"  ⚑ (hidden hand) collections calls: {', '.join(p.name for p in owed)} lose 1 Trust.")
        # The Algorithm's extra strike applies in the Machine phase

    def hit(self, d):
        vet=next((p for p in self.active() if p.role=="Veteran" and p.shields>0),None)
        if vet: vet.shields-=1; self.emit(f"  ⛨ {vet.name} shields {d}. ({vet.shields} left)"); return
        if self.safe_route(d): return
        self.pressure[d]+=1; self.emit(f"  ✖ The Machine strikes {d}. Squeeze {self.pressure[d]}/{CAPTURE}.")
        if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")

    def party_machine_phase(self):
        """Block Party: the Machine hits the districts closest to waking, +1 Squeeze and −1 Clarity each."""
        for _ in range(self.strikes()):
            vuln=[d for d in self.ds if self.clarity[d]<WAKE and self.pressure[d]<CAPTURE]   # no spread rule here
            if not vuln: break
            d=max(vuln,key=lambda x:(self.clarity[x],-self.pressure[x])); self.struck.add(d)
            self.pressure[d]+=1; had=self.clarity[d]; self.clarity[d]=max(0,had-1)
            self.emit(f"  ✖ The Machine strikes {d}. Squeeze {self.pressure[d]}/{CAPTURE}" + (", Clarity −1." if had else "."))
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")

    def strikes(self):
        """This round's strikes, carrying the remainder: 1.5 = 1, 2, 1, 2…"""
        h=(BP_HITS if self.party else MACHINE_HITS)[self.n()]
        return int(h*self.round)-int(h*(self.round-1))

    def auto_machine_phase(self):
        hits=self.strikes()
        if self.owner=="The Algorithm": hits+=1     # the relentless one: an extra strike
        if self.owner_shown: hits+=1                # the Owner fights in the open
        struck=self.struck
        if (self.scenario=="Payday Season" and self.round%2==0 and "LENDING" not in struck
                and self.pressure["LENDING"]<CAPTURE):
            struck.add("LENDING"); self.emit(f"  ✖ Payday Season: payday again — an extra LENDING hit.")
            self.hit("LENDING")
        for _ in range(max(0,hits)):
            vuln=[d for d in self.ds if self.clarity[d]<WAKE and self.pressure[d]<CAPTURE and d not in struck]
            if not vuln: break
            # contest the block's progress: pressure the district closest to waking.
            # One strike per district per phase — the Machine spreads, it doesn't snipe.
            d=max(vuln,key=lambda x:(self.clarity[x],-self.pressure[x])); struck.add(d); self.hit(d)
        # erode the block's best unfinished work, so clarity isn't a one-way ratchet
        building=[d for d in self.ds if 0<self.clarity[d]<WAKE and d not in struck]
        if building:
            d=max(building,key=lambda x:self.clarity[x]); self.clarity[d]-=1; struck.add(d)
            self.emit(f"  ✖ The Machine muddies {d}. Clarity −1.")
        # in the open, the Owner buries a woken district before you can trace it
        if self.owner_shown:
            exp=[d for d in self.ds if self.clarity[d]>=WAKE and d not in self.threads and d not in struck]
            if exp and not self.covered:
                d=random.choice(exp); self.clarity[d]-=1; self.covered=True; struck.add(d)
                self.emit(f"  ⚑ The Owner covers its tracks in {d}. Clarity −1 (no longer awake).")
        self.owner_passive()

    def fallen_turn(self, pl, n):
        """The Machine moves through a Fallen player (n actions; Debt Buyer doubles them)."""
        mult=2 if (self.owner=="The Debt Buyer" and not self.overlord) else 1
        for _ in range(n*mult):
            self.do(pl, self.machine_ai_move(self.struck))

    def reveal_owner(self):
        self.owner_shown=True
        text=self.chapter["face_text"] if self.chapter else f"{self.owner} — {OWNERS[self.owner]}"
        self.emit(f"⚑ THE UNDERWORLD CRACKS OPEN. The Owner is {text}")
        self.emit(f"  Trace {self.threads_needed()} threads (Read 3 in a woken district) and expose it before it buries you.")
        if self.owner=="The Lobbyist":
            awake=[d for d in self.ds if self.clarity[d]>=WAKE]
            if awake: d=random.choice(awake); self.clarity[d]=1; self.emit(f"  ✖ {self.owner_face} re-captures {d}.")

    def open_underworld(self):
        self.uw_open=True
        if self.overlord:
            self.emit(f"⚑ THE UNDERWORLD CRACKS OPEN. Trace {self.threads_needed()} threads and expose the Overlord.")
        else: self.reveal_owner()

    def tighten(self):
        self.map_compounds()
        aps=self.active_patterns()
        if not aps: return
        c,n,_=max(aps,key=lambda x:len(x[0]))
        cand=[d for d in c if self.pressure[d]<CAPTURE]
        if cand:
            d=min(cand,key=lambda x:self.pressure[x]); self.pressure[d]+=1
            self.emit(f"  ⚠ {n} tightens on {d}. Squeeze {self.pressure[d]}/{CAPTURE}.")
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")

    def map_compounds(self):
        """Chapter 3: while REDLINING is active, the map tightens it again every round."""
        if not self.has_league() or self.round<2: return            # the family gets one round to read the map
        if not any(n=="REDLINING" for _,n,_ in self.active_patterns()): return
        d=min(("HOUSING","LENDING"),key=lambda x:self.pressure[x])
        if self.pressure[d]<CAPTURE:
            self.pressure[d]+=1
            self.emit(f"  ⚠ The map compounds: REDLINING tightens again on {d}. Squeeze {self.pressure[d]}/{CAPTURE}.")
            if self.pressure[d]>=CAPTURE: self.emit(f"  ✖ {d} CAPTURED.")

    def check_patterns(self):
        if self.party: return
        active={n for _,n,_ in self.active_patterns()}
        for c,n,l in self.active_patterns():
            if n not in self.patterns_seen:
                self.patterns_seen.add(n); self.emit(f"⚠⚠ MACHINE PATTERN — {n}  [{' + '.join(c)}]: {l}")
        for _,n,_ in PATTERNS:                                  # fixed order, so every run (and port) matches
            if n in self.patterns_seen and n not in active:
                self.patterns_seen.discard(n); self.emit(f"✦ PATTERN BROKEN — {n}.")

    def check_end(self):
        if self.captured()>=LOSE_CAPTURED: self.won=True; self.result="MACHINE_WIN"; return "Two districts fell. The Machine holds the block."
        if not self.active():              self.won=True; self.result="MACHINE_WIN"; return "The whole block fell. The Machine won wearing your faces."
        return None

    # ================= DISPATCH =================
    def do(self, pl, a):
        k=a[0]
        if   k=="study":    self.study(pl,a[1])
        elif k=="face":     self.face(pl,a[1],a[2],a[3] if len(a)>3 else None,a[4] if len(a)>4 else None)
        elif k=="teach":    self.teach(pl,a[1],a[2],a[3] if len(a)>3 else True)
        elif k=="commons":  self.commons(pl, a[1] if len(a)>1 and a[1] else "BARBERSHOP")
        elif k=="reach":    self.reach(pl,a[1])
        elif k=="history":  self.history(pl,a[1])
        elif k=="trace":    self.trace(pl,a[1])
        elif k=="expose_uw":self.expose_uw(pl)
        elif k=="league":   self.sign_league(pl)
        elif k=="m_extract":self.m_extract(pl.name,a[2])
        elif k=="m_obscure":self.m_obscure(pl.name,a[2])
        elif k=="m_tempt":  self.m_tempt(pl.name,a[1])
        elif k=="m_counterfeit": self.m_counterfeit(pl.name,a[2])
        # "pass" -> nothing
        self.check_party_win()

    def check_party_win(self):
        """Block Party: wake 2 of the 3 districts and the block wins on the spot."""
        if self.party and not self.won and self.awake()>=BP_WAKE_TO_WIN:
            self.won=True; self.result="BLOCK_WIN"
            self.emit(f"✦ {self.awake()} of {len(self.ds)} districts awake. The block party goes all night: you win.")

    # ================= BLOCK AI =================
    # style: "careful" (TAKE only to save a district, never past the edge),
    #        "never"   (refuses every shortcut), "greedy" (takes fast power freely),
    #        "human"   (careful, but gives in to temptation about one move in five).
    def bot_choice(self, pl, d, card, style="careful", see=None):
        """Decide TAKE/WALK/NEGOTIATE using only what this player can see (or a renderer sees for them)."""
        see=pl.sight[d] if see is None else see
        card=self.looks(pl,d,card,see)
        safe=pl.corruption+self.take_cost()<FLIP
        urgent=self.pressure[d]>=CAPTURE-1
        if see>=1:                                   # red layer: you can tell trap from honest
            if not card["trap"]: return "TAKE"
            if self.terrell and d in pl.bare and not urgent: return "WALK"   # get covered first
            if see>=card["lever"] and pl.trust>=self.neg_cost(d): return "NEGOTIATE"
            if style=="greedy" and pl.corruption+self.take_cost()<FLIP+2: return "TAKE"
            if style=="careful" and urgent and safe: return "TAKE"
            if (self.partial and urgent and see==card["lever"]-1 and pl.trust>=self.neg_cost(d)
                    and style!="greedy"): return "NEGOTIATE"                     # try a close read
            return "WALK"
        # blind: the front is all you have
        if style=="greedy" or (style=="careful" and urgent and safe): return "TAKE"
        return "WALK"

    def bot_face(self, pl, d, style):
        def score(c):
            c=self.looks(pl,d,c)
            if pl.sight[d]<1: return 0
            if not c["trap"]: return 2
            return 3 if pl.sight[d]>=c["lever"] else 0
        card=max(self.deals_for(pl,d),key=score)
        by=self.bot_renderer(pl,d)
        return ("face",d,self.bot_choice(pl,d,card,style,by.sight[d] if by else None),card,by)

    def bot_renderer(self, pl, d):
        """Who a bot asks to read a deal for it: the best reader, when it can't read the district or it's urgent."""
        if not self.render or pl.face<1: return None
        best=max((p for p in self.active() if p is not pl), key=lambda p:p.sight[d], default=None)
        if best and self.can_render(pl,best,d) and (pl.sight[d]==0 or self.pressure[d]>=CAPTURE-1): return best
        return None

    def bot_place(self, pl):
        """Where the bot gathers. Barbershop, park and market set up your next action."""
        act=self.active()
        if pl.corruption>=2: return ("CHURCH",)
        if not self.kitchen_used and sum(p.trust for p in act)<=len(act): return ("KITCHEN",)
        if self.uw_open and any(pl.sight[x]<3 and self.clarity[x]>=WAKE and x not in self.threads for x in self.ds):
            return ("ADVENTURE",)
        if any(p.sight[x]<pl.sight[x] for p in act if p is not pl for x in self.ds): return ("BARBERSHOP",)
        if any(pl.sight[x]==0 and self.clarity[x]<WAKE for x in self.ds): return ("ADVENTURE",)
        return ("MARKET",)

    def block_ai(self, pl, style="careful"):
        if style=="human": style="greedy" if random.random()<0.2 else "careful"
        if self.can_expose(): return ("expose_uw",None,None)
        for d in self.ds:
            if self.can_trace(pl,d): return ("trace",d,None)
        fallen=[p for p in self.blk() if p.flipped]
        if fallen and pl.trust>=2 and max(self.pressure.values())<CAPTURE-1:
            return ("reach",fallen[0],None)
        if pl.corruption>=FLIP-2 and style!="greedy": return ("commons",)+self.bot_place(pl)
        if pl.trust<NEG_COST: return ("commons",)+self.bot_place(pl)
        if self.terrell and pl.bare and pl.trust<MAX_TRUST: return ("commons",)+self.bot_place(pl)   # get covered
        # urgent: a district about to capture (or captured — reclaim it)
        hot=sorted([d for d in self.ds if self.pressure[d]>=CAPTURE-1 and self.clarity[d]<WAKE],
                   key=lambda d:-self.pressure[d])
        if hot:
            d=hot[0]
            if pl.role=="Elder" and not pl.elder_used: return ("history",d,None)
            if pl.sight[d]>=1 or style!="never": return self.bot_face(pl,d,style)
            return ("study",d,None)
        # Chapter 3: sign the League pledge — collective action first
        if (self.has_league() and not self.league_formed and pl.name not in self.league
                and max(self.pressure["HOUSING"],self.pressure["LENDING"])>=1):
            return ("league",None,None)
        # final act: get someone to Read 3 in a woken, untraced district
        if self.uw_open:
            open_d=[d for d in self.ds if self.clarity[d]>=WAKE and d not in self.threads]
            if open_d:
                d=max(open_d,key=lambda x:pl.sight[x])
                learner=next((p for p in self.active() if p is not pl and p.sight[d]<pl.sight[d]),None)
                if pl.sight[d]>=2 and learner and (pl.role=="Translator" or pl.trust>=2):
                    return ("teach",learner,d)
                return ("study",d,None)
        # build clarity toward the Underworld
        building=[d for d in self.ds if self.clarity[d]<WAKE]
        if not building: return ("commons",)+self.bot_place(pl)
        tgt=min(building,key=lambda d:(self.clarity[d],-pl.sight[d]))
        if pl.sight[tgt]>=1:
            learner=next((p for p in self.active() if p.sight[tgt]<pl.sight[tgt] and p is not pl),None)
            if learner and (pl.role=="Translator" or (pl.trust>=2 and learner.sight[tgt]==0)):
                return ("teach",learner,tgt)
            if pl.sight[tgt]==1 and pl.role!="Elder" and random.random()<0.35:
                return ("study",tgt,None)        # deepen your lens before facing amber/blue levers
            return self.bot_face(pl,tgt,style)
        if style=="greedy": return self.bot_face(pl,tgt,style)
        return ("study",tgt,None)

    # ================= RUN (headless, for the tester) =================
    def end_of_block_turns(self):
        self.check_patterns()
        if not self.uw_open and not self.party and self.total_clarity()>=UNDERWORLD_AT: self.open_underworld()

    def machine_phase(self, overlord_move=None):
        self.league_round()
        if self.overlord and self.ov():
            m=OVERLORD_MOVES[self.n()]; moves=int(m*self.round)-int(m*(self.round-1))   # carry the remainder
            for _ in range(moves):
                self.do(self.ov(), overlord_move() if overlord_move else self.overlord_ai_move(self.struck))
            self.tighten()
        elif self.grace>0:
            self.grace-=1; self.emit("  (The Machine is distracted — grace round.)")
        else:
            if self.party: self.party_machine_phase()     # no Owner, no Patterns in Block Party
            else: self.auto_machine_phase(); self.tighten()
        self.check_patterns()
        return self.check_end()

    def run_auto(self, max_rounds=None, style="careful"):
        max_rounds=max_rounds or (BP_ROUNDS if self.party else MAX_ROUNDS)   # read at call time so tuning works
        while self.round<max_rounds and not self.won:
            self.round+=1; self.struck=set(); self.covered=False; self.forged=False
            feast=self.cookout_ai()
            if feast: self.cookout()
            for pl in self.players:
                if pl.role=="Overlord": continue
                if pl.flipped: self.fallen_turn(pl, self.actions())
                elif feast: continue
                elif pl.benched: pl.benched=False; self.emit(f"{pl.name} sits this turn out.")
                else:
                    self.start_turn(pl)
                    for _ in range(self.actions()):
                        self.do(pl, self.block_ai(pl, style))
                        if self.won or pl.flipped: break
                if self.won: break
            if self.won: break
            if self.sousou_ai(): self.throw_hand()
            self.end_of_block_turns()
            if self.machine_phase(): break
        if not self.result: self.time_up()
        return self.result

    def money(self):
        """The real money behind the game's decisions, for the end screen: what the block signed,
        what it read its way out of, and what it walked away from."""
        tot=lambda o: sum(x["dollars"] for x in self.signed if x["out"]==o)
        conned=tot("conned")
        taken=[x for x in self.signed if x["out"]=="taken"]
        worst=max(taken,key=lambda x:x["dollars"]) if taken else None    # the first, on a tie
        played={}
        for x in self.signed:
            if x["out"] in ("played","conned"): played[x["who"]]=played.get(x["who"],0)+1
        most=max(played.items(),key=lambda kv:kv[1]) if played else None
        return dict(taken=tot("taken"), played=tot("played")+conned, refused=tot("refused")+tot("wasted"),
                    dodged=tot("dodged"), defused=tot("defused")+tot("partial"), help=tot("help"),
                    shortcuts=len(taken), worst=worst, playedMost=dict(who=most[0],times=most[1]) if most else None)

    def chapter_result(self):
        """What this game writes into the Family Ledger (CAMPAIGN.md)."""
        won=self.result=="BLOCK_WIN"
        awake=[d for d in self.ds if self.clarity[d]>=WAKE]
        captured=[d for d in self.ds if self.pressure[d]>=CAPTURE]
        falls=sum("HAS FALLEN" in l for l in self.log); reaches=sum("pulls them home" in l for l in self.log)
        ledger=(2+len(awake)) if won else (-2-len(captured))
        ledger+=reaches-falls
        redlining=any(n=="REDLINING" for _,n,_ in self.active_patterns())
        unlocks=[]
        if self.chapter:
            unlocks+=self.chapter["unlocks_always"]
            if self.league_formed and won: unlocks+=self.chapter["unlocks_if_league_won"]
        return dict(won=won, ledger=ledger, rebuilt=awake, scarred=captured, falls=falls, reaches=reaches,
                    league=self.league_formed, redlining_broken=not redlining, unlocks=unlocks,
                    rally=not won)                      # the community rallies after a loss

    def time_up(self):
        self.won=True; self.result="MACHINE_WIN"
        self.emit("⏳ The clock ran out. The Machine doesn't need to win — it only needs you to run out of time.")

ROSTER=[("Marcus","Translator"),("Nia","Student"),("Simone","Elder"),("Zay","Veteran"),("Dre","Organizer")]

def new_game(overlord=False, scenario=None, owner=None, verbose=False, seed=None, roster=None, chapter=None, **rules):
    """rules: party, fine_print, terrell, endless, partial, render, carry (see Game)."""
    g=Game(overlord=overlord, scenario=scenario, owner=owner, verbose=verbose, seed=seed, chapter=chapter, **rules)
    g.players=[Player(n,r) for n,r in (roster or ROSTER)]
    if g.scenario=="The Plants Close":
        for p in g.players: p.trust=1
    for p in g.players: p.face=FACE_TOKENS if g.render else 0
    if g.carry and g.carry.get("rally") and not g.overlord and not g.chapter and not g.party:
        for p in g.players: p.trust=min(MAX_TRUST,p.trust+1)
    if overlord: g.players.append(Player("The Owner","Overlord"))
    return g
