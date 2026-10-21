"use client";
import Link from "next/link";
import { K } from "@/engine/content";
import { t, useLang } from "@/i18n";
import { rich } from "../../_i18n/rich";
import { PrintButton } from "./PrintButton";

/** a sentence with <b>/<i> kept inside it, in the current language */
const r = (en: string, vars?: Record<string, string | number>) => rich(t(en, vars));

/**
 * The teacher's guide: the two pages a school asks for before it says yes. It prints on two Letter or
 * A4 sheets (globals.css, the .sheet print rules), in either language; the PDFs in game/ are printed from this page, one per language.
 */
export function Guide() {
  const lang = useLang();
  // each language prints its own PDFs (the build copies game/*.pdf into the site)
  const es = lang === "es" ? "_ES" : "";
  return (
    <main className="px-4 py-8 print:p-0">
      <nav className="no-print mx-auto mb-4 flex max-w-[52rem] flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/teacher" className="text-gold underline">{t("← Teacher's view")}</Link>
        <span className="flex flex-wrap items-center gap-3">
          <a href={`/The_Second_Number_TEACHER_GUIDE${es}.pdf`} className="text-gold underline">{t("Download the PDF")}</a>
          <PrintButton />
        </span>
      </nav>

      <article className="sheet mx-auto max-w-[52rem] rounded-xl bg-white px-8 py-8 text-[15px] leading-relaxed text-ink shadow-2xl sm:px-12">
        <header className="border-b-4 border-[#1B1530] pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b4a14]">{t("Teacher's guide · one class period")}</p>
          <h1 className="mt-1 text-3xl font-black text-[#1B1530]">{t("The Second Number")}</h1>
          <p className="mt-1">
            {t("A cooperative game about the hidden cost in every deal: the payday loan, the rent-to-own couch, the “free” first month. Students work as one block against the Machine, read the fine print together, and learn to spot the second number before they sign.")}
          </p>
          <p className="mt-2 text-sm">
            {r("<b>Ages</b> 12+ · <b>Players</b> 2–5 per table · <b>Time</b> one 50-minute period · <b>Needs</b> one device per table (laptop, tablet or Chromebook), or the free print-and-play kit · <b>Cost</b> free, no accounts")}
          </p>
        </header>

        <section>
          <h2>{t("Learning goals")}</h2>
          <p className="text-sm">{t("By the end of the period, students can:")}</p>
          <ol className="list-decimal pl-6">
            <li>{r("<b>Find the total cost</b> of an offer from its fee and its term, and turn a flat fee into a yearly rate (APR).")}</li>
            <li>{r("<b>Name the three places a trap hides:</b> the cost (red), the terms and the clock (amber), and who profits behind it (blue).")}</li>
            <li>{r("<b>Spot pressure:</b> a deadline that is fake (“Approved!”, “Move in today”) is part of the sale, not a reason to sign.")}</li>
            <li>{r("<b>Tell a trap from real help,</b> and name the honest options: a credit-union loan, free tax prep (VITA), federal student aid, a community college with guaranteed transfer.")}</li>
            <li>{r("<b>Explain why it takes a community:</b> the block only wins when everyone can read, not one strong reader.")}</li>
          </ol>
          <p className="mt-1 text-sm">
            {r("Fits the <i>Managing Credit</i> and <i>Spending</i> areas of the National Standards for Personal Financial Education, and works in math (rates, percents, totals), economics, and civics.")}
          </p>
        </section>

        <section>
          <h2>{t("Before class (10 minutes, once)")}</h2>
          <ul className="list-disc pl-6">
            <li>{r("Open the site on a school device and play a few turns of <b>Learn to play</b>. It runs in the browser; nothing to install.")}</li>
            <li>{r("Groups of 3 are best (2–5 work). One device per group, passed around the table. <i>Play on everyone's phones</i> is optional; some school networks block it, and one device always works.")}</li>
            <li>
              {rich(t("No devices? Print the <a>print-and-play kit</a> (the cards, board and rules on paper)."), {
                a: (c) => <a href={`/The_Second_Number_PRINT_AND_PLAY${es}.pdf`} className="font-bold underline">{c}</a>,
              })}
            </li>
            <li>{r("Built for every student: keyboard-only play, screen-reader support, <b>Plain cards</b> for anyone the red lens doesn't work for, color-blind-safe districts, and 🔊 to mute.")}</li>
          </ul>
        </section>

        <section>
          <h2>{t("The 50-minute plan")}</h2>
          <table className="plan">
            <tbody>
              <tr>
                <th>0–5</th>
                <td>{r("<b>Warm-up: one deal.</b> Open <b>Endless deals</b> on the projector and read one offer aloud. Ask: <i>“What does this really cost?”</i> Take three guesses, then reveal the second number.")}</td>
              </tr>
              <tr>
                <th>5–8</th>
                <td>{r("<b>Set the tables.</b> Each group chooses <b>Learn to play</b>: a 30-second comic, then the Coach explains each rule as it comes up. Groups that aren't three choose <b>Play now → Block Party</b> with <b>Coach me as we play</b> on.")}</td>
              </tr>
              <tr>
                <th>8–33</th>
                <td>
                  {r("<b>Play the Block Party</b> (3 districts: Lending, Housing, Education; {rounds} rounds; about 25 minutes). The block wins by waking {wake} districts before the Machine captures 2. Walk the room. Listen for students reading the cost aloud to each other: that is the lesson working.", { rounds: K.BP_ROUNDS, wake: K.BP_WAKE_TO_WIN })}
                </td>
              </tr>
              <tr>
                <th>33–38</th>
                <td>{r("<b>The dollar count.</b> Win or lose, the end screen turns the game into real money: what the table signed, what it walked away from, what it stayed out of. Each table opens <b>Send this game to your teacher</b> and copies its result code to you (a chat, a form, or the board).")}</td>
              </tr>
              <tr>
                <th>38–50</th>
                <td>{r("<b>Debrief.</b> Paste the codes into the <b>Teacher's view</b> on your device. It adds up the class, shows the deals that fooled the most tables, and opens a <i>Talk it through</i> for the top one. Use the questions on the next page.")}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1 text-sm">
            {r("<b>Exit ticket / homework:</b> bring one real offer from home (a phone plan, a store card, a rent-to-own receipt) and work out its second number on the <b>Read your own deal</b> page. Nothing typed there leaves the device.")}
          </p>
        </section>

        <section className="page-break">
          <h2>{t("How the game teaches it")}</h2>
          <dl className="words">
            <div><dt>{t("Every deal has a front,")}</dt><dd>{r("the pitch everyone sees, and three hidden layers. Students unlock them by building <b>Read</b>, and drag Grandma's red reading glasses over the card to see them.")}</dd></div>
            <div><dt>{t("Red: the cost.")}</dt><dd>{t("“Quick Cash: $375 today, one flat fee of $56.25.” Under the glasses: that fee is a 391% APR.")}</dd></div>
            <div><dt>{t("Amber: the clock.")}</dt><dd>{r("Due in full in 14 days; can't pay, and you roll it over and owe the fee again. Sign-now deals run a countdown on screen. <b>The deadline is always fake</b>: when it runs out, nothing happens.")}</dd></div>
            <div><dt>{t("Blue: the connection.")}</dt><dd>{t("The storefront and the debt buyer that hounds you later share one owner. Every trap is part of one Machine.")}</dd></div>
            <div><dt>{t("The shortcut.")}</dt><dd>{r("Signing a trap fixes a problem now and leaves a mark on you (<b>Shady</b>). Students feel why people sign: it works, for a while.")}</dd></div>
            <div><dt>{t("Teaching.")}</dt><dd>{t("A player can teach another to read a district (call and response: read the second number aloud, have them say it back). The block can't win on one reader.")}</dd></div>
          </dl>
        </section>

        <section>
          <h2>{t("Questions for after the game")}</h2>
          <ol className="list-decimal space-y-1 pl-6">
            <li>{r("<b>What would you have to know to see this coming?</b> Pick the deal that fooled your table. What one fact would have changed your move?")}</li>
            <li>{r("<b>Which layer got you:</b> the cost, the clock, or who was behind it? Which is hardest to see in real life, and why?")}</li>
            <li>{r("<b>The countdown was always fake.</b> Where have you seen a fake deadline outside the game? What does a seller gain by rushing you?")}</li>
            <li>{r("<b>Why would someone sign a trap they know is a trap?</b> (In the game, shortcuts worked for a while.) What would they need instead? No wrong answers: this is about choices under pressure, not blame.")}</li>
            <li>{r("<b>Which honest deal surprised you?</b> Where could someone in our town find a credit union, free tax prep, or a sliding-scale clinic?")}</li>
            <li>{r("<b>Your block only won by teaching.</b> Who taught you to read a bill or a contract? Who could you teach this week?")}</li>
            <li>{r("<b>The Machine.</b> The blue layers showed traps sharing owners. Is that true in our town? How could you find out?")}</li>
          </ol>
        </section>

        <section>
          <h2>{t("Quick math (answer key)")}</h2>
          <ul className="list-disc pl-6 text-[14px]">
            <li>{r("<b>Payday loan.</b> $56.25 on $375 for 14 days = 15% every two weeks. 15% × about 26 two-week periods = <b>391% a year</b>. The typical borrower pays that fee 8 times: 8 × $56.25 = <b>$450 in fees</b> on a $375 loan.")}</li>
            <li>{r("<b>Rent-to-own.</b> $20 a week × 78 weeks = <b>$1,560</b> for a couch that retails around $500, about 3× the price.")}</li>
            <li>{r("<b>Overdraft.</b> A $4 coffee plus a ~$35 fee = <b>$39</b>: an extra 875%, from one swipe.")}</li>
          </ul>
          <p className="mt-1 text-sm">{r("For more, turn on <b>House rules → Endless deals → Work it out</b>: students calculate every second number before the red layer opens.")}</p>
        </section>

        <section>
          <h2>{t("Going further")}</h2>
          <ul className="list-disc pl-6 text-[14px]">
            <li>{r("<b>A week of it:</b> one day per district (Lending, Housing, Education), each opening with three Endless deals and closing with question 1.")}</li>
            <li>{r("<b>Your City edition:</b> put your own neighborhoods, gathering places and real local help on the board, in the browser, with no code.")}</li>
            <li>{r("<b>The novel:</b> <i>The Second Number</i> (Book One) is built on the same rules. Assign its opening chapters the same week; the lens on the table and the Sight on the page explain each other.")}</li>
            <li>{r("<b>Privacy:</b> no accounts and nothing uploaded. Result codes hold only the first names students type and how the game went, and the Teacher's view keeps them in your browser.")}</li>
          </ul>
        </section>
      </article>
    </main>
  );
}
