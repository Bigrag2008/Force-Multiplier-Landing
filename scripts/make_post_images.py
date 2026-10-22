#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
The pictures for "Read the Machine" posts: one 1080x1350 image (Instagram's portrait size, fine everywhere else)
for every deal card and history card, in English and Spanish, in the game's colors.

  python3 scripts/make_post_images.py        -> launch/content/images/<post card>-<lang>.png

The file names match the card column in launch/content/library.csv (LEN01-en.png goes with LEN01-en-feed).
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "launch", "content", "images")
C = json.load(open(os.path.join(ROOT, "src", "content", "content.json"), encoding="utf-8"))
ES = json.load(open(os.path.join(ROOT, "src", "content", "es.json"), encoding="utf-8"))

W, H, M = 1080, 1350, 84
NAVY, CREAM, GOLD, GOLDL, GREY = "#1B1530", "#F6EEDC", "#F2B632", "#F7CF6B", "#B9B2C8"
LAYER = {"red": "#E63946", "amber": "#E0A526", "blue": "#2F8FD8"}
DCOL = C["districtColors"]
DISTRICT = {"en": {"LENDING": "LENDING", "HOUSING": "HOUSING", "LABOR": "LABOR", "HEALTH": "HEALTH", "EDUCATION": "EDUCATION"},
            "es": {"LENDING": "PRÉSTAMOS", "HOUSING": "VIVIENDA", "LABOR": "TRABAJO", "HEALTH": "SALUD", "EDUCATION": "EDUCACIÓN"}}
WORDS = {
    "en": dict(kicker="READ THE MACHINE", offer="THE OFFER", red="THE COST", amber="THE CLOCK", blue="THE CONNECTION",
               second="The second number", honest="REAL HELP: NOT EVERY DEAL IS A TRAP", link="getcivicarmor.com/play",
               history="HOW THE MACHINE WAS BUILT", lesson="The lesson"),
    "es": dict(kicker="LEE LA MÁQUINA", offer="LA OFERTA", red="EL COSTO", amber="EL RELOJ", blue="LA CONEXIÓN",
               second="El segundo número", honest="AYUDA DE VERDAD: NO TODO ES TRAMPA", link="getcivicarmor.com/juega",
               history="CÓMO SE CONSTRUYÓ LA MÁQUINA", lesson="La lección"),
}


def font(bold, size):
    for path in ((["/usr/share/fonts/opentype/inter/Inter-Bold.otf"] if bold else ["/usr/share/fonts/opentype/inter/Inter-Regular.otf"])
                 + [f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf"]):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def wrap(d, text, f, width):
    lines, line = [], ""
    for word in text.split():
        trial = (line + " " + word).strip()
        if d.textlength(trial, font=f) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + ([line] if line else [])


def block(d, x, y, text, bold, size, width, fill, lead=1.28, max_h=None, min_size=24):
    """draw wrapped text, shrinking it until it fits max_h; returns the y below it"""
    while True:
        f = font(bold, size)
        lines = wrap(d, text, f, width)
        h = int(len(lines) * size * lead)
        if max_h is None or h <= max_h or size <= min_size:
            break
        size -= 2
    for i, ln in enumerate(lines):
        d.text((x, y + int(i * size * lead)), ln, font=f, fill=fill)
    return y + h


def frame(lang, district_color, kicker):
    im = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 14], fill=district_color)
    for i, c in enumerate(LAYER.values()):
        d.ellipse([M + i * 34, 64, M + i * 34 + 24, 88], fill=c)
    d.text((M + 120, 62), kicker, font=font(True, 26), fill=GOLDL)
    d.line([M, H - 132, W - M, H - 132], fill="#3A3352", width=2)
    d.text((M, H - 104), WORDS[lang]["link"], font=font(True, 34), fill=GOLD)
    f = font(True, 26)
    d.text((W - M - d.textlength("CIVIC ARMOR", font=f), H - 98), "CIVIC ARMOR", font=f, fill=GREY)
    return im, d


def deal_image(dk, card, lang):
    w = WORDS[lang]
    t = (lambda s: s) if lang == "en" else (lambda s: ES.get(s, ""))
    if lang == "es" and not all(t(card[k]) for k in ("front", "red", "amber", "blue")):
        return None
    trap = card.get("trap", True)
    im, d = frame(lang, DCOL[dk], f"{w['kicker']} · {DISTRICT[lang][dk]}")
    y = 150
    d.text((M, y), w["offer"] if trap else w["honest"], font=font(True, 28), fill=GREY)
    y = block(d, M, y + 52, f"“{t(card['front'])}”", True, 60, W - 2 * M, CREAM, lead=1.18, max_h=330) + 40
    bottom = H - 170 - (240 if trap and card.get("dollars") else 0)
    room = (bottom - y) // 3
    for k in ("red", "amber", "blue"):
        d.rounded_rectangle([M, y + 6, M + 10, y + room - 30], radius=5, fill=LAYER[k])
        d.text((M + 34, y), w[k], font=font(True, 24), fill=LAYER[k])
        block(d, M + 34, y + 36, t(card[k]), False, 34, W - 2 * M - 34, CREAM, lead=1.3, max_h=room - 70)
        y += room
    if trap and card.get("dollars"):
        d.text((M, H - 400), w["second"], font=font(False, 32), fill=GOLDL)
        d.text((M, H - 360), f"${card['dollars']:,}", font=font(True, 96), fill=GOLD)
        block(d, M, H - 238, "= " + t(card["basis"]), False, 30, W - 2 * M, GOLDL, lead=1.25, max_h=84, min_size=22)  # what it's made of
    return im


def history_image(card, lang, label):
    w = WORDS[lang]
    t = (lambda s: s) if lang == "en" else (lambda s: ES.get(s, ""))
    if lang == "es" and not all(t(card[k]) for k in ("title", "story", "lesson")):
        return None
    im, d = frame(lang, GOLD, w["history"])
    y = 150
    d.text((M, y), card["year"], font=font(True, 30), fill=GOLD)
    y = block(d, M, y + 56, t(card["title"]), True, 64, W - 2 * M, CREAM, lead=1.15, max_h=240) + 36
    y = block(d, M, y, t(card["story"]), False, 36, W - 2 * M, CREAM, lead=1.38, max_h=H - 170 - y - 200) + 40
    d.text((M, y), w["lesson"], font=font(True, 26), fill=GOLDL)
    block(d, M, y + 40, t(card["lesson"]), True, 40, W - 2 * M, GOLD, lead=1.25, max_h=H - 190 - y - 40)
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    n = 0
    skip = {cid for cid, x in json.load(open(os.path.join(ROOT, "game", "NUMBER_SOURCES.json"))).items() if x["status"] == "unsupported"}
    for dk, cards in C["deck"].items():
        for i, card in enumerate(cards):
            if f"{dk[:3]}{i + 1:02d}" in skip:
                continue  # no credible source for its number yet
            for lang in ("en", "es"):
                im = deal_image(dk, card, lang)
                if im:
                    im.quantize(96).save(os.path.join(OUT, f"{dk[:3]}{i + 1:02d}-{lang}.png"), optimize=True)
                    n += 1
    k = 0
    for dk, cards in C["history"].items():
        for card in cards:
            k += 1
            for lang in ("en", "es"):
                im = history_image(card, lang, f"HIS{k:02d}")
                if im:
                    im.quantize(96).save(os.path.join(OUT, f"HIS{k:02d}-{lang}.png"), optimize=True)
                    n += 1
    print(f"wrote {n} images to {OUT}")


if __name__ == "__main__":
    main()
