# Read the Machine: the content engine

Everything to promote Civic Armor, built from the game's own fact-checked cards, ready to schedule the day you go live.

| File | What it is |
|---|---|
| `library.csv` | **528 posts.** Each deal card as a feed post, a 30-second video script and a short post (X, Bluesky), in English and Spanish; the History deck; Long Ledger era cards; and evergreen posts for teachers, churches, the book and the guide. |
| `images/` | **176 pictures**, 1080×1350, one per deal card and history card, in English and Spanish. The `image` column says which one goes with which post. |
| `calendar.csv` | **The schedule:** 12 weeks, about 8 posts a week, each with its date, time, platforms, text, picture and video script. |
| `calendar.ics` | The same schedule for Google Calendar or your phone's calendar (File → Import), so each post shows up as a reminder with its text inside. |
| `emails/` | The welcome sequence (3 emails), the launch-day email, and the every-other-week newsletter template. |

## Go live in four steps
1. **Set the start date.** On the Monday you launch, run:
   `python3 scripts/make_content.py --start 2026-11-02 --weeks 12` (use your date).
   The themes follow the calendar, so a launch in May gets graduation and for-profit college posts, and September gets Labor Day and *The Third Option*.
2. **Open the accounts**, all with the same handle if you can get it (e.g. `@civicarmor` or `@getcivicarmor`): Instagram, TikTok, YouTube, Facebook page, Threads, LinkedIn page. Put **getcivicarmor.com/next** in every bio; it's the page with all three doors.
3. **Load the schedule into one scheduler.** Use **Metricool** (one free account schedules Instagram, Facebook, TikTok, YouTube, Threads, LinkedIn and Bluesky, and it bulk-uploads from a spreadsheet) or **Meta Business Suite** (free, Facebook and Instagram only, also bulk-uploads). Upload `calendar.csv`, map its columns (date, time, text, image) to theirs the first time, and attach the pictures. Check the free plan's current limits when you sign up; if it caps scheduled posts, load two weeks at a time.
4. **The email list:** import the Signups tab from your Google Sheet into **MailerLite** or **Buttondown** (both free to start, and they handle unsubscribes). Set `emails/01`, `02` and `03` as an automation (send on joining, day 3, day 7), and schedule `launch_announcement.md` for launch morning.

## When to post, and why
The default times are Eastern (Dayton) and are a starting point. After four weeks, move them to whatever your own numbers say.

- **Feed posts: Mon, Wed, Fri at 12:15.** Lunch break: working adults scrolling with a few free minutes.
- **Videos: Tue, Thu, Sat at 7:30 p.m.** The evening wind-down, when short video gets watched. Saturday's is in Spanish.
- **History: Sunday at 5 p.m.** Slower Sunday reading. It's the Long Ledger, every card true.
- **Teachers and groups: every other Sunday at 3 p.m.** Teachers, pastors and youth leaders plan their week on Sunday afternoon.
- **The email: every other Thursday at 10 a.m.**

**The money calendar.** Post about a trap the week people meet it. That's the edge this business has over every generic finance account:
- **Paydays (the 1st and 15th, or the Friday before when they fall on a weekend):** payday-loan and cash-advance cards, the morning the money lands.
- **Jan to Mar, tax season:** fast-refund loans, then the rent-to-own and buy-here-pay-here offers that follow the refund.
- **February and June (Juneteenth):** history months, Long Ledger posts on Wednesdays too.
- **April, Financial Literacy Month:** the month to pitch schools, libraries and credit unions.
- **May, graduation:** for-profit college cards, and Marcus's graduation day.
- **July, moving season:** housing.
- **August, back to school:** the teacher's guide.
- **September, Labor Day:** labor cards and *The Third Option*.
- **October and November, open enrollment, then Black Friday:** health, then rent-to-own and buy-now-pay-later.
- **December, holiday loans:** the January bill.

## The monthly routine (one afternoon a month)
1. **Film the month's videos in one sitting:** about 12, at 30 seconds each, from the scripts in `calendar.csv`. Phone, natural light, the card picture on screen or in your hand. The script is a guide, not lines to memorize: say it your way.
2. **Load the next four weeks** into the scheduler.
3. **Look at last month's numbers:** saves, shares, link clicks, sign-ups. Do more of whatever got saved and shared.
4. **Write the two newsletters** from the best posts.

## Rules that protect the brand
- **Every number comes from a card.** The cards are fact-checked, and their sources are in the `source` column. If you change a number, check it again.
- **Say "information, not legal or financial advice"** in your bio and on anything about someone's own job or case.
- **When people DM you their situation:** listen, point them to *The Third Option* and real help (legal aid, the EEOC, a credit union), and never tell them what their case is worth or whether they'll win.
- **Honest deals too.** Every other Friday is an honest-deal post. It's what makes the traps believable, and it's what the credit unions and CDFIs you want as partners need to see.

## Measuring what works (free)
In Cloudflare, open each Pages project → **Metrics → Web Analytics → Enable**. You'll see visits, the pages people land on and where they came from (Instagram, TikTok, Google), with no cookie banner needed.

## Making more
- New cards in the game become new posts: run `npm run content`, then `python3 scripts/make_content.py` and `python3 scripts/make_post_images.py`.
- A Your City edition (another city's deals) can become another city's content the same way.
