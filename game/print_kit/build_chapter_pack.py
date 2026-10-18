#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE LONG LEDGER — Chapter 3: The Map, printable envelope.
Builds The_Long_Ledger_Chapter3_The_Map.pdf from chapters.py, reusing the base
kit's card renderer so era cards look and decode exactly like base cards.

  python3 print_kit/build_chapter_pack.py
"""
import os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
sys.path.insert(0,HERE); sys.path.insert(0,ROOT)
import build_print_and_play as K
import chapters as CH
import sn_engine as E
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit

CH3=CH.CHAPTERS["THE_MAP"]
OUT=os.path.join(ROOT,"The_Long_Ledger_Chapter3_The_Map.pdf")
PAGE_W,PAGE_H=K.PAGE_W,K.PAGE_H
fill,stroke,hx=K.fill,K.stroke,K.hx
MAP_RED=hx("B23A3A")

def para(c,x,y,text,font="DV",size=9.5,width=None,lead=12.5,col=K.INK):
    fill(c,col); c.setFont(font,size)
    for ln in simpleSplit(text,font,size,width or PAGE_W-2*inch): c.drawString(x,y,ln); y-=lead
    return y

def envelope_cover(c):
    fill(c,K.NAVY); c.rect(0,0,PAGE_W,PAGE_H,stroke=0,fill=1)
    K.quilt(c,0,0,PAGE_W,PAGE_H,[MAP_RED,K.GOLD,hx("5a3d1e")],size=0.75*inch,alpha=0.12)
    fill(c,K.NAVY); c.roundRect(1*inch,2.2*inch,PAGE_W-2*inch,PAGE_H-4.4*inch,14,stroke=0,fill=1)
    K.stitch(c,1.1*inch,2.3*inch,PAGE_W-2.2*inch,PAGE_H-4.6*inch,K.GOLD,12)
    cx=PAGE_W/2
    fill(c,K.GOLDL); c.setFont("DVB",12); c.drawCentredString(cx,PAGE_H-3.0*inch,"THE LONG LEDGER")
    fill(c,K.GOLD); c.setFont("DVB",40); c.drawCentredString(cx,PAGE_H-3.9*inch,f"CHAPTER {CH3['number']}")
    c.setFont("DVB",54); c.drawCentredString(cx,PAGE_H-4.8*inch,CH3["title"].upper())
    fill(c,K.CREAM); c.setFont("DVI",14); c.drawCentredString(cx,PAGE_H-5.35*inch,CH3["era"])
    fill(c,MAP_RED); c.roundRect(cx-1.6*inch,PAGE_H-6.35*inch,3.2*inch,0.55*inch,8,stroke=0,fill=1)
    fill(c,K.CREAM); c.setFont("DVB",14); c.drawCentredString(cx,PAGE_H-6.15*inch,"SEALED")
    c.setFont("DV",10); c.drawCentredString(cx,PAGE_H-6.75*inch,"Open only when the family begins this chapter.")
    fill(c,K.GREY); c.setFont("DVI",8.5)
    c.drawCentredString(cx,2.55*inch,f"{K.EDITION} · a prototype chapter: playtest it and fill in the log.")
    c.showPage()

def chapter_rules(c):
    x=inch; y=PAGE_H-inch
    fill(c,K.INK); c.setFont("DVB",20); c.drawString(x,y,f"Chapter {CH3['number']}: {CH3['title']} ({CH3['era']})"); y-=24
    y=para(c,x,y,CH3["intro"],"DVI",10.5,lead=14,col=K.GREY)-8
    secs=[
     ("Setup",f"Set up the base game as usual, with these changes. Swap the Housing and Lending deal decks for this envelope's "
              f"era decks (the cards with “The Map” backs; print the backs on the reverse so era deals never mix into the base deck). Start Housing and Lending at Pressure 2: REDLINING is active "
              f"from round 1. Slide the Appraiser face-down under the board as the Owner (skip the Owner shuffle). "
              f"Ignore the scenario deck. If the last chapter was lost, the community rallies: everyone starts with +1 Trust "
              f"and one free Commons action."),
     ("The twist",CH3["twist"]),
     (CH3["league"]["name"],CH3["league"]["text"]+" The League card goes on the board when it forms."),
     ("The Owner's face",CH3["face_text"]),
     ("Ending the chapter","Win or lose, fill in the Family Ledger (next page): win +2 and +1 per awake district; lose −2 and "
              "−1 per captured district; each Fall −1 and each Reach +1. Awake districts heal a Scar or take a Rebuilt sticker; "
              "captured districts take a Scarred sticker (at most 2 per district). The History card “The Redlining Maps” "
              "is unlocked; “The Contract Buyers League” is unlocked only if the League formed and the family won."),
     ("Family Decision",CH3["decision"]),
    ]
    for h,t in secs:
        fill(c,K.INK); c.setFont("DVB",11.5); c.drawString(x,y,h); y-=14
        y=para(c,x,y,t)-8
    fill(c,K.GREY); c.setFont("DVI",8.5)
    y=para(c,x,y-4,"Balance-tested with computer players at 2–5 players: about 50% family wins at every table size. "
                   "Organizing matters: the same players who never sign the League win far less often (as low as 19%).",
           "DVI",8.5,lead=11,col=K.GREY)
    K.footer(c,"Chapter 3: The Map — rules"); c.showPage()

def era_back(c,x,y):
    K.card_back(c,x,y,"THE MAP",f"{CH3['era']} · era deal")
    fill(c,MAP_RED); c.roundRect(x+CARD_W/2-0.55*inch,y+0.32*inch,1.1*inch,0.24*inch,5,stroke=0,fill=1)
    fill(c,K.CREAM); c.setFont("DVB",7); c.drawCentredString(x+CARD_W/2,y+0.4*inch,"CHAPTER 3")

CARD_W=K.CARD_W
def era_cards(c):
    cards=[(d,i,card) for d,deck in CH3["decks"].items() for i,card in enumerate(deck)]
    extra=[
     (K.GOLD,"THE LEAGUE","Chapter 3","The Contract Buyers League",CH3["league"]["text"],
      "Signatures this round: ☐ ☐ ☐ ☐ ☐   Formed: ☐"),
     (hx("7a1f2b"),"THE OWNER","hidden","The Appraiser",CH3["face_text"],
      "This chapter's Owner. Slide it face-down under the board instead of shuffling the Owners."),
     (MAP_RED,"THE TWIST","Chapter 3","The Map Compounds",CH3["twist"],None),
     (hx("3b2f5c"),"FAMILY DECISION","after the chapter","Stay or Move?",CH3["decision"],None,7),
     (hx("2f7a4a"),"THE COMMUNITY RALLIES","after a loss","The Block Shows Up",
      "If the last chapter was lost: everyone starts this chapter with +1 Trust and one free Commons action. "
      "The church, the club and the neighbors show up.",None),
     (hx("5a3d1e"),"LEDGER","reference","Scoring the Chapter",
      "Win +2, +1 per awake district. Lose −2, −1 per captured district. Each Fall −1, each Reach +1. "
      "Awake: heal a Scar, else Rebuilt. Captured: Scarred. Max 2 stickers per district.",None),
    ]
    slots=[("deal",x) for x in cards]+[("text",x) for x in extra]
    pages=[slots[k:k+9] for k in range(0,len(slots),9)]
    for pi,pg in enumerate(pages):
        K.crop_marks(c)
        for (x,y),(kind,item) in zip(K.card_slots(),pg):
            if kind=="deal":
                d,i,card=item; K.deal_card(c,x,y,d,i,card,era="THE MAP",era_years=f"West Dayton, {CH3['era']}")
            else: K.text_card(c,x,y,*item)
        K.sheet_label(c,f"Chapter 3 cards {pi+1}/{len(pages)}"); c.showPage()
    K.crop_marks(c)
    for x,y in K.card_slots(): era_back(c,x,y)
    K.sheet_label(c,"Chapter 3 card backs"); c.showPage()
CARD_H_=K.CARD_H

def lineage_sheet(c):
    x=0.75*inch; y=PAGE_H-0.9*inch
    fill(c,K.INK); c.setFont("DVB",20); c.drawString(x,y,"The Long Ledger — family lineage sheet"); y-=16
    fill(c,K.GREY); c.setFont("DV",9); c.drawString(x,y,"One sheet for the whole campaign. Name the family. Name each generation. Keep it in the box."); y-=26
    fill(c,K.INK); c.setFont("DVB",11); c.drawString(x,y,"Family name:"); stroke(c,K.LGREY); c.line(x+1*inch,y-2,PAGE_W-x,y-2); y-=28
    # Ledger track
    c.setFont("DVB",11); fill(c,K.INK); c.drawString(x,y,"THE FAMILY LEDGER"); y-=22
    w=(PAGE_W-2*x)/21
    for k,v in enumerate(range(-10,11)):
        bx=x+k*w; col=K.LAYER_COL[1] if v<0 else (K.GOLD if v>0 else K.GREY)
        stroke(c,col); c.setLineWidth(1.2); fill(c,(1,1,1)); c.rect(bx+1,y-4,w-2,0.32*inch,stroke=1,fill=1)
        fill(c,col); c.setFont("DVB",8); c.drawCentredString(bx+w/2,y+4,f"{v:+d}" if v else "0")
    y-=34
    # chapters table
    cols=["Chapter","Played on","Result","Ledger","Elder / Student (names)","Fallen / redeemed","Family Decision"]
    widths=[1.25,0.75,0.6,0.55,1.55,1.15,1.65]
    rows=["1 · Freedom's Ledger","2 · Up North","3 · The Map","4 · Voice","5 · The Plants Close","6 · Today"]
    fill(c,K.NAVY); c.rect(x,y-2,sum(widths)*inch,0.3*inch,stroke=0,fill=1)
    xx=x; fill(c,K.CREAM); c.setFont("DVB",7.2)
    for h,wd in zip(cols,widths): c.drawString(xx+4,y+6,h); xx+=wd*inch
    y-=0.3*inch
    for r in rows:
        xx=x; stroke(c,K.LGREY); c.setLineWidth(0.6)
        for wd in widths: c.rect(xx,y-0.55*inch+0.28*inch,wd*inch,0.55*inch,stroke=1,fill=0); xx+=wd*inch
        fill(c,K.INK); c.setFont("DVB" if r.startswith("3") else "DV",7.5); c.drawString(x+4,y+0.05*inch,r)
        y-=0.55*inch
    y-=10
    fill(c,K.INK); c.setFont("DVB",11); c.drawString(x,y,"History cards unlocked"); y-=14
    for name in ["The Freedman's Savings Bank","Dunbar, the Wrights and the Dayton Tattler","The Redlining Maps",
                 "The Contract Buyers League","Montgomery · I AM A MAN · Mayor James H. McGee"]:
        c.setFont("DV",9); c.drawString(x,y,"☐  "+name); y-=13
    K.footer(c,"The Long Ledger — lineage sheet"); c.showPage()

def stickers(c):
    fill(c,K.INK); c.setFont("DVB",16); c.drawString(0.75*inch,PAGE_H-0.85*inch,"District stickers: Rebuilt and Scarred")
    fill(c,K.GREY); c.setFont("DV",8.5)
    c.drawString(0.75*inch,PAGE_H-1.08*inch,"Print on sticker paper (or paper + tape). Awake at a chapter's end: heal a Scar, else add Rebuilt. Captured: add Scarred. Max 2 per district.")
    y=PAGE_H-1.6*inch
    for label,col,sub,n in (("REBUILT",hx("3FA34D"),"starts at Clarity 1",20),("SCARRED",K.LAYER_COL[1],"starts at Pressure 1",20)):
        fill(c,K.INK); c.setFont("DVB",10); c.drawString(0.75*inch,y,f"{label} — {sub}"); y-=0.55*inch
        for k in range(n):
            cx=0.75*inch+0.42*inch+(k%10)*0.72*inch; cy=y-(k//10)*0.8*inch
            fill(c,col); stroke(c,K.INK); c.setLineWidth(0.6); c.circle(cx,cy,0.32*inch,stroke=1,fill=1)
            fill(c,(1,1,1)); c.setFont("DVB",6.5); c.drawCentredString(cx,cy-2,label)
        y-=1.9*inch
    K.footer(c,"The Long Ledger — stickers"); c.showPage()

def main():
    c=canvas.Canvas(OUT,pagesize=K.letter)
    c.setTitle(f"The Long Ledger — Chapter 3: The Map ({K.EDITION})")
    for b in (envelope_cover,chapter_rules,era_cards,lineage_sheet,stickers): b(c)
    c.save(); print(f"wrote {OUT}")

if __name__=="__main__": main()
