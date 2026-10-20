#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — printable chapter envelopes, for every campaign chapter (The Long Ledger and Book One).
Each envelope is built from chapters.py (setup, twist, Owner, carry-ins, Family Decision), reusing the base
kit's card renderer so era cards look and decode exactly like base cards. The text comes from the same
chapter definitions the website plays, so paper and screen can't drift apart.

  python3 print_kit/build_chapter_pack.py              # all ten envelopes
  python3 print_kit/build_chapter_pack.py THE_MAP      # one chapter
"""
import os, re, sys
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
sys.path.insert(0,HERE); sys.path.insert(0,ROOT)
import build_print_and_play as K
import chapters as CH
import sn_engine as E
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit

PAGE_W,PAGE_H=K.PAGE_W,K.PAGE_H
CARD_W=K.CARD_W
fill,stroke,hx=K.fill,K.stroke,K.hx
# one color per era, for the cover, the backs and the twist cards
ERA_COLOR={"FREEDOMS_LEDGER":"2f6b3a","UP_NORTH":"1F5FA8","THE_MAP":"B23A3A","VOICE":"7a3fb0","PLANTS_CLOSE":"4a5560",
           "TODAY":"c27a12","B1_CHAIN":"1E7F78","B1_NET":"3b4a8c","B1_CROWN":"9a6a00","B1_THRONE":"5a3d1e"}
MODE_WORDS={"coop":"the Full Block (Co-op)","party":"a Block Party (the 25-minute game: Lending, Housing and Education, 8 rounds, no roles)",
            "overlord":"Overlord mode (a person or the computer plays the Machine)"}
RULE_WORDS={"terrell":"the Terrell rule","fine_print":"fine-print dice","endless":"endless deals"}

def out_path(ch):
    camp="The_Long_Ledger" if ch["campaign"]=="LEDGER" else "Book_One"
    title=re.sub(r"[^A-Za-z0-9]+","_",ch["title"].replace("'","")).strip("_")
    return os.path.join(ROOT,f"{camp}_Chapter{ch['number']}_{title}.pdf")

def campaign_title(ch): return CH.CAMPAIGNS[ch["campaign"]]["title"]
def prev_chapter(ch):
    keys=CH.CAMPAIGNS[ch["campaign"]]["chapters"]; i=keys.index(ch["key"])
    return CH.CHAPTERS[keys[i-1]] if i else None
def dname(d): return d.capitalize()

def para(c,x,y,text,font="DV",size=9.5,width=None,lead=12.5,col=K.INK):
    fill(c,col); c.setFont(font,size)
    for ln in simpleSplit(text,font,size,width or PAGE_W-2*inch): c.drawString(x,y,ln); y-=lead
    return y

def envelope_cover(c,ch):
    col=hx(ERA_COLOR[ch["key"]])
    fill(c,K.NAVY); c.rect(0,0,PAGE_W,PAGE_H,stroke=0,fill=1)
    K.quilt(c,0,0,PAGE_W,PAGE_H,[col,K.GOLD,hx("5a3d1e")],size=0.75*inch,alpha=0.12)
    fill(c,K.NAVY); c.roundRect(1*inch,2.2*inch,PAGE_W-2*inch,PAGE_H-4.4*inch,14,stroke=0,fill=1)
    K.stitch(c,1.1*inch,2.3*inch,PAGE_W-2.2*inch,PAGE_H-4.6*inch,K.GOLD,12)
    cx=PAGE_W/2
    fill(c,K.GOLDL); c.setFont("DVB",12); c.drawCentredString(cx,PAGE_H-3.0*inch,campaign_title(ch).upper())
    fill(c,K.GOLD); c.setFont("DVB",40); c.drawCentredString(cx,PAGE_H-3.9*inch,f"CHAPTER {ch['number']}")
    title=ch["title"].upper(); size=54
    while c.stringWidth(title,"DVB",size)>PAGE_W-2.6*inch and size>24: size-=2
    c.setFont("DVB",size); c.drawCentredString(cx,PAGE_H-4.8*inch,title)
    fill(c,K.CREAM); c.setFont("DVI",14); c.drawCentredString(cx,PAGE_H-5.35*inch,ch["era"])
    fill(c,col); c.roundRect(cx-1.6*inch,PAGE_H-6.35*inch,3.2*inch,0.55*inch,8,stroke=0,fill=1)
    fill(c,K.CREAM); c.setFont("DVB",14); c.drawCentredString(cx,PAGE_H-6.15*inch,"SEALED")
    c.setFont("DV",10); c.drawCentredString(cx,PAGE_H-6.75*inch,
        "Open only when the family begins this chapter." if ch["campaign"]=="LEDGER" else "Open only when the table begins this chapter.")
    fill(c,K.GREY); c.setFont("DVI",8.5)
    c.drawCentredString(cx,2.55*inch,f"{K.EDITION} · playtest it and fill in the log. Also playable on the website: Play → Campaign.")
    c.showPage()

def setup_text(ch):
    """The chapter's setup, in words, from its definition."""
    parts=[f"Set up {MODE_WORDS[ch['mode']]}"]
    rules=[RULE_WORDS[k] for k,v in ch["rules"].items() if v]
    parts[0]+=(f", with {' and '.join(rules)}." if rules else ".")
    if ch["decks"]:
        ds=" and ".join(dname(d) for d in ch["decks"])
        parts.append(f"Swap the {ds} deal decks for this envelope's era decks (the cards with “{ch['title']}” backs; print the backs "
                     f"on the reverse so era deals never mix into the base deck).")
    if ch["pressure"]:
        parts.append("Start "+", ".join(f"{dname(d)} at Squeeze {p}" for d,p in ch["pressure"].items())+".")
    if ch.get("start_trust") is not None: parts.append(f"Everyone starts with {ch['start_trust']} Trust.")
    if ch.get("no_read"): parts.append("Nobody starts with Read, not even the Elder.")
    if ch.get("late"):
        parts.append(" and ".join(dname(d) for d in ch["late"])+f" start off the board: they open in round {min(ch['late'].values())}.")
    if ch["mode"]=="coop":
        plays="" if ch["face"]==ch["owner"] else f" (it plays as {ch['owner']})"
        parts.append(f"The Owner is {ch['face']}{plays}: slide its card face-down under the board instead of "
                     f"shuffling the Owners. Ignore the scenario deck.")
    if ch["campaign"]=="LEDGER":
        parts.append("If the family played the last chapter: put on the district stickers (each Rebuilt takes 1 Squeeze off a "
                     "district this chapter starts squeezed, or else adds Clarity 1; each Scarred adds Squeeze 1), and if that chapter "
                     "was lost the community rallies: everyone +1 Trust.")
        prev=prev_chapter(ch)
        if prev and prev.get("decision"):
            parts.append(f"Then apply last chapter's Family Decision ({prev['title']}): "
                         +" ".join(f"{o['label']}: {o['text']}" for o in prev["decision"]["options"]))
    return " ".join(parts)

def special(ch):
    """The chapter's own extra rule, if it has one beyond the twist text."""
    if ch.get("league"): return (ch["league"]["name"],ch["league"]["text"]+" The League card goes on the board when it forms.")
    if ch.get("defend_choice"): return ("Defend or let go","Decide before round 1, together. Defend: in every Machine phase, strike your Rebuilt "
                                        "districts first. Let go: peel one Rebuilt sticker off now; the Machine strikes as usual.")
    if ch.get("history_twice"): return ("The family's History","Shuffle only the History cards the family unlocked (the lineage sheet's ticks) "
                                        "into the History deck; the Elder may teach History twice this chapter.")
    return None

def ending(ch):
    if ch["campaign"]=="LEDGER":
        un=", ".join(f"“{u}”" for u in ch["unlocks_always"])
        won=", ".join(f"“{u}”" for u in ch["unlocks_if_won"])
        s=("Win or lose, fill in the Family Ledger on the lineage sheet: win +2 and +1 per awake district; lose −2 and −1 per captured "
           "district; each Fall −1 and each Reach +1. Awake districts heal a Scar or take a Rebuilt sticker; captured districts take a "
           "Scarred sticker (at most 2 per district). A chapter won with no Falls redeems one Fall from an earlier chapter (+2).")
        if un: s+=f" History unlocked: {un}."
        if won: s+=f" With a win, also {won}."
        return s
    return ch["after"]

def chapter_rules(c,ch):
    x=inch; y=PAGE_H-inch
    head=f"{campaign_title(ch)} · Chapter {ch['number']}: {ch['title']} ({ch['era']})"; size=18
    while c.stringWidth(head,"DVB",size)>PAGE_W-2*inch and size>11: size-=0.5
    fill(c,K.INK); c.setFont("DVB",size); c.drawString(x,y,head); y-=22
    y=para(c,x,y,ch["intro"],"DVI",10.5,lead=14,col=K.GREY)-8
    secs=[("Setup",setup_text(ch)),("The twist",ch["twist"])]
    sp=special(ch)
    if sp: secs.append(sp)
    if ch["mode"]=="coop" and ch.get("face_text"): secs.append(("The Owner's face",ch["face_text"]))
    secs.append(("Ending the chapter",ending(ch)))
    if ch.get("decision"):
        secs.append(("Family Decision",ch["decision"]["text"]+" "+" ".join(f"{o['label']}: {o['text']}" for o in ch["decision"]["options"])))
    for h,t in secs:
        if y<1.6*inch: K.footer(c,f"{ch['title']} — rules"); c.showPage(); y=PAGE_H-inch
        fill(c,K.INK); c.setFont("DVB",11.5); c.drawString(x,y,h); y-=14
        y=para(c,x,y,t)-8
    para(c,x,max(y-4,0.8*inch),"Balance-tested with computer players at 1–5 players (python3 balance_test.py, CAMPAIGNS and SOLO). "
         "Solo: 5 actions, Teach a neighbor, trace 2 threads (RULES.md, Solo).","DVI",8.5,lead=11,col=K.GREY)
    K.footer(c,f"{ch['title']} — rules"); c.showPage()

def era_back(c,x,y,ch):
    K.card_back(c,x,y,ch["title"].upper(),f"{ch['era']} · chapter card")
    fill(c,hx(ERA_COLOR[ch["key"]])); c.roundRect(x+CARD_W/2-0.55*inch,y+0.32*inch,1.1*inch,0.24*inch,5,stroke=0,fill=1)
    fill(c,K.CREAM); c.setFont("DVB",7); c.drawCentredString(x+CARD_W/2,y+0.4*inch,f"CHAPTER {ch['number']}")

def text_cards(ch):
    col=hx(ERA_COLOR[ch["key"]]); chap=f"Chapter {ch['number']}"
    out=[]
    if ch["mode"]=="coop":
        out.append((hx("7a1f2b"),"THE OWNER","hidden",ch["face"],ch["face_text"],
                    "This chapter's Owner. Slide it face-down under the board instead of shuffling the Owners."))
    out.append((col,"THE TWIST",chap,ch["title"],ch["twist"],None))
    if ch.get("league"): out.append((K.GOLD,"THE LEAGUE",chap,"The Contract Buyers League",ch["league"]["text"],"Signatures this round: ☐ ☐ ☐ ☐ ☐   Formed: ☐"))
    if ch.get("march"): out.append((K.GOLD,"THE MARCH","once per game","Call the March","An action, any player, once per game: every player gathers at once: Trust +2, Shady −1, and covered. Flip this card when it's used.","Marched: ☐"))
    if ch.get("desk"): out.append((K.GOLD,"THE DESK","round 2","A County Job","At the start of round 2, one player may take this card. At the Desk: +1 Trust every round; no facing deals and no teaching; every second round the Machine strikes once more. Quitting it, for good, takes an action.","Taken by: ________   Quit: ☐"))
    if ch.get("crown"): out.append((K.GOLD,"THE CROWN","once per game","A Way Up","From round 3 the Overlord may offer this card to one player. Wear it: you can't Fall, but every other player loses 1 Trust at the start of each round. Refuse it: the Overlord takes one extra move this round.","Offered to: ________   Worn: ☐  Refused: ☐"))
    if ch.get("throne"): out.append((K.GOLD,"NO NECK FOR A CROWN","Expose","The Empty Throne","You can't Expose the Owner until every player has taught at least once, and not while any one player holds more than half of the table's Props.","Taught: ☐ ☐ ☐ ☐ ☐"))
    if ch.get("chain"): out.append((K.GOLD,"THE CHAIN","every Teach","Pass It On","When a learner says the second number back, they at once teach one more player in that district (one who reads it less), for free.",None))
    if ch.get("defend_choice"): out.append((K.GOLD,"DEFEND OR LET GO","before round 1","What We Built",special(ch)[1],"Defend: ☐   Let go of: ________"))
    if ch.get("decision"):
        out.append((hx("3b2f5c"),"FAMILY DECISION","after the chapter",ch["decision"]["text"].split("?")[0][:60]+("?" if "?" in ch["decision"]["text"] else ""),
                    " ".join(f"{o['label']}: {o['text']}" for o in ch["decision"]["options"]),None))
    if ch["campaign"]=="LEDGER":
        out.append((hx("2f7a4a"),"THE COMMUNITY RALLIES","after a loss","The Block Shows Up",
                    "If the last chapter was lost: everyone starts this chapter with +1 Trust. The church, the club and the neighbors show up.",None))
        out.append((hx("5a3d1e"),"LEDGER","reference","Scoring the Chapter",
                    "Win +2, +1 per awake district. Lose −2, −1 per captured district. Each Fall −1, each Reach +1. "
                    "Awake: heal a Scar, else Rebuilt. Captured: Scarred. Max 2 stickers per district.",None))
    else:
        out.append((hx("5a3d1e"),"BOOK ONE","after the chapter","What It Writes Down",ch["after"],None))
    return out

def chapter_cards(c,ch):
    deals=[(d,i,card) for d,deck in ch["decks"].items() for i,card in enumerate(deck)]
    slots=[("deal",x) for x in deals]+[("text",x) for x in text_cards(ch)]
    pages=[slots[k:k+9] for k in range(0,len(slots),9)]
    for pi,pg in enumerate(pages):
        K.crop_marks(c)
        for (x,y),(kind,item) in zip(K.card_slots(),pg):
            if kind=="deal":
                d,i,card=item
                if card.get("counterfeit"):   # dressed as help: printed like an honest deal; only the blue layer gives it away
                    card=dict(card,trap=False,lever=0,blue=card["blue"]+"   ▸ A TRAP DRESSED AS HELP. LEVER: BLUE.")
                K.deal_card(c,x,y,d,i,card,era=ch["title"].upper(),era_years=f"West Dayton, {ch['era']}")
            else: K.text_card(c,x,y,*item)
        K.sheet_label(c,f"Chapter {ch['number']} cards {pi+1}/{len(pages)}"); c.showPage()
    K.crop_marks(c)
    for x,y in K.card_slots(): era_back(c,x,y,ch)
    K.sheet_label(c,f"Chapter {ch['number']} card backs"); c.showPage()

def lineage_sheet(c):
    x=0.75*inch; y=PAGE_H-0.9*inch
    fill(c,K.INK); c.setFont("DVB",20); c.drawString(x,y,"The Long Ledger — family lineage sheet"); y-=16
    fill(c,K.GREY); c.setFont("DV",9); c.drawString(x,y,"One sheet for the whole campaign. Name the family. Name each generation. Keep it in the box."); y-=26
    fill(c,K.INK); c.setFont("DVB",11); c.drawString(x,y,"Family name:"); stroke(c,K.LGREY); c.line(x+1*inch,y-2,PAGE_W-x,y-2); y-=28
    c.setFont("DVB",11); fill(c,K.INK); c.drawString(x,y,"THE FAMILY LEDGER"); y-=22
    w=(PAGE_W-2*x)/21
    for k,v in enumerate(range(-10,11)):
        bx=x+k*w; col=K.LAYER_COL[1] if v<0 else (K.GOLD if v>0 else K.GREY)
        stroke(c,col); c.setLineWidth(1.2); fill(c,(1,1,1)); c.rect(bx+1,y-4,w-2,0.32*inch,stroke=1,fill=1)
        fill(c,col); c.setFont("DVB",8); c.drawCentredString(bx+w/2,y+4,f"{v:+d}" if v else "0")
    y-=34
    cols=["Chapter","Played on","Result","Ledger","Elder / Student (names)","Fallen / redeemed","Family Decision"]
    widths=[1.25,0.75,0.6,0.55,1.55,1.15,1.65]
    rows=[f"{CH.CHAPTERS[k]['number']} · {CH.CHAPTERS[k]['title']}" for k in CH.CAMPAIGNS["LEDGER"]["chapters"]]
    fill(c,K.NAVY); c.rect(x,y-2,sum(widths)*inch,0.3*inch,stroke=0,fill=1)
    xx=x; fill(c,K.CREAM); c.setFont("DVB",7.2)
    for h,wd in zip(cols,widths): c.drawString(xx+4,y+6,h); xx+=wd*inch
    y-=0.3*inch
    for r in rows:
        xx=x; stroke(c,K.LGREY); c.setLineWidth(0.6)
        for wd in widths: c.rect(xx,y-0.55*inch+0.28*inch,wd*inch,0.55*inch,stroke=1,fill=0); xx+=wd*inch
        fill(c,K.INK); c.setFont("DV",7.5); c.drawString(x+4,y+0.05*inch,r)
        y-=0.55*inch
    y-=10
    fill(c,K.INK); c.setFont("DVB",11); c.drawString(x,y,"History cards unlocked"); y-=14
    names=[]
    for k in CH.CAMPAIGNS["LEDGER"]["chapters"]:
        ch=CH.CHAPTERS[k]; names+=[(u,"") for u in ch["unlocks_always"]]+[(u," (with a win)") for u in ch["unlocks_if_won"]]
    for i,(name,note) in enumerate(names):
        cx=x+(i%2)*3.5*inch; c.setFont("DV",8.5); c.drawString(cx,y,f"☐  {name}{note}")
        if i%2: y-=12
    K.footer(c,"The Long Ledger — lineage sheet"); c.showPage()

def book_one_sheet(c):
    x=0.75*inch; y=PAGE_H-0.9*inch
    fill(c,K.INK); c.setFont("DVB",20); c.drawString(x,y,"Book One — the table's ledger"); y-=16
    fill(c,K.GREY); c.setFont("DV",9); c.drawString(x,y,"One sheet for the four chapters. Each one writes down what the next one reads."); y-=30
    rows=[("1 · The Chain","Burned by the Terrell rule?  ☐ → write TERRELL","Won?  ☐ → the block learns CIVIC ARMOR (every Teach comes with cover)"),
          ("2 · The Net","Who quit the Desk? ____________","They start Chapter 3 with Read 1 everywhere"),
          ("3 · The Crown","Who wore the Crown? ____________","If anyone did: one extra strike in Chapter 4's first round"),
          ("4 · The Empty Throne","Won?  ☐","The book's last scene is on a porch. If you won, read it aloud.")]
    for title,a,b in rows:
        fill(c,K.NAVY); c.rect(x,y-4,PAGE_W-2*x,0.3*inch,stroke=0,fill=1)
        fill(c,K.CREAM); c.setFont("DVB",10); c.drawString(x+6,y+4,title); y-=0.42*inch
        fill(c,K.INK); c.setFont("DV",9.5); c.drawString(x+10,y,a); y-=16; c.drawString(x+10,y,b); y-=0.45*inch
    y=para(c,x,y,"In Chapter 3, if TERRELL is written down, every block player starts with 1 less Trust.","DVI",9,col=K.GREY)
    K.footer(c,"Book One — the table's ledger"); c.showPage()

def stickers(c):
    fill(c,K.INK); c.setFont("DVB",16); c.drawString(0.75*inch,PAGE_H-0.85*inch,"District stickers: Rebuilt and Scarred")
    fill(c,K.GREY); c.setFont("DV",8.5)
    c.drawString(0.75*inch,PAGE_H-1.08*inch,"Print on sticker paper (or paper + tape). Awake at a chapter's end: heal a Scar, else add Rebuilt. Captured: add Scarred. Max 2 per district.")
    y=PAGE_H-1.6*inch
    for label,col,sub,n in (("REBUILT",hx("1E9E78"),"−1 Squeeze where the era squeezes, else Clarity 1",20),("SCARRED",K.LAYER_COL[1],"starts at Squeeze 1",20)):
        fill(c,K.INK); c.setFont("DVB",10); c.drawString(0.75*inch,y,f"{label} — {sub}"); y-=0.55*inch
        for k in range(n):
            cx=0.75*inch+0.42*inch+(k%10)*0.72*inch; cy=y-(k//10)*0.8*inch
            fill(c,col); stroke(c,K.INK); c.setLineWidth(0.6); c.circle(cx,cy,0.32*inch,stroke=1,fill=1)
            fill(c,(1,1,1)); c.setFont("DVB",6.5); c.drawCentredString(cx,cy-2,label)
        y-=1.9*inch
    K.footer(c,"The Long Ledger — stickers"); c.showPage()

def build(key):
    ch=CH.CHAPTERS[key]; out=out_path(ch)
    c=canvas.Canvas(out,pagesize=K.letter)
    c.setTitle(f"{campaign_title(ch)} — Chapter {ch['number']}: {ch['title']} ({K.EDITION})")
    envelope_cover(c,ch); chapter_rules(c,ch); chapter_cards(c,ch)
    first=CH.CAMPAIGNS[ch["campaign"]]["chapters"][0]==key
    if ch["campaign"]=="LEDGER" and (first or key=="THE_MAP"):     # where a family starts (or most tables start)
        lineage_sheet(c); stickers(c)
    if ch["campaign"]=="BOOK_ONE" and first: book_one_sheet(c)
    c.save(); print(f"wrote {out}")

def main():
    keys=sys.argv[1:] or [k for camp in CH.CAMPAIGNS.values() for k in camp["chapters"]]
    for k in keys: build(k)

if __name__=="__main__": main()
