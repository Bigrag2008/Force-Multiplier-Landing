#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
"Read the Machine": the game's own cards, turned into posts, video scripts and a schedule.

Every deal card is a fact-checked trap (or an honest deal) with its three layers already written, so each one
becomes a feed post, a 30-second video script and a short post, in English and Spanish. The history cards become
Sunday history posts. Then a calendar lays them out on the money calendar: paydays, tax season, back-to-school.

  python3 scripts/make_content.py                         # 12 weeks from the next Monday
  python3 scripts/make_content.py --start 2026-11-02 --weeks 16

Writes launch/content/: library.csv (every post), calendar.csv (the schedule, for a scheduler's bulk upload),
calendar.ics (the same schedule for Google Calendar or your phone). See launch/content/README.md.
"""
import argparse, csv, datetime as dt, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "launch", "content")
C = json.load(open(os.path.join(ROOT, "src", "content", "content.json"), encoding="utf-8"))
ES = json.load(open(os.path.join(ROOT, "src", "content", "es.json"), encoding="utf-8"))
TZ = "America/New_York"  # Dayton
# where each estimated number comes from (game/NUMBER_SOURCES.json); "unsupported" cards stay out of posts and reels
SOURCES = json.load(open(os.path.join(ROOT, "game", "NUMBER_SOURCES.json"), encoding="utf-8"))
UNSUPPORTED = {cid for cid, x in SOURCES.items() if x["status"] == "unsupported"}

HUB = "getcivicarmor.com"
LINK = {"play": f"{HUB}/play", "juega": f"{HUB}/juega", "guide": f"{HUB}/guide", "book": f"{HUB}/book", "list": HUB}
DISTRICT = {"LENDING": "Lending", "HOUSING": "Housing", "LABOR": "Labor", "HEALTH": "Health", "EDUCATION": "Education"}
DISTRICT_ES = {"LENDING": "Préstamos", "HOUSING": "Vivienda", "LABOR": "Trabajo", "HEALTH": "Salud", "EDUCATION": "Educación"}
TAGS = "#ReadTheMachine #CivicArmor #TheSecondNumber"
TAGS_ES = "#LeeLaMáquina #CivicArmor #TheSecondNumber"
NOT_ADVICE = "Information, not legal or financial advice."
NOT_ADVICE_ES = "Información, no asesoría legal ni financiera."


def es(s):
    return ES.get(s, "")


def money(n):
    return f"${n:,.0f}"


def cta(d, lang):
    if lang == "es":
        return f"Lee tratos como este en el juego gratis: {LINK['juega']}"
    if d == "LABOR":
        return f"Is this happening at your job? The Third Option shows you how to document it: {LINK['guide']}"
    return f"Read deals like this in the free game: {LINK['play']}"


def short(text, limit=280):
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


# ------------------------------------------------------------------ the posts
def deal_posts():
    """every deal card in the base game: a feed post, a video script and a short post, in English and Spanish"""
    out = []
    for d, cards in C["deck"].items():
        for i, card in enumerate(cards):
            cid = f"{d[:3]}{i + 1:02d}"
            trap = card.get("trap", True)
            if cid in UNSUPPORTED:
                continue  # no credible source for its number yet
            for lang in ("en", "es"):
                f, r, a, b = (card["front"], card["red"], card["amber"], card["blue"]) if lang == "en" else \
                             (es(card["front"]), es(card["red"]), es(card["amber"]), es(card["blue"]))
                if lang == "es" and not all((f, r, a, b)):
                    continue
                dn = DISTRICT[d] if lang == "en" else DISTRICT_ES[d]
                over = ""
                if trap and card.get("dollars"):
                    over = (f"The second number: {money(card['dollars'])}. That's {card['basis']}." if lang == "en"
                            else f"El segundo número: {money(card['dollars'])}. Es {es(card['basis'])}.")
                if trap:
                    feed = (f"THE OFFER: “{f}”\n\n"
                            f"🔴 {'The cost' if lang == 'en' else 'El costo'}: {r}\n"
                            f"🟡 {'The clock' if lang == 'en' else 'El reloj'}: {a}\n"
                            f"🔵 {'The connection' if lang == 'en' else 'La conexión'}: {b}\n\n"
                            + (over + "\n" if over else "")
                            + ("Read the machine. Don't become it.\n" if lang == "en" else "Lee la máquina. No te conviertas en ella.\n")
                            + cta(d, lang) + "\n\n" + (TAGS if lang == "en" else TAGS_ES))
                    hook = (f"Somebody's offering you this: “{f}”" if lang == "en" else f"Alguien te ofrece esto: “{f}”")
                    script = "\n".join([
                        f"[0–3s HOOK, card on screen] {hook}",
                        f"[3–10s RED] {'Put on the red glasses. ' if lang == 'en' else 'Ponte los lentes rojos. '}{r}",
                        f"[10–16s AMBER] {'Now the amber ones: how fast do they want you to sign? ' if lang == 'en' else 'Ahora los ámbar: ¿qué tan rápido quieren que firmes? '}{a}",
                        f"[16–22s BLUE] {'Blue: follow the money. ' if lang == 'en' else 'Azul: sigue el dinero. '}{b}",
                        f"[22–27s PAYOFF] {over or ('That is the second number.' if lang == 'en' else 'Ese es el segundo número.')}",
                        f"[27–30s CTA] {'This is one card from a free game. Link in bio.' if lang == 'en' else 'Es una carta de un juego gratis. Enlace en la bio.'}",
                    ])
                    sh = short(f"“{f}” → {r} {LINK['play'] if lang == 'en' else LINK['juega']} {('#ReadTheMachine' if lang == 'en' else '#LeeLaMáquina')}")
                    pillar = "read-the-machine"
                else:
                    feed = ((f"NOT EVERY DEAL IS A TRAP.\n\n“{f}”\n\n🔴 {r}\n🟡 {a}\n🔵 {b}\n\n"
                             "This one is real help. Reading the machine means knowing the difference, "
                             "and walking away from real help costs you too.\n")
                            if lang == "en" else
                            (f"NO TODO TRATO ES UNA TRAMPA.\n\n“{f}”\n\n🔴 {r}\n🟡 {a}\n🔵 {b}\n\n"
                             "Este es ayuda de verdad. Leer la máquina es saber la diferencia.\n")) + cta(d, lang) + "\n\n" + (TAGS if lang == "en" else TAGS_ES)
                    script = "\n".join([
                        f"[0–3s HOOK] {'Is this one a trap? ' if lang == 'en' else '¿Esta es una trampa? '}“{f}”",
                        f"[3–18s] {r} {a} {b}",
                        f"[18–25s PAYOFF] {'Nope. This is real help, and walking away from it costs you too.' if lang == 'en' else 'No. Esto es ayuda de verdad.'}",
                        f"[25–30s CTA] {'One card from a free game. Link in bio.' if lang == 'en' else 'Una carta de un juego gratis. Enlace en la bio.'}",
                    ])
                    sh = short(f"{'Not every deal is a trap:' if lang == 'en' else 'No todo trato es una trampa:'} “{f}” {LINK['play'] if lang == 'en' else LINK['juega']}")
                    pillar = "real-help"
                base = dict(card=cid, district=dn, lang=lang, pillar=pillar, front=f, source=card.get("basis", ""))
                out.append(dict(base, id=f"{cid}-{lang}-feed", format="feed", text=feed, script=""))
                out.append(dict(base, id=f"{cid}-{lang}-video", format="video", text=short(f"“{f}” {('The second number, read in 30 seconds.' if lang == 'en' else 'El segundo número, en 30 segundos.')} {TAGS if lang == 'en' else TAGS_ES}", 300), script=script))
                out.append(dict(base, id=f"{cid}-{lang}-short", format="short", text=sh, script=""))
    return out


def history_posts():
    """the History deck and the Long Ledger's era cards: Sunday posts about how the machine was built"""
    out = []
    n = 0
    for d, cards in C["history"].items():
        for card in cards:
            n += 1
            for lang in ("en", "es"):
                title, story, lesson = (card["title"], card["story"], card["lesson"]) if lang == "en" else \
                                       (es(card["title"]), es(card["story"]), es(card["lesson"]))
                if lang == "es" and not (title and story and lesson):
                    continue
                text = (f"{title.upper()} · {card['year']}\n\n{story}\n\n"
                        + (f"The lesson: {lesson}\n\nEvery card in the game's History deck is true. {LINK['play']}\n\n#BlackHistory {TAGS}"
                           if lang == "en" else
                           f"La lección: {lesson}\n\nCada carta de Historia del juego es verdad. {LINK['juega']}\n\n{TAGS_ES}"))
                out.append(dict(id=f"HIS{n:02d}-{lang}", card=f"HIS{n:02d}", district=card.get("place", ""), lang=lang,
                                pillar="history", format="feed", front=title, text=text, script="", source=card["year"]))
    for key, ch in C["chapters"].items():
        if ch.get("campaign") != "LEDGER":
            continue
        for d, cards in ch["decks"].items():
            for i, card in enumerate(cards[:4]):  # the first few of each era deck: enough for a season
                cid = f"{key[:6]}-{d[:3]}{i + 1}"
                text = (f"{ch['era'].upper()}: “{card['front']}”\n\n🔴 {card['red']}\n🟡 {card['amber']}\n🔵 {card['blue']}\n\n"
                        f"The deals change their clothes. The machine doesn't. From {ch['title']}, a chapter of the free game's Long Ledger campaign: {LINK['play']}\n\n{TAGS}")
                out.append(dict(id=f"{cid}-en", card=cid, district=DISTRICT.get(d, d), lang="en", pillar="history",
                                format="feed", front=card["front"], text=text, script="", source=card.get("basis", "")))
    return out


EVERGREEN = [
    ("groups", "For teachers: The Second Number fits one class period. Free teacher's guide, learning goals, and questions for after. No accounts, nothing to install. getcivicarmor.com/teachers"),
    ("groups", "Church game night idea: a cooperative game where your youth group reads predatory deals together and teaches each other to spot them. Free to play, free to print. getcivicarmor.com/play"),
    ("groups", "Librarians and community centers: a free print-and-play game about reading the fine print, in English and Spanish, 1 to 5 players, about 25 minutes for the short version. getcivicarmor.com/play"),
    ("method", "Swallow it. Blow up. Or find out. When something happens at work, there's a third option: recognize it, document it, prove it. Before you ever see a lawyer. getcivicarmor.com/guide"),
    ("method", "A bad feeling isn't evidence. A dated note, written the same day, is. The Third Option: the Civic Armor method for your own job. getcivicarmor.com/guide"),
    ("story", "At eighteen, Marcus Ellison signed a plea so he could go home. Then he wakes up on graduation day able to see the second number in every deal on his block. The Second Number, Book One. getcivicarmor.com/book"),
    ("story", "“Armor, ’cause it covers you. Civic, ’cause it ain’t yours. It’s everybody’s that lives here.” Gloria, in The Second Number. getcivicarmor.com"),
    ("method", "Read your own deal: paste in the numbers from a real offer and the site works out the second number, on your phone, never uploaded. getcivicarmor.com/my-deal"),
]


def evergreen_posts():
    return [dict(id=f"EVG{i + 1:02d}-en", card=f"EVG{i + 1:02d}", district="", lang="en", pillar=p, format="feed",
                 front="", text=t + "\n\n" + TAGS, script="", source="") for i, (p, t) in enumerate(EVERGREEN)]


# ------------------------------------------------------------------ the money calendar
# what people are about to run into, month by month: post about a trap the week they meet it
THEMES = {
    1: ("LENDING", "Tax season opens: fast-refund loans and fee-heavy tax prep"),
    2: ("HISTORY", "Black History Month: the Long Ledger"),
    3: ("LENDING", "Tax refunds land: rent-to-own and buy-here-pay-here come calling"),
    4: ("ANY", "Financial Literacy Month: schools, libraries, credit unions"),
    5: ("EDUCATION", "Graduation season: for-profit college offers (and Marcus's graduation day)"),
    6: ("HISTORY", "Juneteenth, and summer youth programs"),
    7: ("HOUSING", "Moving season: leases, deposits and 'we buy houses'"),
    8: ("EDUCATION", "Back to school: teachers planning the year"),
    9: ("LABOR", "Labor Day: your job, your rights, The Third Option"),
    10: ("HEALTH", "Before open enrollment: medical debt and 'free' plans"),
    11: ("HEALTH", "Open enrollment, then Black Friday rent-to-own and buy-now-pay-later"),
    12: ("LENDING", "Holiday loans and layaway: the January bill"),
}
# (weekday 0=Mon, time, format, lang, what)
WEEK = [
    (0, "12:15", "feed", "en", "deal"),
    (1, "19:30", "video", "en", "deal"),
    (2, "12:15", "feed", "en", "deal"),
    (3, "19:30", "video", "es", "deal"),   # Spanish twice a week: the households these traps hit hardest
    (4, "12:15", "feed", "en", "deal"),
    (5, "19:30", "video", "es", "deal"),
    (6, "17:00", "feed", "en", "history"),
]
PLATFORMS = {"feed": "Instagram, Facebook, Threads, LinkedIn (short version: X, Bluesky)",
             "video": "TikTok, Instagram Reels, YouTube Shorts, Facebook Reels"}


def schedule(lib, start, weeks):
    by = {}
    for p in lib:
        by.setdefault((p["format"], p["lang"], p["pillar"]), []).append(p)
    used = set()

    def take(fmt, lang, district, pillars=("read-the-machine",)):
        pools = [x for pl in pillars for x in by.get((fmt, lang, pl), [])]
        fresh = [x for x in pools if x["card"] not in used]
        if not fresh:  # every card in this pool has run once: start the pool over
            used.difference_update(x["card"] for x in pools)
            fresh = pools
        pick = ([x for x in fresh if district == "ANY" or x["district"] in (DISTRICT.get(district), DISTRICT_ES.get(district))]
                or fresh or pools)
        p = pick[0]
        used.add(p["card"])  # one card, one appearance (feed or video) until the pool has gone round
        return p

    rows = []
    for w in range(weeks):
        for wd, time, fmt, lang, what in WEEK:
            day = start + dt.timedelta(days=7 * w + wd)
            theme, why = THEMES[day.month]
            district = theme if theme in DISTRICT else "ANY"
            if what == "history" or (theme == "HISTORY" and fmt == "feed" and wd == 2):  # history months: Wednesdays too
                p = take("feed", "en", "ANY", ("history",))
            elif day.day in (1, 15) or (day.weekday() == 4 and {(day + dt.timedelta(days=k)).day for k in (1, 2)} & {1, 15}):
                p = take(fmt, lang, "LENDING")  # payday: the money traps, the day the money lands
                why = "Payday: " + why
            elif w % 2 == 1 and wd == 4:
                p = take("feed", "en", "ANY", ("real-help",))  # every other Friday: an honest deal
            else:
                p = take(fmt, lang, district)
            rows.append(dict(date=day.isoformat(), time=time, timezone=TZ, format=p["format"],
                             platforms=PLATFORMS[p["format"]], lang=p["lang"], pillar=p["pillar"], theme=why,
                             post_id=p["id"], image=image_of(p), reel=reel_of(p), text=p["text"], video_script=p["script"]))
        # every other Sunday: teachers and groups; every other Thursday morning: the email
        sun = start + dt.timedelta(days=7 * w + 6)
        if w % 2 == 0:
            ev = [x for x in lib if x["id"].startswith("EVG")][(w // 2) % len(EVERGREEN)]
            rows.append(dict(date=sun.isoformat(), time="15:00", timezone=TZ, format="feed", platforms=PLATFORMS["feed"],
                             lang="en", pillar=ev["pillar"], theme="Teachers, churches and groups plan on Sunday",
                             post_id=ev["id"], image="", reel="", text=ev["text"], video_script=""))
            thu = start + dt.timedelta(days=7 * w + 3)
            rows.append(dict(date=thu.isoformat(), time="10:00", timezone=TZ, format="email", platforms="Email list",
                             lang="en", pillar="email", theme=THEMES[thu.month][1], post_id=f"EMAIL-{w // 2 + 1:02d}", image="", reel="",
                             text="Newsletter: see launch/content/emails/newsletter_template.md", video_script=""))
    rows.sort(key=lambda r: (r["date"], r["time"]))
    return rows


def image_of(p):
    """the picture made by scripts/make_post_images.py, for a deal or history card's feed post or video"""
    if p["format"] == "short" or not re.fullmatch(r"(LEN|HOU|LAB|HEA|EDU|HIS)\d\d", p["card"]):
        return ""
    return f"images/{p['card']}-{p['lang']}.png"


def reel_of(p):
    """the finished video made by scripts/make_reels.py, for a trap card's video slot"""
    if p["format"] != "video" or p["pillar"] != "read-the-machine":
        return ""
    return f"reels/{p['card']}-{p['lang']}.mp4"


# The arithmetic behind each trap card's dollar figure, for anyone who checks it. A card not listed here is an
# estimate (a typical amount, per its basis): it needs a cited source before it goes out as a post or a reel.
MATH = {
    "a $56.25 fee paid 8 times, like the typical payday borrower": "8 × $56.25 = $450",
    "25% a month on $1,000, for 5 months": "$1,000 × 25% × 5 = $1,250",
    "20% a month on a $250 pawn, for 3 months": "$250 × 20% × 3 = $150",
    "seven $10 late fees across overdue plans": "7 × $10 = $70",
    "five $35 overdraft fees in a month": "5 × $35 = $175",
    "a $14 tip-and-fee, eight times a year": "8 × $14 = $112",
    "about 100% a year on $2,000 over 18 months": "amortized: 18 payments of about $218 = $3,931, so about $1,931 in interest (≈ $1,900)",
    "$15 a month in fees for a year, on a loan you can't touch": "12 × $15 = $180",
    "a $10,000 balance stretched from 3 years to 5, at 17%": "36 payments of $356.53 = $12,835 vs 60 of $248.53 = $14,912: about $2,077 more (≈ $2,100)",
    "2% of a $20,000-a-year paycheck, for a year": "2% × $20,000 = $400",
    "$25 a week for a year, for a couch that sells for about $400": "52 × $25 = $1,300, minus the $400 couch = $900",
    "$100 a month in junk fees, for a year": "12 × $100 = $1,200",
    "five $50 applications": "5 × $50 = $250",
    "a $10-a-month markup on the policy, for a year": "12 × $10 = $120",
    "a 20% renewal hike on $1,000 rent, for a year": "$1,000 × 20% × 12 = $2,400",
    "a $500 payment that resets to $1,000, for a year": "12 × ($1,000 − $500) = $6,000",
    "$50 a month above real usage, for a year": "12 × $50 = $600",
    "an unpaid 8-hour day at $15 an hour": "8 × $15 = $120",
    "a copay above the cash price": "the card: a $60 copay vs a $30 cash price = $30",
}


def audit():
    """every trap card's number: the arithmetic that closes it, its sources, or a flag that it has none"""
    rows = []
    for d, cards in C["deck"].items():
        for i, card in enumerate(cards):
            if not card.get("trap", True):
                continue
            cid = f"{d[:3]}{i + 1:02d}"
            src = SOURCES.get(cid)
            if src:
                assert src["front"] == card["front"], f"{cid}: NUMBER_SOURCES.json is out of step with the deck"
            m = MATH.get(card["basis"]) or (src or {}).get("math", "")
            if src and src["status"] == "unsupported":
                check = "UNSUPPORTED: no credible source; kept out of posts and reels"
            elif src:
                check = "sourced" + (" (math closes)" if m else "") + ": open each link and confirm the figure before posting"
            else:
                check = "math closes"
            rows.append(dict(card=cid, district=DISTRICT[d], offer=card["front"], number=money(card["dollars"]),
                             basis=card["basis"], check=check, math=m,
                             sources=" | ".join((src or {}).get("sources", [])), evidence=(src or {}).get("evidence", "")))
    return rows


def ics(rows):
    def esc(s):
        return s.replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Civic Armor//Content Calendar//EN", "CALSCALE:GREGORIAN",
           "X-WR-CALNAME:Civic Armor posts", f"X-WR-TIMEZONE:{TZ}"]
    for r in rows:
        start = r["date"].replace("-", "") + "T" + r["time"].replace(":", "") + "00"
        body = r["text"] + ("\n\nVIDEO SCRIPT:\n" + r["video_script"] if r["video_script"] else "")
        out += ["BEGIN:VEVENT", f"UID:{r['post_id']}-{r['date']}@{HUB}", f"DTSTAMP:{now}",
                f"DTSTART;TZID={TZ}:{start}", "DURATION:PT15M",
                f"SUMMARY:{esc(r['format'].upper() + ' · ' + r['pillar'] + ' · ' + r['post_id'])}",
                f"DESCRIPTION:{esc(r['theme'] + chr(10) + r['platforms'] + chr(10) + chr(10) + body)}", "END:VEVENT"]
    out.append("END:VCALENDAR")

    def fold(line):  # iCalendar: lines of at most 75 bytes, continued with a leading space
        b, parts = line.encode("utf-8"), []
        while len(b) > 75:
            cut = 75 if not parts else 74
            while cut and (b[cut] & 0xC0) == 0x80:  # never split a character
                cut -= 1
            parts.append(b[:cut].decode("utf-8"))
            b = b[cut:]
        parts.append(b.decode("utf-8"))
        return "\r\n ".join(parts)
    # iCalendar lines end in CRLF
    return "\r\n".join(fold(x) for x in out) + "\r\n"


def main():
    ap = argparse.ArgumentParser()
    today = dt.date.today()
    nxt = today + dt.timedelta(days=(7 - today.weekday()) % 7 or 7)
    ap.add_argument("--start", default=nxt.isoformat(), help="the Monday the schedule starts (default: next Monday)")
    ap.add_argument("--weeks", type=int, default=12)
    a = ap.parse_args()
    start = dt.date.fromisoformat(a.start)
    start -= dt.timedelta(days=start.weekday())  # always a Monday

    lib = deal_posts() + history_posts() + evergreen_posts()
    rows = schedule(lib, start, a.weeks)
    os.makedirs(OUT, exist_ok=True)
    for p in lib:
        p["image"] = image_of(p)
    cols = ["id", "format", "lang", "pillar", "district", "card", "image", "front", "source", "text", "script"]
    with open(os.path.join(OUT, "library.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for p in lib:
            w.writerow({k: p.get(k, "") for k in cols})
    with open(os.path.join(OUT, "calendar.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    with open(os.path.join(OUT, "calendar.ics"), "w", newline="", encoding="utf-8") as f:
        f.write(ics(rows))
    au = audit()
    with open(os.path.join(OUT, "NUMBERS_AUDIT.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(au[0].keys()))
        w.writeheader()
        w.writerows(au)
    n = lambda k: sum(1 for r in au if r["check"].startswith(k))
    print(f"numbers: {n('math')} close with arithmetic, {n('sourced')} sourced, {n('UNSUPPORTED')} unsupported (kept out)")
    n = {}
    for p in lib:
        n[p["format"]] = n.get(p["format"], 0) + 1
    print(f"library: {len(lib)} posts {n}; calendar: {len(rows)} slots over {a.weeks} weeks from {start}")


if __name__ == "__main__":
    main()
