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
import re
reload(sys)
sys.setdefaultencoding('utf8')

list_response_pattern = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?P<name>.*)')

def parse_list_response(line):
    flags, delimiter, mailbox_name = list_response_pattern.match(line).groups()
    mailbox_name = mailbox_name.strip('"')
    return (flags, delimiter, mailbox_name)

def process_mailbox(M , uid):
    """
    Do something with emails messages in the folder.
    For the sake of this example, print some headers.
    """

    rv, data = M.fetch(uid, '(RFC822)')
    if rv != 'OK':
        print "ERROR getting message", uid
        return

    msg = email.message_from_string(data[0][1])
    decode = email.header.decode_header(msg['Subject'])[0]
    subject = unicode(decode[0])
    decode = email.header.decode_header(msg['from'])[0]
    sender = unicode(decode[0])
    print 'Message %s: %s' % (uid, subject)
    print 'Raw Date:', msg['Date']
    # Now convert to local date-time
    date_tuple = email.utils.parsedate_tz(msg['Date'])
    if date_tuple:
        local_date = datetime.datetime.fromtimestamp(
            email.utils.mktime_tz(date_tuple))
        print "Local Date:", \
            local_date.strftime("%a, %d %b %Y %H:%M:%S")

    for part in msg.walk():
        if part.get_content_type()=='text/html':
            return part.get_payload(decode = True) , subject , msg['Date'] , sender


@api_view(['GET', 'POST'])
def mailBoxView(request):
    """
    List all snippets, or create a new snippet.
    """
    EMAIL_ACCOUNT = "ciocpky@gmail.com"
    EMAIL_FOLDER = "INBOX"

    M = imaplib.IMAP4_SSL('imap.gmail.com')

    try:
        rv, data = M.login(EMAIL_ACCOUNT, 'pradeepyadav')
    except imaplib.IMAP4.error:
        print "LOGIN FAILED!!! "
        # sys.exit(1)

    print rv, data

    rv, mailboxes = M.list()
    if rv == 'OK':
        print "Mailboxes:"
        print mailboxes.__class__
        for folder in mailboxes:
            flag , delimiter , mailbox_name =  parse_list_response(folder)
            print "parsed response :"  + mailbox_name

    rv, data = M.select(EMAIL_FOLDER)
    if rv == 'OK':
        print "Processing mailbox...\n"
        # process_mailbox(M)
        if request.method == 'GET':
            rv, data = M.search(None, "ALL")
            if rv != 'OK':
                print "No messages found!"
            mailIDs = data[0].split()
            content = []
            for num in mailIDs:
                body , subject , date , sender = process_mailbox(M , num)
                content.append({'mail': body , 'subject' : subject , 'date' : date , 'sender' : sender})
            return Response(content)
        print "closing mail box"
        M.close()
    else:
        print "ERROR: Unable to open mailbox ", rv
    print "logging out mailbox"
    M.logout()
