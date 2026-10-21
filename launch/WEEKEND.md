# Launch weekend: getcivicarmor.com

Everything in this repo is already built. This list is the buying, clicking and pasting. Go top to bottom; each step says how long it takes.

## Before Friday
- [ ] **Merge this work into `main`.** The sites deploy from `main`.

## Friday night (about an hour)
- [ ] **Buy getcivicarmor.com** (about $11 a year). Turn on auto-renew and WHOIS privacy. *(10 min)*
- [ ] **Trademark search.** At [tmsearch.uspto.gov](https://tmsearch.uspto.gov), search "Civic Armor". You're looking for a live registration covering books, games or education (classes 9, 16, 28, 41). None found: you're clear to brand on it. Something found: stop and ask before printing anything. *(10 min)*
- [ ] **Free Cloudflare account**, then **Add a site → getcivicarmor.com → Free plan**. Cloudflare gives you two nameservers: paste them into your registrar's nameserver setting. It can take up to a few hours to switch over. *(15 min)*
- [ ] **Email:** in Cloudflare, **Email → Email Routing →** forward `hello@getcivicarmor.com` to your Gmail. *(5 min)*

## Saturday morning: the game goes live at play.getcivicarmor.com
Follow **Put it online** in the main [README](../README.md#put-it-online). In short:
- [ ] Cloudflare **Workers & Pages → Create → Pages → Connect to Git →** The-Second-Number.
- [ ] Build command `npm run build:static`, output directory `out`, variable `SITE_URL` = `https://play.getcivicarmor.com`.
- [ ] **Custom domains →** `play.getcivicarmor.com`.
- [ ] Check: the site opens, a game plays to the end, and the print-and-play PDF downloads. *(Saturday morning total: about 30 min)*

## Saturday afternoon: the hub goes live at getcivicarmor.com
Follow [hub/README.md](../hub/README.md). In short:
- [ ] A **second** Cloudflare Pages project from the same repo: no build command, output directory `hub`.
- [ ] **Custom domains →** `getcivicarmor.com` and `www.getcivicarmor.com`.
- [ ] Check every short address: `/play`, `/juega`, `/guide`, `/book`, `/course`, `/next`. *(30 min)*

## Saturday: the Sheet (optional but worth it, 15 min)
- [ ] Make a Google Sheet, paste in `game/feedback/Code.gs`, and deploy it ([game/FEEDBACK.md](../game/FEEDBACK.md)).
- [ ] Put its `/exec` address in **two** places:
  - `NEXT_PUBLIC_FEEDBACK_URL` on the game's Cloudflare project (then **Retry deployment**);
  - `signupUrl` in `hub/config.js` (then push).
- [ ] Sign yourself up on the hub, and play one game to the end and answer the card. Check that a **Signups** row and a **Feedback** row both appear.

## Sunday: the books
Open [Back_Matter_Pages.docx](Back_Matter_Pages.docx); every page says where it goes.
- [ ] ***The Third Option:***
  - fix the publisher name on the copyright page;
  - **remove the PENDING ATTORNEY note** (or have it written);
  - add the course link to *The Next Step*;
  - add the *If you want the story* page.
- [ ] ***The Second Number*, Book One:** add *Civic Armor is real* and *About the author* after the reading list.
- [ ] Publish or update both books wherever you sell them (KDP, Gumroad, etc.).
- [ ] Paste the store links into `hub/config.js` (`guideBuyUrl`, `novelBuyUrl`) and push. Until then, the buttons say *Coming soon* and collect emails instead.

## Print
- [ ] `game/The_Second_Number_WHERE_NEXT.pdf`: the card for every box or game night. Print double-sided, flip on the long edge, cut on the marks. Scan the QR with your phone first to check it.

## Not this weekend
- Renaming the LLC itself. "Force Multiplier HQ LLC dba Civic Armor" already lets you do everything as Civic Armor; just make sure the dba is on file with the state.
- civicarmor.com. If it ever gets cheaper, point it at the same Cloudflare project; nothing printed has to change.
- A separate game domain. Buy one only if schools ask for a shorter address; it would point at `play.`.

## Every link in one place
| What | Where it's set |
|---|---|
| The game's links out (novel, guide, list) | `src/links.ts` (or the `NEXT_PUBLIC_HUB_URL` variable) |
| Buy links, course, sign-up Sheet | `hub/config.js` |
| Short addresses | `hub/_redirects` |
| QR codes | `game/print_kit/build_where_next.py` (images in `launch/qr/`) |
