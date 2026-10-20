import Link from "next/link";
import { K } from "@/engine/content";
import { PrintButton } from "./PrintButton";

export const metadata = {
  title: "Teacher's guide — The Second Number",
  description: "One class period with The Second Number: learning goals, a 50-minute plan, and questions for after the game.",
};

/**
 * The teacher's guide: the two pages a school asks for before it says yes. It prints on two Letter or
 * A4 sheets (globals.css, the .sheet print rules); the PDF in game/ is printed from this page.
 */
export default function TeacherGuide() {
  return (
    <main className="px-4 py-8 print:p-0">
      <nav className="no-print mx-auto mb-4 flex max-w-[52rem] flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/teacher" className="text-gold underline">← Teacher&apos;s view</Link>
        <span className="flex flex-wrap items-center gap-3">
          <a href="/The_Second_Number_TEACHER_GUIDE.pdf" className="text-gold underline">Download the PDF</a>
          <PrintButton />
        </span>
      </nav>

      <article className="sheet mx-auto max-w-[52rem] rounded-xl bg-white px-8 py-8 text-[15px] leading-relaxed text-ink shadow-2xl sm:px-12">
        <header className="border-b-4 border-[#1B1530] pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b4a14]">Teacher&apos;s guide · one class period</p>
          <h1 className="mt-1 text-3xl font-black text-[#1B1530]">The Second Number</h1>
          <p className="mt-1">
            A cooperative game about the hidden cost in every deal: the payday loan, the rent-to-own couch, the &ldquo;free&rdquo; first month.
            Students work as one block against the Machine, read the fine print together, and learn to spot the second number before they sign.
          </p>
          <p className="mt-2 text-sm">
            <b>Ages</b> 12+ · <b>Players</b> 2–5 per table · <b>Time</b> one 50-minute period · <b>Needs</b> one device per table (laptop,
            tablet or Chromebook), or the free print-and-play kit · <b>Cost</b> free, no accounts
          </p>
        </header>

        <section>
          <h2>Learning goals</h2>
          <p className="text-sm">By the end of the period, students can:</p>
          <ol className="list-decimal pl-6">
            <li><b>Find the total cost</b> of an offer from its fee and its term, and turn a flat fee into a yearly rate (APR).</li>
            <li><b>Name the three places a trap hides:</b> the cost (red), the terms and the clock (amber), and who profits behind it (blue).</li>
            <li><b>Spot pressure:</b> a deadline that is fake (&ldquo;Approved!&rdquo;, &ldquo;Move in today&rdquo;) is part of the sale, not a reason to sign.</li>
            <li><b>Tell a trap from real help,</b> and name the honest options: a credit-union loan, free tax prep (VITA), federal student aid, a community college with guaranteed transfer.</li>
            <li><b>Explain why it takes a community:</b> the block only wins when everyone can read, not one strong reader.</li>
          </ol>
          <p className="mt-1 text-sm">
            Fits the <i>Managing Credit</i> and <i>Spending</i> areas of the National Standards for Personal Financial Education, and works in math
            (rates, percents, totals), economics, and civics.
          </p>
        </section>

        <section>
          <h2>Before class (10 minutes, once)</h2>
          <ul className="list-disc pl-6">
            <li>Open the site on a school device and play a few turns of <b>Learn to play</b>. It runs in the browser; nothing to install.</li>
            <li>Groups of 3 are best (2–5 work). One device per group, passed around the table. <i>Play on everyone&apos;s phones</i> is optional; some school networks block it, and one device always works.</li>
            <li>No devices? Print the <a href="/The_Second_Number_PRINT_AND_PLAY.pdf" className="font-bold underline">print-and-play kit</a> (the cards, board and rules on paper).</li>
            <li>Built for every student: keyboard-only play, screen-reader support, <b>Plain cards</b> for anyone the red lens doesn&apos;t work for, color-blind-safe districts, and 🔊 to mute.</li>
          </ul>
        </section>

        <section>
          <h2>The 50-minute plan</h2>
          <table className="plan">
            <tbody>
              <tr>
                <th>0–5</th>
                <td>
                  <b>Warm-up: one deal.</b> Open <b>Endless deals</b> on the projector and read one offer aloud. Ask: <i>&ldquo;What does this really cost?&rdquo;</i> Take three guesses, then reveal the second number.
                </td>
              </tr>
              <tr>
                <th>5–8</th>
                <td>
                  <b>Set the tables.</b> Each group chooses <b>Learn to play</b>: a 30-second comic, then the Coach explains each rule as it comes up. Groups that aren&apos;t three choose
                  <b> Play now → Block Party</b> with <b>Coach me as we play</b> on.
                </td>
              </tr>
              <tr>
                <th>8–33</th>
                <td>
                  <b>Play the Block Party</b> (3 districts: Lending, Housing, Education; {K.BP_ROUNDS} rounds; about 25 minutes). The block wins by waking {K.BP_WAKE_TO_WIN} districts before the Machine
                  captures 2. Walk the room. Listen for students reading the cost aloud to each other: that is the lesson working.
                </td>
              </tr>
              <tr>
                <th>33–38</th>
                <td>
                  <b>The dollar count.</b> Win or lose, the end screen turns the game into real money: what the table signed, what it walked away from, what it stayed out of.
                  Each table opens <b>Send this game to your teacher</b> and copies its result code to you (a chat, a form, or the board).
                </td>
              </tr>
              <tr>
                <th>38–50</th>
                <td>
                  <b>Debrief.</b> Paste the codes into the <b>Teacher&apos;s view</b> on your device. It adds up the class, shows the deals that fooled the most tables, and opens a
                  <i> Talk it through</i> for the top one. Use the questions on the next page.
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1 text-sm">
            <b>Exit ticket / homework:</b> bring one real offer from home (a phone plan, a store card, a rent-to-own receipt) and work out its second number on the <b>Read your own deal</b> page. Nothing typed there leaves the device.
          </p>
        </section>

        <section className="page-break">
          <h2>How the game teaches it</h2>
          <dl className="words">
            <div><dt>Every deal has a front,</dt><dd>the pitch everyone sees, and three hidden layers. Students unlock them by building <b>Read</b>, and drag Grandma&apos;s red reading glasses over the card to see them.</dd></div>
            <div><dt>Red: the cost.</dt><dd>&ldquo;Quick Cash: $375 today, one flat fee of $56.25.&rdquo; Under the glasses: that fee is a 391% APR.</dd></div>
            <div><dt>Amber: the clock.</dt><dd>Due in full in 14 days; can&apos;t pay, and you roll it over and owe the fee again. Sign-now deals run a countdown on screen. <b>The deadline is always fake</b>: when it runs out, nothing happens.</dd></div>
            <div><dt>Blue: the connection.</dt><dd>The storefront and the debt buyer that hounds you later share one owner. Every trap is part of one Machine.</dd></div>
            <div><dt>The shortcut.</dt><dd>Signing a trap fixes a problem now and leaves a mark on you (<b>Shady</b>). Students feel why people sign: it works, for a while.</dd></div>
            <div><dt>Teaching.</dt><dd>A player can teach another to read a district (call and response: read the second number aloud, have them say it back). The block can&apos;t win on one reader.</dd></div>
          </dl>
        </section>

        <section>
          <h2>Questions for after the game</h2>
          <ol className="list-decimal space-y-1 pl-6">
            <li><b>What would you have to know to see this coming?</b> Pick the deal that fooled your table. What one fact would have changed your move?</li>
            <li><b>Which layer got you:</b> the cost, the clock, or who was behind it? Which is hardest to see in real life, and why?</li>
            <li><b>The countdown was always fake.</b> Where have you seen a fake deadline outside the game? What does a seller gain by rushing you?</li>
            <li><b>Why would someone sign a trap they know is a trap?</b> (In the game, shortcuts worked for a while.) What would they need instead? No wrong answers: this is about choices under pressure, not blame.</li>
            <li><b>Which honest deal surprised you?</b> Where could someone in our town find a credit union, free tax prep, or a sliding-scale clinic?</li>
            <li><b>Your block only won by teaching.</b> Who taught you to read a bill or a contract? Who could you teach this week?</li>
            <li><b>The Machine.</b> The blue layers showed traps sharing owners. Is that true in our town? How could you find out?</li>
          </ol>
        </section>

        <section>
          <h2>Quick math (answer key)</h2>
          <ul className="list-disc pl-6 text-[14px]">
            <li><b>Payday loan.</b> $56.25 on $375 for 14 days = 15% every two weeks. 15% × about 26 two-week periods = <b>391% a year</b>. The typical borrower rolls over 8 times: 8 × $56 = <b>$448 in fees</b> on a $375 loan.</li>
            <li><b>Rent-to-own.</b> $20 a week × 78 weeks = <b>$1,560</b> for a couch that retails around $500, about 3× the price.</li>
            <li><b>Overdraft.</b> A $4 coffee plus a ~$35 fee = <b>$39</b>: an extra 875%, from one swipe.</li>
          </ul>
          <p className="mt-1 text-sm">For more, turn on <b>House rules → Endless deals → Work it out</b>: students calculate every second number before the red layer opens.</p>
        </section>

        <section>
          <h2>Going further</h2>
          <ul className="list-disc pl-6 text-[14px]">
            <li><b>A week of it:</b> one day per district (Lending, Housing, Education), each opening with three Endless deals and closing with question 1.</li>
            <li><b>Your City edition:</b> put your own neighborhoods, gathering places and real local help on the board, in the browser, with no code.</li>
            <li><b>The novel:</b> <i>The Second Number</i> (Book One) is built on the same rules. Assign its opening chapters the same week; the lens on the table and the Sight on the page explain each other.</li>
            <li><b>Privacy:</b> no accounts and nothing uploaded. Result codes hold only the first names students type and how the game went, and the Teacher&apos;s view keeps them in your browser.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}
