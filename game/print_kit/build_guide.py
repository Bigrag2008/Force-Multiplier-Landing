#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — the plain-language How to Play guide, as a PDF.
Builds The_Second_Number_HOW_TO_PLAY.pdf from HOW_TO_PLAY.md, in the print kit's look but with larger,
easier type: a cover, then the guide, each Part on a new page.

  python3 print_kit/build_guide.py
"""
import os, re, sys
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
sys.path.insert(0,HERE); sys.path.insert(0,ROOT)
import build_print_and_play as K
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, KeepTogether, NextPageTemplate)

OUT=os.path.join(ROOT,"The_Second_Number_HOW_TO_PLAY.pdf")
PAGE_W,PAGE_H=K.PAGE_W,K.PAGE_H
NAVY,INK,GREY,GOLD=colors.Color(*K.NAVY),colors.Color(*K.INK),colors.Color(*K.GREY),colors.Color(*K.GOLD)
# bigger than the rulebook: this one is for reading at the table
ST={
 "h1":ParagraphStyle("h1",fontName="DVB",fontSize=24,leading=29,textColor=NAVY,spaceAfter=6),
 "sub":ParagraphStyle("sub",fontName="DVI",fontSize=11,leading=15,textColor=GREY,spaceAfter=10),
 "h2":ParagraphStyle("h2",fontName="DVB",fontSize=19,leading=24,textColor=NAVY,spaceBefore=4,spaceAfter=8,keepWithNext=1),
 "h3":ParagraphStyle("h3",fontName="DVB",fontSize=13,leading=17,textColor=INK,spaceBefore=10,spaceAfter=4,keepWithNext=1),
 "p": ParagraphStyle("p",fontName="DV",fontSize=10.2,leading=13.8,textColor=INK,spaceAfter=6),
 "li":ParagraphStyle("li",fontName="DV",fontSize=10.2,leading=13.6,leftIndent=16,bulletIndent=4,spaceAfter=3),
 "q": ParagraphStyle("q",fontName="DVI",fontSize=12,leading=16,leftIndent=18,textColor=GREY,spaceBefore=8,spaceAfter=8),
 "td":ParagraphStyle("td",fontName="DV",fontSize=9.6,leading=12.4),
 "th":ParagraphStyle("th",fontName="DVB",fontSize=9.6,leading=12.4,textColor=colors.white),
}
W=PAGE_W-1.6*inch

def table(rows):
    rows=[[x.strip() for x in r.strip().strip("|").split("|")] for r in rows]
    rows=[r for r in rows if not all(re.fullmatch(r":?-{2,}:?",x) for x in r)]
    n=len(rows[0])
    # a short first column (the term), the rest share the width
    first=min(1.9*inch, W*0.3) if n>1 else W
    widths=[first]+[(W-first)/(n-1)]*(n-1) if n>1 else [W]
    data=[[Paragraph(K.inline(x),ST["th"] if i==0 else ST["td"]) for x in r] for i,r in enumerate(rows)]
    t=Table(data,repeatRows=1,hAlign="LEFT",colWidths=widths)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("GRID",(0,0),(-1,-1),0.5,colors.Color(*K.LGREY)),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.Color(0.97,0.96,0.93)]),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    return [t,Spacer(1,8)]

def story():
    md=open(os.path.join(ROOT,"HOW_TO_PLAY.md"),encoding="utf-8").read()
    out=[]; lines=md.splitlines(); i=0; first_part=True; pending=None
    while i<len(lines):
        ln=lines[i]
        if ln.startswith("|"):
            rows=[]
            while i<len(lines) and lines[i].startswith("|"): rows.append(lines[i]); i+=1
            tb=table(rows)
            out+=[KeepTogether(([pending] if pending else [])+tb)]; pending=None
            continue
        if pending: out.append(pending); pending=None
        if ln.startswith("# "): out.append(Paragraph(K.inline(ln[2:]),ST["h1"]))
        elif ln.startswith("## "):
            if not first_part and not ln.startswith("## Part 3"): out.append(PageBreak())   # Part 3 follows Part 2's last lines
            first_part=False
            out.append(Paragraph(K.inline(ln[3:]),ST["h2"]))
            stroke=Table([[""]],colWidths=[W],rowHeights=[3]); stroke.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),GOLD)]))
            stroke.keepWithNext=1; out+=[stroke,Spacer(1,8)]
        elif ln.startswith("### "): pending=Paragraph(K.inline(ln[4:]),ST["h3"])   # kept with what follows
        elif ln.startswith("> "): out.append(Paragraph(K.inline(ln[2:]),ST["q"]))
        elif re.match(r"\s*[-*] ",ln): out.append(Paragraph(K.inline(re.sub(r"^\s*[-*] ","",ln)),ST["li"],bulletText="•"))
        elif re.match(r"\d+\. ",ln): out.append(Paragraph(K.inline(re.sub(r"^\d+\. ","",ln)),ST["li"],bulletText=ln.split(".")[0]+"."))
        elif ln.strip()=="---": pass
        elif ln.strip():
            st=ST["sub"] if ln.startswith("*") and ln.endswith("*") and i<4 else ST["p"]
            out.append(Paragraph(K.inline(ln),st))
        i+=1
    if pending: out.append(pending)
    return out

def cover(c,doc):
    K.fill(c,K.NAVY); c.rect(0,0,PAGE_W,PAGE_H,stroke=0,fill=1)
    K.quilt(c,0,0,PAGE_W,PAGE_H,[K.hx(v[1:]) for v in K.Dk.DISTRICT_COLORS.values()],size=0.75*inch,alpha=0.14)
    K.fill(c,K.NAVY); c.roundRect(0.9*inch,2.0*inch,PAGE_W-1.8*inch,PAGE_H-4.0*inch,14,stroke=0,fill=1)
    K.stitch(c,1.0*inch,2.1*inch,PAGE_W-2.0*inch,PAGE_H-4.2*inch,K.GOLD,12)
    cx=PAGE_W/2
    K.fill(c,K.GOLDL); c.setFont("DVB",13); c.drawCentredString(cx,PAGE_H-3.0*inch,"HOW TO PLAY")
    K.fill(c,K.GOLD); c.setFont("DVB",46); c.drawCentredString(cx,PAGE_H-3.9*inch,"THE SECOND")
    c.drawCentredString(cx,PAGE_H-4.6*inch,"NUMBER")
    K.fill(c,K.CREAM); c.setFont("DVI",14); c.drawCentredString(cx,PAGE_H-5.25*inch,"Read the machine. Wake the block. Don't become it.")
    c.setFont("DV",11)
    for k,line in enumerate(["The rules in plain words, with examples.",
                             "Part 1 · Learn it in 10 minutes      Part 2 · The full game",
                             "Part 3 · Other ways to play      Part 4 · Everything the website does",
                             "Plus a one-page cheat sheet."]):
        c.drawCentredString(cx,PAGE_H-6.1*inch-k*0.3*inch,line)
    K.fill(c,K.GREY); c.setFont("DVI",9)
    c.drawCentredString(cx,2.35*inch,f"{K.EDITION} · a cooperative game for 1–5 players, ages 12+")

def page(c,doc):
    c.setFont("DV",8); K.fill(c,K.GREY)
    c.drawCentredString(PAGE_W/2,0.45*inch,f"How to Play The Second Number · {doc.page}")

def main():
    doc=BaseDocTemplate(OUT,pagesize=K.letter,leftMargin=0.8*inch,rightMargin=0.8*inch,topMargin=0.8*inch,bottomMargin=0.8*inch,
                        title="How to Play The Second Number",author="The Second Number")
    fr=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="f")
    doc.addPageTemplates([PageTemplate(id="cover",frames=[fr],onPage=cover),PageTemplate(id="body",frames=[fr],onPage=page)])
    doc.build([NextPageTemplate("body"),PageBreak()]+story())
    print(f"wrote {OUT}")

if __name__=="__main__": main()
