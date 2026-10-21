#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE SECOND NUMBER — the "Where it goes next" card for the box: the novel, The Third Option, and the game,
with a QR code to getcivicarmor.com/next (a page you control, so the card never has to be reprinted).
Four 3.75" x 5" cards per sheet. Page 1 fronts and page 2 backs in English, pages 3 and 4 in Spanish:
print double-sided (flip on long edge) and cut on the marks.

  python3 print_kit/build_where_next.py          -> The_Second_Number_WHERE_NEXT.pdf
Also writes the QR codes as PNGs to launch/qr/ for the books' back pages.
"""
import os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); REPO=os.path.dirname(ROOT)
sys.path.insert(0,HERE); sys.path.insert(0,ROOT)
import build_print_and_play as K
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode import qrencoder

OUT=os.path.join(ROOT,"The_Second_Number_WHERE_NEXT.pdf")
QR_DIR=os.path.join(REPO,"launch","qr")
HUB="getcivicarmor.com"
NEXT_URL=f"https://{HUB}/next"
CW,CH=3.75*inch,5.0*inch
X0=(K.PAGE_W-2*CW)/2; Y0=(K.PAGE_H-2*CH)/2
RED,AMBER,BLUE=K.hx("E63946"),K.hx("E0A526"),K.hx("2F8FD8")

TEXT={
 "en":dict(
   kicker="THE SECOND NUMBER", title=["WHERE IT", "GOES NEXT"],
   quote="“Armor, ’cause it covers you. Civic, ’cause it ain’t yours. It’s everybody’s that lives here.”",
   cite="Gloria, in The Second Number",
   lead="You read the machine at the table. Now read it in your own life.",
   doors="THREE DOORS",
   items=[("The novel","The Second Number, Book One. Marcus’s story, the world this game comes from.",f"{HUB}/book"),
          ("The Third Option","The real-life version: recognize, document and prove what’s happening at your job.",f"{HUB}/guide"),
          ("Play again, free","Every chapter, solo play, phones at the table, in English and Spanish.",f"{HUB}/play")],
   scan="Scan for all three", legal="Force Multiplier HQ LLC dba Civic Armor · not legal advice"),
 "es":dict(
   kicker="THE SECOND NUMBER", title=["A DÓNDE", "LLEVA"],
   quote="“Armadura, porque te cubre. Cívica, porque no es tuya. Es de todos los que viven aquí.”",
   cite="Gloria, en The Second Number",
   lead="Leíste la máquina en la mesa. Ahora léela en tu propia vida.",
   doors="TRES PUERTAS",
   items=[("La novela","The Second Number, Libro Uno: la historia de Marcus (en inglés).",f"{HUB}/book"),
          ("The Third Option","La versión de la vida real: reconocer, documentar y probar lo que pasa en tu trabajo (en inglés).",f"{HUB}/guide"),
          ("Juega otra vez, gratis","Todos los capítulos, en solitario o con teléfonos en la mesa, en español.",f"{HUB}/juega")],
   scan="Escanea para las tres", legal="Force Multiplier HQ LLC dba Civic Armor · no es asesoría legal"),
}

def qr_matrix(text):
    q=qrencoder.QRCode(None,qrencoder.QRErrorCorrectLevel.M); q.addData(text); q.make()
    n=q.getModuleCount()
    return [[q.isDark(r,c) for c in range(n)] for r in range(n)]

def draw_qr(c,x,y,size,text,dark=K.NAVY):
    m=qr_matrix(text); n=len(m); quiet=2; cell=size/(n+2*quiet)
    K.fill(c,(1,1,1)); c.rect(x,y,size,size,stroke=0,fill=1)
    K.fill(c,dark)
    for r,row in enumerate(m):
        for k,on in enumerate(row):
            if on: c.rect(x+(k+quiet)*cell,y+size-(r+quiet+1)*cell,cell+0.15,cell+0.15,stroke=0,fill=1)

def qr_png(text,path,px=900):
    from PIL import Image
    m=qr_matrix(text); n=len(m); quiet=4; cell=max(1,px//(n+2*quiet)); side=cell*(n+2*quiet)
    img=Image.new("1",(side,side),1)
    for r,row in enumerate(m):
        for k,on in enumerate(row):
            if on:
                for yy in range((r+quiet)*cell,(r+quiet+1)*cell):
                    for xx in range((k+quiet)*cell,(k+quiet+1)*cell): img.putpixel((xx,yy),0)
    img.save(path)

def slots():
    for row in range(2):
        for col in range(2): yield X0+col*CW, Y0+(1-row)*CH

def marks(c):
    K.stroke(c,K.GREY); c.setLineWidth(0.4); L=10
    for x in (X0,X0+CW,X0+2*CW):
        c.line(x,Y0-4-L,x,Y0-4); c.line(x,Y0+2*CH+4,x,Y0+2*CH+4+L)
    for y in (Y0,Y0+CH,Y0+2*CH):
        c.line(X0-4-L,y,X0-4,y); c.line(X0+2*CW+4,y,X0+2*CW+4+L,y)

def para(c,text,x,y,w,font,size,lead,rgb):
    K.fill(c,rgb); c.setFont(font,size)
    for ln in simpleSplit(text,font,size,w):
        c.drawString(x,y,ln); y-=lead
    return y

def front(c,x,y,L):
    K.fill(c,K.NAVY); c.rect(x,y,CW,CH,stroke=0,fill=1)
    K.quilt(c,x,y,CW,CH,[K.hx(v[1:]) for v in K.Dk.DISTRICT_COLORS.values()],size=0.5*inch,alpha=0.12)
    K.fill(c,K.NAVY); c.roundRect(x+12,y+12,CW-24,CH-24,10,stroke=0,fill=1)
    K.stitch(c,x+18,y+18,CW-36,CH-36,K.GOLD,8)
    m=x+34; w=CW-68; top=y+CH-56
    K.fill(c,K.GOLDL); c.setFont("DVB",8.5); c.drawString(m,top,L["kicker"])
    K.fill(c,K.GOLD); c.setFont("DVB",27)
    for i,ln in enumerate(L["title"]): c.drawString(m,top-34-i*30,ln)
    yy=top-112
    for i,rgb in enumerate((RED,AMBER,BLUE)):
        K.fill(c,rgb); c.roundRect(m+i*(w/3),yy,w/3-4,4,2,stroke=0,fill=1)
    yy=para(c,L["quote"],m,yy-26,w,"DVI",12,16.5,K.CREAM)
    para(c,"— "+L["cite"],m,yy-4,w,"DV",8.5,11,K.GOLDL)
    para(c,L["lead"],m,y+70,w,"DVB",10.5,14,K.CREAM)

def back(c,x,y,L):
    K.fill(c,K.CREAM); c.rect(x,y,CW,CH,stroke=0,fill=1)
    K.stroke(c,K.NAVY); c.setLineWidth(1.2); c.roundRect(x+12,y+12,CW-24,CH-24,10,stroke=1,fill=0)
    m=x+30; w=CW-60; yy=y+CH-48
    K.fill(c,K.NAVY); c.setFont("DVB",10); c.drawString(m,yy,L["doors"])
    yy-=24
    for (name,what,url),rgb in zip(L["items"],(RED,AMBER,BLUE)):
        K.fill(c,rgb); c.circle(m+5,yy+3.5,5,stroke=0,fill=1)
        K.fill(c,K.NAVY); c.setFont("DVB",11); c.drawString(m+16,yy,name)
        yy=para(c,what,m+16,yy-12.5,w-16,"DV",8.2,10.2,K.INK)
        K.fill(c,K.hx("8A5A00")); c.setFont("DVB",9); c.drawString(m+16,yy-0.5,url)
        yy-=19
    q=1.1*inch; qx=x+CW-30-q; qy=y+34
    assert yy>qy+q+2, "the doors run into the QR code: shorten the text"
    draw_qr(c,qx,qy,q,NEXT_URL)
    K.fill(c,K.NAVY); c.setFont("DVB",9.5); c.drawString(m,qy+q-14,L["scan"])
    c.setFont("DV",8.5); c.drawString(m,qy+q-28,f"{HUB}/next")
    c.drawString(m,qy+q-41,f"hello@{HUB}")
    K.fill(c,K.GREY); c.setFont("DV",6.3); c.drawString(m,y+24,L["legal"])

def main():
    c=canvas.Canvas(OUT,pagesize=K.letter)
    c.setTitle("The Second Number — Where It Goes Next card"); c.setAuthor("Civic Armor")
    for lang in ("en","es"):
        for side in (front,back):
            for x,y in slots(): side(c,x,y,TEXT[lang])
            marks(c)
            K.fill(c,K.GREY); c.setFont("DV",7)
            c.drawCentredString(K.PAGE_W/2,Y0-26,f"Where it goes next · {lang.upper()} · {'fronts' if side is front else 'backs'} · print double-sided, flip on long edge, cut on the marks")
            c.showPage()
    c.save(); print(f"wrote {OUT}")
    os.makedirs(QR_DIR,exist_ok=True)
    for name,url in (("qr_next.png",NEXT_URL),("qr_play.png","https://play.getcivicarmor.com"),
                     ("qr_book.png",f"https://{HUB}/book"),("qr_third_option.png",f"https://{HUB}/third-option")):
        qr_png(url,os.path.join(QR_DIR,name))
    print(f"wrote {QR_DIR}/")

if __name__=="__main__": main()
