from django.shortcuts import render
import sys
import imaplib
import getpass
import email
import email.header
import datetime
import os
# For guessing MIME type based on file name extension
import mimetypes
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
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.core.exceptions import *
import re
reload(sys)
sys.setdefaultencoding('utf8')

list_response_pattern = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?P<name>.*)')

def parse_list_response(line):
    flags, delimiter, mailbox_name = list_response_pattern.match(line).groups()
    mailbox_name = mailbox_name.strip('"')
    return (flags, delimiter, mailbox_name)

def getMailHeader(M , id):

    rv, data =  M.uid('FETCH', id, '(RFC822.HEADER)')
    if rv == 'OK':
        msg = email.message_from_string(data[0][1])
        try:
            decode = email.header.decode_header(msg['Subject'])[0]
            subject = unicode(decode[0])
        except:
            subject = msg['subject']
        decode = email.header.decode_header(msg['from'])[0]
        sender = unicode(decode[0])
        return subject , msg['Date'] , sender , msg['to']

def getMailBody(M , id):

    rv, data = M.uid('FETCH', id, '(RFC822)')
    if rv == 'OK':
        msg = email.message_from_string(data[0][1])
        for part in msg.walk():
            if part.get_content_type()=='text/html':
                return part.get_payload(decode = True)


@api_view(['GET', 'POST'])
def mailBoxView(request):
    """
    View to get the mailbox selected, ideally 10 at a time.
    """

    if request.user.username != 'pradeep':
        raise PermissionDenied()

    EMAIL_ACCOUNT = "ciocpky@gmail.com"
    EMAIL_FOLDER = "INBOX"

    M = imaplib.IMAP4_SSL('imap.gmail.com')
    try:
        rv, data = M.login(EMAIL_ACCOUNT, 'pradeepyadav')
    except imaplib.IMAP4.error:
        print "LOGIN FAILED!!! "

    if request.method == 'GET':

        rv, data = M.select(EMAIL_FOLDER)
        if rv == 'OK':
            rv, data = M.uid('SEARCH', None, "ALL")
            # rv, data = M.sort('REVERSE DATE', 'UTF-8' , "ALL")

            if rv != 'OK':
                print "No messages found!"
            mailIDs = data[0].split()
            print mailIDs
            content = []
            for num in mailIDs:
                subject , date , sender , to = getMailHeader(M , num)
                # body = getMailBody(M, num)
                content.append({'uid' : num, 'subject' : subject , 'date' : date , 'sender' : sender , 'to' : to , 'body' : 'body'})
            return Response(content)
            # print "closing mail box"
            M.close()
        else:
            print "ERROR: Unable to open mailbox ", rv
        # print "logging out mailbox"
        M.logout()

def getFolders(M):
    mailboxStatus = []
    rv, mailboxes = M.list()
    if rv == 'OK':
        # print "Mailboxes:"
        print mailboxes.__class__
        for folder in mailboxes:
            flag , delimiter , mailbox_name =  parse_list_response(folder)
            # print "parsed response :"  + mailbox_name
            status =  M.status(mailbox_name, '(MESSAGES RECENT UIDNEXT UIDVALIDITY UNSEEN)')
            mailboxStatus.append(status)
