#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
The reel factory: every trap card in the game becomes a vertical "Second Number" reel (1080x1920, 30 fps, with
sound), in English and Spanish, plus a voiceover script timed to it.

  python3 scripts/make_reels.py                   # every trap card, both languages -> launch/content/reels/
  python3 scripts/make_reels.py LEN01 HEA02       # just these cards (both languages)
  python3 scripts/make_reels.py LEN01 --lang en

The cards come from the game itself (src/content/content.json), so a number corrected in the game is corrected here.
Five beats, timed to how long each part takes to read:
  1 THE OFFER        the pitch stamps in: "Would you take this deal?"
  2 THE SECOND NUMBER the red lens sweeps the static and the dollar figure resolves, with the red line under it
  3 THE CLOCK, THE CONNECTION   the amber and blue layers, one hit each (a clock ticks under the amber)
  4 THE DOOR         what to ask or do, for the card's district
  5 TEACH ONE        "Now teach one person." and the link
Needs ffmpeg and numpy. Fonts are bundled in scripts/fonts/ (Inter, SIL Open Font License).
"""
import json, math, os, subprocess, sys, wave
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_content import MATH, SOURCES, UNSUPPORTED  # noqa: E402  the arithmetic and sources behind each number
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "launch", "content", "reels")
C = json.load(open(os.path.join(ROOT, "src", "content", "content.json"), encoding="utf-8"))
ES = json.load(open(os.path.join(ROOT, "src", "content", "es.json"), encoding="utf-8"))
FONTS = os.path.join(ROOT, "scripts", "fonts")

W, H, FPS, SR = 1080, 1920, 30, 44100
# the safe zone: Reels/TikTok/Shorts cover the bottom (caption, buttons) and the right edge (like, share)
L, R, TOP, BOT = 90, W - 150, 250, H - 430
TW = R - L
NAVY, NAVY2, CREAM, GOLD, GOLDL, MUTED = (27, 21, 48), (44, 36, 78), (246, 238, 220), (242, 182, 50), (247, 207, 107), (170, 162, 190)
RED, AMBER, BLUE = (230, 57, 70), (224, 165, 38), (47, 143, 216)
DCOL = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in C["districtColors"].items()}

WORDS = {
    "en": dict(offer="THE OFFER", sign="Would you take this deal?", second="THE SECOND NUMBER", clock="THE CLOCK",
               conn="THE CONNECTION", door="THE DOOR", teach="Now teach\none person.", price="That's the price of the lesson.",
               link="getcivicarmor.com/play", tag="read the machine · don't become it", lens="put on the red glasses"),
    "es": dict(offer="LA OFERTA", sign="¿Aceptarías este trato?", second="EL SEGUNDO NÚMERO", clock="EL RELOJ",
               conn="LA CONEXIÓN", door="LA PUERTA", teach="Ahora enséñale\na una persona.", price="Ese es el precio de la lección.",
               link="getcivicarmor.com/juega", tag="lee la máquina · no te conviertas en ella", lens="ponte los lentes rojos"),
}
DISTRICT = {"en": {"LENDING": "LENDING", "HOUSING": "HOUSING", "LABOR": "LABOR", "HEALTH": "HEALTH", "EDUCATION": "EDUCATION"},
            "es": {"LENDING": "PRÉSTAMOS", "HOUSING": "VIVIENDA", "LABOR": "TRABAJO", "HEALTH": "SALUD", "EDUCATION": "EDUCACIÓN"}}
# what to ask or do: written to be true for every card in the district, never advice about someone's own case
DOORS = {
    "en": {
        "LENDING": "Ask two things out loud:\n“What's the APR?”\n“What's the total I'll pay?”\nThen call a credit union.",
        "HOUSING": "Before you sign, ask:\n“What's the total, all in,\nfor the whole term?”\nGet it in writing.",
        "LABOR": "Keep a record from day one:\nthe date, the hours,\nwhat you were paid,\nwho saw it.",
        "HEALTH": "Before you pay, ask for\nan itemized bill,\nand ask about\nfinancial assistance.",
        "EDUCATION": "Get it in writing:\nthe total cost, and the real\ngraduation and job numbers.",
    },
    "es": {
        "LENDING": "Pregunta dos cosas en voz alta:\n“¿Cuál es la tasa anual?”\n“¿Cuánto pagaré en total?”\nLuego llama a una cooperativa de crédito.",
        "HOUSING": "Antes de firmar, pregunta:\n“¿Cuál es el total, con todo,\npor todo el plazo?”\nPídelo por escrito.",
        "LABOR": "Lleva un registro desde el primer día:\nla fecha, las horas,\nlo que te pagaron,\nquién lo vio.",
        "HEALTH": "Antes de pagar, pide\nuna factura detallada\ny pregunta por\nayuda financiera.",
        "EDUCATION": "Pídelo por escrito:\nel costo total y los números reales\nde graduación y empleo.",
    },
}


def font(weight, size):
    for p in (os.path.join(FONTS, f"Inter-{weight}.otf"), f"/usr/share/fonts/opentype/inter/Inter-{weight}.otf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap(d, text, f, width):
    out = []
    for para in text.split("\n"):
        line = ""
        for w in para.split():
            t = (line + " " + w).strip()
            if d.textlength(t, font=f) <= width or not line:
                line = t
            else:
                out.append(line)
                line = w
        out.append(line)
    return out


def text_layer(text, weight, size, color, width=TW, lead=1.18, max_h=None, min_size=34, align="left"):
    """text on a transparent layer, shrunk until it fits max_h; returns (image, height)"""
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    while True:
        f = font(weight, size)
        lines = wrap(probe, text, f, width)
        h = int(len(lines) * size * lead) + int(size * 0.3)
        if max_h is None or h <= max_h or size <= min_size:
            break
        size -= 3
    im = Image.new("RGBA", (W, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        x = L if align == "left" else (W - d.textlength(ln, font=f)) / 2
        d.text((x, int(i * size * lead)), ln, font=f, fill=color + (255,))
    return im, h


def words(s):
    return len(s.split())


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


# ------------------------------------------------------------------ the pieces
class Reel:
    def __init__(self, district, idx, card, lang):
        self.d, self.idx, self.card, self.lang = district, idx, card, lang
        t = (lambda s: s) if lang == "en" else (lambda s: ES.get(s) or "")
        self.front, self.red, self.amber, self.blue, self.basis = (t(card[k]) for k in ("front", "red", "amber", "blue", "basis"))
        self.ok = all((self.front, self.red, self.amber, self.blue, self.basis))
        self.wd = WORDS[lang]
        self.id = f"{district[:3]}{idx + 1:02d}-{lang}"
        self.dollars = f"${card['dollars']:,}"
        # the timeline, from how long each part takes to read (about 4 words a second, a beat to land)
        rd = lambda s, lo, extra: max(lo, words(s) / 4.0 + extra)
        self.t_offer = rd(self.front, 2.3, 0.9)
        self.t_reveal = 2.3 + rd(self.basis + " " + self.red, 2.6, 0.5)   # sweep and settle, then what it's made of
        self.t_clock = rd(self.amber, 2.0, 0.3)
        self.t_conn = rd(self.blue, 2.0, 0.3)
        self.t_door = rd(DOORS[lang][district], 2.4, 0.4)
        self.t_cta = 2.6
        b = [0.0]
        for x in (self.t_offer, self.t_reveal, self.t_clock, self.t_conn, self.t_door, self.t_cta):
            b.append(b[-1] + x)
        self.beats = b               # start of each beat; b[-1] is the end
        self.total = b[-1]

    # -------------------------------------------------- static layers, made once
    def build(self):
        bg = Image.new("RGB", (W, H), NAVY)
        glow = Image.new("L", (W, H), 0)
        ImageDraw.Draw(glow).ellipse([-300, -700, W + 300, 700], fill=120)
        glow = glow.filter(ImageFilter.GaussianBlur(160))
        bg = Image.composite(Image.new("RGB", (W, H), NAVY2), bg, glow)
        d = ImageDraw.Draw(bg)
        d.rectangle([0, 0, W, 12], fill=DCOL[self.d])
        for i, c in enumerate((RED, AMBER, BLUE)):
            d.ellipse([L + i * 46, TOP - 70, L + i * 46 + 30, TOP - 40], fill=c)
        d.text((L + 160, TOP - 72), DISTRICT[self.lang][self.d], font=font("Bold", 30), fill=GOLDL)
        d.text((L, BOT + 40), self.wd["tag"], font=font("SemiBold", 30), fill=MUTED)
        self.bg = bg
        self.lab = {k: text_layer(self.wd[k], "Bold", 42, col)[0] for k, col in
                    (("offer", GOLDL), ("second", RED), ("clock", AMBER), ("conn", BLUE), ("door", GOLDL))}
        self.sign, self.sign_h = text_layer(self.wd["sign"], "Bold", 58, GOLD)
        self.offer, self.offer_h = text_layer(f"“{self.front}”", "Black", 112, CREAM, lead=1.08, max_h=700, min_size=64)
        self.num, self.num_h = text_layer(self.dollars, "Black", 250, RED, lead=1.0)
        # what the number is made of, so anyone with a calculator lands where we landed
        self.basisline, self.basis_h = text_layer("= " + self.basis, "SemiBold", 50, GOLDL, lead=1.2, max_h=260, min_size=38)
        self.redline, self.redline_h = text_layer(self.red, "Bold", 60, CREAM, lead=1.2, max_h=420, min_size=42)
        self.lens_hint = text_layer(self.wd["lens"], "SemiBold", 34, MUTED)[0]
        self.amberline, self.amber_h = text_layer(self.amber, "Bold", 80, CREAM, width=TW - 44, lead=1.18, max_h=900, min_size=50)
        self.blueline, self.blue_h = text_layer(self.blue, "Bold", 80, CREAM, width=TW - 44, lead=1.18, max_h=900, min_size=50)
        self.doorline, self.door_h = text_layer(DOORS[self.lang][self.d], "Bold", 66, CREAM, lead=1.24, max_h=950, min_size=46)
        self.teach, self.teach_h = text_layer(self.wd["teach"], "Black", 132, GOLD, lead=1.02)
        self.price, self.price_h = text_layer(self.wd["price"], "SemiBold", 52, CREAM)
        self.link = text_layer(self.wd["link"], "Black", 62, GOLDL)[0]
        # decoder static: thin red diagonals with gaps, over the number's box
        self.box = (L - 20, 0, R + 20, self.num_h + 40)
        bw, bh = self.box[2] - self.box[0], self.box[3]
        rng = np.random.default_rng(self.idx * 7 + len(self.lang))
        st = Image.new("RGBA", (bw + 80, bh), (0, 0, 0, 0))
        sd = ImageDraw.Draw(st)
        for x in range(-bh, bw + 80, 11):
            for seg in range(0, bh, 26):
                if rng.random() < 0.72:
                    sd.line([(x + seg, seg), (x + seg + 22, seg + 22)], fill=RED + (int(110 + rng.random() * 120),), width=3)
        self.static = st

    # -------------------------------------------------- one frame
    def put(self, base, layer, y, alpha=1.0, dy=0.0, scale=1.0, dx=0):
        if alpha <= 0:
            return
        bbox = layer.getbbox()
        if not bbox:
            return
        crop = layer.crop(bbox)
        if scale != 1.0:
            crop = crop.resize((max(1, int(crop.width * scale)), max(1, int(crop.height * scale))), Image.BICUBIC)
            cx = bbox[0] + (bbox[2] - bbox[0]) / 2
            x0 = int(cx - crop.width / 2)
        else:
            x0 = bbox[0]
        if alpha < 1:
            a = crop.getchannel("A").point(lambda v: int(v * alpha))
            crop.putalpha(a)
        base.alpha_composite(crop, (max(0, x0 + dx), int(y + bbox[1] + dy)))

    def y0(self, h):
        """the top of a beat's block, so the block sits a little above the middle of the safe zone"""
        return TOP + max(0, int((BOT - TOP - h) * 0.42))

    def frame(self, t):
        b = self.beats
        im = self.bg.convert("RGBA")
        if t < b[1]:  # 1 THE OFFER
            u = t - b[0]
            top = self.y0(100 + self.offer_h + 60 + self.sign_h)
            self.put(im, self.lab["offer"], top, ease(u / 0.2))
            y = top + 100
            self.put(im, self.offer, y, ease(u / 0.22), scale=1.0 + 0.14 * (1 - ease(u / 0.22)))
            if u > 0.7:
                self.put(im, self.sign, y + self.offer_h + 50, ease((u - 0.7) / 0.25), dy=30 * (1 - ease((u - 0.7) / 0.25)))
        elif t < b[2]:  # 2 THE SECOND NUMBER
            u = t - b[1]
            top = self.y0(120 + self.num_h + 30 + self.basis_h + 50 + self.redline_h)
            self.put(im, self.lab["second"], top)
            ny = top + 120
            sweep0, sweep1 = 0.35, 1.85
            reveal = ease((u - sweep1) / 0.4)
            # the number: ghosted under the static, clear inside the lens, then clear everywhere
            num = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            self.put(num, self.num, ny, alpha=0.18 + 0.82 * reveal)
            lensx = None
            if sweep0 <= u <= sweep1 + 0.1:
                lensx = int(-260 + (W + 520) * ease((u - sweep0) / (sweep1 - sweep0)))
            if lensx is not None and reveal < 1:
                m = Image.new("L", (W, H), 0)
                ImageDraw.Draw(m).ellipse([lensx - 250, ny + self.num_h / 2 - 250, lensx + 250, ny + self.num_h / 2 + 250], fill=255)
                clear = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                self.put(clear, self.num, ny)
                num = Image.composite(clear, num, m)
            im.alpha_composite(num)
            if reveal < 1:  # the static, drifting, fading as the number resolves
                off = int(u * 60) % 11
                st = self.static.crop((off, 0, off + self.box[2] - self.box[0], self.box[3]))
                a = st.getchannel("A").point(lambda v: int(v * (1 - reveal)))
                if lensx is not None:
                    hole = Image.new("L", st.size, 255)
                    ImageDraw.Draw(hole).ellipse([lensx - 250 - self.box[0], self.num_h / 2 - 250 + 20,
                                                  lensx + 250 - self.box[0], self.num_h / 2 + 250 + 20], fill=0)
                    a = ImageChops.multiply(a, hole)
                st.putalpha(a)
                im.alpha_composite(st, (self.box[0], int(ny - 20)))
            if lensx is not None and reveal < 1:
                ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                cy = ny + self.num_h / 2
                ImageDraw.Draw(ring).ellipse([lensx - 250, cy - 250, lensx + 250, cy + 250], outline=RED + (255,), width=12)
                ImageDraw.Draw(ring).ellipse([lensx - 250, cy - 250, lensx + 250, cy + 250], fill=RED + (34,))
                im.alpha_composite(ring)
            if u < sweep0 + 0.4:
                self.put(im, self.lens_hint, ny + self.num_h + 40, 1 - ease((u - sweep0) / 0.4))
            if u > sweep1 + 0.25:
                k = ease((u - sweep1 - 0.25) / 0.3)
                self.put(im, self.basisline, ny + self.num_h + 30, k, dy=20 * (1 - k))
            if u > sweep1 + 0.9:
                k = ease((u - sweep1 - 0.9) / 0.3)
                self.put(im, self.redline, ny + self.num_h + 30 + self.basis_h + 50, k, dy=30 * (1 - k))
        elif t < b[4]:  # 3 THE CLOCK, then THE CONNECTION
            clock = t < b[3]
            u = t - (b[2] if clock else b[3])
            col, lab, line, lh = (AMBER, "clock", self.amberline, self.amber_h) if clock else (BLUE, "conn", self.blueline, self.blue_h)
            k = ease(u / 0.22)
            top = self.y0(110 + lh)
            bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(bar).rounded_rectangle([L, top + 110, L + 14, top + 110 + lh], radius=7, fill=col + (255,))
            self.put(im, bar, 0, k, dy=-40 * (1 - k))
            self.put(im, self.lab[lab], top, k)
            self.put(im, line, top + 110, k, dy=50 * (1 - k), dx=44)  # indented past the color bar
        elif t < b[5]:  # 4 THE DOOR
            u = t - b[4]
            k = ease(u / 0.25)
            top = self.y0(110 + self.door_h)
            self.put(im, self.lab["door"], top, k)
            self.put(im, self.doorline, top + 110, k, dy=50 * (1 - k))
        else:  # 5 TEACH ONE
            u = t - b[5]
            k = ease(u / 0.25)
            y = self.y0(self.teach_h + 40 + self.price_h + 110 + 80)
            self.put(im, self.teach, y, k, scale=1.0 + 0.08 * (1 - k))
            self.put(im, self.price, y + self.teach_h + 40, ease((u - 0.35) / 0.3))
            self.put(im, self.link, y + self.teach_h + 190, ease((u - 0.7) / 0.3), dy=24 * (1 - ease((u - 0.7) / 0.3)))
        return im.convert("RGB")

    # -------------------------------------------------- sound
    def sound(self, path):
        n = int(self.total * SR)
        t = np.arange(n) / SR
        out = np.zeros(n)
        env = np.minimum(1, t / 1.0) * np.minimum(1, (self.total - t) / 1.2)
        for f, a in ((55, 0.05), (82.4, 0.035), (110, 0.025), (164.8, 0.012)):   # a low A-minor pad
            out += a * np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * 0.11 * t)) * env

        def add(start, sig):
            i = int(start * SR)
            j = min(n, i + len(sig))
            if i < n:
                out[i:j] += sig[: j - i]

        def tone(f, dur, a, decay):
            tt = np.arange(int(dur * SR)) / SR
            return a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * decay)

        rng = np.random.default_rng(1)
        b = self.beats
        add(0.0, tone(58, 0.5, 0.5, 9))                                                   # the stamp
        add(0.0, tone(116, 0.3, 0.15, 14))
        sw = int(1.5 * SR)                                                                # the lens sweep
        noise = rng.standard_normal(sw)
        noise = np.convolve(noise, np.ones(24) / 24, mode="same")
        add(b[1] + 0.35, 0.22 * noise * np.sin(np.linspace(0, np.pi, sw)) ** 2)
        add(b[1] + 1.95, tone(659.3, 1.4, 0.16, 3) + tone(987.8, 1.4, 0.09, 3.5))      # the number resolves (same lengths)
        k = b[2] + 0.1
        while k < b[3] - 0.2:                                                             # the clock ticks
            add(k, tone(2200, 0.03, 0.12, 120))
            k += 0.5
        add(b[3], tone(392, 0.8, 0.08, 4))                                                # the connection
        add(b[5], tone(220, 2.6, 0.08, 1.2) + tone(277.2, 2.6, 0.06, 1.2) + tone(329.6, 2.6, 0.06, 1.2))  # teach one
        out = out / max(1e-9, np.abs(out).max()) * 0.5  # headroom for the AAC encoder
        with wave.open(path, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((out * 32767).astype(np.int16).tobytes())

    # -------------------------------------------------- the voiceover script
    def voiceover(self):
        b, wd, lang = self.beats, self.wd, self.lang
        en = lang == "en"
        door = DOORS[lang][self.d].replace("\n", " ")
        lines = [
            (b[0], b[1], (f"The offer: {self.front} Would you take this deal?" if en
                          else f"La oferta: {self.front} ¿Aceptarías este trato?")),
            (b[1], b[2], (f"Put on the red glasses. The second number: {self.dollars}. That's {self.basis}. {self.red}" if en
                          else f"Ponte los lentes rojos. El segundo número: {self.dollars}. Es {self.basis}. {self.red}")),
            (b[2], b[3], (f"The clock: {self.amber}" if en else f"El reloj: {self.amber}")),
            (b[3], b[4], (f"The connection: {self.blue}" if en else f"La conexión: {self.blue}")),
            (b[4], b[5], ("The door: " if en else "La puerta: ") + door),
            (b[5], b[6], (f"Now teach one person. That's the price of the lesson." if en
                          else "Ahora enséñale a una persona. Ese es el precio de la lección.")),
        ]
        head = (f"{self.id}  ·  {self.total:.1f} seconds  ·  "
                + ("say only what's on screen (people watch muted, so nothing lives only in the audio)" if en
                   else "di solo lo que está en pantalla (la gente mira sin sonido)"))
        src = SOURCES.get(self.id[:5])
        if src:
            head += ("\nSOURCE (open it and confirm the figure before posting): " if en
                     else "\nFUENTE (ábrela y confirma la cifra antes de publicar): ") + src["sources"][0]
        return head + "\n\n" + "\n\n".join(f"[{a:4.1f}–{z:4.1f}s]  {s}" for a, z, s in lines) + "\n"

    # -------------------------------------------------- render
    def render(self, outdir=OUT):
        os.makedirs(outdir, exist_ok=True)
        self.build()
        mp4, wav = os.path.join(outdir, f"{self.id}.mp4"), os.path.join(outdir, f"{self.id}.wav")
        self.sound(wav)
        nframes = int(round(self.total * FPS))
        cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
               "-i", "-", "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", mp4]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(nframes):
            p.stdin.write(self.frame(i / FPS).tobytes())
        p.stdin.close()
        if p.wait() != 0:
            raise SystemExit(f"ffmpeg failed on {self.id}")
        os.remove(wav)
        with open(os.path.join(outdir, f"{self.id}.txt"), "w", encoding="utf-8") as f:
            f.write(self.voiceover())
        return mp4


def cards():
    for d, cs in C["deck"].items():
        for i, c in enumerate(cs):
            if c.get("trap", True) and c.get("dollars") and f"{d[:3]}{i + 1:02d}" not in UNSUPPORTED:
                yield d, i, c


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    langs = ("en", "es")
    if "--lang" in sys.argv:
        langs = (sys.argv[sys.argv.index("--lang") + 1],)
        args = [a for a in args if a not in langs]
    want = {a.upper() for a in args}
    done = []
    for d, i, c in cards():
        cid = f"{d[:3]}{i + 1:02d}"
        if want and cid not in want:
            continue
        for lang in langs:
            r = Reel(d, i, c, lang)
            if not r.ok:
                continue
            path = r.render()
            done.append(path)
            print(f"  {os.path.relpath(path, ROOT)}  ({r.total:.1f}s)")
    print(f"{len(done)} reels in {os.path.relpath(OUT, ROOT)}/")


if __name__ == "__main__":
    main()
