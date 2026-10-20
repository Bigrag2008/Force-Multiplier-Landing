# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — the full card content for the base box.
60 deal cards (12 per district), 5 roles, 12 patterns, 4 owners, 5 scenarios.

Each deal card:
  front : the price/pitch you SEE with the naked eye
  red   : 🔴 the real COST (Read 1 reveals)
  amber : 🟠 the CLOCK / deadline (Read 2 reveals)
  blue  : 🔵 the CONNECTION to the Underworld (Read 3 reveals)

  lever : which layer holds the leverage to beat it (1 red · 2 amber · 3 blue).
          Printed inside the hidden red zone, so it takes Read 1 to see it.

Seeing is not the same as beating it. Read 1 (red) tells you a deal is a trap.
To NEGOTIATE it down you need Read up to the card's lever layer.

Every deal offers the same three choices (defined in the rules, not per card):
  TAKE it      — honest deal: real help. Trap: fast relief now, Shady on you.
  WALK         — always safe on a trap; walking away from honest help costs Trust.
  NEGOTIATE    — spend 1 Trust; with Read ≥ the lever you defuse the trap,
                 below it you get played.
"""

DISTRICT_COLORS = {   # AfriCOBRA "Kool-Aid" brights — see ART_DIRECTION.md
 "LENDING":"#3FA34D","HOUSING":"#E03C31","LABOR":"#1F7AE0",
 "HEALTH":"#8E3BB8","EDUCATION":"#F28C1B",
}

# THE WEST DAYTON SETTING — every district is a part of the West Side.
EDITION = "West Dayton Edition"
DAYTON = {
 "LENDING":  dict(sub="Payday on every corner",
                  flavor="Where the bank branches thin out, the storefront lenders fill in."),
 "HOUSING":  dict(sub="Wright-Dunbar to Madden Hills",
                  flavor="Historic homes, empty lots, and families who never left."),
 "LABOR":    dict(sub="After the plants closed",
                  flavor="GM's Moraine plant closed in 2008 and NCR moved its headquarters out in 2009. "
                         "The good jobs left; the fine print didn't."),
 "HEALTH":   dict(sub="A hospital gone",
                  flavor="Good Samaritan Hospital in northwest Dayton closed in 2018. Care got farther away; the bills didn't."),
 "EDUCATION":dict(sub="Dunbar High to Central State",
                  flavor="Paul Laurence Dunbar High School, Sinclair downtown, Wilberforce and Central State down the road."),
}

DECK = {
 "LENDING": [
  dict(front="Quick Cash: $375 today. One flat fee — $56.25.",
       red="That fee is a 391% APR. The fee is the product, not a favor.",
       amber="Due in full in 14 days. Can't pay? You 'reroll' and owe $56 again.",
       blue="The storefront and the debt buyer that hounds you later share one owner."),
  dict(front="Title Loan: borrow $1,000 on your car title, keep driving.",
       red="~300% APR, and the loan is a fraction of the car's real value.",
       amber="One missed payment = repossession, often with no grace period.",
       blue="The lender holds a stake in the repo lot that resells your car."),
  dict(front="Pawn: cash now for your item, buy it back anytime.",
       red="Effective APR 120–240%; most items are never redeemed.",
       amber="The redemption window is short — miss it and it's sold.",
       blue="Resale profit flows to the same chain that wrote the loan."),
  dict(front="Buy Now, Pay Later: 4 easy payments, 0% interest!",
       red="Late fees pile on, and it stacks across apps till you lose track.",
       amber="Autopay hits whether the money's there or not → overdraft.",
       blue="The BNPL firm sells your payment data and routes late fees up."),
  dict(front="Overdraft Protection: we'll cover your card if you're short.",
       red="Up to ~$35 per swipe — a $4 coffee can cost ~$39 (many banks now $0–$15).",
       amber="Charges reordered largest-first to trigger the most fees.",
       blue="Overdraft fees are a top profit line for the bank behind it."),
  dict(front="Cash Advance App: get $100 early. No interest — just tip!",
       red="A $14 'tip' + fee on $100 for a week ≈ 300%+ APR.",
       amber="Auto-debits on payday; bad timing sets off an overdraft cascade.",
       blue="The 'tip' dodges lending law; the app sells your bank data."),
  dict(front="Refund Advance: your tax refund NOW, don't wait weeks.",
       red="Fees + interest eat a refund you'd get free in a few days.",
       amber="Due when the IRS pays — any delay becomes your problem.",
       blue="The preparer, the bank, and the loan are one packaged product."),
  dict(front="Online Installment Loan: need $2,000? Easy approval.",
       red="100%+ APR by renting an out-of-state bank to dodge your state's cap.",
       amber="Balloon structure — early payments barely touch the principal.",
       blue="A fintech fronts it; a far-off bank lends its charter for a cut."),
  dict(front="Credit Builder: build your credit — guaranteed approval!",
       red="You pay fees for a 'loan' you can't touch; it may not even report.",
       amber="Cancel late and you eat months of fees for nothing.",
       blue="The fees are the business; your 'credit building' is the bait."),
  dict(front="Debt Consolidation: one low monthly payment, be debt-free!",
       red="Lower payment = longer term = more interest paid in total.",
       amber="Stop paying creditors as told and your credit craters first.",
       blue="The 'nonprofit' is funded by fees from the lenders it deals with."),
  dict(front="Drive It Home Today — financing approved!",
       red="Days later: 'financing fell through,' re-signed at a worse rate.",
       amber="They hold your trade-in and down payment hostage to force the redo.",
       blue="The dealer and the finance arm split the markup on your rate."),
  dict(front="Check Cashing: cash your check instantly, no bank needed.",
       red="1–5% per check — hundreds a year to reach your own money.",
       amber="Every payday, every time. It never stops.",
       blue="The chain also sells the payday loans you'll 'need' next."),
 ],
 "HOUSING": [
  dict(front="Rent-to-Own: $25/week and the couch is yours!",
       red="Total paid = 2–4x the retail price.",
       amber="Miss one week late in the term and they take it — you keep nothing.",
       blue="The store and the lease company are one holding company."),
  dict(front="No-Credit-Check Lease: bad credit? Move in today.",
       red="Huge deposit + junk fees; rent set above market for 'risk'.",
       amber="A 60-day move-out notice is buried inside — miss it, it auto-renews.",
       blue="The 'management co.' is a shell of the same landlord group."),
  dict(front="Own Your Home — no bank, no mortgage! (Contract-for-Deed)",
       red="You build no equity; miss a payment late and lose it all.",
       amber="One default — even near the end — forfeits everything you paid.",
       blue="The seller reclaims and resells the same house again and again."),
  dict(front="Rent is only $950!",
       red="'Technology fee,' 'convenience fee,' 'valet trash' add $100+/mo.",
       amber="Fees climb at renewal while the base rent stays 'the same'.",
       blue="A third-party fee processor splits the take with the landlord."),
  dict(front="Just first month + deposit to move in.",
       red="Move-out charges get invented to keep your whole deposit.",
       amber="The dispute window is tight — miss it and it's gone.",
       blue="A 'turnover' vendor profits from every withheld deposit."),
  dict(front="$50 to apply — refundable if you're not approved!",
       red="Rarely refunded; they collect from dozens for one open unit.",
       amber="Your decision stays 'pending' past the refund window.",
       blue="The screening company and the landlord share the fee pool."),
  dict(front="Renters insurance included for your protection.",
       red="A marked-up policy that mostly protects the landlord, not you.",
       amber="Auto-added monthly; opting out is hidden and time-boxed.",
       blue="The landlord earns a commission on every policy."),
  dict(front="Welcome! Great intro rent.",
       red="Renewal jumps 15–30%; moving costs trap you into paying it.",
       amber="Your notice to leave is due before you even learn the new rate.",
       blue="Rent-setting software coordinates the hike across the whole area."),
  dict(front="Low payment to get you in the door! (ARM mortgage)",
       red="The teaser rate resets far higher — your payment can double.",
       amber="The reset date was set on day one; the clock always ran.",
       blue="The loan is sold upstream; the servicer profits when you struggle."),
  dict(front="All utilities included — simple!",
       red="A flat 'utility' charge set far above your real usage.",
       amber="The rate adjusts up yearly with no itemized proof.",
       blue="A submetering vendor splits the overcharge with ownership."),
  dict(front="Standard lease, just sign here.",
       red="Waives your notice and auto-adds 'attorney fees' on any late rent.",
       amber="Late by a day → filing starts and fees attach immediately.",
       blue="A high-volume eviction law firm is paid per filing by the group."),
  dict(front="First month FREE!",
       red="Leave early and you repay the 'free' month plus a penalty.",
       amber="The clawback triggers on any break before month 13.",
       blue="Concessions are booked as debt you owe the property fund."),
 ],
 "LABOR": [
  dict(front="Sign here to start Monday.",
       red="You waive your right to sue or join a class action.",
       amber="The 30-day opt-out is buried on page 9 — the clock starts now.",
       blue="The arbitration firm is chosen and paid by the employer."),
  dict(front="Standard new-hire paperwork. (Non-compete)",
       red="Can block you from your whole field for a year+ (enforceability varies by state).",
       amber="Signed at hire; enforced exactly when you try to leave.",
       blue="Used to hold wages down across an entire local industry."),
  dict(front="You're an independent contractor — be your own boss!",
       red="No overtime, no benefits; you pay both halves of payroll tax.",
       amber="Back-pay and benefit claims expire if you don't file in time.",
       blue="The staffing agency pockets what your protections would've cost."),
  dict(front="Tips pooled and shared fairly, trust us.",
       red="Managers skim the pool; off-clock work goes unpaid.",
       amber="Wage claims have a filing deadline, and proof fades fast.",
       blue="Skimmed wages become the owner's margin."),
  dict(front="Free training to start your career!",
       red="Quit within 2 years and owe thousands for that 'training'.",
       amber="The debt clock starts day one and follows you out the door.",
       blue="The 'debt' is sold to a collector the moment you leave."),
  dict(front="Come do a working interview!",
       red="Hours of real labor with no pay — and often no job after.",
       amber="'We'll decide later' — payday never comes.",
       blue="Serial trial shifts quietly staff the floor for free."),
  dict(front="Flexible hours — we'll text you!",
       red="You hold the day open, get called off, and earn nothing.",
       amber="Hours cut just below the benefits threshold on purpose.",
       blue="Scheduling software optimizes you to part-time, no benefits."),
  dict(front="Get paid on a convenient card!",
       red="Fees to check your balance, to withdraw, even to stay active.",
       amber="Inactivity fees drain it if you don't cash out fast.",
       blue="The card issuer and employer split the fee revenue."),
  dict(front="Shop at our store with your staff discount!",
       red="Wages steered back to the employer at marked-up prices.",
       amber="Advances against pay keep you one cycle behind, always.",
       blue="The modern company town — you owe your soul to the store."),
  dict(front="Set your own schedule, earn per job!",
       red="Pay per task drops as you come to rely on it; costs are all yours.",
       amber="Incentives expire; the 'bonus' always moves out of reach.",
       blue="The platform tunes your pay to the lowest you'll still accept."),
  dict(front="Congrats, you're salaried now — a manager!",
       red="A 'manager' title used to dodge overtime on 60-hour weeks.",
       amber="Your duties never match the title; claims expire quietly.",
       blue="Your unpaid overtime is pure profit upstream."),
  dict(front="Quick team meeting after your shift.",
       red="Off-clock captive meetings, with anti-organizing pressure.",
       amber="Attendance is tracked; refusing is quietly punished.",
       blue="Union-avoidance consultants are paid to keep you quiet."),
 ],
 "HEALTH": [
  dict(front="In-network hospital — you're covered.",
       red="An out-of-network doctor inside it bills you the gap.",
       amber="Since 2022 the No Surprises Act bans this for ER/emergency care — dispute it.",
       blue="Staffing firms place out-of-network docs in in-network ERs on purpose."),
  dict(front="Amount due: $8,400. FINAL.",
       red="It's an opening offer — cash and charity rates are far lower.",
       amber="Negotiate before it hits collections or the number hardens.",
       blue="Hospital, biller, and collector are one revenue chain."),
  dict(front="Medical card: 0% interest if paid in 12 months!",
       red="Deferred interest — miss the date and they backdate ALL of it.",
       amber="The 0% clock ends quietly on a date you'll forget.",
       blue="The clinic earns a cut for every patient it signs up."),
  dict(front="Just a routine clinic visit.",
       red="A separate 'facility fee' for the room — often more than the visit.",
       amber="It shows up weeks later as a second, surprise bill.",
       blue="Hospitals buy up clinics just to attach facility fees."),
  dict(front="Please pay your balance today.",
       red="You likely qualify for charity care they never mentioned.",
       amber="Eligibility windows close while they push you to pay.",
       blue="Nonprofits owe charity care but profit by collecting instead."),
  dict(front="Health coverage for just $99/mo! (Short-term plan)",
       red="Denies pre-existing conditions; caps leave you exposed.",
       amber="Claims denied after care, and appeal windows are short.",
       blue="The broker earns a fat commission on junk plans."),
  dict(front="We can set up a payment plan.",
       red="The plan reports to credit and can lead to liens or garnishment.",
       amber="Statute-of-limitations tricks restart the debt clock.",
       blue="The debt is sold for pennies; the collector profits on the spread."),
  dict(front="Your copay is $60.",
       red="The cash price can be lower than your insured copay.",
       amber="'Gag clauses' once barred pharmacists from telling you.",
       blue="Pharmacy middlemen pocket the spread between list and real price."),
  dict(front="We'll get you to the hospital. (Ambulance)",
       red="Ground ambulances are often out-of-network — and still exempt from the No Surprises Act.",
       amber="The bill arrives later; you had no way to choose in the moment.",
       blue="Private-equity-owned ambulance firms balance-bill on purpose."),
  dict(front="Here's your total, pay at the desk.",
       red="Errors and duplicate charges hide in the itemization you didn't see.",
       amber="Request the itemized bill fast — before it's marked 'final'.",
       blue="Upcoding inflates the bill; the chain keeps the overcharge."),
  dict(front="Get the dental work done now — finance it!",
       red="In-office financing at high deferred interest.",
       amber="The promo ends mid-treatment and the rate jumps.",
       blue="The provider is paid upfront; you're left owing the lender."),
  dict(front="We'll airlift you — don't worry about the cost.",
       red="Air-ambulance bills run $30k–$50k — but the No Surprises Act (2022) now shields most of it.",
       amber="You still can't consent to the price mid-emergency, so know your protection.",
       blue="PE-owned air fleets long relied on balance billing as the business model."),
 ],
 "EDUCATION": [
  dict(front="Enroll now — job placement guaranteed!",
       red="Low grad rates; 'placement' counts any job, not the career.",
       amber="The enrollment deadline pushes you past the refund date.",
       blue="The school and the loan servicer are one owner."),
  dict(front="Approved! A private loan to cover your whole tuition.",
       red="Variable rate, fewer protections than federal — take federal first.",
       amber="The rate resets on a schedule you don't control.",
       blue="The servicer profits the longer you stay in debt."),
  dict(front="Pay $0 now — just a % of your future income! (ISA)",
       red="Can cost far more than a normal loan if you actually succeed.",
       amber="The percentage and term lock in before you know your salary.",
       blue="Investors bought a slice of your future paycheck."),
  dict(front="Just have a family member cosign.",
       red="The cosigner is fully liable; default wrecks their credit too.",
       amber="The 'release' option has conditions almost no one ever meets.",
       blue="Binding family debt is a feature, not a bug, for the lender."),
  dict(front="Can't pay? Just defer — no worries!",
       red="Unpaid interest is added to principal; the debt grows while you wait.",
       amber="Capitalization hits on a date buried in the terms.",
       blue="A bigger balance means more servicer profit."),
  dict(front="6 weeks to a high-paying certification!",
       red="A credential employers don't recognize, with sky-high fees.",
       amber="No refund once the first module 'starts'.",
       blue="The 'accreditor' is paid by the schools it blesses."),
  dict(front="Start here, transfer anywhere later!",
       red="The credits don't transfer; you pay to retake them.",
       amber="You find out only after you've enrolled and paid.",
       blue="Non-transferable credits lock you into one paying school."),
  dict(front="Tuition is all-inclusive!",
       red="Mandatory 'lab,' 'tech,' and book fees stack up fast.",
       amber="Fees are billed per term and rise each year.",
       blue="A captive bookstore/vendor shares in the markup."),
  dict(front="A counselor will help you apply today!",
       red="'Counselors' are commissioned salespeople hitting enrollment quotas.",
       amber="High pressure: 'enroll today or lose your spot.'",
       blue="Recruiters are paid per signed enrollment, not per graduate."),
  dict(front="We'll erase your student loans — for a fee!",
       red="Charges you for free federal programs; can forfeit protections.",
       amber="Pay upfront, then 'processing' drags past your real options.",
       blue="A fee-mill resells your info to the next scam in line."),
  dict(front="No cost until you're hired at $70k+! (Bootcamp ISA)",
       red="Broad definitions of 'hired' trigger payments even on low pay.",
       amber="The clock and salary floor are written to favor the school.",
       blue="Financiers bundle and securitize cohorts of students like bonds."),
  dict(front="Keep your license current — easy subscription.",
       red="Auto-renews yearly at a higher rate for credits you're required to have.",
       amber="The cancel window is tiny and lands right before renewal.",
       blue="A captive provider holds a monopoly on the required credits."),
 ],
}

ROLES = {
 "Translator":"Teaches for free (no Trust cost). Still has to read a district to teach it. The bridge — spreads the Read fastest.",
 "Student":"Gains DOUBLE Read when taught. The hungry one.",
 "Elder":"Starts with Read 1 everywhere; once per game, 'Teach the History' wakes a whole district instantly.",
 "Veteran":"Shields the block from two Machine hits per game. Came home to protect it.",
 "Organizer":"A successful NEGOTIATE drops Squeeze by 2, not 1 (collective action). Rallies the block.",
}

PATTERNS = [
 (("HOUSING","LENDING"),"REDLINING",
  "Credit and housing denied by geography — your address decides what money costs you."),
 (("HEALTH","LENDING"),"THE MEDICAL-DEBT SPIRAL",
  "One illness becomes a debt becomes ruined credit. A leading cause of bankruptcy in America."),
 (("EDUCATION","LENDING"),"THE DEBT DIPLOMA",
  "The school and the loan servicer are one hand. They sold you the loan, not the future."),
 (("LABOR","LENDING"),"WAGE CAPTURE",
  "Wages kept just low enough that you need the loan to live — so you work to pay the lender."),
 (("HOUSING","LABOR"),"NO ADDRESS, NO JOB",
  "Lose the job, lose the home; no address, no hire. The two feed each other into a spiral."),
 (("HOUSING","EDUCATION"),"ZIP-CODE DESTINY",
  "School funding tied to property values — the block the Machine drained gets the worst schools."),
 (("HEALTH","LABOR"),"THE EXPENDABLE WORKER",
  "Misclassified so there's no workers' comp and no benefits — get hurt and you're discarded."),
 (("EDUCATION","LABOR"),"THE PIPELINE TO NOWHERE",
  "Trained and charged for jobs that don't exist. School-to-dead-end by design."),
 (("HOUSING","LENDING","LABOR"),"THE EXTRACTION ZONE",
  "No jobs, predatory credit, housing that builds no wealth. Concentrated poverty, engineered."),
 (("HEALTH","HOUSING","LENDING"),"THE WIPEOUT",
  "Medical event → debt → lose the house. A whole family erased in one bad year."),
 (("EDUCATION","LENDING","LABOR"),"THE SOLD FUTURE",
  "Debt diploma + no jobs + more loans. Paying forever for a door that was never open."),
 (("HOUSING","LENDING","LABOR","HEALTH","EDUCATION"),"THE CAPTURED CITY",
  "All five in the grip — generational poverty, by design. The whole machine, out in the open."),
]

OWNERS = {
 "The Algorithm":"Relentless. The Machine strikes one extra time every round.",
 "The Lobbyist":"Each round it leans on your strongest unfinished district (+1 Squeeze). On reveal it knocks one woken district back to Clarity 1.",
 "The Debt Buyer":"Every TAKE on a trap costs +1 extra Shady. Each round, collections calls: anyone carrying Shady loses 1 Trust. The Fallen strike twice as hard.",
 "The Recruiter":"Each round it peels someone away: a random player loses 1 Read in a district they can read.",
}

# HISTORY — the Elder's deck. "Teach the History" wakes a district and draws a
# true story from that district's pile (or the ANY pile). The block has always
# fought back; most of these are about how. Verify every card before printing.
HISTORY = {
 "LENDING":[
  dict(title="The Freedman's Savings Bank", year="1865–1874", place="Washington, D.C., with branches across the South",
       story="Congress chartered a bank for the formerly enslaved, and tens of thousands opened accounts. Its white trustees "
             "moved the deposits into risky loans and speculation. When it failed in 1874, many families lost savings they "
             "had worked for since freedom.",
       lesson="Always ask whose hands are on your money."),
  dict(title="Maggie L. Walker's Penny Savings Bank", year="1903", place="Richmond, Virginia",
       story="Maggie Lena Walker chartered the St. Luke Penny Savings Bank so Black families could save, borrow and buy "
             "homes on fair terms. She was the first woman of any race to charter a bank in the United States.",
       lesson="If they won't lend to you fairly, build the bank."),
 ],
 "HOUSING":[
  dict(title="The Redlining Maps", year="1930s", place="Every major city, Dayton included",
       story="The federal Home Owners' Loan Corporation graded neighborhoods for lending risk. Black neighborhoods were "
             "routinely shaded red, \"hazardous,\" which cut them off from fair mortgages for generations.",
       lesson="The map was drawn on purpose. It can be redrawn on purpose."),
  dict(title="The Contract Buyers League", year="1968", place="West Side of Chicago",
       story="Shut out of mortgages, Black families bought homes \"on contract\" at inflated prices, losing everything "
             "after one missed payment. They organized, withheld payments together and went to court, and forced many "
             "sellers to renegotiate.",
       lesson="Read the contract together. Then fight it together."),
 ],
 "LABOR":[
  dict(title="I AM A MAN", year="1968", place="Memphis, Tennessee",
       story="Black sanitation workers struck after two co-workers were killed by a faulty truck. Their signs read "
             "\"I AM A MAN.\" Dr. King came to Memphis to stand with them. The strike won union recognition and a raise.",
       lesson="Dignity is a wage demand."),
  dict(title="The Montgomery Bus Boycott", year="1955–1956", place="Montgomery, Alabama",
       story="For 381 days, Black riders walked, carpooled and organized rather than ride segregated buses. The lost "
             "fares hurt the bus company, and the Supreme Court struck down bus segregation.",
       lesson="Your money is a vote. Spend it like one."),
 ],
 "HEALTH":[
  dict(title="The People's Free Medical Clinics", year="Late 1960s–1970s", place="Oakland and cities nationwide",
       story="The Black Panther Party opened free community clinics and ran a national screening campaign for sickle "
             "cell anemia, a disease the medical system had long neglected.",
       lesson="When care won't come to the block, the block brings care."),
  dict(title="Dr. Charles Drew", year="1940s", place="New York and Washington, D.C.",
       story="Dr. Drew pioneered ways to store blood plasma and ran a major wartime blood-bank program. He spoke out "
             "against the Red Cross separating donated blood by race.",
       lesson="Expertise is protection. Learn the system better than it knows you."),
 ],
 "EDUCATION":[
  dict(title="Wilberforce University", year="founded 1856", place="Wilberforce, Ohio (next to Xenia)",
       story="In 1863 the AME Church bought Wilberforce, making it the first college owned and operated by African "
             "Americans. Central State University grew up beside it. Both are minutes from Dayton.",
       lesson="We have always built our own schools."),
  dict(title="Dunbar, the Wrights and the Dayton Tattler", year="1890", place="West Third Street, Dayton",
       story="Paul Laurence Dunbar and Orville Wright were classmates at Dayton's Central High School. In 1890 the "
             "Wright brothers printed Dunbar's newspaper for Dayton's Black community, the Dayton Tattler.",
       lesson="The block reads, and the block writes its own story."),
 ],
 "ANY":[
  dict(title="Mayor James H. McGee", year="1970–1982", place="Dayton, Ohio",
       story="Dayton elected James H. McGee its first Black mayor. He served for twelve years, and a West Dayton "
             "boulevard carries his name.",
       lesson="Get a voice in the room where the rules are written."),
  dict(title="Greenwood: Black Wall Street", year="1921", place="Tulsa, Oklahoma",
       story="Greenwood was a thriving Black business district of banks, theaters and shops. A white mob destroyed it "
             "in the 1921 massacre. Residents rebuilt much of it within years, with little help.",
       lesson="What we build can be taken. What we know can't."),
 ],
}

# COMMONS PLACES — where the block gathers, on the West Side of Dayton.
# Every Commons action gives +2 Trust and −1 Shady, plus the place's bonus.
PLACES = {
 "BARBERSHOP":dict(name="The Barbershop & Beauty Shop", where="West Third Street",
                   bonus="Your next Teach this turn is free.",
                   flavor="Where the news really travels. Somebody in the chair already read the fine print."),
 "CHURCH":    dict(name="The Church", where="on the corner, every Sunday",
                   bonus="−2 Shady instead of −1.",
                   flavor="Come as you are. Leave a little lighter."),
 "ADVENTURE": dict(name="Adventure Central", where="Wesleyan MetroPark",
                   bonus="Your next Study this turn gives +2 Read.",
                   flavor="The young people's learning center in the park. Practice makes sight."),
 "MARKET":    dict(name="Gem City Market", where="the co-op grocery on Salem Avenue",
                   bonus="Your next deal this turn: draw 2, face 1.",
                   flavor="Owned by the neighborhood it feeds. Shop around before you sign."),
 "KITCHEN":   dict(name="Grandma's Kitchen Table", where="the house everybody ends up at",
                   bonus="Once per game: every player gets +2 Trust.",
                   flavor="Sit down. Eat. Now show me the paper they gave you."),
}

SCENARIOS = {
 "The Eviction Wave":"Housing starts under siege (Squeeze 2). Hold the line.",
 "Payday Season":"Every second round is payday: Lending takes an extra hit. The hardest rung.",
 "The Closure":"A school starts captured (3 Squeeze). Reclaim it — fast.",
 "The Audit":"The Machine is distracted — the block gets a one-round head start.",
 "A Quiet Year":"No extra Squeeze. Learn the ropes.",
 "The Plants Close":"Dayton, 2008: Labor starts at Squeeze 2, and everyone starts with 1 Trust instead of 2.",
 "The Hospital Closes":"Dayton, 2018: Health starts at Squeeze 2, and negotiating a Health deal costs 2 Trust.",
}

# ---------------------------------------------------------------------------
# HONEST DEALS — not every offer is a trap. Mixing these in means blind
# suspicion has a cost: WALK away from real help and you lose. Reading the
# second number becomes a skill (tell the trap from the fair deal), not reflex.
# ---------------------------------------------------------------------------
HONEST = {
 "LENDING":[
  dict(front="Credit-union personal loan: fixed low rate.",
       red="A fair APR — the rate is the whole story, no hidden second number.",
       amber="No prepayment penalty; pay it early and save.",
       blue="Member-owned nonprofit; the profit returns to members like you."),
  dict(front="Layaway: pay it off first, then take it home.",
       red="No interest and no debt — you only pay the sticker price.",
       amber="Miss payments and you just get your money back, minus a small fee.",
       blue="Old-school model with nobody profiting off your debt."),
  dict(front="Free tax prep (VITA) + your refund by direct deposit.",
       red="$0 to file, and the full refund is yours — no advance fee.",
       amber="E-file with direct deposit and it usually lands in about 3 weeks.",
       blue="An IRS-backed volunteer program; nobody earns a cut of your refund."),
 ],
 "HOUSING":[
  dict(front="A fair lease: normal deposit, clear terms.",
       red="Rent is the rent — deposit is refundable, fees are spelled out.",
       amber="Standard notice period, plainly stated. No buried clause.",
       blue="A small local landlord, not a shell of a national fund."),
  dict(front="Housing voucher (Section 8): inspected unit, capped rent.",
       red="Your share of rent is capped to your income — the real cost is low.",
       amber="Annual recertification, clearly scheduled.",
       blue="A public program built to keep you housed, not to extract."),
  dict(front="Community land trust home: buy at a price you can afford.",
       red="A real mortgage you can carry; you build equity as you pay.",
       amber="Resale is capped, and that's spelled out on day one.",
       blue="The trust holds the land so the next family can afford it too."),
 ],
 "LABOR":[
  dict(front="A real W-2 job: overtime, benefits, clear pay.",
       red="You get overtime, the employer pays its share of taxes, benefits included.",
       amber="Pay schedule and raises are written and predictable.",
       blue="Classified correctly — your protections are intact."),
  dict(front="Union apprenticeship: paid training, raises you keep.",
       red="You're paid to learn, and the skill and raises are yours for good.",
       amber="A clear schedule of raises as you hit milestones.",
       blue="Collective bargaining puts the leverage on your side."),
  dict(front="File a wage claim with the state labor office.",
       red="Free to file — and it's illegal for the boss to retaliate.",
       amber="The deadline is long, but file soon while the records are fresh.",
       blue="The public enforcer works for you, not the employer."),
 ],
 "HEALTH":[
  dict(front="Charity-care application at a nonprofit hospital.",
       red="You likely qualify — the real cost could be $0 to a small fraction.",
       amber="Apply within the window and the balance can be wiped.",
       blue="Nonprofit hospitals are required to offer this; it's your right."),
  dict(front="Join Gem City Market: a grocery the neighborhood owns.",
       red="Membership is a share in the store, not a subscription. Fresh food close to home.",
       amber="No teaser price, no auto-renew trap. The rules are the co-op's bylaws, in the open.",
       blue="Member-owned: the store answers to the people it feeds."),
  dict(front="Community clinic, sliding-scale fee.",
       red="The price is matched to your income — no surprise markup.",
       amber="Set your fee up front; no bill ambush later.",
       blue="Federally supported care designed to reach everyone."),
  dict(front="Marketplace plan with an income-based subsidy.",
       red="Covers pre-existing conditions; the subsidy cuts the premium.",
       amber="Sign up in open enrollment, or within 60 days of a life change.",
       blue="A public program with real rules; the plan can't deny you for being sick."),
 ],
 "EDUCATION":[
  dict(front="Federal student aid (FAFSA): fixed rate, protections.",
       red="Fixed rate, income-driven repayment, forgiveness options — take this first.",
       amber="Clear, federal timelines; deferment won't quietly capitalize the same way.",
       blue="Public aid built for you, not an investor's return."),
  dict(front="Public library / free certification program.",
       red="Real, recognized skills for $0 — the cost is just your time.",
       amber="Go at your own pace; no refund deadline to beat.",
       blue="A public good with nobody profiting off your enrollment."),
  dict(front="Community college with a guaranteed-transfer agreement.",
       red="Low tuition, and the credits are guaranteed to count at the state school.",
       amber="Follow the transfer map from semester one.",
       blue="A public partnership — the schools are built to pass you along, not trap you."),
 ],
}

# LEVERS — which layer holds the leverage to beat each trap, in deck order.
# 1 = red (the cost is the weak point), 2 = amber (the clock / your rights window),
# 3 = blue (you have to name who's behind it). 5 / 4 / 3 per district, so Read 2
# and Read 3 each unlock real plays.
LEVERS = {
 "LENDING":  [1,2,2,2,1,3,1,3,1,3,2,1],
 "HOUSING":  [1,2,3,1,2,2,3,3,1,1,1,2],
 "LABOR":    [2,3,1,1,2,1,2,1,2,3,1,3],
 "HEALTH":   [2,1,2,3,1,1,2,1,3,2,1,3],
 "EDUCATION":[2,1,2,2,1,3,1,1,3,1,3,2],
}

# tag everything: existing deck = traps; honest deals = not traps; fold honest in
for _d in DECK:
    for _c,_l in zip(DECK[_d],LEVERS[_d]):
        _c.setdefault("trap", True); _c["lever"]=_l
    for _c in HONEST[_d]:
        _c["trap"] = False; _c["lever"]=0
    DECK[_d].extend(HONEST[_d])

# DOLLARS — the real money behind each card, for the end-of-game count ("the block signed $14,300
# of traps"). Deck order, honest deals last. A trap's figure is what signing it typically costs you
# beyond what it looks like; an honest deal's is what the real help is worth to you. These are rough,
# typical amounts for one household over about a year, not quotes: each has its basis.
DOLLARS = {
 "LENDING": [
  (448, "a $56 fee rolled over 8 times, like the typical payday borrower"),
  (1200, "about 300% a year on $1,000 over a few months"),
  (150, "120%+ a year on a pawn, or the item gone"),
  (70, "late fees across a few overdue plans"),
  (175, "five $35 overdraft fees in a month"),
  (112, "a $14 tip-and-fee, eight times a year"),
  (60, "advance and filing fees on a refund that was coming anyway"),
  (1900, "about 100% a year on $2,000 over 18 months"),
  (180, "a year of fees for a loan you can't touch"),
  (2000, "a longer term and more interest on a typical balance"),
  (2500, "re-signed at a worse rate after the 'financing fell through'"),
  (400, "about 2% of every paycheck, for a year"),
  (600, "what a fair rate saves over a high-cost loan"),
  (120, "no interest and no fees"),
  (250, "a typical tax-prep fee, kept"),
 ],
 "HOUSING": [
  (900, "$25 a week for a year, for a couch that sells for about $400"),
  (1200, "a big deposit and a 'risk' markup in the first year"),
  (15000, "years of payments on a house you never own, gone with one late payment"),
  (1200, "$100 a month in junk fees, for a year"),
  (1500, "a deposit kept for invented move-out charges"),
  (250, "five $50 applications"),
  (120, "a marked-up policy, for a year"),
  (2400, "a 20% renewal hike on $1,000 rent, for a year"),
  (6000, "a reset rate that doubles the payment, for a year"),
  (600, "a flat 'utility' charge above real usage, for a year"),
  (500, "attorney fees added to one late rent"),
  (1500, "the 'free' month paid back, plus a penalty"),
  (1500, "a deposit you actually get back"),
  (6000, "a year of rent above your capped share"),
  (8000, "equity built in the first years"),
 ],
 "LABOR": [
  (1500, "a wage claim you signed away"),
  (5000, "a year kept out of better pay in your field"),
  (3500, "the employer's half of payroll tax, overtime and benefits, on $35,000"),
  (1500, "skimmed tips and unpaid off-clock work, over a year"),
  (4000, "paying back 'free' training after quitting early"),
  (120, "a day of unpaid work"),
  (2000, "called-off shifts over a year"),
  (250, "card fees over a year"),
  (600, "wages spent back at marked-up prices"),
  (3000, "car costs and falling per-job pay, over a year"),
  (8000, "unpaid overtime on 60-hour weeks, for a year"),
  (300, "off-clock meetings over a year"),
  (5000, "overtime, benefits and the employer's tax share"),
  (6000, "paid training and the raises that come with it"),
  (1200, "back wages recovered"),
 ],
 "HEALTH": [
  (2000, "an out-of-network surprise bill"),
  (5000, "paying the opening price instead of the charity or cash rate"),
  (600, "deferred interest backdated on a $2,500 bill"),
  (300, "a facility fee on top of the visit"),
  (2000, "paying a bill charity care would have cut"),
  (3000, "a denied claim after a year of premiums"),
  (800, "a payment plan sent to collections"),
  (30, "a copay above the cash price"),
  (1200, "an out-of-network ambulance bill"),
  (400, "errors and duplicate charges"),
  (800, "deferred interest on dental financing"),
  (1000, "what's left after the No Surprises Act covers most of it"),
  (3000, "a hospital bill cut by charity care"),
  (300, "fresh food close to home, and a share in the store"),
  (400, "a visit priced to your income"),
  (4000, "a year of premium subsidy"),
 ],
 "EDUCATION": [
  (15000, "for-profit tuition for a credential that doesn't lead to the career"),
  (6000, "extra interest over a federal loan"),
  (10000, "income-share payments above a normal loan, if you do well"),
  (5000, "a cosigned loan that defaults"),
  (2000, "interest added to the loan while it was deferred"),
  (3000, "fees for a credential employers don't recognize"),
  (4000, "paying to retake credits that didn't transfer"),
  (1500, "lab, tech and book fees on 'all-inclusive' tuition"),
  (8000, "a commissioned sale into the wrong program"),
  (1000, "fees for free federal programs"),
  (8000, "income-share payments on low pay"),
  (200, "auto-renewal price hikes"),
  (8000, "federal protections over a private loan"),
  (3000, "a free certification"),
  (10000, "two years at community-college prices that transfer"),
 ],
}
for _d in DECK:
    assert len(DOLLARS[_d])==len(DECK[_d]), _d
    for _c,(_usd,_why) in zip(DECK[_d],DOLLARS[_d]):
        _c["dollars"]=_usd; _c["basis"]=_why

# RUSH — "sign now" deals: the pitch pushes a deadline that isn't real. On the website a clock
# counts down while you decide; Read 2 (amber, the clock) shows you the deadline is fake.
# At the table: count to 15 out loud, unless the reader has Read 2 there. (RULES.md: Sign-now clocks)
RUSH = ("Quick Cash", "Refund Advance", "Online Installment Loan", "Credit Builder", "Drive It Home Today",
        "No-Credit-Check Lease", "$50 to apply", "Standard lease, just sign here", "First month FREE",
        "Sign here to start Monday", "Please pay your balance today", "Get the dental work done now",
        "Enroll now", "Approved! A private loan", "Pay $0 now", "A counselor will help you apply today")
for _d in DECK:
    for _c in DECK[_d]:
        if _c["trap"] and _c["front"].startswith(RUSH): _c["rush"]=True
assert sum(c.get("rush",False) for v in DECK.values() for c in v)==len(RUSH)
