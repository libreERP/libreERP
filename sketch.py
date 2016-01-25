from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle, Image
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

def genInvoice(c):
    c.setFont("Times-Roman" , 20)
    c.drawCentredString(2*cm, 27*cm,"Brand")
    c.line(1*cm , 26*cm ,20*cm,26*cm )
    c.drawImage('logo.png' , 3*cm , 26.2*cm , 2*cm, 2*cm)
    c.setFont("Times-Roman" , 12)
    c.drawString(5*cm, 27.35*cm , "Contact us : 1800 1234 5678 | care@ecommerce.com")
    styles=getSampleStyleSheet()
    p = Paragraph('<p><font size=14>ABC Motors Pvt. Ltd.</font><font size=10>  34, Main street , District, State, Pin : 400076</font></p>' , styles['Normal'])
    p.wrapOn(c, 15*cm, 1*cm)
    p.drawOn(c, 5*cm, 26.3*cm)
    c.setDash(6,3)
    c.rect(14.4*cm, 27.2*cm, 6*cm, 0.6*cm )
    c.drawString(14.5*cm, 27.35*cm , "Invoice # DEL-000109-00025566")
    pSrc = '''
        <font size=10>
            <strong>Order ID: OD303042960054866200</strong><br/><br/>
            <strong>Order Date : </strong> 06-06-2016 <br/>
            <strong>Invoice Date : </strong> 06-06-2016 <br/>
            <strong>VAT/TIN : </strong> 07410380729 <br/>
            <strong>CST# : </strong> 07410380729 <br/>
        </font>
    '''
    p = Paragraph( pSrc , styles['Normal'])
    p.wrapOn(c, 6*cm, 5*cm)
    p.drawOn(c, 1*cm, 22.4*cm)
    pSrc = '''
        <font size=10>
            <strong>Billing Address</strong><br/><br/>
            Pradeep Yadav<br/>
            House No. 95/6 , Sanjog chetri vihar<br/>
            Lucknow Cantt Pin : 226002,<br/>
            Lucknow 226002 Uttar Pradesh<br/>
            Phone : 9702438730<br/>
        </font>
    '''
    p = Paragraph( pSrc , styles['Normal'])
    p.wrapOn(c, 6*cm, 5*cm)
    p.drawOn(c, 7.5*cm, 22*cm)
    pSrc = '''
        <font size=10>
            <strong>Shipping Address</strong><br/><br/>
            Pradeep Yadav<br/>
            House No. 95/6 , Sanjog chetri vihar<br/>
            Lucknow Cantt Pin : 226002,<br/>
            Lucknow 226002 Uttar Pradesh<br/>
            Phone : 9702438730<br/>
        </font>
    '''
    p = Paragraph( pSrc , styles['Normal'])
    p.wrapOn(c, 6*cm, 5*cm)
    p.drawOn(c, 14*cm, 22*cm)
    c.setDash()
    c.line(1*cm , 26*cm ,20*cm,2*cm )
    data = [['00', '01', '02', '03', '04'],
            ['10', '11', '12', '13', '14'],
            ['20', '21', '22', '23', '24'],
            ['30', '31', '32', '33', '34']]
    t=Table(data)
    ts = TableStyle([('ALIGN',(1,1),(-2,-2),'RIGHT'),
                ('TEXTCOLOR',(1,1),(-2,-2),colors.red),
                ('VALIGN',(0,0),(0,-1),'TOP'),
                ('TEXTCOLOR',(0,0),(0,-1),colors.blue),
                ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                ('VALIGN',(0,-1),(-1,-1),'MIDDLE'),
                ('TEXTCOLOR',(0,-1),(-1,-1),colors.green),
                ('INNERGRID', (0,0), (-1,-1), 1, colors.black),
                ('BOX', (0,0), (-1,-1), 1, colors.black),
            ])
    t.setStyle(ts)
    t.wrapOn(c, 26*cm, 6*cm)
    t.drawOn(c, 7.5*cm, 15*cm)

c = canvas.Canvas("invoice.pdf" , pagesize=A4)
pageWidth, pageHeight = A4
print pageWidth, pageHeight
genInvoice(c)
c.showPage()
c.save()
