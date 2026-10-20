# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — campaign chapters (The Long Ledger). See CAMPAIGN.md.

Chapter 3, The Map, is the prototype. Housing and Lending use era decks with the
same shape as the base game (12 traps at levers 5 red / 4 amber / 3 blue, plus
3 honest deals) so balance stays comparable. Labor, Health and Education still
use the base deck for now; era-filtering them is on the build list.

Every card here is on COMMUNITY.md's verify-before-printing list.
"""
import deck_cards as D

def _base(district, front_starts):
    """Pull base-game cards that fit the era, by the start of their front text."""
    out=[]
    for start in front_starts:
        c=next(c for c in D.DECK[district] if c["front"].startswith(start))
        out.append(dict(c))
    return out

def _deal(front, red, amber, blue, lever):
    return dict(front=front, red=red, amber=amber, blue=blue, trap=True, lever=lever)

def _honest(front, red, amber, blue):
    return dict(front=front, red=red, amber=amber, blue=blue, trap=False, lever=0)

THE_MAP_HOUSING = _base("HOUSING", ["Rent-to-Own", "Own Your Home", "Just first month", "All utilities", "Standard lease"]) + [
 _deal("A house on the next street, and they're finally selling to us!",
       "Bought cheap from panicked sellers, then marked up by half or more for you.",
       "Sold on contract: you won't hold the deed until the very last payment.",
       "The same speculator scared the sellers into selling and now sells to you. That's blockbusting.", 3),
 _deal("Fire insurance: our special policy for your area.",
       "It costs far more than the same policy across the line, when they'll write one at all.",
       "One claim and the policy is cancelled at renewal.",
       "Insurers drew the same red lines the lenders did.", 2),
 _deal("A room in a converted house: cheap, and close to the plant.",
       "Per square foot, the rent is higher than the big houses across town.",
       "The rent climbs as more families are packed into the building.",
       "An absentee owner splits big houses into many units; the more crowded, the more profit.", 1),
 _deal("Urban renewal: the city will buy your home. Progress is coming!",
       "The payout is far below what it costs to buy anywhere you're allowed to live.",
       "Refuse, and eminent domain takes the house anyway, on their schedule.",
       "The highways and the 'renewal' land went where the red lines were drawn.", 2),
 _deal("A nice house across town. The realtor says you'd love it there.",
       "The deed carries a covenant: no Black owners.",
       "Since Shelley v. Kraemer (1948) courts can't enforce it, but the realtor won't tell you that.",
       "Developers, realtors and lenders wrote those covenants in together.", 2),
 _deal("Home repair: we'll fix your roof today. Just sign here.",
       "The 'repair loan' is secured by your house, at a crushing rate.",
       "Miss payments and the lender can take the house over a roof.",
       "The contractor and the lender split the loan.", 1),
 _deal("The bank's appraiser: sorry, this block appraises low.",
       "Your home is valued below what it would fetch across the line.",
       "The low appraisal blocks the refinance you needed this year.",
       "For decades the appraisal manuals graded Black neighborhoods down by rule.", 3),
]
THE_MAP_HOUSING += [
 _honest("A GI Bill home loan, and this veteran actually got one.",
         "A guaranteed mortgage at a fair rate, with a small down payment.",
         "Fixed payments and a clear schedule. Many Black veterans were denied; this one wasn't.",
         "A public benefit, earned in service."),
 _honest("File a fair-housing complaint about the realtor who steered you away.",
         "Free to file, and steering is against the law since the Fair Housing Act (1968).",
         "There's a deadline, so write down names and dates now.",
         "The law is on your side, and so is the agency that enforces it."),
 _honest("The church's building fund helps a family make a fair down payment.",
         "No interest; the congregation pools money so you can buy with a real deed.",
         "Pay it back on a schedule the trustees agree with you, in the open.",
         "The block financing the block."),
]

THE_MAP_LENDING = _base("LENDING", ["Pawn", "Check Cashing", "Debt Consolidation"]) + [
 _deal("The small-loan company: easy terms for working people.",
       "Around 3% a month in interest: more than a third of the loan every year.",
       "Late fees stack on top, and the loan renews before it's paid down.",
       "Small-loan laws set the ceiling high, and the lenders helped write them.", 1),
 _deal("The downtown bank: open a savings account with us!",
       "They'll hold your savings, but they won't lend a dollar on your street.",
       "Your deposits fund mortgages across the line, year after year.",
       "The red line on the federal map decides who gets to borrow.", 3),
 _deal("Furniture on time: a little each week.",
       "The weekly price adds up to double the sticker or more.",
       "Miss a week and they come for the whole set, paid-off pieces included.",
       "The store makes more on the credit than on the furniture.", 1),
 _deal("A burial policy from the insurance man: just a dime a week.",
       "You pay in for years; most policies like this lapse with nothing paid out.",
       "Miss a few weeks and the policy lapses. Everything you paid stays with them.",
       "Lapsed policies are the company's profit.", 2),
 _deal("Borrow against your next paychecks: sign the wage assignment.",
       "The lender takes your pay straight from your employer.",
       "One late payment and your boss gets the notice, and may let you go.",
       "Lenders and employers both profit from the hold it gives them over workers.", 2),
 _deal("Easy credit at the clothing store: no money down!",
       "Prices are marked up for credit customers, then interest goes on top.",
       "The balance never seems to shrink before the next purchase.",
       "The store sells the debt to a collector.", 1),
 _deal("Refinance your contract: a lower payment now!",
       "Lower payment, longer term: more interest, and the balloon is still at the end.",
       "Signing resets the clock on everything you've paid in.",
       "The seller gets paid again, and you still don't hold the deed.", 3),
 _deal("Sell your next paycheck at a discount: cash today.",
       "You hand over a full week's pay for most of it now. The discount is the interest.",
       "Every payday it's due again, and it never stops.",
       "Salary buyers worked the plant gates every payday.", 1),
 _deal("Co-sign for your cousin's car. It's family.",
       "You owe every dollar if they can't pay.",
       "Their missed payment shows up on your name the same month.",
       "Lenders count on family ties to collect.", 2),
]
THE_MAP_LENDING += [
 _honest("A Black-owned savings and loan: a fair mortgage, on your street.",
         "A fair rate. They lend where the downtown banks won't.",
         "Clear terms, and you hold the deed from day one.",
         "Owned by the community it lends to."),
 _honest("The credit union at the plant: a small loan at a fair rate.",
         "A capped rate, and members vote on how it's run.",
         "Payments come out of pay you agreed to, and stop when it's paid.",
         "Member-owned: the profit comes back to the workers."),
 _honest("The mutual-aid society: a loan from the club when you need it.",
         "No interest: the members pooled it for exactly this.",
         "Pay it back as you can; the club knows your name.",
         "Neighbors covering neighbors, the way the block always has."),
]

# the real money behind each era card, in 1950s dollars (see deck_cards.DOLLARS)
ERA_DOLLARS = {
 "HOUSING": [
  (300, "weekly payments adding up to two or three times the price"),
  (4000, "years of payments on a contract house, lost with one late payment"),
  (150, "a deposit kept for invented charges"),
  (100, "a flat utility charge above real usage, for a year"),
  (100, "fees added to one late rent"),
  (3000, "a house marked up by half after panic selling"),
  (200, "a year of an overpriced 'special' policy"),
  (400, "a year of rent above what bigger houses cost across town"),
  (3000, "a buyout below what any allowed house costs"),
  (500, "a deposit lost on a house the covenant won't let you keep"),
  (1500, "a repair loan secured by the house, at a crushing rate"),
  (2500, "the value a low appraisal takes off your home"),
  (3000, "a fair mortgage with a small down payment"),
  (1000, "a home you're no longer steered away from"),
  (800, "a down payment with no interest"),
 ],
 "LENDING": [
  (50, "high interest on a pawn, or the item gone"),
  (100, "a fee on every check, for a year"),
  (400, "more interest over a longer term"),
  (300, "3% a month on a small loan, for a year"),
  (200, "savings that fund loans everywhere but your street"),
  (200, "weekly furniture payments that double the price"),
  (150, "years of dimes on a policy that lapses"),
  (300, "pay taken straight from your employer"),
  (100, "credit markups plus interest"),
  (600, "more interest, and the balloon still at the end"),
  (50, "a week's pay sold at a discount"),
  (1500, "every dollar of a car loan you cosigned"),
  (2000, "a fair mortgage on your own street"),
  (150, "a small loan at a capped rate"),
  (100, "a loan from the club, with no interest"),
 ],
}
# the era's own "sign now" pitches (base cards keep their deck_cards.RUSH mark)
for _c in THE_MAP_HOUSING+THE_MAP_LENDING:
    if _c["front"].startswith(("Home repair: we'll fix your roof today","Sell your next paycheck","Refinance your contract")): _c["rush"]=True
for _d,_deck in (("HOUSING",THE_MAP_HOUSING),("LENDING",THE_MAP_LENDING)):
    assert len(ERA_DOLLARS[_d])==len(_deck), _d
    for _c,(_usd,_why) in zip(_deck,ERA_DOLLARS[_d]):
        _c["dollars"]=_usd; _c["basis"]=_why+" (1950s dollars)"

CHAPTERS = {
 "THE_MAP": dict(
    number=3, title="The Map", era="1930s–1960s",
    intro=("The federal maps shade the West Side red. The banks won't lend here, the insurers won't write here, "
           "and the only way to buy a house is on contract. Families start reading their contracts together."),
    pressure={"HOUSING":2, "LENDING":2},          # REDLINING is active from round 1
    twist=("REDLINING is active from round 1, and from round 2, while it stays active, the map compounds: it tightens a second "
           "time every round (+1 Squeeze on the weaker of Housing and Lending). Break it, or it breaks you."),
    owner="The Lobbyist", face="The Appraiser",
    face_text=("The Appraiser: leans on your strongest unfinished district every round (+1 Squeeze); "
               "on reveal, knocks one woken district back to Clarity 1."),
    decks={"HOUSING":THE_MAP_HOUSING, "LENDING":THE_MAP_LENDING},
    league=dict(name="The League",
                text=("Like the Contract Buyers League (Chicago, 1968): sign the pledge to withhold together "
                      "(an action). Every family must sign in the same round, or the sellers scare them off "
                      "and the pledges fall apart. Once it forms: Housing Squeeze −2 at once, Housing −1 every second round "
                      "after, and every Housing and Lending trap can be negotiated with Read 1.")),
    unlocks_always=["The Redlining Maps"],
    unlocks_if_league_won=["The Contract Buyers League"],
    decision=dict(text="Stay and fight for the house, or move to where the map says you can?",
                  options=[dict(key="STAY", label="Stay and fight",
                                text="Housing keeps its stickers, and the family's Ledger +1: they held the line."),
                           dict(key="MOVE", label="Move",
                                text="Remove one Scar from Housing, but the Elder stays behind: in Chapter 4 the Elder starts with no Read and no History.")]),
    campaign="LEDGER", era_dollars="1950s dollars",
 ),
}

# ---------------------------------------------------------------------------------------------------
# The rest of The Long Ledger (CAMPAIGN.md). Each chapter: one setup change and one twist, an era deck
# for two districts (game/eras/), an Owner wearing the era's face, the History it unlocks, and the
# Family Decision that changes the next chapter. A chapter plays on its own, or in order as a family
# (campaign.py carries the Ledger, the stickers, the decisions and the unlocks between them).
# ---------------------------------------------------------------------------------------------------
from eras import ch1 as _ch1, ch2 as _ch2, ch4 as _ch4, ch5 as _ch5

CHAPTERS["FREEDOMS_LEDGER"]=dict(
    number=1, title="Freedom's Ledger", era="1865–1877",
    intro=("The family is newly free. They save what they can, learn to read by lamplight, raise a church and a school, "
           "and sign the only contracts on offer: the crop lien, the store's book, the year-long labor contract."),
    pressure={"LENDING":2},
    twist=("Nobody starts with Read, not even the Elder: the family learns everything at the table. "
           "And the crop lien grips from the first day: Lending starts at Squeeze 2."),
    no_read=True,
    owner="The Debt Buyer", face="The Planter's Ledger",
    face_text=("The Planter's Ledger: every shortcut costs +1 extra Shady, and each round the store calls in its book: "
               "anyone carrying Shady loses 1 Trust. The Fallen strike twice as hard."),
    decks=_ch1.DECKS,
    unlocks_always=["The Freedman's Savings Bank"],
    unlocks_if_won=["Wilberforce University"],
    decision=dict(text="Go north now, or stay one more season and save?",
                  options=[dict(key="GO", label="Go north now",
                                text="Chapter 2 starts with all five districts open from round 1."),
                           dict(key="STAY", label="Stay and save",
                                text="The family's Ledger +1, but Chapter 2 starts with Lending at Squeeze 1 (the debt follows you).")]),
    campaign="LEDGER", era_dollars="1870s dollars",
)
CHAPTERS["UP_NORTH"]=dict(
    number=2, title="Up North", era="1910s–1940s",
    intro=("The family steps off the train on Dayton's West Side with a labor agent's ticket and a room they haven't seen. "
           "The plants are hiring. The fine print came north too."),
    pressure={},
    twist=("Only Lending, Housing and Labor are open at first. Health and Education open in round 3, "
           "once the family is settled."),
    late={"HEALTH":3, "EDUCATION":3},
    owner="The Lobbyist", face="The Labor Agent",
    face_text=("The Labor Agent: every round it leans on your strongest unfinished district (+1 Squeeze); "
               "on reveal, knocks one woken district back to Clarity 1."),
    decks=_ch2.DECKS,
    unlocks_always=["Dunbar, the Wrights and the Dayton Tattler"],
    unlocks_if_won=["Maggie L. Walker's Penny Savings Bank"],
    decision=dict(text="The family has a little saved. Put it into the church, the house, or a child's schooling?",
                  options=[dict(key="CHURCH", label="The church",
                                text="In Chapter 3, gathering at the church takes off 3 Shady instead of 2."),
                           dict(key="HOUSE", label="The house",
                                text="In Chapter 3, Housing starts with 1 less Squeeze: a house the family owns outright."),
                           dict(key="SCHOOL", label="A child's schooling",
                                text="In Chapter 3, the Student starts with Read 1 everywhere.")]),
    campaign="LEDGER", era_dollars="1920s dollars",
)
CHAPTERS["VOICE"]=dict(
    number=4, title="Voice", era="1955–1970",
    intro=("Boycotts in Montgomery, a strike in Memphis, and on the West Side the family is registering voters. "
           "In 1970 Dayton elects James H. McGee mayor. Somebody keeps offering the organizers a quieter way."),
    pressure={},
    twist=("The Organizer's NEGOTIATE clears 3 Squeeze. Once per game, any player can call the March (an action): "
           "every player gathers at once (Trust +2, Shady −1, covered)."),
    march=True, organizer_clears=3,
    owner="The Lobbyist", face="The Council",
    face_text=("The Council: leans on your strongest unfinished district every round (+1 Squeeze); "
               "on reveal, it redraws the lines: every woken district loses 1 Clarity."),
    reveal="all",
    decks=_ch4.DECKS,
    unlocks_always=["The Montgomery Bus Boycott", "I AM A MAN"],
    unlocks_if_won=["Mayor James H. McGee"],
    decision=dict(text="Run for office, or keep organizing?",
                  options=[dict(key="RUN", label="Run for office",
                                text="In Chapter 5, the Owner's hidden hand rests for the first 3 rounds."),
                           dict(key="ORGANIZE", label="Keep organizing",
                                text="In Chapter 5, the Organizer starts with 5 Trust.")]),
    campaign="LEDGER", era_dollars="1960s dollars",
)
CHAPTERS["PLANTS_CLOSE"]=dict(
    number=5, title="The Plants Close", era="1990s–2009",
    intro=("GM's Moraine plant closes in 2008; NCR leaves in 2009. Before the crash, the brokers came door to door "
           "with teaser rates and cash-out refinances. Now the temp agency is the only one hiring."),
    pressure={"LABOR":2}, start_trust=1,
    twist=("Labor starts at Squeeze 2 and everyone starts with 1 Trust. Before the chapter the family chooses: "
           "defend what you built (the Machine strikes your Rebuilt districts first) or let one go (remove one Rebuilt sticker)."),
    defend_choice=True,
    owner="The Algorithm", face="The Algorithm",
    face_text="The Algorithm: scoring, automation and risk models. Relentless: the Machine strikes one extra time every round.",
    decks=_ch5.DECKS,
    unlocks_always=["The People's Free Medical Clinics"],
    unlocks_if_won=["Greenwood: Black Wall Street"],
    decision=dict(text="Sell the house at the bottom of the market, or hold on?",
                  options=[dict(key="SELL", label="Sell",
                                text="In Chapter 6, everyone starts with +2 Trust, but Housing loses a Rebuilt sticker."),
                           dict(key="HOLD", label="Hold on",
                                text="Housing keeps everything, and starts Chapter 6 with 1 more Squeeze.")]),
    campaign="LEDGER", era_dollars="2000s dollars",
)
CHAPTERS["TODAY"]=dict(
    number=6, title="Today", era="2018–",
    intro=("Good Samaritan Hospital has closed. Gem City Market has opened. The family is still here, "
           "and the trap is still here, wearing new clothes."),
    pressure={},
    twist=("Every History card the family unlocked is in play, and the Elder may teach History twice."),
    history_twice=True,
    owner="The Ledger Keeper", face="The Ledger Keeper",
    face_text=("The Ledger Keeper: one hand behind every era. Its hidden hand changes face each round: the store's book "
               "(collections), the labor agent (Read −1), the appraiser (+1 Squeeze on your strongest work), the algorithm "
               "(an extra strike). It wore The Planter's Ledger, the Labor Agent, the Appraiser, the Council and the Algorithm."),
    decks={},
    unlocks_always=[],
    unlocks_if_won=[],
    decision=None,
    campaign="LEDGER", era_dollars=None,
)

# ---------------------------------------------------------------------------------------------------
# Book One (BOOK_ONE.md): four chapters that follow the novel. The Terrell rule is on in chapters 1, 2 and 4
# (in 3 the stranger's handwriting takes its place): seeing it isn't being safe to confront it. Flags carry between chapters.
# ---------------------------------------------------------------------------------------------------
CHAPTERS["B1_CHAIN"]=dict(
    number=1, title="The Chain", era="Graduation night",
    intro=("Marcus can see the second number on everything now, and he teaches it as fast as he can: "
           "to Nia, who teaches the next one, who teaches the next."),
    mode="party", rules=dict(terrell=True), pressure={},
    twist=("A Block Party with the Terrell rule. The Chain: when a learner says the second number back, they at once "
           "teach one more player in that district, for free."),
    chain=True,
    owner="No Owner", face="No Owner", face_text="",
    decks={}, unlocks_always=[], unlocks_if_won=[], decision=None,
    after=("If anyone was burned by the Terrell rule, the ledger reads Terrell. If you won, the block learns Civic Armor: "
           "from Chapter 2 on, every Teach comes with cover."),
    campaign="BOOK_ONE",
)
CHAPTERS["B1_NET"]=dict(
    number=2, title="The Net", era="A county job",
    intro=("A county job, a desk, a program that sounds like help. The terms keep changing on you."),
    mode="coop", rules=dict(terrell=True, fine_print=True), pressure={},
    twist=("Full Block with fine-print dice. The Desk: at the start of round 2 one player may take the Desk. "
           "At the Desk they gain +1 Trust every round but can't face deals or teach, and every second round its paperwork "
           "feeds the Machine an extra strike. Leaving it, for good, takes an action."),
    desk=True,
    owner="The Algorithm", face="The Net",
    face_text=("The Net: the program that sounds like help. Relentless: the Machine strikes one extra time every round."),
    decks={}, unlocks_always=[], unlocks_if_won=[], decision=None,
    after="If the player at the Desk left it, the ledger reads Quit the desk: in Chapter 3 that player starts with Read 1 everywhere.",
    campaign="BOOK_ONE",
)
CHAPTERS["B1_CROWN"]=dict(
    number=3, title="The Crown", era="A way up",
    intro=("Somebody offers Dre a way up out of the life, and it looks just like a blessing."),
    mode="overlord", rules={}, pressure={},
    twist=("Overlord mode, with the stranger's handwriting in place of the Terrell rule. The Crown: once per game the Overlord may offer the Crown to one player. A crowned player "
           "can't Fall, but every other block player loses 1 Trust at the start of each round. Refuse it, and the "
           "Overlord takes one extra move that round."),
    crown=True,
    owner="The Overlord", face="The Overlord", face_text="",
    decks={}, unlocks_always=[], unlocks_if_won=[], decision=None,
    after="The ledger records whether anyone wore the Crown.",
    campaign="BOOK_ONE",
)
CHAPTERS["B1_THRONE"]=dict(
    number=4, title="The Empty Throne", era="No neck for a crown",
    intro=("No card table to shut down. No leader to arrest. The only way to win is for everybody to read."),
    mode="coop", rules=dict(terrell=True, endless=True), pressure={},
    twist=("Full Block with endless deals. No neck for a crown: you can't Expose the Owner until every player has "
           "taught at least once, and while any one player holds more than half the table's Props."),
    throne=True,
    owner="The Algorithm", face="The Empty Throne",
    face_text=("The Empty Throne: no face at all, just the system. Relentless: the Machine strikes one extra time every round."),
    decks={}, unlocks_always=[], unlocks_if_won=[], decision=None,
    after="The book's last scene is on a porch. If you won, read it aloud.",
    campaign="BOOK_ONE",
)

CAMPAIGNS = {
 "LEDGER": dict(title="The Long Ledger",
                blurb="One West Dayton family across six generations, from Reconstruction to today.",
                chapters=["FREEDOMS_LEDGER","UP_NORTH","THE_MAP","VOICE","PLANTS_CLOSE","TODAY"]),
 "BOOK_ONE": dict(title="Book One",
                  blurb="Four chapters that follow the novel, from graduation night to the empty throne.",
                  chapters=["B1_CHAIN","B1_NET","B1_CROWN","B1_THRONE"]),
}
for _k,_c in CHAPTERS.items():
    _c["key"]=_k
    _c.setdefault("mode","coop"); _c.setdefault("rules",{}); _c.setdefault("after","")
    _c.setdefault("unlocks_if_won", _c.pop("unlocks_if_league_won", []))
