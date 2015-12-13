from django.shortcuts import render
import sys
import imaplib
import smtplib
import getpass
import email
import email.header
import datetime
import os
# For guessing MIME type based on file name extension
import mimetypes
import re

from optparse import OptionParser
from email import encoders
from email.message import Message
from email.mime.audio import MIMEAudio
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
# Create your views here.
from django.contrib.auth.models import User
from django.core.exceptions import *
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets , permissions , serializers, status
from rest_framework.decorators import api_view
from API.permissions import *
from .models import mailAttachment
from .serializers import *

reload(sys)
sys.setdefaultencoding('utf8')

list_response_pattern = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?P<name>.*)')

def parse_list_response(line):
    flags, delimiter, mailbox_name = list_response_pattern.match(line).groups()
    mailbox_name = mailbox_name.strip('"')
    return (flags, delimiter, mailbox_name)

def getMailHeader(M , id):

    rv, data =  M.uid('FETCH', id, '(RFC822.HEADER FLAGS)')
    if rv == 'OK':
        msg = email.message_from_string(data[0][1])
        try:
            decode = email.header.decode_header(msg['Subject'])[0]
            subject = unicode(decode[0])
        except:
            subject = str(msg['subject'])
        try:
            decode = email.header.decode_header(msg['from'])[0]
            sender = unicode(decode[0])
        except:
            sender = str(msg['from'])
        return subject , msg['Date'] , sender , msg['to'] , data[1]


@api_view(['post'])
def sendMailView(request):
    """
    A view to to send a mail via SMTP
    """
    if request.user.username != 'pradeep':
        raise PermissionDenied()
    EMAIL_ACCOUNT = "ciocpky@gmail.com"
    EMAIL_PASSWORD = 'pradeepyadav'

    toAddr = request.data['to']
    msg = MIMEMultipart()
    msg['From'] = "Pradeep <ciocpky@gmail.com>"
    msg['To'] = toAddr
    if 'subject' in request.data:
        msg['Subject'] = request.data['subject']
    if 'cc' in request.data:
        msg['cc'] = request.data['cc']
        toAddr += ',' + request.data['cc']
    if 'bcc' in request.data:
        toAddr += ',' + request.data['bcc']

    msg.attach(MIMEText(request.data['body'].encode('utf-8'), 'html'))

    S = smtplib.SMTP('smtp.gmail.com', 587)
    S.starttls()
    S.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
    text = msg.as_string()
    for address in toAddr.split(','):
        S.sendmail(EMAIL_ACCOUNT, address, text)
    S.quit()
    return Response(status = status.HTTP_200_OK)


@api_view(['GET'])
def mailBoxView(request):
    """
    View to get the mailbox selected, ideally 10 at a time.
    """

    if request.user.username != 'pradeep':
        raise PermissionDenied()

    EMAIL_ACCOUNT = "ciocpky@gmail.com"
    EMAIL_PASSWORD = 'pradeepyadav'

    EMAIL_FOLDER = str(request.GET['folder'])
    try:
        page = int(request.GET['page'])
    except:
        page = 0
    try:
        query = str(request.GET['query']).replace('/' , '"')
    except:
        query = "ALL"
    M = imaplib.IMAP4_SSL('imap.gmail.com')
    try:
        rv, data = M.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
    except imaplib.IMAP4.error:
        print "LOGIN FAILED!!! "


    rv, data = M.select(EMAIL_FOLDER)
    if rv == 'OK':
        rv, data = M.uid('SEARCH', None, '(' + query + ')')
        # rv, data = M.sort('REVERSE DATE', 'UTF-8' , "ALL")
        # I think the dovecot mail server supports the sort method but gmail does not so as of now using a workaround

        if rv != 'OK':
            print "No messages found!"
        mailUIDs = data[0].split()
        content = []
        endIndex =  len(mailUIDs)-10 - page*9
        if endIndex<-1:
            endIndex = -1
        indexes = range(len(mailUIDs)-1 - page*9, endIndex , -1) # this generates from 8 to 0 as -1 in the middle does is not included in the list
        for index in indexes:
            num = mailUIDs[index]
            # print "fetching " + str(num)
            subject , date , sender , to , flags = getMailHeader(M , num)
            content.append({'uid' : num, 'subject' : subject , 'date' : date , 'sender' : sender , 'to' : to , 'flags':flags })
        return Response(content)
        # print "closing mail box"
        M.close()
    else:
        print "ERROR: Unable to open mailbox ", rv
    # print "logging out mailbox"
    M.logout()

def getMailBody(M , id , mode):
    rv, data = M.uid('FETCH', id, '(RFC822)')
    if rv == 'OK':
        msg = email.message_from_string(data[0][1])
        for part in msg.walk():
            if part.get_content_type()=='text/'+mode:
                return part.get_payload(decode = True)

@api_view(['GET','PATCH'])
def emailView(request):
    """
    get a perticular mail
    """

    if request.user.username != 'pradeep':
        raise PermissionDenied()
    EMAIL_FOLDER = str(request.GET['folder'])
    uid = int(request.GET['uid'])

    EMAIL_ACCOUNT = "ciocpky@gmail.com"
    EMAIL_PASSWORD = 'pradeepyadav'

    M = imaplib.IMAP4_SSL('imap.gmail.com')
    try:
        rv, data = M.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
    except imaplib.IMAP4.error:
        print "LOGIN FAILED!!! "

    rv, data = M.select(EMAIL_FOLDER)
    if rv == 'OK':
        if request.method=='GET':
            body = getMailBody(M, uid , request.GET['mode'])
            return Response({'body' : body , 'uid' : uid  , 'folder' : EMAIL_FOLDER})
        elif request.method=='PATCH':
            if 'action' in request.GET:
                actionType = request.GET['action']
                if actionType == 'addFlag' or actionType == 'removeFlag':
                    if actionType =='addFlag':
                        action = '+FLAGS'
                    elif actionType == 'removeFlag':
                        action = '-FLAGS'
                    rv , data = M.uid('STORE' , uid , action , '\\'+ request.GET['flag'])
                elif actionType == 'move':
                    rv , data = M.uid('COPY' , uid ,  request.GET['to'])
                    if rv == 'OK':
                        rv , data = M.uid('STORE', uid , '+FLAGS', '(\Deleted)')
                        M.expunge()
            else:
                M.close()
                M.logout()
        return Response(status = status.HTTP_200_OK)


def getFolders(M):
    fodlersStatus = []
    rv, mailboxes = M.list()
    if rv == 'OK':
        # print "Mailboxes:"
        for folder in mailboxes:
            flag , delimiter , mailbox_name =  parse_list_response(folder)
            # print "parsed response :"  + mailbox_name
            status =  M.status(mailbox_name, '(MESSAGES RECENT UIDNEXT UIDVALIDITY UNSEEN)')
            fodlersStatus.append(status)
        return fodlersStatus

@api_view(['GET'])
def foldersDetailsView(request):
    """
    get the folder details
    """


    if request.user.username != 'pradeep':
        raise PermissionDenied()

    EMAIL_ACCOUNT = "ciocpky@gmail.com"
    M = imaplib.IMAP4_SSL('imap.gmail.com')
    try:
        rv, data = M.login(EMAIL_ACCOUNT, 'pradeepyadav')
    except imaplib.IMAP4.error:
        print "LOGIN FAILED!!! "

    return Response(getFolders(M))

class mailAttachmentViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwnerOrReadOnly,)
    serializer_class = mailAttachmentSerializer
    queryset = mailAttachment.objects.all()
