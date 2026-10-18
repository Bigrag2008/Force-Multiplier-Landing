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

CHAPTERS = {
 "THE_MAP": dict(
    number=3, title="The Map", era="1930s–1960s",
    intro=("The federal maps shade the West Side red. The banks won't lend here, the insurers won't write here, "
           "and the only way to buy a house is on contract. Families start reading their contracts together."),
    pressure={"HOUSING":2, "LENDING":2},          # REDLINING is active from round 1
    owner="The Lobbyist", face="The Appraiser",
    face_text=("The Appraiser: leans on your strongest unfinished district every round (+1 Pressure); "
               "on reveal, knocks one woken district back to Clarity 1."),
    decks={"HOUSING":THE_MAP_HOUSING, "LENDING":THE_MAP_LENDING},
    league=dict(name="The League",
                text=("Like the Contract Buyers League (Chicago, 1968): sign the pledge to withhold together "
                      "(an action and 1 Trust). When as many families have signed as there are players, the League "
                      "forms: Housing Pressure −2, and every Housing and Lending trap can be negotiated with Sight 1.")),
    unlocks_always=["The Redlining Maps"],
    unlocks_if_league_broke_redlining=["The Contract Buyers League"],
    decision=("Stay and fight for the house, or move to where the map says you can? Stay: Housing keeps its sticker, "
              "and the Organizer gains +1 Legend per League signature in Chapter 4. Move: remove one Scar from Housing, "
              "but the Elder role skips a generation."),
 ),
}
