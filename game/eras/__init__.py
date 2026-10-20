# -*- coding: utf-8 -*-
"""
Era decks for the campaign chapters (CAMPAIGN.md, The Long Ledger). One module per chapter; each
exports DECKS = {district: [15 cards]} built with the helpers below, and check() keeps them to the
base game's shape so balance stays comparable: 12 traps (levers 5 red / 4 amber / 3 blue) + 3 honest,
every card with its real money (era dollars) and the basis for that figure.

Every era card is on COMMUNITY.md's verify-before-printing list: a historian reads it before print.
"""
import deck_cards as D

def base(district, front_starts):
    """Pull base-game cards that fit the era, by the start of their front text."""
    out=[]
    for start in front_starts:
        c=next(c for c in D.DECK[district] if c["front"].startswith(start))
        out.append(dict(c))
    return out

def deal(front, red, amber, blue, lever, dollars, basis, rush=False, disguised=False):
    """A trap. disguised: it looks honest through the red and amber layers; only Read 3 (blue) sees it
    (played with the counterfeit rule: below Read 3 it reads as honest help)."""
    c=dict(front=front, red=red, amber=amber, blue=blue, trap=True, lever=lever, dollars=dollars, basis=basis)
    if rush: c["rush"]=True
    if disguised: c["counterfeit"]=True; c["lever"]=3
    return c

def honest(front, red, amber, blue, dollars, basis):
    return dict(front=front, red=red, amber=amber, blue=blue, trap=False, lever=0, dollars=dollars, basis=basis)

def check(decks, era_label):
    """The shape every era deck keeps. era_label goes on the basis, e.g. '1870s dollars'."""
    for d,cards in decks.items():
        assert d in D.DECK, d
        traps=[c for c in cards if c["trap"]]; good=[c for c in cards if not c["trap"]]
        assert len(cards)==15 and len(good)==3, (d,len(cards),len(good))
        levers=sorted(c["lever"] for c in traps)
        assert levers==[1]*5+[2]*4+[3]*3, (d,levers)
        fronts=[c["front"] for c in cards]; assert len(set(fronts))==15, d
        for c in cards:
            for k in ("front","red","amber","blue"): assert isinstance(c[k],str) and c[k].strip(), (d,k,c["front"])
            assert isinstance(c.get("dollars"),int) and c["dollars"]>0, (d,c["front"])
            assert c.get("basis"), (d,c["front"])
            if not c["basis"].endswith(f"({era_label})"): c["basis"]=f"{c['basis']} ({era_label})"
    return decks
