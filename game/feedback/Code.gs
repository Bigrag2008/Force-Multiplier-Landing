/**
 * The Second Number: receives players' end-of-game feedback into this Google Sheet.
 * Setup (about 5 minutes): game/FEEDBACK.md. Paste this whole file into Extensions → Apps Script, then Deploy.
 *
 * It also receives the Civic Armor hub's email list (hub/site.js): those go to a "Signups" tab, one row per email.
 *
 * Each answer becomes one row. Answers are checked and trimmed here too (anyone can post to a public web app),
 * and the same game answered twice replaces its row instead of adding a second one.
 */
const SHEET = "Feedback";
const HEAD = ["Received", "Game id", "Fun (1-4)", "Confusing", "Play again", "Note", "Mode", "Chapter", "Players",
              "Won", "Rounds", "Language", "Coach on", "Fooled by", "Edition"];
const CONFUSING = ["glasses", "choices", "lever", "machine", "underworld", "teaching", "nothing"];
const SIGNUPS = "Signups";
const SIGNUP_HEAD = ["Received", "Email", "Interested in", "Signed up on", "Language"];
const INTERESTS = ["guide", "course", "novel", "game", "groups"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const fb = JSON.parse(e.postData.contents);
    const f = fb.facts || {};
    const str = (x, n) => String(x == null ? "" : x).replace(/[\r\n\t]+/g, " ").slice(0, n);
    // a leading = + - @ would make the Sheet treat a player's note as a formula
    const safe = (x, n) => str(x, n).replace(/^[=+\-@]/, "'$&");
    if (fb.kind === "signup") return signup(fb, safe);
    const row = [
      new Date(),
      safe(fb.id, 40),
      Math.max(1, Math.min(4, Number(fb.fun) || 1)),
      (Array.isArray(fb.confusing) ? fb.confusing : []).filter((k) => CONFUSING.indexOf(k) >= 0).join(", "),
      ["yes", "maybe", "no"].indexOf(fb.again) >= 0 ? fb.again : "",
      safe(fb.note, 280),
      safe(f.mode, 20), safe(f.chapter, 30), Math.max(1, Math.min(5, Number(f.players) || 0)),
      f.won ? "won" : "lost", Math.max(0, Math.min(12, Number(f.rounds) || 0)),
      safe(f.lang, 5), f.coach ? "yes" : "no", safe(f.fooledBy, 120), safe(f.edition, 20),
    ];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) { sh.appendRow(HEAD); sh.setFrozenRows(1); }
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().map((r) => r[0]) : [];
    const at = ids.indexOf(row[1]);
    if (at >= 0) sh.getRange(at + 2, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("bad request");
  } finally {
    lock.releaseLock();
  }
}

/** the hub's email list: one row per email, signing up again updates it */
function signup(fb, safe) {
  const email = String(fb.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@=+\-][^\s@]*@[^\s@]+\.[^\s@]+$/.test(email)) return ContentService.createTextOutput("bad request");
  const row = [
    new Date(), email,
    (Array.isArray(fb.interests) ? fb.interests : []).filter((k) => INTERESTS.indexOf(k) >= 0).join(", "),
    safe(fb.page, 40), fb.lang === "es" ? "es" : "en",
  ];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SIGNUPS) || ss.insertSheet(SIGNUPS);
  if (sh.getLastRow() === 0) { sh.appendRow(SIGNUP_HEAD); sh.setFrozenRows(1); }
  const emails = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().map((r) => r[0]) : [];
  const at = emails.indexOf(email);
  if (at >= 0) sh.getRange(at + 2, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
  return ContentService.createTextOutput("ok");
}

/** open the web app's address in a browser to check it's live */
function doGet() {
  return ContentService.createTextOutput("The Second Number feedback is listening.");
}
