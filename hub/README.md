# The Civic Armor hub (getcivicarmor.com)

Plain HTML, CSS and a little JavaScript: no build step, nothing to install. It's the front door for everything:

| Address | Page |
|---|---|
| `/` | Civic Armor: the three doors, who's behind it, groups, the email list |
| `/third-option/` | *The Third Option*, the guide, and the course |
| `/book/` | *The Second Number*, Book One, the novel |
| `/next/` | Where the card in the game box points (its QR code). English and Spanish. **Keep this address forever**; change where its doors go instead. |
| `/play`, `/juega` (the game in Spanish), `/game`, `/teachers`, `/guide`, `/novel`, `/es` | Short addresses for flyers and the backs of the books ([`_redirects`](_redirects)) |

The game itself lives at **play.getcivicarmor.com** (the rest of this repo; see the main README).

## The one file to edit: `config.js`
When a link goes live, paste it in and push. A link left `""` makes its button say *Coming soon* and point at the email list instead, so nothing is ever a dead end.

- `guideBuyUrl`: where to buy *The Third Option*
- `novelBuyUrl`: where to buy *The Second Number*, Book One
- `courseUrl`: the course, or its free taster lesson
- `signupUrl`: the Google Apps Script address that writes sign-ups to your Sheet (below)
- `playUrl`, `email`: the game's address and the contact email

## Put it online (Cloudflare Pages, free)
1. **Workers & Pages → Create → Pages → Connect to Git**, pick **The-Second-Number** (yes, the same repo as the game; this is a second project).
2. Project name `civic-armor`. Framework preset **None**. Build command: leave empty. **Build output directory: `hub`**.
3. **Save and Deploy**, then **Custom domains → Set up a domain →** `getcivicarmor.com`, and again for `www.getcivicarmor.com`.

## The email list
Until `signupUrl` is set, **Add me** opens the visitor's email app with a message to `hello@getcivicarmor.com`, so no sign-up is lost on day one.

To collect them in a Sheet instead, use the game's feedback script ([`game/feedback/Code.gs`](../game/feedback/Code.gs), set up in [`game/FEEDBACK.md`](../game/FEEDBACK.md)); it takes both. Put its `/exec` address in `signupUrl`. If you deployed that script before this list existed, paste the new `Code.gs` in and choose **Deploy → Manage deployments → Edit → Version: New version**, so the address stays the same.

Sign-ups land on a **Signups** tab: date, email, what they're interested in, which page, language. Those are people's emails: keep the Sheet private. When it's time to send, export the tab to CSV and import it into a mail service (Buttondown, MailerLite and Kit all have free tiers) that handles unsubscribes for you.

## Trying it on your own computer
`npx serve hub` (or `python3 -m http.server -d hub`) and open the address it prints. The short addresses in `_redirects` only work once it's on Cloudflare.
