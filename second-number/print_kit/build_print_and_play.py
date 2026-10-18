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
import os, re, sys, random, io
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
sys.path.insert(0,ROOT)
import deck_cards as Dk
import sn_engine as E
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
NAVY=hx("0c1b30"); GOLD=hx("d4af37"); GOLDL=hx("e8c766"); CREAM=hx("f5efe0"); INK=hx("1b1b1f")
GREY=hx("6b7078"); LGREY=hx("d9dbe0")
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
    c.drawCentredString(w/2,0.3*inch,f"THE SECOND NUMBER · Print & Play v3 · {label}")

def sheet_label(c, label):
    c.setFont("DV",6); fill(c,GREY)
    c.drawString(GRID_X0+0.12*inch,PAGE_H-0.15*inch,f"Second Number v3 · {label}")

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
    stroke(c,INK); c.setLineWidth(0.6); fill(c,(1,1,1))
    c.roundRect(x+3,y+3,CARD_W-6,CARD_H-6,6,stroke=1,fill=1)
    fill(c,rgb); c.roundRect(x+3,y+CARD_H-25,CARD_W-6,22,6,stroke=0,fill=1)
    c.rect(x+3,y+CARD_H-25,CARD_W-6,8,stroke=0,fill=1)
    fill(c,(1,1,1)); c.setFont("DVB",title_size); c.drawString(x+10,y+CARD_H-18,top)
    c.setFont("DV",6.5); c.drawRightString(x+CARD_W-10,y+CARD_H-18,right)

# ================= deal cards =================
def deal_card(c,x,y,d,i,card):
    cid=f"{DABBR[d]}-{i+1:02d}"
    card_frame(c,x,y,DCOL[d],d,f"DEAL · {cid}")
    ix=x+10; iw=CARD_W-20
    fill(c,GREY); c.setFont("DVB",5.6); c.drawString(ix,y+CARD_H-34,"WHAT YOU SEE")
    lines,size=fit_lines(card["front"],"DVB",8.4,iw,3,6.4)
    fill(c,INK); c.setFont("DVB",size); ty=y+CARD_H-44
    for ln in lines: c.drawString(ix,ty,ln); ty-=size+1.6
    top=y+CARD_H-74; zone_h=40; gap=12
    for n,key in ((1,"red"),(2,"amber"),(3,"blue")):
        hy=top-(n-1)*(zone_h+gap)
        dot(c,ix+3,hy-2.5,2.6,LAYER_COL[n])
        fill(c,INK); c.setFont("DVB",5.8)
        c.drawString(ix+9,hy-4.5,f"SIGHT {n} · THE {LAYER_NAME[n]}")
        txt=card[key]
        if n==1:
            txt+=("   ▸ HONEST DEAL — no trap, no lever." if not card["trap"]
                  else f"   ▸ LEVER: {LEVER_WORD[card['lever']]}")
        decoder_zone(c,ix,hy-8-zone_h,iw,zone_h,txt,seed=hash((d,i,n))&0xffffff)
    fill(c,GREY); c.setFont("DV",5.2)
    c.drawCentredString(x+CARD_W/2,y+10,"TAKE · WALK · NEGOTIATE (1 Trust, Sight ≥ lever)")

def card_back(c,x,y,label="THE SECOND NUMBER",sub="read the machine"):
    stroke(c,INK); c.setLineWidth(0.6); fill(c,NAVY)
    c.roundRect(x+3,y+3,CARD_W-6,CARD_H-6,6,stroke=1,fill=1)
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
    for r,txt in Dk.ROLES.items():
        start="Start: 2 Trust · Sight 1 in every district." if r=="Elder" else "Start: 2 Trust · Sight 0."
        cards.append(("role",(GOLD,"ROLE","character",f"The {r}",txt,start)))
    for o,txt in Dk.OWNERS.items():
        cards.append(("owner",(hx("7a1f2b"),"THE OWNER","hidden",o,txt,
                     "Revealed when total Clarity reaches 9. Until then, watch the board and deduce it.")))
    for s,txt in Dk.SCENARIOS.items():
        cards.append(("scen",(hx("3b4a63"),"SCENARIO","setup",s,txt,None)))
    for combo,name,lesson in Dk.PATTERNS:
        cards.append(("pattern",(hx("8b1e1e"),"MACHINE PATTERN"," + ".join(DABBR[d] for d in combo),
                      name.title() if name.isupper() else name,lesson,
                      "Forms when every district listed is at Pressure 2+. Tightens each round. Break it by pulling one district below 2.")))
    pages=[cards[k:k+9] for k in range(0,len(cards),9)]
    for pi,pg in enumerate(pages):
        crop_marks(c)
        for (x,y),(_,a) in zip(card_slots(),pg): text_card(c,x,y,*a)
        sheet_label(c,f"Character cards {pi+1}/{len(pages)}"); c.showPage()
    crop_marks(c)
    for x,y in card_slots(): card_back(c,x,y,"THE OWNER","one machine · one hand")
    sheet_label(c,"Owner card backs"); c.showPage()

# ================= cover & lens page =================
def build_cover(c):
    fill(c,NAVY); c.rect(0,0,PAGE_W,PAGE_H,stroke=0,fill=1)
    stroke(c,GOLD); c.setLineWidth(1.5); c.rect(0.5*inch,0.5*inch,PAGE_W-inch,PAGE_H-inch,stroke=1,fill=0)
    cx=PAGE_W/2
    for i,(dx,dy) in enumerate(((-30,0),(30,0),(0,48))):
        fill(c,LAYER_COL[i+1]); c.circle(cx+dx,PAGE_H-3.1*inch+dy,30,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",40); c.drawCentredString(cx,PAGE_H-4.4*inch,"THE SECOND")
    c.drawCentredString(cx,PAGE_H-5.0*inch,"NUMBER")
    fill(c,CREAM); c.setFont("DVI",14)
    c.drawCentredString(cx,PAGE_H-5.6*inch,"read the machine · wake the block · don't become it")
    c.setFont("DV",11)
    c.drawCentredString(cx,PAGE_H-6.3*inch,"A cooperative game for 2–5 players · ages 12+ · 45–60 minutes")
    c.drawCentredString(cx,PAGE_H-6.6*inch,"PRINT & PLAY KIT · rules v3")
    fill(c,GOLDL); c.setFont("DVB",10); c.drawCentredString(cx,PAGE_H-7.4*inch,"IN THIS KIT")
    fill(c,CREAM); c.setFont("DV",9.5)
    items=["How to make the decoder lens + printer test","Rulebook and quick reference","Game board",
           "5 player boards","75 Deal cards (60 real traps, 15 honest deals) + backs",
           "5 Roles · 4 Owners · 5 Scenarios · 12 Machine Patterns","Facilitator answer key","Playtest log"]
    y=PAGE_H-7.75*inch
    for it in items: c.drawCentredString(cx,y,it); y-=14
    fill(c,GREY); c.setFont("DVI",8)
    c.drawCentredString(cx,0.8*inch,"Part of the Individual Democracy / Civic Armor universe.")
    c.showPage()

def build_lens_page(c):
    fill(c,INK); c.setFont("DVB",20); c.drawString(inch,PAGE_H-inch,"Before you cut: the decoder lens")
    fill(c,GREY); c.setFont("DV",10)
    paras=[
     ("What you need","A color printer, plain paper or light cardstock, scissors, about 40 small tokens (coins, beans, beads), and a sheet of RED transparent film — red acetate, a red lighting gel, red cellophane, or even a red candy wrapper. Two layers of thin cellophane work better than one."),
     ("How the trick works","Each hidden layer is printed in cyan, buried under dense red decoy letters. To the naked eye it's a red blur. Through the red lens the red washes out to the color of the paper and the cyan turns dark, so the second number appears."),
     ("Print settings","Print at 100% / 'Actual size' (not 'fit to page') in COLOR on the best quality setting. Card sheets are 2.5 × 3.5 in poker size, so they fit standard sleeves. Sleeving each card in front of an old playing card keeps cards opaque and shuffleable. Cut on the solid crop marks. Card backs are optional (print them on the reverse of any card sheet), but the Owner backs matter: glue or sleeve one onto each Owner card so the Owner stays hidden."),
     ("Test your printer first","Print this page and look at the three strips below through your lens. You should read each line clearly through the lens and NOT read it without one. If you can read the hidden line without the lens, use cardstock, a darker red film, or double up the film."),
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
           "SIGHT 3 · THE CONNECTION — IT WAS ALWAYS ONE MACHINE."]
    for k,t in enumerate(tests):
        dot(c,inch+4,y-14,4,LAYER_COL[k+1])
        decoder_zone(c,inch+16,y-30,PAGE_W-2*inch-16,30,t,seed=900+k,size=12,lead=14,decoy=10)
        y-=46
    y-=6
    fill(c,INK); c.setFont("DVB",11); c.drawString(inch,y,"The honor rule"); y-=14
    c.setFont("DV",9.5)
    for ln in simpleSplit("Every deal card has three hidden zones: red (Sight 1), amber (Sight 2) and blue (Sight 3). "
        "When you face a deal, hold the lens only over the zones your Sight in that district unlocks — no deeper. "
        "The table watches. The lever (or 'honest deal') is printed inside the red zone, so a blind player "
        "(Sight 0) sees only the pitch.","DV",9.5,PAGE_W-2*inch): c.drawString(inch,y,ln); y-=12.5
    footer(c,"Lens & printer test"); c.showPage()

# ================= board =================
def build_board(c):
    W,H=landscape(letter); c.setPageSize((W,H))
    fill(c,CREAM); c.rect(0,0,W,H,stroke=0,fill=1)
    fill(c,NAVY); c.rect(0,H-0.75*inch,W,0.75*inch,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",20); c.drawString(0.5*inch,H-0.45*inch,"THE SECOND NUMBER")
    fill(c,CREAM); c.setFont("DVI",8.5); c.drawString(0.5*inch,H-0.64*inch,"the block · five districts, one machine")
    # round track
    c.setFont("DVB",8); fill(c,CREAM); c.drawString(W-5.9*inch,H-0.32*inch,"ROUND")
    for r in range(1,13):
        bx=W-5.4*inch+(r-1)*0.4*inch
        stroke(c,GOLD); fill(c,NAVY); c.rect(bx,H-0.62*inch,0.34*inch,0.34*inch,stroke=1,fill=1)
        fill(c,GOLD if r<12 else LAYER_COL[1]); c.setFont("DVB",9); c.drawCentredString(bx+0.17*inch,H-0.5*inch,str(r))
    fill(c,CREAM); c.setFont("DV",6.5); c.drawRightString(W-0.5*inch,H-0.72*inch,"end of round 12 = the Machine wins")
    # districts
    colw=(W-inch)/5; top=H-0.95*inch; ch=4.35*inch
    for k,d in enumerate(E.DISTRICTS):
        x=0.5*inch+k*colw; rgb=DCOL[d]
        fill(c,(1,1,1)); stroke(c,rgb); c.setLineWidth(2); c.roundRect(x+4,top-ch,colw-8,ch,8,stroke=1,fill=1)
        fill(c,rgb); c.roundRect(x+4,top-0.42*inch,colw-8,0.42*inch,8,stroke=0,fill=1)
        c.rect(x+4,top-0.42*inch,colw-8,0.2*inch,stroke=0,fill=1)
        fill(c,(1,1,1)); c.setFont("DVB",12); c.drawCentredString(x+colw/2,top-0.3*inch,d)
        def track(label,yy,col,last):
            fill(c,INK); c.setFont("DVB",7.5); c.drawString(x+14,yy+0.36*inch,label)
            for n in range(4):
                bx=x+14+n*((colw-36)/4+3); bw=(colw-36)/4
                stroke(c,col); c.setLineWidth(1.2); fill(c,(1,1,1) if n<3 else col)
                c.rect(bx,yy,bw,0.3*inch,stroke=1,fill=1)
                fill(c,col if n<3 else (1,1,1)); c.setFont("DVB",9); c.drawCentredString(bx+bw/2,yy+0.1*inch,str(n))
            fill(c,col); c.setFont("DVB",6.5); c.drawRightString(x+colw-14,yy+0.36*inch,last)
        track("CLARITY",top-1.05*inch,rgb,"3 = AWAKE")
        track("MACHINE",top-1.8*inch,LAYER_COL[1],"3 = CAPTURED")
        fill(c,GREY); c.setFont("DV",6.5); c.drawString(x+14,top-1.95*inch,"2+ = gripped (counts for Patterns)")
        # deal pile
        stroke(c,rgb); c.setDash(3,3); c.setLineWidth(1)
        c.roundRect(x+colw/2-0.55*inch,top-3.55*inch,1.1*inch,1.45*inch,6,stroke=1,fill=0); c.setDash()
        fill(c,rgb); c.setFont("DVB",7); c.drawCentredString(x+colw/2,top-2.85*inch,f"{d.title()}")
        c.drawCentredString(x+colw/2,top-2.98*inch,"deal pile")
        # thread spot
        stroke(c,LAYER_COL[3]); c.setLineWidth(1.4); fill(c,(1,1,1)); c.circle(x+colw/2,top-3.95*inch,0.2*inch,stroke=1,fill=1)
        fill(c,LAYER_COL[3]); c.setFont("DVB",5); c.drawCentredString(x+colw/2,top-3.97*inch,"THREAD")
        fill(c,GREY); c.setFont("DV",5.8); c.drawCentredString(x+colw/2,top-4.27*inch,"Sight 3 + awake → trace")
    # underworld strip
    uy=0.45*inch; uh=1.75*inch
    fill(c,NAVY); c.roundRect(0.5*inch,uy,W-inch,uh,8,stroke=0,fill=1)
    fill(c,GOLD); c.setFont("DVB",12); c.drawString(0.7*inch,uy+uh-0.3*inch,"THE UNDERWORLD")
    fill(c,CREAM); c.setFont("DV",7.5)
    c.drawString(0.7*inch,uy+uh-0.48*inch,"Total Clarity across all five districts. At 9 it cracks open: flip the Owner,")
    c.drawString(0.7*inch,uy+uh-0.62*inch,"it fights in the open (+1 strike, one cover-up per round). Trace 3 threads, then EXPOSE to win.")
    for n in range(16):
        bx=0.7*inch+n*0.38*inch; by=uy+0.62*inch
        col=GOLD if n>=9 else hx("3b4a63")
        fill(c,col); c.rect(bx,by,0.32*inch,0.32*inch,stroke=0,fill=1)
        fill(c,NAVY if n>=9 else CREAM); c.setFont("DVB",9); c.drawCentredString(bx+0.16*inch,by+0.1*inch,str(n))
    fill(c,GOLD); c.setFont("DVB",7); c.drawString(0.7*inch+9*0.38*inch,uy+0.45*inch,"▲ 9: CRACKS OPEN")
    # owner + patterns slots
    ox=W-3.65*inch
    stroke(c,GOLD); c.setDash(3,3); c.roundRect(ox,uy+0.15*inch,1.1*inch,1.45*inch,6,stroke=1,fill=0)
    c.roundRect(ox+1.25*inch,uy+0.15*inch,1.75*inch,1.45*inch,6,stroke=1,fill=0); c.setDash()
    fill(c,GOLD); c.setFont("DVB",7.5); c.drawCentredString(ox+0.55*inch,uy+0.95*inch,"OWNER")
    c.setFont("DV",6.5); c.drawCentredString(ox+0.55*inch,uy+0.82*inch,"face-down")
    c.setFont("DVB",7.5); c.drawCentredString(ox+2.12*inch,uy+0.95*inch,"ACTIVE PATTERNS")
    c.setFont("DV",6.5); c.drawCentredString(ox+2.12*inch,uy+0.82*inch,"read them aloud")
    fill(c,CREAM); c.setFont("DV",6.5)
    c.drawString(0.7*inch,uy+0.27*inch,"The spread rule: the Machine, the Overlord and the Fallen act on each district at most once per round.")
    c.drawString(0.7*inch,uy+0.14*inch,"Lose: 2 districts captured · everyone Falls · round 12 ends.")
    c.showPage(); c.setPageSize(letter)

# ================= player boards =================
def player_board(c,y0,role,gift):
    x0=0.5*inch; w=PAGE_W-inch; h=4.85*inch
    stroke(c,NAVY); c.setLineWidth(1.4); fill(c,(1,1,1)); c.roundRect(x0,y0,w,h,10,stroke=1,fill=1)
    fill(c,NAVY); c.roundRect(x0,y0+h-0.55*inch,w,0.55*inch,10,stroke=0,fill=1)
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
    start="start 2" + (" · Elder starts Sight 1 everywhere" if role=="Elder" else "")
    track("TRUST",y0+h-1.35*inch,5,GOLD,"max 5",f"{start} · spend on Negotiate, Teach, Reach")
    track("CORRUPTION",y0+h-2.15*inch,6,LAYER_COL[1],"6 = YOU FALL","TAKE on a trap +2 · Commons −1")
    # sight grid
    gx=x0+0.25*inch; gy=y0+0.45*inch
    fill(c,INK); c.setFont("DVB",9); c.drawString(gx,gy+1.85*inch,"SIGHT")
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
    acts=[("Study","+1 Sight in a district. +1 Legend."),
          ("Face a deal","Read what your Sight allows → TAKE / WALK / NEGOTIATE."),
          ("Teach","+1 Sight to a teammate where you read better. 1 Trust (Translator: free). +2 Legend."),
          ("Commons","+2 Trust, −1 Corruption."),
          ("Reach","2 Trust: a Fallen friend comes home at Corruption 4. +3 Legend."),
          ("Trace","Underworld open, Sight 3, district awake → place a thread. +2 Legend."),
          ("Expose","3 threads traced → the block wins.")]
    for a,t in acts:
        fill(c,INK); c.setFont("DVB",7.4); c.drawString(ax,ay,a)
        c.setFont("DV",7.2)
        for ln in simpleSplit(t,"DV",7.2,w-3.35*inch-1.05*inch): c.drawString(ax+0.8*inch,ay,ln); ay-=9.2
        ay-=2
    fill(c,GOLD); c.setFont("DVB",8); c.drawString(ax,y0+0.22*inch,"LEGEND:")
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
    s=[PageBreak(),Paragraph("Quick reference",ST["h1"])]
    rows=[["Your turn","Take your actions (2–3, see setup table): Study · Face a deal · Teach · Commons · Reach · Trace · Expose."],
          ["Facing a deal","Draw from a district. Lens over the zones your Sight unlocks. Then TAKE / WALK / NEGOTIATE."],
          ["Honest deal","TAKE: +2 Trust, +1 Clarity, +1 Legend. WALK: −1 Trust. NEGOTIATE: the Trust is wasted."],
          ["Trap","TAKE: −2 Pressure now (or +2 Clarity if no Pressure), +2 Corruption. WALK: safe. NEGOTIATE (1 Trust): Sight ≥ lever → −1 Pressure (Organizer −2), +1 Clarity, +2 Legend; else +1 Pressure."],
          ["After all turns","Total Clarity ≥ 9 → the Underworld cracks open: flip the Owner."],
          ["Machine phase","Strikes (setup table), each on a different unwoken district, closest to waking first. Muddy the strongest unwoken district (−1 Clarity). Scenario, Owner, Patterns."],
          ["Owner in the open","+1 strike; once per round −1 Clarity on a woken district without a thread."],
          ["Lose","2 districts captured · everyone Fallen · round 12 ends."],
          ["Win","3 threads traced (Sight 3 in woken districts) → Expose."],
          ["Fallen","On your turn the Machine moves through you (Extract · Obscure · Tempt). Your crew can Reach you."]]
    data=[[Paragraph(f"<b>{a}</b>",ST["td"]),Paragraph(inline(b),ST["td"])] for a,b in rows]
    t=Table(data,colWidths=[1.3*inch,PAGE_W-1.5*inch-1.3*inch])
    t.setStyle(TableStyle([("GRID",(0,0),(-1,-1),0.4,colors.Color(*LGREY)),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[colors.white,colors.Color(0.97,0.96,0.93)])]))
    s+=[t,Spacer(1,10),Paragraph("Setup by player count",ST["h2"])]
    def mv(m): return str(int(m)) if m==int(m) else f"{int(m)}, or {int(m)+1} on even rounds"
    s+=md_table(["| Players | Actions per turn | Machine strikes | Overlord moves |"]+
                [f"| {k} | {E.ACTIONS[k]} | {E.MACHINE_HITS[k]} | {mv(E.OVERLORD_MOVES[k])} |" for k in (2,3,4,5)])
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
    hdr=["Date","Players / roles","Scenario","Owner","Result","Round","Who Fell?","Most Legendary"]
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
    parts=[canvas_pdf(build_cover,build_lens_page),
           platypus_pdf(rules_story()+reference_story(),"Rulebook"),
           canvas_pdf(build_board,build_player_boards,build_deal_pages,build_other_cards),
           platypus_pdf(key_story()[1:],"Answer key"),
           platypus_pdf(log_story()[1:],"Playtest log")]
    w=PdfWriter()
    for p in parts:
        for page in PdfReader(p).pages: w.add_page(page)
    w.add_metadata({"/Title":"The Second Number — Print & Play Kit (v3)","/Author":"The Second Number",
                    "/Subject":"A cooperative game about reading the hidden cost in every deal."})
    with open(OUT,"wb") as f: w.write(f)
    print(f"wrote {OUT} ({len(w.pages)} pages)")

if __name__=="__main__": main()
