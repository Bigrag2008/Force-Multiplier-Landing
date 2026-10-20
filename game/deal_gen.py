# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — deal templates, for endless deals.

The printed deck is 76 fixed cards, so a table that plays it enough can learn it by heart.
A template is a deal with blanks: "Rent-to-own: a {item} for ${a} a week." Roll the blanks
and the second number changes every time, so you have to work it out instead of remembering it.

  make_deal(district, rng) -> a card like the ones in deck_cards.DECK, plus
      ask    : the math question behind the red layer ("$20 a week × 78 weeks = ?")
      answer : the second number (the math variant: at Read 1 you work it out yourself)

Each template's `calc` names how the second number (`total`) comes from the blanks:
  mul      a × b            mul_add  a × b + c        mul_sub  a × b − c
  add      a + c            apr      c ÷ (a × b) × 36500, rounded (a fee c on a loan a for b days)
Every template also gets `ab` = a × b, and `over` = total − s when it has a sticker price s.
`dollars` is a trap's real cost for the end-of-game count: `over` if there's a sticker price, else
`total`, or the blank `usd` names. An honest template's `worth` is what the real help is worth.
The website (src/engine/dealgen.ts) reads these same templates and must roll them identically.
"""
import re

TEMPLATES = {
 "LENDING": [
  dict(front="Tax refund advance: get your ${a} today, no waiting!", rush=True,
       a=[500,750,1000], b=[1], c=[49,69,89], calc="mul_sub",
       red="The 'free' advance costs ${c} in filing fees, so you get ${total} of your own ${a} refund.",
       amber="The refund lands in their account first. You wait for them.",
       blue="The tax shop and the bank behind the advance split the fee.",
       ask="${a} refund − ${c} in fees = ?", lever=1, usd="c"),
  dict(front="Quick Cash: borrow ${a} today. One flat fee: just ${c}.", rush=True,
       a=[200,300,375,500], c=[30,45,56,75], b=[14], calc="apr", usd="c",
       red="A ${c} fee on ${a} for {b} days is a {total}% yearly rate. The fee is the product.",
       amber="Due in full in {b} days. Can't pay? Roll it over and owe ${c} again.",
       blue="The storefront and the debt buyer that calls you later share one owner.",
       ask="A ${c} fee on ${a} for {b} days. As a yearly rate: ${c} ÷ ${a} × 365 ÷ {b} = ?", lever=2),
  dict(front="Borrow ${s} today. Low monthly payments of just ${a}!",
       s=[800,1000,1500], a=[89,99,129], b=[18,24,30], calc="mul",
       red="${a} × {b} months = ${total}. That's ${over} more than you borrowed.",
       amber="Miss one payment and a 'late plan' you never asked for gets added to the loan.",
       blue="The loan is sold to a debt buyer before the ink dries.",
       ask="${a} a month × {b} months = ?", lever=1),
  dict(front="Title loan: ${s} cash on your car title, and you keep driving.",
       s=[600,800,1000], a=[250,300,350], b=[6,8], calc="mul",
       red="${a} × {b} months = ${total} to borrow ${s}: ${over} extra.",
       amber="One missed payment and the car is gone, often with no grace period.",
       blue="The lender owns a piece of the repo lot that resells your car.",
       ask="${a} a month × {b} months = ?", lever=3),
  dict(front="Credit union starter loan: ${a} a month for {b} months.",
       a=[45,62,80], b=[12], calc="mul", trap=False,
       red="${a} × {b} = ${total} in all, at a low fixed rate with no fees. This one's honest.",
       amber="No rollover, no balloon payment, and paying early costs nothing.",
       blue="Owned by its members, the people on the block who save there.",
       ask="${a} a month × {b} months = ?", worth=300),
 ],
 "HOUSING": [
  dict(front="First month free! Then just ${a} a month, {b}-month lease.", rush=True,
       a=[750,850,950], b=[12], c=[300,400], calc="mul_add",
       red="${a} × {b} = ${ab}, plus ${c} in 'amenity' and admin fees: ${total}, and the free month is spread over the rest.",
       amber="Break the lease early and the free month gets billed back to you.",
       blue="The amenity fee goes to the management company, not the building.",
       ask="${a} × {b} months + ${c} in fees = ?", lever=1),
  dict(front="Rent-to-own: a brand-new {item} for just ${a} a week!",
       item=["couch","TV","washer"], s=[399,499,599], a=[15,20,25], b=[52,78,104], calc="mul",
       red="${a} × {b} weeks = ${total} for a {item} the store sells for ${s}.",
       amber="Miss a week and they can pick it up, along with everything you've paid.",
       blue="The same company runs the store, the financing, and the collections.",
       ask="${a} a week × {b} weeks = ?", lever=1),
  dict(front="Own this house in Madden Hills: ${c} down, ${a} a month, no bank needed.",
       c=[500,1000,1500], a=[400,500,600], b=[120,180], s=[18000,25000], calc="mul_add",
       red="${c} down + ${a} × {b} months = ${total}, for a house appraised at ${s}.",
       amber="Miss one payment and you lose the house and everything you paid in: no deed until the last check.",
       blue="The seller bought it at a tax sale for almost nothing and has sold it this way before.",
       ask="${c} down + ${a} a month × {b} months = ?", lever=2),
  dict(front="Apartments on Salem Avenue: apply today, just ${a} an application!", rush=True,
       a=[35,50,65], b=[4,5,6], calc="mul",
       red="{b} applications × ${a} = ${total}, and most never call you back.",
       amber="The fee is gone the moment you hit submit, approved or not.",
       blue="The 'screening company' belongs to the landlord's management firm.",
       ask="${a} × {b} applications = ?", lever=3),
  dict(front="Homeownership program: ${a} a month for {b} months toward a house with a real deed.",
       a=[350,425,500], b=[120,180], calc="mul", trap=False,
       red="${a} × {b} = ${total}, and every dollar of it builds equity. This one's honest.",
       amber="A missed month gets a counselor's call, not an eviction.",
       blue="A neighborhood land trust, run by the people who live here.",
       ask="${a} a month × {b} months = ?", worth=8000),
 ],
 "LABOR": [
  dict(front="Delivery app: make ${a} a trip, choose your own hours!",
       a=[6,7,8], b=[20,25,30], c=[60,80], calc="mul_sub",
       red="{b} trips × ${a} = ${ab}, minus ${c} in gas and wear on your car: ${total} for the day.",
       amber="The pay per trip can change any week, without notice.",
       blue="The app counts you as a contractor so it pays nothing toward your car or your health.",
       ask="{b} trips × ${a}, minus ${c} for gas = ?", lever=1, usd="c"),
  dict(front="Warehouse work through the agency: ${a} an hour, start Monday!", rush=True,
       a=[14,15,16], b=[30,40], c=[35,50,70], calc="mul_sub",
       red="{b} hours × ${a} = ${ab}, minus a ${c} weekly 'van fee' = ${total} a week.",
       amber="The agency can end the job any day, and the 90-day hire-on keeps moving.",
       blue="The plant pays the agency almost twice what reaches you.",
       ask="{b} hours × ${a}, minus ${c} = ?", lever=1, usd="c"),
  dict(front="Sign-on bonus: ${s} cash when you start!",
       s=[500,750,1000], c=[300,450,600], b=[6,12], calc="add",
       red="Leave before {b} months and you pay back the ${s} plus ${c} in 'training': ${total}.",
       amber="The {b}-month clock restarts if they move you to another shift.",
       blue="The same staffing firm writes the payback loan and sues to collect it.",
       ask="${s} back + ${c} in training = ?", lever=2, usd="c"),
  dict(front="Security job, ${a} an hour, uniform included!",
       a=[13,14,15], c=[15,20,25], b=[10,12], calc="mul",
       red="\"Included\" means ${c} a week out of your check for {b} weeks: ${total}. (The math: ${c} × {b}.)",
       amber="Quit early and the rest of the uniform cost comes out of your last check.",
       blue="The uniform company is owned by the guard firm's parent company.",
       ask="${c} a week × {b} weeks = ?", lever=3, mul=["c","b"]),
  dict(front="Union apprenticeship: ${a} an hour while you learn, a raise every {b} months.",
       a=[17,18,19], b=[6], c=[40], calc="mul", trap=False,
       red="{c} hours × ${a} = ${total} a week, with no fees taken out. This one's honest.",
       amber="The raises are in the contract: on the date, every time.",
       blue="The hall is run by the members, the people doing the work.",
       ask="{c} hours × ${a} = ?", mul=["c","a"], worth=6000),
 ],
 "HEALTH": [
  dict(front="Teeth whitening kit: just ${a} a month, cancel anytime!",
       a=[29,39,49], b=[12], calc="mul",
       red="${a} × {b} months = ${total} a year. 'Cancel anytime' means calling during business hours.",
       amber="The free trial turns into a monthly charge in 7 days.",
       blue="The same company sells the 'dentist-approved' reviews.",
       ask="${a} a month × {b} months = ?", lever=1),
  dict(front="Get the dental work today: 0% interest for {b} months on the clinic card!", rush=True,
       s=[1200,1800,2400], c=[290,430,580], b=[6,12], calc="add",
       red="Owe even $1 on day {b} and all the interest lands at once: ${c}, for ${total} in all.",
       amber="The 0% clock runs {b} months. One late payment ends it early.",
       blue="The card company pays the clinic to sign patients up in the chair.",
       ask="${s} bill + ${c} in deferred interest = ?", lever=2, usd="c"),
  dict(front="Health plan: just ${a} a month!", rush=True,
       a=[89,119,149], b=[12], c=[2500,5000], calc="mul_add",
       red="${a} × {b} = ${ab} a year, and you pay the first ${c} yourself: ${total} before it pays a dime.",
       amber="Sign-up closes Friday. After that you wait a year.",
       blue="The 'plan' is a discount card sold by the same company that runs the ads.",
       ask="${a} × {b} months + ${c} deductible = ?", lever=1),
  dict(front="Settle that ER bill: just ${a} a month for {b} months.",
       s=[1500,1800,2000], a=[90,120,150], b=[24,30], calc="mul",
       red="${a} × {b} = ${total}, ${over} more than the bill itself.",
       amber="You have 240 days from the first bill to apply for help. The clock already started.",
       blue="The hospital is a nonprofit that owes charity care: you might owe nothing at all.",
       ask="${a} a month × {b} months = ?", lever=3),
  dict(front="Community health center: a sliding-scale visit, ${a} today.",
       a=[10,20,30], b=[4], calc="mul", trap=False,
       red="{b} visits × ${a} = ${total} for the year. No surprise bill. This one's honest.",
       amber="No deadline: they see you whether or not you can pay today.",
       blue="Run by a board that's mostly patients, the way the law requires.",
       ask="${a} a visit × {b} visits = ?", worth=400),
 ],
 "EDUCATION": [
  dict(front="Private student loan: ${s}, just ${a} a month after you graduate!",
       s=[5000,8000], a=[95,130], b=[120], calc="mul",
       red="${a} × {b} months = ${total} to borrow ${s}: ${over} extra.",
       amber="Interest piles up the whole time you're in school, before the first payment.",
       blue="The lender pays the school to be on its 'preferred' list.",
       ask="${a} a month × {b} months = ?", lever=1),
  dict(front="Career college: certified in {b} months, just ${a} a month!", rush=True,
       a=[450,550,650], b=[12,18], s=[3500,4200], calc="mul",
       red="${a} × {b} = ${total}. The same certificate at Sinclair runs about ${s}.",
       amber="Drop after week 3 and you owe the whole term.",
       blue="The school's owners also own the lender in the financial aid office.",
       ask="${a} a month × {b} months = ?", lever=1),
  dict(front="Test-prep: ${a} a session, a higher score guaranteed!",
       a=[60,75,90], b=[8,10,12], calc="mul",
       red="{b} sessions × ${a} = ${total}, and the guarantee is only a free retake.",
       amber="Cancel within 3 days or you're billed for every session.",
       blue="The free practice test at the library is the same one.",
       ask="${a} × {b} sessions = ?", lever=2),
  dict(front="A school laptop for ${a} a week. No credit check!",
       a=[12,15,18], b=[52,78], s=[349,449], calc="mul",
       red="${a} × {b} weeks = ${total} for a ${s} laptop: ${over} extra.",
       amber="Miss a week and the laptop locks itself.",
       blue="The lender pays the school for the flyer in your kid's backpack.",
       ask="${a} a week × {b} weeks = ?", lever=3),
  dict(front="College aid night at Dunbar: fill out the FAFSA with a counselor. {b} grants to try for.",
       b=[3,4], a=[0], calc="mul", trap=False,
       red="It costs ${total}. Grants don't get paid back. This one's honest.",
       amber="The state deadline is real: go early.",
       blue="Run by the school and Central State volunteers.",
       ask="What does filling out the FAFSA cost? ${a} × {b} = ?", worth=6000),
 ],
}

SLOT_ORDER = ("item","s","a","b","c")      # blanks are rolled in this order, in both engines


def half_up(num, den):
    """num ÷ den rounded half up, in integers, so Python and JavaScript agree."""
    return (2*num + den)//(2*den)


def fmt(v):
    return f"{v:,}" if isinstance(v, int) else str(v)


def fill(text, vals):
    return re.sub(r"\{(\w+)\}", lambda m: fmt(vals[m.group(1)]), text)


def make_deal(d, rng):
    t = rng.choice(TEMPLATES[d])
    v = {k: rng.choice(t[k]) for k in SLOT_ORDER if k in t}
    x, y = t.get("mul", ["a","b"])
    if x in v and y in v: v["ab"] = v[x]*v[y]
    calc = t["calc"]
    v["total"] = (v["ab"] if calc=="mul" else v["ab"]+v["c"] if calc=="mul_add" else v["ab"]-v["c"] if calc=="mul_sub"
                  else v["s"]+v["c"] if calc=="add" else half_up(v["c"]*36500, v["ab"]))
    if "s" in v: v["over"] = v["total"]-v["s"]
    trap = t.get("trap", True)
    return dict(front=fill(t["front"],v), red=fill(t["red"],v), amber=fill(t["amber"],v), blue=fill(t["blue"],v),
                trap=trap, lever=t.get("lever",1) if trap else 0, ask=fill(t["ask"],v), answer=v["total"], gen=True,
                dollars=v[t.get("usd","over" if "over" in v else "total")] if trap else t["worth"],
                basis="the numbers on this deal" if trap else "what the real help is worth", rush=t.get("rush",False))
