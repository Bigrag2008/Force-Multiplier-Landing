#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — print-and-play kit builder.
Builds The_Second_Number_PRINT_AND_PLAY.pdf from deck_cards.py and RULES.md,
so the kit can never drift from the rules. Re-run after any card or rule change:

  python3 print_kit/build_print_and_play.py

Needs: reportlab, pypdf, and the DejaVu Sans fonts (standard on Linux).
The hidden second number uses the decoder-ink trick: text in cyan, buried under
dense red decoy letters. A red lens washes the red out and darkens the cyan.
"""
import os, re, sys, random, io, zlib
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
sys.path.insert(0,ROOT)
import deck_cards as Dk
import sn_engine as E
import deal_gen as G
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader, PdfWriter

OUT=os.path.join(ROOT,"The_Second_Number_PRINT_AND_PLAY.pdf")
FONTDIR="/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DV",  f"{FONTDIR}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", f"{FONTDIR}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DVM", f"{FONTDIR}/DejaVuSansMono.ttf"))
_obl=f"{FONTDIR}/DejaVuSans-Oblique.ttf"
pdfmetrics.registerFont(TTFont("DVI", _obl if os.path.exists(_obl) else f"{FONTDIR}/DejaVuSans.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("DV",normal="DV",bold="DVB",italic="DVI",boldItalic="DVB")

# ---------------- palette ----------------
def hx(h): h=h.lstrip("#"); return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
# West Dayton palette (ART_DIRECTION.md): After Hours, Church Program, Funk Gold
NAVY=hx("1B1530"); GOLD=hx("F2B632"); GOLDL=hx("F7CF6B"); CREAM=hx("F6EEDC"); INK=hx("1b1b1f")
GREY=hx("6b6676"); LGREY=hx("dcd6cc")
EDITION=Dk.EDITION
LAYER_COL={1:hx("e63946"),2:hx("e0a526"),3:hx("2f8fd8")}
LAYER_NAME={1:"COST",2:"CLOCK",3:"CONNECTION"}
LEVER_WORD={1:"RED",2:"AMBER",3:"BLUE"}
DCOL={d:hx(c) for d,c in Dk.DISTRICT_COLORS.items()}
DABBR={"LENDING":"LEN","HOUSING":"HOU","LABOR":"LAB","HEALTH":"HEA","EDUCATION":"EDU"}
# decoder ink
HIDDEN=(0.0,0.82,1.0)      # bright cyan: low contrast to the eye, near-black under a red lens
DECOY=(0.93,0.15,0.20)     # red: vanishes under a red lens
ZONEBG=(1.0,0.93,0.93)

CARD_W, CARD_H = 2.5*inch, 3.5*inch
PAGE_W, PAGE_H = letter

# drawn art, captured from the site's /art page by scripts/render_art.mjs (commissioned art replaces it)
ART=os.path.join(HERE,"art")
def art(name):
    p=os.path.join(ART,f"{name}.png")
    return p if os.path.exists(p) else None

def fill(c,rgb): c.setFillColorRGB(*rgb)
def stroke(c,rgb): c.setStrokeColorRGB(*rgb)

def fit_lines(text, font, size, width, max_lines, min_size=5.6):
    """Shrink text until it fits in max_lines; returns (lines, size)."""
    while True:
        lines=simpleSplit(text,font,size,width)
        if len(lines)<=max_lines or size<=min_size: return lines,size
        size-=0.2

def footer(c, label, w=PAGE_W):
    c.setFont("DV",7); fill(c,GREY)
    c.drawCentredString(w/2,0.3*inch,f"THE SECOND NUMBER · {EDITION} · Print & Play · {label}")

def sheet_label(c, label):
    c.setFont("DV",6); fill(c,GREY)
    c.drawString(GRID_X0+0.12*inch,PAGE_H-0.15*inch,f"Second Number · West Dayton · {label}")

# ================= decoder zone =================
LETTERS="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%"
def decoder_zone(c, x, y, w, h, text, seed, size=7.9, lead=9.1, decoy=7.2):
    """Hidden cyan text under dense red decoy letters and scribbles."""
    rng=random.Random(seed)
    c.saveState(); p=c.beginPath(); p.rect(x,y,w,h); c.clipPath(p,stroke=0)
    fill(c,ZONEBG); c.rect(x,y,w,h,stroke=0,fill=1)
    def decoys(top, step, passes):
        c.setFont("DVB",decoy); fill(c,DECOY)
        for ps in range(passes):
            yy=top-ps*decoy*0.375
            while yy>y-4:
                xx=x-rng.random()*3
                while xx<x+w:
                    ch=rng.choice(LETTERS); c.drawString(xx,yy,ch)
                    xx+=pdfmetrics.stringWidth(ch,"DVB",decoy)+rng.random()*1.4
                yy-=step
    decoys(y+h-decoy*0.85, decoy*0.75, 2)          # under: a dense red field
    lines,size=fit_lines(text,"DVB",size,w-6,int((h-3)//lead))
    c.saveState(); fill(c,HIDDEN); stroke(c,HIDDEN); c.setLineWidth(0.3); ty=y+h-size-2
    for ln in lines:                               # the second number, in cyan
        t=c.beginText(x+3,ty); t.setFont("DVB",size); t.setTextRenderMode(2); t.textOut(ln)
        t.setTextRenderMode(0); c.drawText(t); ty-=lead
    c.restoreState()
    decoys(y+h-decoy*0.62, decoy*0.6, 1)           # over: breaks up the letter shapes
    stroke(c,DECOY); c.setLineWidth(0.5)
    for _ in range(int(w*h/80)):
        x0=x+rng.random()*w; y0=y+rng.random()*h
        c.bezier(x0,y0,x0+rng.uniform(-8,8),y0+rng.uniform(-6,6),x0+rng.uniform(-8,8),
                 y0+rng.uniform(-6,6),x0+rng.uniform(-12,12),y0+rng.uniform(-6,6))
    c.restoreState()
    stroke(c,LGREY); c.setLineWidth(0.4); c.rect(x,y,w,h,stroke=1,fill=0)

def dot(c,x,y,r,rgb): fill(c,rgb); c.circle(x,y,r,stroke=0,fill=1)
def seed_of(*parts): return zlib.crc32("|".join(map(str,parts)).encode())   # stable across runs

def quilt(c,x,y,w,h,cols,size=0.5*inch,alpha=0.18):
    """A patchwork of half-square triangles in the district colors."""
    rng=random.Random(seed_of("quilt",x,y)); c.saveState(); c.setFillAlpha(alpha)
    p=c.beginPath(); p.rect(x,y,w,h); c.clipPath(p,stroke=0)
    yy=y
    while yy<y+h:
        xx=x
        while xx<x+w:
            a,b=rng.sample(cols,2); fill(c,a); c.rect(xx,yy,size,size,stroke=0,fill=1)
            fill(c,b); t=c.beginPath(); t.moveTo(xx,yy)
            if rng.random()<.5: t.lineTo(xx+size,yy); t.lineTo(xx+size,yy+size)
            else: t.lineTo(xx,yy+size); t.lineTo(xx+size,yy+size)
            t.close(); c.drawPath(t,stroke=0,fill=1); xx+=size
        yy+=size
    c.restoreState()

def stitch(c,x,y,w,h,rgb,r=8):
    """Quilt stitching: a dashed line just inside a shape's edge."""
    c.saveState(); stroke(c,rgb); c.setLineWidth(0.8); c.setDash(3,2.5)
    c.roundRect(x,y,w,h,r,stroke=1,fill=0); c.restoreState()

# ================= card grid helpers =================
GRID_X0=(PAGE_W-3*CARD_W)/2; GRID_Y0=(PAGE_H-3*CARD_H)/2
def card_slots():
    for row in range(3):
        for col in range(3):
            yield GRID_X0+col*CARD_W, GRID_Y0+(2-row)*CARD_H
def crop_marks(c):
    stroke(c,GREY); c.setLineWidth(0.4); L=8
    xs=[GRID_X0+i*CARD_W for i in range(4)]; ys=[GRID_Y0+i*CARD_H for i in range(4)]
    for x in xs:
        c.line(x,GRID_Y0-4-L,x,GRID_Y0-4); c.line(x,GRID_Y0+3*CARD_H+4,x,GRID_Y0+3*CARD_H+4+L)
    for y in ys:
        c.line(GRID_X0-4-L,y,GRID_X0-4,y); c.line(GRID_X0+3*CARD_W+4,y,GRID_X0+3*CARD_W+4+L,y)
    stroke(c,LGREY); c.setDash(2,3)
    for x in xs[1:-1]: c.line(x,GRID_Y0,x,GRID_Y0+3*CARD_H)
    for y in ys[1:-1]: c.line(GRID_X0,y,GRID_X0+3*CARD_W,y)
    c.setDash()

def card_frame(c,x,y,rgb,top,right,title_size=8):
    stroke(c,INK); c.setLineWidth(0.6); fill(c,CREAM)
    c.roundRect(x+3,y+3,CARD_W-6,CARD_H-6,6,stroke=1,fill=1)
    fill(c,rgb); c.roundRect(x+3,y+CARD_H-25,CARD_W-6,22,6,stroke=0,fill=1)
    c.rect(x+3,y+CARD_H-25,CARD_W-6,8,stroke=0,fill=1)
    fill(c,(1,1,1)); c.setFont("DVB",title_size); c.drawString(x+10,y+CARD_H-18,top)
    c.setFont("DV",6.5); c.drawRightString(x+CARD_W-10,y+CARD_H-18,right)

# ================= deal cards =================
def deal_card(c,x,y,d,i,card,era="",era_years=""):
    """A deal styled as real paperwork: a form number, ruled fine print, a signature line."""
    cid=f"{DABBR[d]}-{i+1:02d}"
    card_frame(c,x,y,DCOL[d],d,f"{era+' · ' if era else ''}FORM {cid}")
    ix=x+10; iw=CARD_W-20
    stroke(c,LGREY); c.setLineWidth(0.5); c.setDash(1.5,2)                  # perforation
    c.line(x+8,y+CARD_H-29,x+CARD_W-8,y+CARD_H-29); c.setDash()
    fill(c,GREY); c.setFont("DVB",5.4); c.drawString(ix,y+CARD_H-37,"WHAT YOU SEE")
    c.setFont("DVI",5.4); c.drawRightString(x+CARD_W-10,y+CARD_H-37,era_years or Dk.DAYTON[d]["sub"])
    lines,size=fit_lines(card["front"],"DVB",8.4,iw,3,6.4)
    fill(c,INK); c.setFont("DVB",size); ty=y+CARD_H-47
    for ln in lines: c.drawString(ix,ty,ln); ty-=size+1.6
    top=y+CARD_H-76; zone_h=39; gap=12
    for n,key in ((1,"red"),(2,"amber"),(3,"blue")):
        hy=top-(n-1)*(zone_h+gap)
        dot(c,ix+3,hy-2.5,2.6,LAYER_COL[n])
        fill(c,INK); c.setFont("DVB",5.8)
        c.drawString(ix+9,hy-4.5,f"READ {n} · THE {LAYER_NAME[n]}")
        if n==1: fill(c,GREY); c.setFont("DV",4.6); c.drawRightString(x+CARD_W-10,hy-4.5,"(fine print — use your glasses)")
        txt=card[key]
        if n==1:
            txt+=("   ▸ HONEST DEAL — no trap, no lever." if not card["trap"]
                  else f"   ▸ LEVER: {LEVER_WORD[card['lever']]}")
        decoder_zone(c,ix,hy-8-zone_h,iw,zone_h,txt,seed=seed_of(d,i,n))
    stroke(c,INK); c.setLineWidth(0.5); c.line(ix+8,y+17,ix+70,y+17)
    fill(c,INK); c.setFont("DVB",7); c.drawString(ix,y+18,"X")
    fill(c,GREY); c.setFont("DV",5.2); c.drawRightString(x+CARD_W-10,y+18,"TAKE · WALK · NEGOTIATE")
    c.setFont("DV",4.6); c.drawRightString(x+CARD_W-10,y+11,"Negotiate: 1 Trust, Read ≥ lever")

def card_back(c,x,y,label="THE SECOND NUMBER",sub="read the machine"):
    stroke(c,INK); c.setLineWidth(0.6); fill(c,NAVY)
    c.roundRect(x+3,y+3,CARD_W-6,CARD_H-6,6,stroke=1,fill=1)
    quilt(c,x+10,y+10,CARD_W-20,CARD_H-20,list(DCOL.values()),size=0.42*inch,alpha=0.22)
    stroke(c,GOLD); c.setLineWidth(1.2); c.roundRect(x+10,y+10,CARD_W-20,CARD_H-20,4,stroke=1,fill=0)
    cx,cy=x+CARD_W/2,y+CARD_H/2
    stroke(c,GOLD); c.setLineWidth(1); c.circle(cx,cy+18,22,stroke=1,fill=0)
    fill(c,LAYER_COL[1]); c.circle(cx-9,cy+18,7,stroke=0,fill=1)
    fill(c,LAYER_COL[2]); c.circle(cx+9,cy+18,7,stroke=0,fill=1)
    fill(c,LAYER_COL[3]); c.circle(cx,cy+30,7,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",11); c.drawCentredString(cx,cy-20,label.split()[0]+" "+label.split()[1] if len(label.split())>2 else label)
    if len(label.split())>2: c.drawCentredString(cx,cy-34," ".join(label.split()[2:]))
    fill(c,CREAM); c.setFont("DVI",7); c.drawCentredString(cx,cy-50,sub)

def build_deal_pages(c):
    allc=[(d,i,card) for d in Dk.DECK for i,card in enumerate(Dk.DECK[d])]
    pages=[allc[k:k+9] for k in range(0,len(allc),9)]
    for pi,pg in enumerate(pages):
        crop_marks(c)
        for (x,y),(d,i,card) in zip(card_slots(),pg): deal_card(c,x,y,d,i,card)
        sheet_label(c,f"Deal cards {pi+1}/{len(pages)}"); c.showPage()
    crop_marks(c)
    for x,y in card_slots(): card_back(c,x,y)
    sheet_label(c,"Card backs (optional)"); c.showPage()

# ================= role / owner / scenario / pattern cards =================
def text_card(c,x,y,rgb,top,right,title,body,extra=None,body_size=8):
    card_frame(c,x,y,rgb,top,right)
    ix=x+12; iw=CARD_W-24
    lines,size=fit_lines(title,"DVB",13,iw,3,9)
    fill(c,INK); c.setFont("DVB",size); ty=y+CARD_H-48
    for ln in lines: c.drawString(ix,ty,ln); ty-=size+2
    stroke(c,GOLD); c.setLineWidth(1); c.line(ix,ty+size-6,ix+40,ty+size-6); ty-=8
    lines,size=fit_lines(body,"DV",body_size,iw,14,6)
    c.setFont("DV",size)
    for ln in lines: c.drawString(ix,ty,ln); ty-=size+2.4
    if extra:
        ty-=4; fill(c,GREY); c.setFont("DVI",6.6)
        for ln in simpleSplit(extra,"DVI",6.6,iw): c.drawString(ix,ty,ln); ty-=8.6

ROLE_FLAVOR={"Translator":"The bridge.","Student":"The hungry one.","Elder":"The memory of the block.",
             "Veteran":"Came home to protect it.","Organizer":"Rallies the block."}
def build_other_cards(c):
    cards=[]
    for o,txt in Dk.OWNERS.items():
        cards.append((hx("7a1f2b"),"THE OWNER","hidden",o,txt,
                     "Revealed when total Clarity reaches 9. Until then, watch the board and deduce it."))
    for s_,txt in Dk.SCENARIOS.items():
        dayton="Dayton" in txt
        cards.append((hx("3b2f5c") if not dayton else GOLD,"SCENARIO","West Dayton" if dayton else "setup",s_,txt,None))
    for combo,name,lesson in Dk.PATTERNS:
        cards.append((hx("8b1e1e"),"MACHINE PATTERN"," + ".join(DABBR[d] for d in combo),
                      name.title() if name.isupper() else name,lesson,
                      "Forms when every district listed is at Squeeze 2+. Tightens each round. Break it by pulling one district below 2."))
    for d,hs in Dk.HISTORY.items():
        for h in hs:
            cards.append((hx("5a3d1e"),"HISTORY",("any district" if d=="ANY" else d.lower()),h["title"],
                          f"{h['year']} · {h['place']}. {h['story']}",f"“{h['lesson']}”",7))
    cards.append((hx("2f7a4a"),"THE GREEN BOOK","once per game","A Safe Route",
                  "When any Machine strike would capture a district, open the Green Book: "
                  "that strike lands nowhere. It still counts as the Machine's move there this round.",
                  "After The Negro Motorist Green Book (1936–1966), the guide Black travelers used to find the places that would serve them safely."))
    pages=[cards[k:k+9] for k in range(0,len(cards),9)]
    for pi,pg in enumerate(pages):
        crop_marks(c)
        for (x,y),a in zip(card_slots(),pg): text_card(c,x,y,*a)
        sheet_label(c,f"Character cards {pi+1}/{len(pages)}"); c.showPage()
    crop_marks(c)
    for x,y in card_slots(): card_back(c,x,y,"THE OWNER","one machine · one hand")
    sheet_label(c,"Owner card backs"); c.showPage()

# ================= hand fans & pieces =================
def hand_fan(c,cx,cy,role,gift):
    """A church hand fan: a round paddle on a stick. Front: the role. 'Sponsor' panel: the gift."""
    r=1.55*inch
    fill(c,hx("c9a26b")); stroke(c,INK); c.setLineWidth(0.8)
    c.roundRect(cx-0.16*inch,cy-r-1.55*inch,0.32*inch,1.75*inch,4,stroke=1,fill=1)       # the stick
    fill(c,CREAM); c.circle(cx,cy,r,stroke=1,fill=1)
    c.saveState(); p=c.beginPath(); p.circle(cx,cy,r-3); c.clipPath(p,stroke=0)
    quilt(c,cx-r,cy-r,2*r,2*r,[GOLD,hx("E03C31"),hx("8E3BB8"),hx("1F7AE0")],size=0.38*inch,alpha=0.16)
    c.restoreState()
    stroke(c,GOLD); c.setLineWidth(1.4); c.circle(cx,cy,r-6,stroke=1,fill=0)
    fill(c,NAVY); c.circle(cx,cy+0.45*inch,0.5*inch,stroke=0,fill=1)                        # portrait
    img=art(f"role-{role.lower()}")
    if img:
        # the drawn portrait is itself a fan (viewBox -2..62 × -2..78, face r=24 at 30,30): crop to its face
        u=0.5*inch/24
        c.saveState(); p=c.beginPath(); p.circle(cx,cy+0.45*inch,0.5*inch); c.clipPath(p,stroke=0)
        c.drawImage(img,cx-32*u,cy+0.45*inch+32*u-80*u,64*u,80*u,mask="auto")
        c.restoreState()
        stroke(c,GOLD); c.setLineWidth(1.2); c.circle(cx,cy+0.45*inch,0.5*inch,stroke=1,fill=0)
    else:
        fill(c,GOLDL); c.setFont("DVI",5.5); c.drawCentredString(cx,cy+0.47*inch,"portrait —")
        c.drawCentredString(cx,cy+0.38*inch,"commission")
    fill(c,INK); c.setFont("DVB",13); c.drawCentredString(cx,cy-0.25*inch,f"The {role}")
    lines,size=fit_lines(gift,"DV",7.4,2*r-0.75*inch,5,6)
    c.setFont("DV",size); ty=cy-0.45*inch
    for ln in lines: c.drawCentredString(cx,ty,ln); ty-=size+2
    start="Start: 2 Trust · Read 1 everywhere" if role=="Elder" else "Start: 2 Trust · Read 0"
    fill(c,GREY); c.setFont("DVI",6); c.drawCentredString(cx,cy-r+0.28*inch,start)
    fill(c,INK); c.setFont("DVB",6); c.drawCentredString(cx,cy-r-0.3*inch,"ROLE")

def paper_plate(c,cx,cy):
    r=1.45*inch
    import math
    fill(c,(1,1,1)); stroke(c,GREY); c.setLineWidth(0.6)
    for k in range(48):                                              # fluted rim
        a=2*math.pi*k/48
        c.circle(cx+(r-1)*math.cos(a),cy+(r-1)*math.sin(a),6,stroke=1,fill=1)
    c.setLineWidth(0); c.circle(cx,cy,r-2,stroke=0,fill=1)
    stroke(c,LGREY); c.setLineWidth(1); c.circle(cx,cy,r-0.32*inch,stroke=1,fill=0)
    fill(c,hx("E03C31")); c.setFont("DVB",15); c.drawCentredString(cx,cy+0.5*inch,"THE COOKOUT")
    fill(c,INK); c.setFont("DV",7)
    for k,ln in enumerate(["Once per game, at the start of a round.","No block actions this round.",
                           "Everyone: +2 Trust, −1 Shady, +1 Props,","and Read in one district up to",
                           "the best reader at the table.","Flip this plate over when it's been had."]):
        c.drawCentredString(cx,cy+0.22*inch-k*10,ln)

def sousou_label(c,x,y,w,h):
    fill(c,GOLD); stroke(c,INK); c.setLineWidth(0.8); c.rect(x,y,w,h,stroke=1,fill=1)
    quilt(c,x,y,w,h,[hx("E03C31"),hx("3FA34D"),NAVY],size=0.3*inch,alpha=0.12)
    fill(c,NAVY); c.setFont("DVB",18); c.drawString(x+0.25*inch,y+h-0.45*inch,"THE SOU-SOU")
    c.setFont("DV",8)
    for k,ln in enumerate(["Tape this around a coffee can. At the end of the block's turns, the table may throw a hand:",
                           "everyone with Trust drops 1 in the can. At 4, the next player in the circle takes the hand",
                           "and clears 2 Squeeze from any district — paid off clean, no Shady."]):
        c.drawString(x+0.25*inch,y+h-0.68*inch-k*10.5,ln)
    fill(c,INK); c.setFont("DVI",7); c.drawRightString(x+w-0.2*inch,y+0.12*inch,"also called a susu, “the hand,” or “the club”")

def build_fans_and_pieces(c):
    roles=list(Dk.ROLES.items())
    top,bot=PAGE_H-2.05*inch,4.05*inch                     # sticks clear the footer
    spots=[(PAGE_W*0.27,top),(PAGE_W*0.73,top),(PAGE_W*0.27,bot),(PAGE_W*0.73,bot)]
    for (cx,cy),(r,g) in zip(spots,roles[:4]): hand_fan(c,cx,cy,r,g)
    footer(c,"Role cards as church hand fans 1/2 — cut out, glue to a craft stick"); c.showPage()
    hand_fan(c,PAGE_W*0.27,PAGE_H-2.05*inch,*roles[4])
    paper_plate(c,PAGE_W*0.73,PAGE_H-2.05*inch)
    sousou_label(c,0.5*inch,0.75*inch,PAGE_W-inch,1.25*inch)
    fill(c,GREY); c.setFont("DVI",8)
    c.drawCentredString(PAGE_W/2,2.35*inch,"Hand fans, a paper plate and a coffee can: the game's pieces are the things already on the table.")
    footer(c,"Role fans 2/2 · the Cookout plate · the Sou-Sou can"); c.showPage()

# ================= Grandma's reading glasses =================
def build_glasses(c):
    fill(c,INK); c.setFont("DVB",20); c.drawString(inch,PAGE_H-inch,"Grandma's reading glasses")
    fill(c,GREY); c.setFont("DV",9.5); y=PAGE_H-1.35*inch
    for ln in simpleSplit("The decoder lens, the way every family knows it: \"Put your glasses on and read it again.\" "
                          "Print on cardstock. Cut out the frame and both arms. Cut out the two lens holes, tape red film "
                          "over them from behind, fold the arm tabs and tape them to the frame's ends. One pair per table is "
                          "enough; pass them to whoever is facing a deal.","DV",9.5,PAGE_W-2*inch):
        c.drawString(inch,y,ln); y-=12.5
    cx=PAGE_W/2; cy=PAGE_H-3.6*inch
    stroke(c,INK); c.setLineWidth(1.2); fill(c,NAVY)
    c.roundRect(cx-3.1*inch,cy-0.85*inch,6.2*inch,1.7*inch,0.5*inch,stroke=1,fill=1)       # frame
    fill(c,(1,1,1))
    for dx in (-1.45*inch,1.45*inch):
        c.roundRect(cx+dx-1.15*inch,cy-0.62*inch,2.3*inch,1.24*inch,0.45*inch,stroke=1,fill=1)   # lens holes
        fill(c,LAYER_COL[1]); c.setFont("DVB",8); c.drawCentredString(cx+dx,cy-0.05*inch,"cut out · red film behind"); fill(c,(1,1,1))
    stroke(c,GOLD); c.setLineWidth(1); c.setDash(2,2)
    c.roundRect(cx-3.0*inch,cy-0.75*inch,6.0*inch,1.5*inch,0.45*inch,stroke=1,fill=0); c.setDash()
    fill(c,GOLD); c.setFont("DVB",7); c.drawCentredString(cx,cy-0.98*inch,"THE SECOND NUMBER · cut along the outer edge")
    for k in range(2):                                                                         # arms
        ay=cy-2.0*inch-k*0.9*inch
        stroke(c,INK); c.setLineWidth(1.2); fill(c,NAVY)
        c.roundRect(cx-3.1*inch,ay,5.6*inch,0.42*inch,0.2*inch,stroke=1,fill=1)
        c.roundRect(cx+2.4*inch,ay-0.35*inch,0.55*inch,0.77*inch,0.2*inch,stroke=1,fill=1)  # ear hook
        stroke(c,GOLD); c.setDash(2,2); c.line(cx-2.7*inch,ay,cx-2.7*inch,ay+0.42*inch); c.setDash()
        fill(c,GOLDL); c.setFont("DV",6.5); c.drawString(cx-3.05*inch,ay+0.16*inch,"fold")
        c.drawString(cx-2.5*inch,ay+0.16*inch,f"arm {k+1} — tape the folded tab to the frame's end")
    y=cy-4.1*inch
    fill(c,INK); c.setFont("DVB",11); c.drawString(inch,y,"No glue? Make a hand lens instead"); y-=14
    fill(c,GREY); c.setFont("DV",9.5); c.drawString(inch,y,"Cut out a holder, tape red film over the window, and hold it over the card."); y-=10
    for k in range(3):
        x0=inch+k*2.25*inch; stroke(c,INK); c.setLineWidth(1); fill(c,NAVY)
        c.roundRect(x0,y-1.65*inch,2*inch,1.4*inch,10,stroke=1,fill=1)
        fill(c,(1,1,1)); c.roundRect(x0+0.2*inch,y-1.45*inch,1.6*inch,0.9*inch,8,stroke=1,fill=1)
        fill(c,GOLD); c.setFont("DVB",6.5); c.drawCentredString(x0+inch,y-0.45*inch,"READ THE SECOND NUMBER")
    footer(c,"The lens: Grandma's reading glasses"); c.showPage()

# ================= tokens =================
def bottle_cap(c,cx,cy,r,rgb,label):
    import math
    fill(c,rgb); stroke(c,INK); c.setLineWidth(0.4)
    pts=[]
    for k in range(42):
        a=2*math.pi*k/42; rr=r if k%2==0 else r*0.9; pts.append((cx+rr*math.cos(a),cy+rr*math.sin(a)))
    p=c.beginPath(); p.moveTo(*pts[0])
    for pt in pts[1:]: p.lineTo(*pt)
    p.close(); c.drawPath(p,stroke=1,fill=1)
    stroke(c,(1,1,1)); c.setLineWidth(0.6); c.circle(cx,cy,r*0.68,stroke=1,fill=0)
    fill(c,(1,1,1)); c.setFont("DVB",r*0.55); c.drawCentredString(cx,cy-r*0.2,label)

def build_tokens(c):
    fill(c,INK); c.setFont("DVB",16); c.drawString(0.6*inch,PAGE_H-0.75*inch,"Tokens: bottle caps, chips and markers")
    fill(c,GREY); c.setFont("DV",8.5)
    c.drawString(0.6*inch,PAGE_H-0.98*inch,"Print on cardstock and punch or cut out. Real bottle caps, coins or beans work just as well.")
    rows=[("TRUST — bottle caps",GOLD,"T",30),("SHADY — the gold-chain chips",hx("b8860b"),"$",20),
          ("READ markers (player boards)",hx("5a5470"),"S",25),("CLARITY markers",hx("3FA34D"),"C",10),
          ("SQUEEZE markers",LAYER_COL[1],"P",10),("UNDERWORLD THREADS & round marker",LAYER_COL[3],"✦",5)]
    y=PAGE_H-1.35*inch
    for label,col,ch,n in rows:
        fill(c,INK); c.setFont("DVB",8.5); c.drawString(0.6*inch,y,label); y-=0.32*inch
        per=15; r=0.2*inch
        for k in range(n):
            cx=0.6*inch+r+(k%per)*0.49*inch; cy=y-(k//per)*0.48*inch
            bottle_cap(c,cx,cy,r,col,ch)
        y-=((n-1)//per+1)*0.48*inch+0.12*inch
    footer(c,"Tokens"); c.showPage()

# ================= cover & lens page =================
def build_cover(c):
    fill(c,NAVY); c.rect(0,0,PAGE_W,PAGE_H,stroke=0,fill=1)
    quilt(c,0,0,PAGE_W,PAGE_H,list(DCOL.values())+[GOLD],size=0.75*inch,alpha=0.13)
    fill(c,NAVY); c.roundRect(0.85*inch,1.0*inch,PAGE_W-1.7*inch,PAGE_H-2.0*inch,14,stroke=0,fill=1)
    stitch(c,0.95*inch,1.1*inch,PAGE_W-1.9*inch,PAGE_H-2.2*inch,GOLD,12)
    cx=PAGE_W/2
    for i,(dx,dy) in enumerate(((-30,0),(30,0),(0,48))):
        fill(c,LAYER_COL[i+1]); c.circle(cx+dx,PAGE_H-2.9*inch+dy,30,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",42); c.drawCentredString(cx,PAGE_H-4.15*inch,"THE SECOND")
    c.drawCentredString(cx,PAGE_H-4.78*inch,"NUMBER")
    fill(c,hx("E03C31")); c.roundRect(cx-1.55*inch,PAGE_H-5.28*inch,3.1*inch,0.34*inch,6,stroke=0,fill=1)
    fill(c,CREAM); c.setFont("DVB",12); c.drawCentredString(cx,PAGE_H-5.18*inch,EDITION.upper())
    c.setFont("DVI",13); c.drawCentredString(cx,PAGE_H-5.75*inch,"read the machine · wake the block · don't become it")
    c.setFont("DV",10.5)
    c.drawCentredString(cx,PAGE_H-6.2*inch,"A cooperative game for 2–5 players · ages 12+ · 45–60 minutes")
    n_deals=sum(len(v) for v in Dk.DECK.values()); n_hon=sum(1 for v in Dk.DECK.values() for x in v if not x["trap"])
    n_hist=sum(len(v) for v in Dk.HISTORY.values())
    fill(c,GOLDL); c.setFont("DVB",10); c.drawCentredString(cx,PAGE_H-6.85*inch,"IN THIS KIT")
    fill(c,CREAM); c.setFont("DV",9.2)
    items=["The lens: printer test + Grandma's reading glasses to cut out","Rulebook and quick reference",
           "The West Dayton board · 5 player boards · tokens",
           "Role cards as church hand fans · the Cookout plate · the Sou-Sou can",
           f"{n_deals} Deal cards ({n_deals-n_hon} real traps, {n_hon} honest deals) + backs",
           f"4 Owners · {len(Dk.SCENARIOS)} Scenarios · {len(Dk.PATTERNS)} Patterns · {n_hist} History cards · the Green Book",
           "Facilitator answer key · playtest log"]
    y=PAGE_H-7.15*inch
    for it in items: c.drawCentredString(cx,y,it); y-=13.5
    fill(c,GREY); c.setFont("DVI",8)
    c.drawCentredString(cx,1.3*inch,"Made for the West Side of Dayton, Ohio. Part of the Individual Democracy / Civic Armor universe.")
    c.showPage()

def build_lens_page(c):
    fill(c,INK); c.setFont("DVB",20); c.drawString(inch,PAGE_H-inch,"Before you cut: the decoder lens")
    fill(c,GREY); c.setFont("DV",10)
    paras=[
     ("What you need","A color printer, plain paper and some cardstock, scissors, tape, a few craft sticks (for the hand fans), an empty coffee can (for the Sou-Sou), and a sheet of RED transparent film — red acetate, a red lighting gel, red cellophane, or even a red candy wrapper. Two layers of thin cellophane work better than one. Tokens are in the kit, or use bottle caps, coins or beans."),
     ("How the trick works","Each hidden layer is printed in cyan, buried under dense red decoy letters. To the naked eye it's a red blur. Through the red lens the red washes out to the color of the paper and the cyan turns dark, so the second number appears."),
     ("Print settings","Print at 100% / 'Actual size' (not 'fit to page') in COLOR on the best quality setting. Card sheets are 2.5 × 3.5 in poker size, so they fit standard sleeves. Sleeving each card in front of an old playing card keeps cards opaque and shuffleable. Cut on the solid crop marks. Card backs are optional (print them on the reverse of any card sheet), but the Owner backs matter: glue or sleeve one onto each Owner card so the Owner stays hidden."),
     ("Test your printer first","Print this page and look at the three strips below through your lens (make it from the next page: Grandma's reading glasses). You should read each line clearly through the lens and NOT read it without one. If you can read the hidden line without the lens, use cardstock, a darker red film, or double up the film."),
    ]
    y=PAGE_H-1.45*inch
    for h,t in paras:
        fill(c,INK); c.setFont("DVB",11); c.drawString(inch,y,h); y-=14
        fill(c,INK); c.setFont("DV",9.5)
        for ln in simpleSplit(t,"DV",9.5,PAGE_W-2*inch): c.drawString(inch,y,ln); y-=12.5
        y-=8
    y-=10
    tests=["IF YOU CAN READ THIS, YOUR LENS WORKS.",
           "THE SECOND NUMBER: 391% APR. THE FEE IS THE PRODUCT.",
           "READ 3 · THE CONNECTION — IT WAS ALWAYS ONE MACHINE."]
    for k,t in enumerate(tests):
        dot(c,inch+4,y-14,4,LAYER_COL[k+1])
        decoder_zone(c,inch+16,y-30,PAGE_W-2*inch-16,30,t,seed=900+k,size=12,lead=14,decoy=10)
        y-=46
    y-=6
    fill(c,INK); c.setFont("DVB",11); c.drawString(inch,y,"The honor rule"); y-=14
    c.setFont("DV",9.5)
    for ln in simpleSplit("Every deal card has three hidden zones: red (Read 1), amber (Read 2) and blue (Read 3). "
        "When you face a deal, hold the lens only over the zones your Read in that district unlocks — no deeper. "
        "The table watches. The lever (or 'honest deal') is printed inside the red zone, so a blind player "
        "(Read 0) sees only the pitch.","DV",9.5,PAGE_W-2*inch): c.drawString(inch,y,ln); y-=12.5
    footer(c,"Lens & printer test"); c.showPage()

# ================= board =================
def build_board(c):
    W,H=landscape(letter); c.setPageSize((W,H))
    fill(c,CREAM); c.rect(0,0,W,H,stroke=0,fill=1)
    quilt(c,0,0,W,H-0.75*inch,list(DCOL.values()),size=0.6*inch,alpha=0.07)
    fill(c,NAVY); c.rect(0,H-0.75*inch,W,0.75*inch,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",20); c.drawString(0.5*inch,H-0.45*inch,"THE SECOND NUMBER")
    fill(c,CREAM); c.setFont("DVI",8.5); c.drawString(0.5*inch,H-0.64*inch,f"{EDITION} · five districts, one machine")
    c.setFont("DVB",8); fill(c,CREAM); c.drawString(W-5.9*inch,H-0.32*inch,"ROUND")
    for r in range(1,13):
        bx=W-5.4*inch+(r-1)*0.4*inch
        stroke(c,GOLD); fill(c,NAVY); c.rect(bx,H-0.62*inch,0.34*inch,0.34*inch,stroke=1,fill=1)
        fill(c,GOLD if r<12 else LAYER_COL[1]); c.setFont("DVB",9); c.drawCentredString(bx+0.17*inch,H-0.5*inch,str(r))
    fill(c,CREAM); c.setFont("DV",6.2)
    def seq(h): return ",".join(str(int(h*r)-int(h*(r-1))) for r in (1,2,3,4))+"…"
    c.drawRightString(W-0.5*inch,H-0.72*inch,"strikes a round · " + " · ".join(f"{k}p: {seq(E.MACHINE_HITS[k])}" for k in (2,3,4,5))
                      + " · end of round 12 = the Machine wins")
    # districts as quilt blocks
    SCENE=0.62*inch      # the district's scene, under its header
    colw=(W-inch)/5; top=H-0.9*inch; ch=3.2*inch+SCENE
    for k,d in enumerate(E.DISTRICTS):
        x=0.5*inch+k*colw; rgb=DCOL[d]
        fill(c,(1,1,1)); stroke(c,rgb); c.setLineWidth(2); c.roundRect(x+4,top-ch,colw-8,ch,8,stroke=1,fill=1)
        stitch(c,x+8,top-ch+4,colw-16,ch-8,rgb,6)
        fill(c,rgb); c.roundRect(x+4,top-0.5*inch,colw-8,0.5*inch,8,stroke=0,fill=1)
        c.rect(x+4,top-0.5*inch,colw-8,0.2*inch,stroke=0,fill=1)
        fill(c,(1,1,1)); c.setFont("DVB",12); c.drawCentredString(x+colw/2,top-0.27*inch,d)
        c.setFont("DVI",6.6); c.drawCentredString(x+colw/2,top-0.42*inch,Dk.DAYTON[d]["sub"])
        img=art(f"district-{d.lower()}")
        if img:
            c.saveState(); p=c.beginPath(); p.rect(x+4,top-0.5*inch-SCENE,colw-8,SCENE); c.clipPath(p,stroke=0)
            iw=colw-8; ih=iw*7/20      # 20:7, centred in the strip
            c.drawImage(img,x+4,top-0.5*inch-SCENE/2-ih/2,iw,ih,mask="auto")
            c.restoreState()
        body=top-SCENE
        def track(label,yy,col,last):
            fill(c,INK); c.setFont("DVB",7.5); c.drawString(x+14,yy+0.36*inch,label)
            for n in range(4):
                bx=x+14+n*((colw-36)/4+3); bw=(colw-36)/4
                stroke(c,col); c.setLineWidth(1.2); fill(c,(1,1,1) if n<3 else col)
                c.rect(bx,yy,bw,0.3*inch,stroke=1,fill=1)
                fill(c,col if n<3 else (1,1,1)); c.setFont("DVB",9); c.drawCentredString(bx+bw/2,yy+0.1*inch,str(n))
            fill(c,col); c.setFont("DVB",6.5); c.drawRightString(x+colw-14,yy+0.36*inch,last)
        track("CLARITY",body-1.1*inch,rgb,"3 = AWAKE")
        track("SQUEEZE",body-1.8*inch,LAYER_COL[1],"3 = CAPTURED")
        fill(c,GREY); c.setFont("DV",6.3); c.drawString(x+14,body-1.95*inch,"2+ = gripped (counts for Patterns)")
        stroke(c,rgb); c.setDash(3,3); c.setLineWidth(1)
        c.roundRect(x+16,body-3.0*inch,0.85*inch,0.9*inch,5,stroke=1,fill=0); c.setDash()
        fill(c,rgb); c.setFont("DVB",6.5); c.drawCentredString(x+16+0.425*inch,body-2.52*inch,"deal pile")
        stroke(c,LAYER_COL[3]); c.setLineWidth(1.4); fill(c,(1,1,1)); c.circle(x+colw-0.55*inch,body-2.55*inch,0.24*inch,stroke=1,fill=1)
        fill(c,LAYER_COL[3]); c.setFont("DVB",5); c.drawCentredString(x+colw-0.55*inch,body-2.57*inch,"THREAD")
        fill(c,GREY); c.setFont("DV",5.5); c.drawCentredString(x+colw-0.55*inch,body-2.95*inch,"Read 3 + awake")
    # the Commons row: five West Side places
    cy=top-ch-0.12*inch; chh=1.05*inch; tw=(W-inch)/5
    fill(c,NAVY); c.setFont("DVB",8); c.drawString(0.55*inch,cy-0.1*inch,"THE COMMONS — gather here: +2 Trust, −1 Shady, plus the place's bonus")
    for k,(key,P) in enumerate(Dk.PLACES.items()):
        x=0.5*inch+k*tw; y=cy-chh-0.15*inch
        fill(c,CREAM); stroke(c,GOLD); c.setLineWidth(1.4); c.roundRect(x+4,y,tw-8,chh,8,stroke=1,fill=1)
        stitch(c,x+8,y+4,tw-16,chh-8,GOLD,6)
        fill(c,INK); c.setFont("DVB",8.2); lines,_=fit_lines(P["name"],"DVB",8.2,tw-26,2)
        ty=y+chh-0.2*inch
        for ln in lines: c.drawString(x+13,ty,ln); ty-=10
        fill(c,GREY); c.setFont("DVI",6.2); c.drawString(x+13,ty,P["where"]); ty-=10
        fill(c,INK); c.setFont("DV",6.6)
        for ln in simpleSplit(P["bonus"],"DV",6.6,tw-26): c.drawString(x+13,ty,ln); ty-=8.4
    # the Underworld strip with the Sou-Sou can, Green Book and Cookout slots
    uy=0.3*inch; uh=1.62*inch
    fill(c,NAVY); c.roundRect(0.5*inch,uy,W-inch,uh,8,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",12); c.drawString(0.7*inch,uy+uh-0.3*inch,"THE UNDERWORLD")
    fill(c,CREAM); c.setFont("DV",7.2)
    c.drawString(0.7*inch,uy+uh-0.47*inch,"Total Clarity across all five districts. At 9 it cracks open: flip the Owner; it fights in the open")
    c.drawString(0.7*inch,uy+uh-0.6*inch,"(+1 strike, one cover-up per round). Trace 3 threads, then EXPOSE to win.")
    for n in range(16):
        bx=0.7*inch+n*0.31*inch; by=uy+0.55*inch
        col=GOLD if n>=9 else hx("3b2f5c")
        fill(c,col); c.rect(bx,by,0.27*inch,0.27*inch,stroke=0,fill=1)
        fill(c,NAVY if n>=9 else CREAM); c.setFont("DVB",7.5); c.drawCentredString(bx+0.135*inch,by+0.085*inch,str(n))
    fill(c,GOLD); c.setFont("DVB",6.5); c.drawString(0.7*inch+9*0.31*inch,uy+0.42*inch,"▲ 9: CRACKS OPEN")
    fill(c,CREAM); c.setFont("DV",6)
    c.drawString(0.7*inch,uy+0.24*inch,"Spread rule: the Machine acts on each district at most once per round.")
    c.drawString(0.7*inch,uy+0.12*inch,"Lose: 2 districts captured · everyone Falls · round 12 ends.")
    slots=[("OWNER","face-down"),("PATTERNS","read aloud"),("SOU-SOU","the can · pot 0–4"),("GREEN BOOK","once per game"),("COOKOUT","the plate")]
    sx=W-0.6*inch-len(slots)*0.86*inch
    for k,(t,sub) in enumerate(slots):
        x0=sx+k*0.86*inch
        stroke(c,GOLD); c.setDash(3,3); c.roundRect(x0,uy+0.15*inch,0.8*inch,1.25*inch,6,stroke=1,fill=0); c.setDash()
        fill(c,GOLD); c.setFont("DVB",6.5); c.drawCentredString(x0+0.4*inch,uy+0.85*inch,t)
        fill(c,CREAM); c.setFont("DV",5.4); c.drawCentredString(x0+0.4*inch,uy+0.72*inch,sub)
    c.showPage(); c.setPageSize(letter)

def build_block_party(c):
    """The Block Party board: three districts, eight rounds, the strikes printed on the round track."""
    W,H=landscape(letter); c.setPageSize((W,H))
    fill(c,CREAM); c.rect(0,0,W,H,stroke=0,fill=1)
    fill(c,NAVY); c.rect(0,H-0.75*inch,W,0.75*inch,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",20); c.drawString(0.5*inch,H-0.45*inch,"BLOCK PARTY")
    fill(c,CREAM); c.setFont("DVI",8.5); c.drawString(0.5*inch,H-0.64*inch,"the 25-minute intro · wake 2 of 3 districts in 8 rounds")
    # the round track, with the strikes for each player count under every round
    tx=W-6.0*inch; c.setFont("DVB",7); fill(c,CREAM); c.drawString(tx-0.55*inch,H-0.3*inch,"ROUND")
    for r in range(1,E.BP_ROUNDS+1):
        bx=tx+(r-1)*0.62*inch
        stroke(c,GOLD); fill(c,NAVY); c.rect(bx,H-0.42*inch,0.56*inch,0.3*inch,stroke=1,fill=1)
        fill(c,GOLD if r<E.BP_ROUNDS else LAYER_COL[1]); c.setFont("DVB",9); c.drawCentredString(bx+0.28*inch,H-0.33*inch,str(r))
    fill(c,NAVY); c.setFont("DVB",6.5); c.drawRightString(tx-0.08*inch,H-0.9*inch,"STRIKES")
    c.setFont("DV",7)
    for j,k in enumerate((2,3,4,5)):
        h=E.BP_HITS[k]; yy=H-0.9*inch-(j+1)*0.13*inch
        fill(c,INK); c.drawRightString(tx-0.08*inch,yy,f"{k} players")
        for r in range(1,E.BP_ROUNDS+1):
            c.drawCentredString(tx+(r-1)*0.62*inch+0.28*inch,yy,str(int(h*r)-int(h*(r-1))))
    colw=(W-inch)/3; top=H-1.55*inch; ch=3.3*inch
    for k,d in enumerate(E.BP_DISTRICTS):
        x=0.5*inch+k*colw; rgb=DCOL[d]
        fill(c,(1,1,1)); stroke(c,rgb); c.setLineWidth(2); c.roundRect(x+6,top-ch,colw-12,ch,8,stroke=1,fill=1)
        fill(c,rgb); c.roundRect(x+6,top-0.5*inch,colw-12,0.5*inch,8,stroke=0,fill=1)
        fill(c,(1,1,1)); c.setFont("DVB",14); c.drawCentredString(x+colw/2,top-0.3*inch,d)
        c.setFont("DVI",7); c.drawCentredString(x+colw/2,top-0.44*inch,Dk.DAYTON[d]["sub"])
        for label,yy,col,last in (("CLARITY",top-1.3*inch,rgb,"3 = AWAKE"),("SQUEEZE",top-2.1*inch,LAYER_COL[1],"3 = CAPTURED")):
            fill(c,INK); c.setFont("DVB",8); c.drawString(x+18,yy+0.4*inch,label)
            fill(c,col); c.setFont("DVB",7); c.drawRightString(x+colw-18,yy+0.4*inch,last)
            for n in range(4):
                bw=(colw-48)/4; bx=x+18+n*(bw+4)
                stroke(c,col); c.setLineWidth(1.2); fill(c,(1,1,1) if n<3 else col); c.rect(bx,yy,bw,0.34*inch,stroke=1,fill=1)
                fill(c,col if n<3 else (1,1,1)); c.setFont("DVB",10); c.drawCentredString(bx+bw/2,yy+0.12*inch,str(n))
        stroke(c,rgb); c.setDash(3,3); c.roundRect(x+colw/2-0.45*inch,top-ch+0.15*inch,0.9*inch,0.95*inch,5,stroke=1,fill=0); c.setDash()
        fill(c,rgb); c.setFont("DVB",7); c.drawCentredString(x+colw/2,top-ch+0.6*inch,"deal pile")
    # the rules, on the board
    ry=top-ch-0.2*inch
    rules=[("Your turn","2 actions: STUDY (+1 Read here) · FACE A DEAL · TEACH (1 Trust: a teammate +1 Read where you read better) · GATHER (+2 Trust, −1 Shady)."),
           ("A deal","Read 1 shows the red layer: the cost, and trap or honest. TAKE honest help (+2 Trust, +1 Clarity). WALK from a trap: safe. "
                     "NEGOTIATE (1 Trust): if your Read reaches the lever, Squeeze −1 and Clarity +1; if not, you get played: Squeeze +1."),
           ("The shortcut",f"TAKE a trap: Squeeze −2 now (or Clarity +1 where there's no Squeeze), and {E.BP_TAKE} Shady chips on you. At {E.BP_SIT_OUT} chips, hand them back and sit out your next turn."),
           ("The Machine","After everyone's turns, it strikes the district closest to waking: +1 Squeeze and −1 Clarity. Strikes per round are printed under the round track; it may strike the same district twice."),
           ("Win · lose",f"Win the moment {E.BP_WAKE_TO_WIN} districts are awake (Clarity 3). Lose if 2 are captured (Squeeze 3), or round {E.BP_ROUNDS} ends.")]
    for t,b in rules:
        fill(c,NAVY); c.setFont("DVB",8); c.drawString(0.6*inch,ry,t)
        fill(c,INK); c.setFont("DV",7.6)
        for ln in simpleSplit(b,"DV",7.6,W-2.2*inch): c.drawString(1.6*inch,ry,ln); ry-=9.6
        ry-=3
    c.showPage(); c.setPageSize(letter)

def templates_story():
    """Endless deals on paper: every template with its blanks, to roll or pick."""
    s=[PageBreak(),Paragraph("Endless deals: the templates",ST["h1"]),
       Paragraph("For tables that have learned the printed deck. Draw a template for the district, then fill each blank: "
                 "roll a d6 and count down the list (wrap around), or just pick. Read the pitch aloud; at Read 1 the reader works out "
                 "the second number (the math variant) before checking the red line. The website rolls these for you, endlessly.",ST["p"])]
    def blank(t): return re.sub(r"\{(\w+)\}",lambda m:"____" if m.group(1) in G.SLOT_ORDER else "(work it out)",t)
    for d,ts in G.TEMPLATES.items():
        s.append(Paragraph(f'<font color="{Dk.DISTRICT_COLORS[d]}">{d}</font>',ST["h2"]))
        data=[[Paragraph(x,ST["kb"]) for x in ("Pitch","Fill the blanks from","Work it out","Lever")]]
        for t in ts:
            slots="; ".join(f"{k}: "+", ".join(f"{v:,}" if isinstance(v,int) else str(v) for v in t[k]) for k in G.SLOT_ORDER if k in t)
            lev="HONEST" if not t.get("trap",True) else LEVER_WORD[t.get("lever",1)]
            data.append([Paragraph(inline(blank(t["front"])),ST["kb"]),Paragraph(inline(slots),ST["k"]),
                         Paragraph(inline(blank(t["ask"])),ST["k"]),Paragraph(lev,ST["kb"])])
        w=PAGE_W-1.5*inch
        tb=Table(data,repeatRows=1,colWidths=[w*0.36,w*0.24,w*0.28,w*0.12])
        tb.setStyle(TableStyle([("GRID",(0,0),(-1,-1),0.3,colors.Color(*LGREY)),("VALIGN",(0,0),(-1,-1),"TOP"),
            ("BACKGROUND",(0,0),(-1,0),colors.Color(*DCOL[d])),("TEXTCOLOR",(0,0),(-1,0),colors.white)]))
        s.append(tb)
    s.append(Paragraph("The blanks fill in front-to-back as written: in the pitch, a blank is the first number you roll for it, and the same "
                       "number every time that blank comes back. The answer key on the website (and in deal_gen.py) shows every line filled in.",ST["p"]))
    return s

# ================= player boards =================
def player_board(c,y0,role,gift):
    x0=0.5*inch; w=PAGE_W-inch; h=4.85*inch
    stroke(c,NAVY); c.setLineWidth(1.4); fill(c,(1,1,1)); c.roundRect(x0,y0,w,h,10,stroke=1,fill=1)
    fill(c,NAVY); c.roundRect(x0,y0+h-0.55*inch,w,0.55*inch,10,stroke=0,fill=1)
    quilt(c,x0,y0+h-0.55*inch,w,0.55*inch,list(DCOL.values()),size=0.28*inch,alpha=0.12)
    c.rect(x0,y0+h-0.55*inch,w,0.2*inch,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",15); c.drawString(x0+0.25*inch,y0+h-0.38*inch,f"THE {role.upper()}")
    fill(c,CREAM); c.setFont("DV",8)
    lines=simpleSplit(gift,"DV",8,w-3.2*inch)
    for k,ln in enumerate(lines[:2]): c.drawString(x0+2.6*inch,y0+h-0.27*inch-k*10,ln)
    def track(label,y,n,col,last,sub):
        fill(c,INK); c.setFont("DVB",9); c.drawString(x0+0.25*inch,y+0.42*inch,label)
        fill(c,GREY); c.setFont("DV",6.8); c.drawString(x0+1.4*inch,y+0.42*inch,sub)
        for i in range(n+1):
            bx=x0+0.25*inch+i*0.55*inch
            stroke(c,col); c.setLineWidth(1.2); fill(c,col if i==n else (1,1,1))
            c.rect(bx,y,0.48*inch,0.34*inch,stroke=1,fill=1)
            fill(c,(1,1,1) if i==n else col); c.setFont("DVB",10); c.drawCentredString(bx+0.24*inch,y+0.11*inch,str(i))
        fill(c,col); c.setFont("DVB",7); c.drawString(x0+0.25*inch+(n+1)*0.55*inch,y+0.12*inch,last)
    start="start 2" + (" · Elder starts Read 1 everywhere" if role=="Elder" else "")
    track("TRUST",y0+h-1.35*inch,5,GOLD,"max 5",f"{start} · spend on Negotiate, Teach, Reach")
    track("SHADY",y0+h-2.15*inch,6,LAYER_COL[1],"6 = YOU FALL","TAKE on a trap +2 (name the price first) · Commons −1")
    img=art(f"role-{role.lower()}")
    if img:   # the role's church fan, beside the tracks
        fh=1.55*inch; fw=fh*64/80
        c.drawImage(img,x0+w-fw-0.35*inch,y0+h-0.65*inch-fh,fw,fh,mask="auto")
    # sight grid
    gx=x0+0.25*inch; gy=y0+0.45*inch
    fill(c,INK); c.setFont("DVB",9); c.drawString(gx,gy+1.85*inch,"READ")
    fill(c,GREY); c.setFont("DV",6.8); c.drawString(gx+0.6*inch,gy+1.85*inch,"read only the zones you've unlocked")
    for k,d in enumerate(E.DISTRICTS):
        yy=gy+(4-k)*0.34*inch
        fill(c,DCOL[d]); c.setFont("DVB",7.5); c.drawString(gx,yy+0.1*inch,d)
        for n in range(4):
            bx=gx+0.95*inch+n*0.5*inch
            colr=GREY if n==0 else LAYER_COL[n]
            stroke(c,colr); c.setLineWidth(1); fill(c,(1,1,1)); c.rect(bx,yy,0.44*inch,0.28*inch,stroke=1,fill=1)
            fill(c,colr); c.setFont("DVB",8); c.drawCentredString(bx+0.22*inch,yy+0.09*inch,str(n))
    # action summary
    ax=x0+3.35*inch; ay=y0+2.25*inch
    fill(c,INK); c.setFont("DVB",9); c.drawString(ax,ay,"ACTIONS"); ay-=13
    acts=[("Study","+1 Read in a district. +1 Props."),
          ("Face a deal","Read what your Read allows → TAKE / WALK / NEGOTIATE."),
          ("Teach","+1 Read to a teammate where you read better. 1 Trust (Translator: free). +2 Props. Call and response: +1 Props each."),
          ("Commons","Gather at a West Side place: +2 Trust, −1 Shady, plus its bonus (see the board)."),
          ("Reach","2 Trust: a Fallen friend comes home at Shady 4. +3 Props."),
          ("Trace","Underworld open, Read 3, district awake → place a thread. +2 Props."),
          ("Expose","3 threads traced → the block wins.")]
    for a,t in acts:
        fill(c,INK); c.setFont("DVB",7.4); c.drawString(ax,ay,a)
        c.setFont("DV",7.2)
        for ln in simpleSplit(t,"DV",7.2,w-3.35*inch-1.05*inch): c.drawString(ax+0.8*inch,ay,ln); ay-=9.2
        ay-=2
    fill(c,GOLD); c.setFont("DVB",8); c.drawString(ax,y0+0.22*inch,"PROPS:")
    stroke(c,LGREY); c.line(ax+0.6*inch,y0+0.2*inch,x0+w-0.25*inch,y0+0.2*inch)

def build_player_boards(c):
    roles=list(Dk.ROLES.items())
    for k in range(0,len(roles),2):
        pair=roles[k:k+2]
        player_board(c,PAGE_H/2+0.1*inch,*pair[0])
        if len(pair)>1: player_board(c,0.55*inch,*pair[1])
        else:
            fill(c,GREY); c.setFont("DVI",9)
            c.drawCentredString(PAGE_W/2,PAGE_H/4+0.5*inch,"(Print an extra copy of any board for a 6th seat or a spare.)")
        footer(c,f"Player boards {k//2+1}/3"); c.showPage()

# ================= rules & key (platypus) =================
ST={
 "h1":ParagraphStyle("h1",fontName="DVB",fontSize=18,leading=22,textColor=colors.Color(*NAVY),spaceAfter=6),
 "h2":ParagraphStyle("h2",fontName="DVB",fontSize=12.5,leading=16,textColor=colors.Color(*NAVY),spaceBefore=8,spaceAfter=4),
 "h3":ParagraphStyle("h3",fontName="DVB",fontSize=10.5,leading=13,textColor=colors.Color(*INK),spaceBefore=6,spaceAfter=3),
 "p": ParagraphStyle("p",fontName="DV",fontSize=8.8,leading=11.6,textColor=colors.Color(*INK),spaceAfter=4),
 "li":ParagraphStyle("li",fontName="DV",fontSize=8.8,leading=11.4,leftIndent=12,bulletIndent=2,spaceAfter=1.5),
 "q": ParagraphStyle("q",fontName="DVI",fontSize=9.5,leading=13,leftIndent=14,textColor=colors.Color(*GREY),spaceBefore=4,spaceAfter=4),
 "td":ParagraphStyle("td",fontName="DV",fontSize=7.8,leading=9.6),
 "th":ParagraphStyle("th",fontName="DVB",fontSize=7.8,leading=9.6,textColor=colors.white),
 "k": ParagraphStyle("k",fontName="DV",fontSize=6.6,leading=8),
 "kb":ParagraphStyle("kb",fontName="DVB",fontSize=6.6,leading=8),
}
EMOJI={"🔴":'<font color="#e63946">●</font>',"🟠":'<font color="#e0a526">●</font>',"🔵":'<font color="#2f8fd8">●</font>',
       "🔑":""}
def inline(t):
    t=t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    t=re.sub(r"\*\*(.+?)\*\*",r"<b>\1</b>",t); t=re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])",r"<i>\1</i>",t)
    t=re.sub(r"`(.+?)`",r'<font name="DVM">\1</font>',t)
    for k,v in EMOJI.items(): t=t.replace(k,v)
    return re.sub("[\U0001F300-\U0001FAFF☀-➿️]","",t).strip()

def md_table(rows):
    rows=[[x.strip() for x in r.strip().strip("|").split("|")] for r in rows]
    rows=[r for r in rows if not all(re.fullmatch(r":?-{2,}:?",x) for x in r)]
    data=[[Paragraph(inline(x),ST["th"] if i==0 else ST["td"]) for x in r] for i,r in enumerate(rows)]
    t=Table(data,repeatRows=1,hAlign="LEFT",colWidths=[(PAGE_W-1.5*inch)/len(rows[0])]*len(rows[0]))
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.Color(*NAVY)),
        ("GRID",(0,0),(-1,-1),0.4,colors.Color(*LGREY)),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.Color(0.97,0.96,0.93)]),
        ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4)]))
    return [t,Spacer(1,6)]

def rules_story():
    md=open(os.path.join(ROOT,"RULES.md"),encoding="utf-8").read()
    md=re.sub(r"These rules match `sn_engine.py`.*?\n","",md)   # developer note, not for the table
    story=[]; lines=md.splitlines(); i=0
    while i<len(lines):
        ln=lines[i]
        if ln.startswith("|"):
            rows=[]
            while i<len(lines) and lines[i].startswith("|"): rows.append(lines[i]); i+=1
            story+=md_table(rows); continue
        if ln.startswith("# "): story.append(Paragraph(inline(ln[2:]),ST["h1"]))
        elif ln.startswith("## "): story.append(Paragraph(inline(ln[3:]),ST["h2"]))
        elif ln.startswith("### "): story.append(Paragraph(inline(ln[4:]),ST["h3"]))
        elif ln.startswith("> "): story.append(Paragraph(inline(ln[2:]),ST["q"]))
        elif re.match(r"\s*[-*] ",ln):
            ind=len(ln)-len(ln.lstrip()); st=ParagraphStyle("lx",parent=ST["li"],leftIndent=12+ind*5,bulletIndent=2+ind*5)
            story.append(Paragraph(inline(re.sub(r"^\s*[-*] ","",ln)),st,bulletText="•"))
        elif re.match(r"\d+\. ",ln): story.append(Paragraph(inline(re.sub(r"^\d+\. ","",ln)),ST["li"],bulletText=ln.split(".")[0]+"."))
        elif ln.strip()=="---": story.append(Spacer(1,6))
        elif ln.strip(): story.append(Paragraph(inline(ln),ST["p"]))
        i+=1
    return story

def reference_story():
    s=[PageBreak(),Paragraph("Quick reference — West Dayton Edition",ST["h1"])]
    rows=[["Your turn","Take your actions (2–3, see setup table): Study · Face a deal · Teach · Commons · Reach · Trace · Expose."],
          ["Facing a deal","Draw from a district. Lens over the zones your Read unlocks. Then TAKE / WALK / NEGOTIATE."],
          ["Honest deal","TAKE: +2 Trust, +1 Clarity, +1 Props. WALK: −1 Trust. NEGOTIATE: the Trust is wasted."],
          ["Trap","TAKE: −2 Squeeze now (or +2 Clarity if no Squeeze), +2 Shady. WALK: safe. NEGOTIATE (1 Trust): Read ≥ lever → −1 Squeeze (Organizer −2), +1 Clarity, +2 Props; else +1 Squeeze."],
          ["The shortcut","Before you TAKE a trap, name the price out loud: what it buys (no Trust; −2 Squeeze now, or +2 Clarity) and what it costs you (+2 Shady, or more if the Owner is the Debt Buyer; at 6 you Fall). Then the table weighs in."],
          ["Commons places","Barbershop (next Teach free) · Church (−2 Shady) · Adventure Central (next Study +2) · Gem City Market (next deal: draw 2, face 1) · Grandma's table (once: all +2 Trust)."],
          ["Teach","Call and response: read a red layer aloud; if your learner says the second number back, +1 Props each."],
          ["Start of a round","Once per game, call the Cookout instead of turns: everyone +2 Trust, −1 Shady, +1 Props, Read in one district up to the table's best."],
          ["After all turns","The Sou-Sou (optional): everyone with Trust puts 1 in the can; at 4 the next player's hand clears 2 Squeeze, no Shady. Then: total Clarity ≥ 9 → the Underworld cracks open."],
          ["The Green Book","Once per game, a strike that would capture a district lands nowhere."],
          ["Machine phase","Strikes (setup table), each on a different unwoken district, closest to waking first. Muddy the strongest unwoken district (−1 Clarity). Scenario, Owner, Patterns."],
          ["Owner in the open","+1 strike; once per round −1 Clarity on a woken district without a thread."],
          ["Lose","2 districts captured · everyone Fallen · round 12 ends."],
          ["Win","3 threads traced (Read 3 in woken districts) → Expose."],
          ["Fallen","On your turn the Machine moves through you (Strike · Muddy · Tempt). Your crew can Reach you."]]
    data=[[Paragraph(f"<b>{a}</b>",ST["td"]),Paragraph(inline(b),ST["td"])] for a,b in rows]
    t=Table(data,colWidths=[1.3*inch,PAGE_W-1.5*inch-1.3*inch])
    t.setStyle(TableStyle([("GRID",(0,0),(-1,-1),0.4,colors.Color(*LGREY)),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[colors.white,colors.Color(0.97,0.96,0.93)])]))
    s+=[t,Spacer(1,10),Paragraph("Setup by player count",ST["h2"])]
    def mv(m): return str(int(m)) if m==int(m) else f"{int(m)}, or {int(m)+1} on even rounds"
    s+=md_table(["| Players | Actions per turn | Machine strikes | Overlord moves |"]+
                [f"| {k} | {E.ACTIONS[k]} | {mv(E.MACHINE_HITS[k])} | {mv(E.OVERLORD_MOVES[k])} |" for k in (2,3,4,5)])
    return s

def key_story():
    s=[PageBreak(),Paragraph("Facilitator answer key",ST["h1"]),
       Paragraph("Every deal, in plain text. For teachers and facilitators, and to settle a hard-to-read card. "
                 "Players: don't peek. Learning to read the card is the game.",ST["p"])]
    for d,cards in Dk.DECK.items():
        s.append(Paragraph(f'<font color="{Dk.DISTRICT_COLORS[d]}">{d}</font>',ST["h2"]))
        data=[[Paragraph(x,ST["kb"]) for x in ("ID","What you see","Lever","Red — the cost","Amber — the clock","Blue — the connection")]]
        for i,c in enumerate(cards):
            lev="HONEST" if not c["trap"] else LEVER_WORD[c["lever"]]
            data.append([Paragraph(f"{DABBR[d]}-{i+1:02d}",ST["kb"]),Paragraph(inline(c["front"]),ST["kb"]),
                         Paragraph(lev,ST["kb"])]+[Paragraph(inline(c[k]),ST["k"]) for k in ("red","amber","blue")])
        w=PAGE_W-1.5*inch
        t=Table(data,repeatRows=1,colWidths=[0.58*inch,1.4*inch,0.62*inch]+[(w-2.6*inch)/3]*3)
        t.setStyle(TableStyle([("GRID",(0,0),(-1,-1),0.3,colors.Color(*LGREY)),("VALIGN",(0,0),(-1,-1),"TOP"),
            ("BACKGROUND",(0,0),(-1,0),colors.Color(*DCOL[d])),("TEXTCOLOR",(0,0),(-1,0),colors.white),
            ("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3)]))
        s.append(t)
    return s

def log_story():
    s=[PageBreak(),Paragraph("Playtest log",ST["h1"]),
       Paragraph("The hard 80% of a board game is playtesting. Fill in a row after every game, and ask the table the questions below. "
                 "Then run <font name=\"DVM\">python3 balance_test.py</font> after any rule change.",ST["p"])]
    hdr=["Date","Players / roles","Scenario","Owner","Result","Round","Who Fell?","Most Props"]
    data=[[Paragraph(h,ST["th"]) for h in hdr]]+[[""]*8 for _ in range(14)]
    t=Table(data,colWidths=[0.65*inch,1.45*inch,0.95*inch,0.85*inch,0.7*inch,0.5*inch,0.9*inch,1.0*inch],rowHeights=[None]+[0.3*inch]*14)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.Color(*NAVY)),("GRID",(0,0),(-1,-1),0.4,colors.Color(*GREY))]))
    s+=[t,Spacer(1,10),Paragraph("Ask the table",ST["h2"])]
    for q in ["When did you first gasp at a second number? Which card?",
              "Did anyone TAKE a shortcut on purpose? Was it worth it?",
              "Was there a turn where you had nothing good to do?",
              "Did the game end too soon, too late, or about right?",
              "Name one real deal from your own life you'd now read differently."]:
        s.append(Paragraph(inline(q),ST["li"],bulletText="•"))
    s+=[Spacer(1,14),Paragraph("How high did you climb before you turned into the thing you were fighting?",ST["q"])]
    return s

def platypus_pdf(story,label):
    buf=io.BytesIO()
    def on_page(c,doc): footer(c,f"{label} · page {doc.page}")
    doc=BaseDocTemplate(buf,pagesize=letter,leftMargin=0.75*inch,rightMargin=0.75*inch,topMargin=0.7*inch,bottomMargin=0.65*inch)
    doc.addPageTemplates([PageTemplate(frames=[Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="f")],onPage=on_page)])
    doc.build(story); buf.seek(0); return buf

def canvas_pdf(*builders):
    buf=io.BytesIO(); c=canvas.Canvas(buf,pagesize=letter)
    for b in builders: b(c)
    c.save(); buf.seek(0); return buf

def main():
    parts=[canvas_pdf(build_cover,build_lens_page,build_glasses),
           platypus_pdf(rules_story()+reference_story(),"Rulebook"),
           canvas_pdf(build_block_party,build_board,build_player_boards,build_fans_and_pieces,build_tokens,build_deal_pages,build_other_cards),
           platypus_pdf(key_story()[1:],"Answer key"),
           platypus_pdf(templates_story()[1:],"Endless deals"),
           platypus_pdf(log_story()[1:],"Playtest log")]
    w=PdfWriter()
    for p in parts:
        for page in PdfReader(p).pages: w.add_page(page)
    w.add_metadata({"/Title":f"The Second Number — {EDITION} — Print & Play Kit","/Author":"The Second Number",
                    "/Subject":"A cooperative game about reading the hidden cost in every deal."})
    with open(OUT,"wb") as f: w.write(f)
    print(f"wrote {OUT} ({len(w.pages)} pages)")

if __name__=="__main__": main()
