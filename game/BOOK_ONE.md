# THE SECOND NUMBER — the novel and the game

The game and the novel *The Second Number* (Book One) are built to the same rules. A reader who picks up the game already knows how the Sight works, and a player who picks up the book already knows what Marcus is looking at. This page is the map between them, a four-chapter campaign that follows Book One, and the School Edition.

## The Sight is the lens

| In the game | In the novel |
|---|---|
| **Read 1, the red layer:** the real cost | Red: the cost. Marcus sees the second number. |
| **Read 2, the amber layer:** the clock, the deadline, the rights window | Amber: the clock. The countdown Marcus sees over Dre (twenty-three down to eight). |
| **Read 3, the blue layer:** who's really behind it | Blue: who's behind it. Out of reach in Book One; the higher they sit, the less of them there is to see. |
| The Coach and the card text | The cold white voice of the Sight. |
| The Overlord's tell (RULES.md: *the stranger's handwriting*) | Another Reader nearby shows up as a stranger's handwriting: slanted, pressed too hard. |
| Read is per district | Dre reads one district: the corner. Outside it he can't read clear. |
| Teach, and call and response | The Chain: Marcus teaches one person, who teaches the next. |
| **The Terrell rule** (house rule) | Terrell saw the trap, confronted it with no one covering him, and paid for it. |
| ***Render?*** (house rule, Face tokens) | The Sight's one-word offer before it reads someone. Marcus learns to refuse it for the people he loves; at the table, letting a teammate read for you costs your Face. |
| The Commons covering a learner | Civic Armor: "Seeing ain't enough. You gotta cover people while they see." |
| Shady, and the Fall | The crown and the desk: every shortcut that looks like a blessing. |
| Expose; no single leader to arrest | The Empty Throne: no card table to shut down, no neck to fit a cuff or a crown to. |

## Campaign: *Book One* (four chapters, prototype)

Play these in order with the same table. Each chapter is a normal game with one setup change and one twist; the twists are **table rules for playtesting**, not yet in `sn_engine.py`. Write the result of each chapter on the back of the rulebook, because the next chapter reads it.

### Chapter 1: *The Chain*
*Graduation night. Marcus can see the second number, and he teaches it as fast as he can.*
- **Setup:** Block Party, with the **Terrell rule** on. No Veteran (no one in the book knows how to cover yet).
- **Twist, the Chain:** when a learner says the second number back (call and response), they may at once teach one more player in that district for free.
- **After:** if any player was burned by the Terrell rule, write *Terrell* in the ledger. If you won, unlock **Civic Armor**: from Chapter 2 on, every Teach comes with cover.

### Chapter 2: *The Net*
*A county job, a desk, a program that sounds like help.*
- **Setup:** Full Block, Owner **The Lobbyist**, with **fine-print dice** on (the terms keep changing on you).
- **Twist, the Desk:** at the start of round 2, one player may take the Desk. While at the Desk they get +1 Trust every round but cannot Face deals. They can leave the Desk on any turn, for good, by spending an action.
- **After:** if the player at the Desk left it, write *Quit the desk* in the ledger: in Chapter 3 that player starts with Read 1 everywhere.

### Chapter 3: *The Crown*
*Somebody offers Dre a way up out of the life that looks just like a blessing.*
- **Setup:** Overlord mode, with *the stranger's handwriting* in play. If *Terrell* is in the ledger, the block starts with 1 less Trust each.
- **Twist, the Crown:** once per game the Overlord may offer the Crown to one player. A crowned player can't Fall, but every other block player loses 1 Trust at the start of each round. The offered player may refuse; if they do, the Overlord takes one extra move that round.
- **After:** write down whether anyone wore the Crown.

### Chapter 4: *The Empty Throne*
*No card table to shut down. No leader to arrest.*
- **Setup:** Full Block with **endless deals**. If anyone wore the Crown in Chapter 3, the Machine strikes once more in round 1.
- **Twist, no neck for a crown:** you can't Expose until every player has Taught at least once, and no player may hold more than half of the table's total Props when you do.
- **After:** the book's last scene is on a porch. If you won, read it aloud.

## The School Edition

For classrooms and youth programs: the game, the math and the novel's opening, in one package.
- **The game:** the Block Party (25 minutes, fits a class period) with **endless deals** and the **math variant**: students work out every second number before the red layer opens. On the website: Play → Block Party → House rules → Endless deals → Work it out. Or use the **Endless deals** page for warm-ups, no game needed.
- **The teacher's view (built):** at the end of each game a table copies its result code (end screen → *Send this game to your teacher*); the teacher pastes the codes into the website's **Teacher's view**. It shows the class's dollar count, the deals that fooled the most tables (with a talk-it-through prompt for the top one), how fast they decided under sign-now clocks, average Read at the end, and every game in a table, with a CSV download for a gradebook. No accounts and no upload: codes hold only the first names students typed.
- **The teacher's guide (built):** two pages for the one-period lesson: learning goals, what to check before class, a 50-minute plan (warm-up deal, Block Party, dollar count, debrief), seven discussion questions led by *"What would you have to know to see this coming?"*, and a worked answer key. On the website at `/teacher/guide` (prints on Letter or A4) and as [`The_Second_Number_TEACHER_GUIDE.pdf`](The_Second_Number_TEACHER_GUIDE.pdf). Still to write: the week-long version, one lesson per district with three deals each.
- **The novel:** Book One's opening chapters as the reading assignment: graduation night and Marcus's first second number. Students play the Block Party the same week, so the lens on the table and the Sight on the page explain each other.
- **Assessment:** the playtest log's last question, *"Name one real deal from your own life you'd now read differently,"* as a short written reflection.
