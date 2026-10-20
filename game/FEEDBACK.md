# Hearing from players

At the end of every game, the website asks **How did it go?**: was it fun (😐 🙂 😄 🔥), was anything confusing (one-tap chips: the glasses, TAKE / WALK / NEGOTIATE, the lever, the Machine, the Underworld, teaching, or nothing), would you play again, and one optional sentence. It's optional and asks for no names. The game adds its own facts: mode, chapter, number of players, won or lost, rounds, language, whether the Coach was on, the deal that fooled the table most, and whether it was West Dayton or a home-made edition (never that edition's name).

The answers go to **a Google Sheet you own**. Until you connect one, nothing leaves anyone's device: answers are saved there, and a tester can copy them out from the thank-you message.

## Connect your Sheet (about 5 minutes)
1. In Google Drive, make a new **Google Sheet**. Name it something like *Second Number feedback*.
2. In the Sheet: **Extensions → Apps Script**. Delete what's there, paste in all of [`feedback/Code.gs`](feedback/Code.gs), and press **Save**.
3. **Deploy → New deployment**. Click the gear next to *Select type* and choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Press **Deploy**, and allow access when Google asks (it's your own script, writing to your own Sheet).
4. Copy the **Web app URL** (it ends in `/exec`). Open it in a browser once: it should say *The Second Number feedback is listening.*
5. In **Vercel → your project → Settings → Environment Variables**, add `NEXT_PUBLIC_FEEDBACK_URL` with that URL, then **Redeploy** (the address is built into the site). Running it yourself: put `NEXT_PUBLIC_FEEDBACK_URL=…` in a `.env.local` file next to `package.json` and rebuild.

Play a game to the end and send an answer: a **Feedback** tab appears in the Sheet with one row per game. The same game answered twice replaces its row.

## Reading it
- **Fun** and **Play again** by **Mode**, **Players** and **Chapter**: where the game is landing and where it isn't.
- **Confusing**: which rule to explain better (in the Coach, the rulebook or the comic).
- **Fooled by**: the deals that beat people most often; they're the best ones for the teacher's guide and for promotion.
- **Note**: read them all. (A note starting with = or + is stored as plain text, never run as a formula.)

## Privacy
No names, no accounts, no device IDs, no location. A home-made edition is recorded only as "your-city". Anyone who knows the web app address could post a row, so treat the Sheet as player feedback, not as a record of games.
