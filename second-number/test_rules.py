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
        assert len(cards)==15, d
        assert sum(not c["trap"] for c in cards)==3, d
        assert sorted(c["lever"] for c in cards if c["trap"])==[1]*5+[2]*4+[3]*3, d

def test_seeing_is_not_beating():
    g,p=game(); p.sight["LENDING"]=1; p.trust=3; g.pressure["LENDING"]=2
    g.face(p,"LENDING","NEGOTIATE",card(lever=2))
    assert g.pressure["LENDING"]==3 and p.trust==2          # got played: Sight 1 < amber lever
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
        g.clarity[d]=E.WAKE; p.sight[d]=2; g.trace(p,d); assert d not in g.threads   # blue Sight required
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

def test_clock_is_a_loss():
    g=E.new_game(seed=3); g.run_auto(max_rounds=1)
    assert g.result in ("MACHINE_WIN","BLOCK_WIN")

if __name__=="__main__":
    tests=[(n,f) for n,f in sorted(globals().items()) if n.startswith("test_")]
    for n,f in tests: f(); print(f"  ✓ {n[5:].replace('_',' ')}")
    print(f"{len(tests)} rule checks passed.")
