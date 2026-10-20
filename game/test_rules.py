#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — rule checks. Each test pins one rule from RULES.md to the engine.
  python3 test_rules.py
"""
import sn_engine as E
import deck_cards as Dk

def game(**kw):
    g=E.new_game(seed=1, scenario=kw.pop("scenario","A Quiet Year"), owner=kw.pop("owner","The Algorithm"), **kw)
    return g, g.players[0]

def card(trap=True, lever=1):
    return dict(front="test", red="r", amber="a", blue="b", trap=trap, lever=lever)

def test_deck_shape():
    for d,cards in Dk.DECK.items():
        honest=4 if d=="HEALTH" else 3                     # + Gem City Market in Health
        assert len(cards)==12+honest, d
        assert sum(not c["trap"] for c in cards)==honest, d
        assert sorted(c["lever"] for c in cards if c["trap"])==[1]*5+[2]*4+[3]*3, d

def test_seeing_is_not_beating():
    g,p=game(); p.sight["LENDING"]=1; p.trust=3; g.pressure["LENDING"]=2
    g.face(p,"LENDING","NEGOTIATE",card(lever=2))
    assert g.pressure["LENDING"]==3 and p.trust==2          # got played: Read 1 < amber lever
    p.sight["LENDING"]=2; g.face(p,"LENDING","NEGOTIATE",card(lever=2))
    assert g.pressure["LENDING"]==2 and g.clarity["LENDING"]==1 and p.trust==1

def test_negotiate_needs_trust():
    g,p=game(); p.sight["HEALTH"]=3; p.trust=0; g.pressure["HEALTH"]=2
    g.face(p,"HEALTH","NEGOTIATE",card(lever=1)); assert g.pressure["HEALTH"]==2

def test_honest_deals():
    g,p=game(); p.trust=2
    g.face(p,"LABOR","TAKE",card(trap=False,lever=0)); assert p.trust==4 and g.clarity["LABOR"]==1 and p.corruption==0
    g.face(p,"LABOR","WALK",card(trap=False,lever=0)); assert p.trust==3

def test_take_is_salvation_or_fast_power():
    g,p=game(); g.pressure["HOUSING"]=2
    g.face(p,"HOUSING","TAKE",card()); assert g.pressure["HOUSING"]==0 and p.corruption==E.TAKE_CORRUPT
    g.face(p,"HOUSING","TAKE",card()); assert g.clarity["HOUSING"]==2
    g.face(p,"HOUSING","TAKE",card()); assert p.flipped                    # 3 shortcuts = Fallen

def test_debt_buyer_bites_from_round_one():
    g,p=game(owner="The Debt Buyer"); assert not g.owner_shown
    g.face(p,"LENDING","TAKE",card()); assert p.corruption==E.TAKE_CORRUPT+1

def test_trust_cap_and_commons():
    g,p=game(); p.trust=4; p.corruption=2; g.commons(p)
    assert p.trust==E.MAX_TRUST and p.corruption==1

def test_church_lifts_more_corruption():
    g,p=game(); p.corruption=4; g.commons(p,"CHURCH"); assert p.corruption==2

def test_barbershop_makes_next_teach_free():
    g,p=game(); t=g.players[1]; p.role="Student"; p.trust=0; p.sight["LABOR"]=2
    g.commons(p,"BARBERSHOP"); trust=p.trust; g.teach(p,t,"LABOR")
    assert p.trust==trust and t.sight["LABOR"]>=1 and not p.free_teach

def test_adventure_central_doubles_next_study():
    g,p=game(); g.commons(p,"ADVENTURE"); g.study(p,"HEALTH"); assert p.sight["HEALTH"]==2
    g.study(p,"HEALTH"); assert p.sight["HEALTH"]==3                     # only the next one

def test_gem_city_market_draws_two():
    g,p=game(); g.commons(p,"MARKET"); assert len(g.deals_for(p,"LENDING"))==2
    assert len(g.deals_for(p,"LENDING"))==1

def test_kitchen_table_once_per_game():
    g,p=game()
    for q in g.players: q.trust=0
    g.commons(p,"KITCHEN"); assert all(q.trust>=2 for q in g.players)
    other=g.players[1]; other.trust=0; g.commons(other,"KITCHEN")         # already used: falls back
    assert g.players[2].trust==2

def test_teach_only_what_you_read_better():
    g,p=game(); t=g.players[1]; p.sight["EDUCATION"]=1; t.sight["EDUCATION"]=1
    g.teach(p,t,"EDUCATION"); assert t.sight["EDUCATION"]==1
    p.sight["EDUCATION"]=3; g.teach(p,t,"EDUCATION"); assert t.sight["EDUCATION"]>=2

def test_machine_spreads():
    g,p=game(); g.round=1
    g.m_extract("M","LABOR"); g.m_extract("M","LABOR"); g.m_obscure("M","LABOR")
    assert g.pressure["LABOR"]==1                                          # one move per district per round

def test_overlord_cannot_snipe_round_one():
    g=E.new_game(overlord=True, seed=2, scenario="The Closure")
    g.round=1; g.struck=set(); g.machine_phase(); assert g.captured()==1   # only the pre-captured school

def test_awake_is_safe_until_the_underworld():
    g,p=game(); g.clarity["HEALTH"]=E.WAKE; g.m_obscure("M","HEALTH"); assert g.clarity["HEALTH"]==E.WAKE
    g.uw_open=True; g.struck=set(); g.m_obscure("M","HEALTH"); assert g.clarity["HEALTH"]==E.WAKE-1   # one cover-up
    g.clarity["LABOR"]=E.WAKE; g.m_obscure("M","LABOR"); assert g.clarity["LABOR"]==E.WAKE

def test_underworld_final_act():
    g,p=game(); g.uw_open=True
    for d in ("LENDING","HOUSING","LABOR"):
        g.clarity[d]=E.WAKE; p.sight[d]=2; g.trace(p,d); assert d not in g.threads   # blue Read required
        p.sight[d]=3; g.trace(p,d)
    assert g.can_expose(); g.expose_uw(p); assert g.result=="BLOCK_WIN"

def test_sousou_pays_a_clean_hand():
    g=E.new_game(seed=1, scenario="A Quiet Year", owner="The Algorithm", roster=E.ROSTER[:4])
    for p in g.players: p.trust=2
    g.pressure["LENDING"]=3
    g.throw_hand(pick=lambda pl:"LENDING")
    assert g.pressure["LENDING"]==1 and g.pot==0 and g.circle==1
    assert all(p.corruption==0 and p.trust==1 for p in g.players)
    assert g.players[0].legend==1                                          # first hand goes to the first seat

def test_sousou_pot_carries_over():
    g=E.new_game(seed=1, scenario="A Quiet Year", owner="The Algorithm", roster=E.ROSTER[:2])
    g.pressure["HEALTH"]=2; g.throw_hand(); assert g.pot==2 and g.pressure["HEALTH"]==2
    g.throw_hand(); assert g.pot==0 and g.pressure["HEALTH"]==0

def test_cookout_shares_the_best_sight():
    g=E.new_game(seed=1, scenario="A Quiet Year", owner="The Algorithm", roster=E.ROSTER[:3])
    a,b,c=g.players; a.sight["HOUSING"]=3; b.corruption=2; c.trust=4
    g.cookout(picks={b.name:"HOUSING",c.name:"HOUSING"})
    assert b.sight["HOUSING"]==3 and c.sight["HOUSING"]==3 and b.corruption==1 and c.trust==E.MAX_TRUST
    assert g.cookout_used

def test_green_book_saves_one_capture():
    g,p=game(); g.round=1; g.pressure["HOUSING"]=2; g.pressure["LABOR"]=2
    g.m_extract("M","HOUSING"); assert g.pressure["HOUSING"]==2 and not g.green_book
    g.m_extract("M","LABOR"); assert g.pressure["LABOR"]==3                # only once per game

def test_green_book_waits_for_a_capture():
    g,p=game(); g.round=1; g.pressure["HEALTH"]=1
    g.m_extract("M","HEALTH"); assert g.pressure["HEALTH"]==2 and g.green_book

def test_call_and_response():
    g,p=game(); t=g.players[2]; p.sight["LABOR"]=2; p.trust=3
    g.teach(p,t,"LABOR"); assert t.legend==1 and p.legend==3
    t2=g.players[3]; g.teach(p,t2,"LABOR",response=False); assert t2.legend==0 and p.legend==5

def test_history_deck_wakes_and_tells():
    assert all(len(Dk.HISTORY[d])>=2 for d in E.DISTRICTS) and Dk.HISTORY["ANY"]
    g,p=game(); p.role="Elder"; g.history(p,"HOUSING")
    assert g.clarity["HOUSING"]==E.WAKE and g.history_card in Dk.HISTORY["HOUSING"]+Dk.HISTORY["ANY"]

def test_dayton_scenarios():
    g=E.new_game(seed=1, scenario="The Plants Close")
    assert g.pressure["LABOR"]==2 and all(p.trust==1 for p in g.players)
    g=E.new_game(seed=1, scenario="The Hospital Closes"); p=g.players[0]
    assert g.pressure["HEALTH"]==2 and g.neg_cost("HEALTH")==2 and g.neg_cost("LABOR")==1
    p.sight["HEALTH"]=3; p.trust=2; g.face(p,"HEALTH","NEGOTIATE",card(lever=1)); assert p.trust==0

def test_chapter_the_map_setup():
    g=E.new_game(seed=1, chapter="THE_MAP")
    assert g.pressure["HOUSING"]==2 and g.pressure["LENDING"]==2
    assert any(n=="REDLINING" for _,n,_ in g.active_patterns())            # active from round 1
    assert g.owner=="The Lobbyist" and g.owner_face=="The Appraiser" and g.scenario.startswith("Chapter 3")
    assert g.draw("HOUSING") in g.deck["HOUSING"] and g.deck["LABOR"] is Dk.DECK["LABOR"]

def test_the_league_forms_and_lowers_the_levers():
    g=E.new_game(seed=1, chapter="THE_MAP", roster=E.ROSTER[:2]); a,b=g.players
    a.trust=b.trust=2; g.sign_league(a); assert not g.league_formed
    g.sign_league(a); assert len(g.league)==1 and a.trust==2               # one signature each; costs an action, not Trust
    g.sign_league(b); assert g.league_formed and g.pressure["HOUSING"]==0
    a.sight["LENDING"]=1; a.trust=2; g.pressure["LENDING"]=2
    g.face(a,"LENDING","NEGOTIATE",card(lever=3)); assert g.pressure["LENDING"]==1   # blue lever beaten at Read 1

def test_league_pledges_fall_apart_if_not_same_round():
    g=E.new_game(seed=1, chapter="THE_MAP", roster=E.ROSTER[:3]); a,b,c=g.players
    a.trust=b.trust=c.trust=2; g.sign_league(a); g.sign_league(b)
    g.league_round(); assert not g.league_formed and not g.league         # scared off at the Machine phase

def test_the_map_compounds_redlining():
    g=E.new_game(seed=1, chapter="THE_MAP"); g.round=2; g.pressure["HOUSING"]=2; g.pressure["LENDING"]=2
    g.tighten(); assert g.pressure["HOUSING"]+g.pressure["LENDING"]==6       # compounds, then tightens
    g=E.new_game(seed=1, chapter="THE_MAP"); g.round=2; g.pressure["HOUSING"]=1
    g.tighten(); assert g.pressure["HOUSING"]==1                           # broken: no compounding
    g=E.new_game(seed=1, chapter="THE_MAP"); g.round=1
    g.tighten(); assert g.pressure["HOUSING"]+g.pressure["LENDING"]==5      # round 1: tightens only once

def test_no_league_outside_the_chapter():
    g,p=game(); p.trust=3; g.sign_league(p); assert not g.league and p.trust==3

def test_chapter_result_writes_the_ledger():
    g=E.new_game(seed=1, chapter="THE_MAP"); g.result="BLOCK_WIN"
    g.clarity["HEALTH"]=E.WAKE; g.league_formed=True
    r=g.chapter_result()
    assert r["won"] and r["ledger"]==3 and r["rebuilt"]==["HEALTH"] and "The Contract Buyers League" in r["unlocks"]
    g.result="MACHINE_WIN"; g.pressure["LABOR"]=3; r=g.chapter_result()
    assert r["ledger"]==-3 and r["rally"] and r["scarred"]==["LABOR"]

# ---- The Long Ledger: the other five chapters, and the family's memory (campaign.py) ----
import campaign as CP, chapters as CH

def test_era_decks_keep_the_base_shape():
    for k,ch in CH.CHAPTERS.items():
        for d,cards in ch["decks"].items():
            traps=[c for c in cards if c["trap"]]
            assert len(cards)==15 and sorted(c["lever"] for c in traps)==[1]*5+[2]*4+[3]*3, (k,d)
            assert all(c.get("dollars") and c.get("basis") for c in cards), (k,d)

def test_freedoms_ledger_nobody_reads_and_the_bank_looks_honest():
    g=E.new_game(seed=1, chapter="FREEDOMS_LEDGER")
    assert all(v==0 for p in g.players for v in p.sight.values()) and g.pressure["LENDING"]==2
    bank=next(c for c in g.deck["LENDING"] if c["front"].startswith("The Freedman's Savings Bank"))
    p=g.players[0]; p.sight["LENDING"]=2
    assert not g.looks(p,"LENDING",bank)["trap"]                       # honest-looking below Read 3
    p.sight["LENDING"]=3; assert g.looks(p,"LENDING",bank)["trap"]

def test_up_north_opens_late_unless_the_family_went_north_early():
    g=E.new_game(seed=1, chapter="UP_NORTH"); assert "HEALTH" not in g.ds and len(g.ds)==3
    g.round=3; g.round_start(); assert g.ds==E.DISTRICTS
    g=E.new_game(seed=1, chapter="UP_NORTH", campaign=dict(decisions={"FREEDOMS_LEDGER":"GO"})); assert g.ds==E.DISTRICTS
    g=E.new_game(seed=1, chapter="UP_NORTH", campaign=dict(decisions={"FREEDOMS_LEDGER":"STAY"})); assert g.pressure["LENDING"]==1

def test_voice_march_and_organizer():
    g=E.new_game(seed=1, chapter="VOICE"); a,b=g.players[:2]
    a.trust=0; b.trust=1; b.corruption=2; g.march(a)
    assert a.trust==2 and b.trust==3 and b.corruption==1 and g.marched
    g.march(b); assert b.trust==3                                       # once per game
    org=next(p for p in g.players if p.role=="Organizer"); org.sight["LABOR"]=3; org.trust=2; g.pressure["LABOR"]=3
    g.face(org,"LABOR","NEGOTIATE",card(lever=1)); assert g.pressure["LABOR"]==0

def test_the_council_redraws_every_woken_district():
    g=E.new_game(seed=1, chapter="VOICE"); g.clarity.update(LABOR=3, HEALTH=3, LENDING=2)
    g.reveal_owner(); assert g.clarity["LABOR"]==2 and g.clarity["HEALTH"]==2 and g.clarity["LENDING"]==2

def test_plants_close_defend_or_let_go():
    st={**CP.new_state("LEDGER"), "stickers":{"HOUSING":{"rebuilt":1,"scarred":0}}}
    g=E.new_game(seed=1, chapter="PLANTS_CLOSE", campaign=st)
    assert g.defend==["HOUSING"] and g.clarity["HOUSING"]==1 and all(p.trust==1 for p in g.players)
    g=E.new_game(seed=1, chapter="PLANTS_CLOSE", campaign=CP.let_go(st,"HOUSING"))
    assert g.defend==[] and g.clarity["HOUSING"]==0

def test_today_ledger_keeper_and_two_histories():
    g=E.new_game(seed=1, chapter="TODAY", campaign={**CP.new_state("LEDGER"),"unlocks":["The Redlining Maps"]})
    el=next(p for p in g.players if p.role=="Elder")
    g.history(el,"HOUSING"); assert g.history_card["title"]=="The Redlining Maps"
    g.history(el,"LABOR"); assert g.clarity["LABOR"]==E.WAKE and el.elder_used
    g.history(el,"HEALTH"); assert g.clarity["HEALTH"]==0              # only twice
    g.round=4; g.clarity["LENDING"]=1; before=sum(g.pressure.values()); g.struck=set(); g.auto_machine_phase()
    assert sum(g.pressure.values())>before                             # the Algorithm's face: an extra strike

def test_stickers_and_rally_carry_in():
    st={**CP.new_state("LEDGER"), "rally":True, "stickers":{"LABOR":{"rebuilt":2,"scarred":0},"HEALTH":{"rebuilt":0,"scarred":2},
                                                           "HOUSING":{"rebuilt":1,"scarred":0}}}
    g=E.new_game(seed=1, chapter="THE_MAP", campaign=st)
    assert g.clarity["LABOR"]==2 and g.pressure["HEALTH"]==2
    assert g.pressure["HOUSING"]==1 and g.clarity["HOUSING"]==0        # Rebuilt resists the era's grip first
    assert all(p.trust==E.START_TRUST+1 for p in g.players)

def test_advance_writes_the_family_record():
    st=CP.new_state("LEDGER")
    r=dict(won=True, ledger=4, rebuilt=["LABOR"], scarred=["HEALTH"], falls=1, reaches=0, unlocks=["X"], rally=False,
           burned=False, quit_desk=None, crown=None)
    st=CP.advance(st,"FREEDOMS_LEDGER",r,"STAY")
    assert st["ledger"]==5 and st["stickers"]=={"LABOR":{"rebuilt":1,"scarred":0},"HEALTH":{"rebuilt":0,"scarred":1}}
    assert st["falls"]==1 and st["decisions"]=={"FREEDOMS_LEDGER":"STAY"} and CP.next_chapter(st)=="UP_NORTH"
    r=dict(r, rebuilt=["HEALTH"], scarred=[], falls=0, ledger=3, unlocks=["X","Y"])
    st=CP.advance(st,"UP_NORTH",r,"SCHOOL")
    assert "HEALTH" not in st["stickers"] and st["falls"]==0 and st["ledger"]==10 and st["unlocks"]==["X","Y"]   # a scar healed; a Fall redeemed (+2)

# ---- Book One ----
def test_the_chain_teaches_one_more():
    g=E.new_game(seed=1, chapter="B1_CHAIN", roster=[("A","Neighbor"),("B","Neighbor"),("C","Neighbor")])
    a,b,c=g.players; assert g.party and g.terrell and g.scenario.startswith("Chapter 1")
    a.sight["LENDING"]=2; a.trust=2; g.teach(a,b,"LENDING")
    assert b.sight["LENDING"]==1 and c.sight["LENDING"]==1 and a.trust==1   # the Chain was free

def test_the_desk():
    g=E.new_game(seed=1, chapter="B1_NET"); p=g.players[0]
    assert g.fine_print and g.terrell
    g.take_desk(p); p.trust=1; g.round=3; g.round_start(); assert p.trust==2
    g.face(p,"LENDING","TAKE",card()); assert p.corruption==0          # can't face at the Desk
    g.leave_desk(p); assert g.desk is None and g.chapter_result()["quit_desk"]==p.name

def test_the_crown():
    g=E.new_game(seed=1, chapter="B1_CROWN"); assert g.overlord and g.ov()
    a,b=g.players[:2]; a.trust=b.trust=2; g.ask_crown=lambda pl: True
    g.offer_crown(a); assert g.crowned==a.name
    g.round_start(); assert a.trust==2 and b.trust==1
    a.corruption=E.FLIP-1; g.face(a,"LENDING","TAKE",card()); assert not a.flipped
    g=E.new_game(seed=1, chapter="B1_CROWN"); g.ask_crown=lambda pl: False; g.offer_crown(g.players[0])
    assert g.crown_refused and g.crowned is None

def test_the_empty_throne():
    g=E.new_game(seed=1, chapter="B1_THRONE", roster=E.ROSTER[:2]); a,b=g.players
    g.uw_open=True; g.threads={"LENDING","HOUSING","LABOR"}
    assert not g.can_expose()                                         # nobody has taught yet
    g.taught={a.name,b.name}; a.legend=5; b.legend=3; assert not g.can_expose()   # a holds more than half
    b.legend=5; assert g.can_expose()

def test_book_one_flags_carry():
    st=CP.new_state("BOOK_ONE")
    r=dict(won=True, ledger=2, rebuilt=[], scarred=[], falls=0, reaches=0, unlocks=[], rally=False, burned=True, quit_desk=None, crown=None)
    st=CP.advance(st,"B1_CHAIN",r); assert st["flags"]==["CIVIC_ARMOR","TERRELL"]
    g=E.new_game(seed=1, chapter="B1_NET", campaign=st); a,b=g.players[:2]; a.sight["LABOR"]=2; a.trust=2
    g.teach(a,b,"LABOR"); assert not b.bare                            # Civic Armor: covered
    st=CP.advance(st,"B1_NET",dict(r,quit_desk="Nia"))
    g=E.new_game(seed=1, chapter="B1_CROWN", campaign=st)
    nia=g.by_name("Nia"); assert all(v>=1 for v in nia.sight.values())
    assert all(p.trust==E.START_TRUST-1 for p in g.blk())               # Terrell: the block starts a Trust down

# ---- Solo ----
def test_solo_teaches_the_neighbors_who_arent_there():
    g=E.new_game(seed=1, roster=[("Marcus","Student")], scenario="A Quiet Year", owner="The Algorithm"); p=g.players[0]
    assert g.solo() and g.actions()==5 and g.threads_needed()==2
    g.teach_neighbor(p,"LENDING"); assert g.clarity["LENDING"]==0           # needs Read 1 there
    p.sight["LENDING"]=1; p.trust=1; g.teach_neighbor(p,"LENDING")
    assert g.clarity["LENDING"]==1 and p.trust==0 and p.legend==2
    g.teach_neighbor(p,"LENDING"); assert g.clarity["LENDING"]==1          # no Trust left
    g2,q=game(); q.sight["LENDING"]=2; g2.teach_neighbor(q,"LENDING"); assert g2.clarity["LENDING"]==0   # not with a table

def test_solo_league_and_throne():
    g=E.new_game(seed=1, chapter="THE_MAP", roster=[("Dre","Organizer")]); g.sign_league(g.players[0]); assert g.league_formed
    g=E.new_game(seed=1, chapter="B1_THRONE", roster=[("Nia","Student")]); g.uw_open=True; g.threads={"LENDING","HOUSING"}
    assert not g.can_expose(); g.taught={"Nia"}; g.players[0].legend=9; assert g.can_expose()

def test_clock_is_a_loss():
    g=E.new_game(seed=3); g.run_auto(max_rounds=1)
    assert g.result in ("MACHINE_WIN","BLOCK_WIN")

def test_strikes_carry_the_remainder():
    g=E.new_game(seed=1, roster=E.ROSTER[:2])                      # 2 players: 1.5 a round
    seq=[]
    for r in range(1,5): g.round=r; seq.append(g.strikes())
    assert seq==[1,2,1,2]
    for k,expect in ((3,3),(4,1)):
        g=E.new_game(seed=1, roster=E.ROSTER[:k]); g.round=1; assert g.strikes()==expect

def test_block_party_setup():
    g=E.new_game(seed=1, roster=[("A","Neighbor"),("B","Neighbor")], party=True)
    assert g.ds==list(E.BP_DISTRICTS) and g.owner=="No Owner" and g.scenario=="Block Party"
    assert not g.green_book and g.max_rounds==8 and g.actions()==2
    g.round=1; assert g.strikes()==0                                # 2 players: 0,1,1,1,…
    g.round=2; assert g.strikes()==1

def test_block_party_win_and_sit_out():
    g=E.new_game(seed=1, roster=[("A","Neighbor"),("B","Neighbor")], party=True); p=g.players[0]
    g.clarity["LENDING"]=3; g.clarity["HOUSING"]=2
    g.do(p,("face","HOUSING","TAKE",card(trap=False,lever=0)))
    assert g.result=="BLOCK_WIN"                                     # 2 of 3 awake wins on the spot
    g=E.new_game(seed=1, roster=[("A","Neighbor"),("B","Neighbor")], party=True); p=g.players[0]
    g.face(p,"HOUSING","TAKE",card()); assert p.corruption==2 and g.clarity["HOUSING"]==1   # the smaller shortcut
    g.face(p,"HOUSING","TAKE",card()); assert p.corruption==0 and p.benched and not p.flipped

def test_block_party_machine_strikes_and_muddies():
    g=E.new_game(seed=1, roster=[("A","Neighbor")]*4, party=True); g.round=1
    g.clarity["EDUCATION"]=2
    g.party_machine_phase()                                          # 4 players: 3 strikes, repeats allowed
    assert g.pressure["EDUCATION"]>=1 and sum(g.pressure.values())==3

def test_fine_print_die_sets_the_lever():
    g,p=game(fine_print=True)
    for _ in range(30):
        c=g.draw("LENDING")
        if c["trap"]: assert c["lever"]==E.FINE_PRINT_DIE[c["die"]]
        else: assert "die" not in c

def test_terrell_rule():
    g,t=game(terrell=True); teacher=g.players[1]
    teacher.sight["HOUSING"]=2; teacher.trust=3; t.trust=3; t.role="Neighbor"
    g.teach(teacher,t,"HOUSING"); assert "HOUSING" in t.bare
    g.face(t,"HOUSING","WALK",card()); assert g.pressure["HOUSING"]==0 and "HOUSING" in t.bare   # walking is safe
    g.face(t,"HOUSING","NEGOTIATE",card(lever=1))
    assert g.pressure["HOUSING"]==1 and "HOUSING" not in t.bare     # defused, then backfired: +1
    g.teach(teacher,t,"HOUSING"); g.commons(t); assert not t.bare   # the block covers you
    vet=next(p for p in g.players if p.role=="Veteran"); vet.sight["LABOR"]=2; vet.trust=3
    g.teach(vet,t,"LABOR"); assert "LABOR" not in t.bare            # the Veteran teaches the cover

def test_endless_deals():
    g,p=game(endless=True)
    c=g.draw("HOUSING"); assert c["gen"] and c["answer"]>0 and "{" not in c["red"]+c["ask"]
    assert c is g.dealt[-1]

def test_money_counts_every_decision():
    g,p=game(); p.sight["LENDING"]=3; p.trust=5
    usd=lambda trap,lever,dollars: dict(card(trap,lever), dollars=dollars, basis="b")
    g.face(p,"LENDING","TAKE",usd(True,1,500))           # a shortcut: signed
    g.face(p,"LENDING","TAKE",usd(True,1,900))           # the most expensive one
    g.face(p,"LENDING","NEGOTIATE",usd(True,1,300))      # defused
    g.face(p,"LENDING","WALK",usd(True,1,200))           # dodged
    g.face(p,"LENDING","WALK",usd(False,0,1000))         # walked away from real help
    g.face(p,"LENDING","TAKE",usd(False,0,40))           # real help taken
    p.sight["LENDING"]=0; g.face(p,"LENDING","NEGOTIATE",usd(True,2,70))   # played
    m=g.money()
    assert (m["taken"],m["defused"],m["dodged"],m["refused"],m["help"],m["played"])==(1400,300,200,1000,40,70)
    assert m["worst"]["dollars"]==900 and m["shortcuts"]==2 and m["playedMost"]=={"who":p.name,"times":1}
    assert all(c["dollars"]>=0 and c["basis"] for v in Dk.DECK.values() for c in v)

def test_counterfeits():
    g=E.new_game(seed=1, overlord=True, roster=E.ROSTER[:3]); ov=g.ov(); p=g.players[0]
    g.round=2; g.m_counterfeit(ov.name,"HOUSING")
    assert "HOUSING" in g.counterfeits and g.forgeries==E.COUNTERFEIT_HAND-1 and "HOUSING" not in g.struck
    assert not any("HOUSING" in l for l in g.log[-1:])                     # the block isn't told where
    g.m_counterfeit(ov.name,"LABOR"); assert "LABOR" not in g.counterfeits  # one a round
    c=g.draw("HOUSING"); assert c["counterfeit"] and not g.counterfeits
    p.sight["HOUSING"]=2; assert g.looks(p,"HOUSING",c)["trap"] is False   # below Read 3 it looks honest
    assert g.bot_choice(p,"HOUSING",c)=="TAKE"                              # and the bots fall for it
    t=p.trust; g.face(p,"HOUSING","TAKE",c)
    assert g.pressure["HOUSING"]==1 and p.trust==t-E.CON_TRUST and p.corruption==0   # conned: no Shady
    p.sight["HOUSING"]=3; p.trust=3; g.pressure["HOUSING"]=2; legend=p.legend
    g.face(p,"HOUSING","NEGOTIATE",dict(E.D.COUNTERFEITS["HOUSING"]))
    assert g.pressure["HOUSING"]==1 and p.legend==legend+3                  # exposed: defused, +1 Props
    assert g.money()["played"]>0
    g.forged=False; g.forgeries=0; g.m_counterfeit(ov.name,"LABOR"); assert not g.counterfeits   # hand empty

def test_close_reads():
    import random
    hits=played=0
    for seed in range(40):
        g=E.new_game(seed=seed, scenario="A Quiet Year", roster=E.ROSTER[:2], partial=True); p=g.players[0]
        p.sight["LABOR"]=1; p.trust=3; g.pressure["LABOR"]=2
        g.face(p,"LABOR","NEGOTIATE",card(True,2))           # one layer short of an amber lever: a roll
        if g.pressure["LABOR"]==1: hits+=1; assert "talked them down" in g.log[-1]
        else: played+=1; assert g.pressure["LABOR"]==3
    assert hits and played                                     # both happen
    g=E.new_game(seed=1, scenario="A Quiet Year", roster=E.ROSTER[:2], partial=True); p=g.players[0]
    p.sight["LABOR"]=1; p.trust=3; g.pressure["LABOR"]=1
    g.face(p,"LABOR","NEGOTIATE",card(True,3)); assert g.pressure["LABOR"]==2   # two layers short: no roll

def test_render():
    g=E.new_game(seed=1, scenario="A Quiet Year", roster=E.ROSTER[:3], render=True); a,b=g.players[0],g.players[1]
    assert a.face==E.FACE_TOKENS
    b.sight["HOUSING"]=2; a.trust=3; g.pressure["HOUSING"]=2
    g.face(a,"HOUSING","NEGOTIATE",card(True,2),b)          # b reads it for a: Read 2 beats the amber lever
    assert g.pressure["HOUSING"]==1 and a.face==0 and any("Render?" in l for l in g.log)
    g.face(a,"HOUSING","NEGOTIATE",card(True,2),b)          # no Face left: a reads it alone, and gets played
    assert g.pressure["HOUSING"]==2
    g.cookout(); assert a.face==E.FACE_TOKENS                 # the Cookout gives Face back
    off=E.new_game(seed=1, scenario="A Quiet Year", roster=E.ROSTER[:2]); assert off.players[0].face==0

def test_block_remembers():
    c={"clarity":{"HOUSING":1},"pressure":{"LABOR":1},"rally":True}
    g=E.new_game(seed=1, scenario="A Quiet Year", roster=E.ROSTER[:2], carry=c)
    assert g.clarity["HOUSING"]==1 and g.pressure["LABOR"]==1 and all(p.trust==E.START_TRUST+1 for p in g.players)
    assert "remembers" in g.log[0]
    p=E.new_game(seed=1, roster=[("A","Neighbor"),("B","Neighbor")], party=True, carry=c)
    assert p.clarity["HOUSING"]==0 and p.players[0].trust==E.START_TRUST     # Block Party starts fresh

if __name__=="__main__":
    tests=[(n,f) for n,f in sorted(globals().items()) if n.startswith("test_")]
    for n,f in tests: f(); print(f"  ✓ {n[5:].replace('_',' ')}")
    print(f"{len(tests)} rule checks passed.")
