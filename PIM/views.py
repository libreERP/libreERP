from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *

class settingsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, isOwner, )
    queryset = settings.objects.all()
    serializer_class = settingsSerializer

class themeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    queryset = theme.objects.all()
    serializer_class = themeSerializer

class notificationViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner, )
    serializer_class = notificationSerializer
    def get_queryset(self):
        return notification.objects.filter(user = self.request.user)

class chatMessageViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner, )
    serializer_class = chatMessageSerializer
    def get_queryset(self):
        qs1 = chatMessage.objects.filter(user = self.request.user , read = False)
        qs2 = chatMessage.objects.filter(originator = self.request.user , read = False)
        qs = qs1 | qs2
        return qs.order_by('-created')[:300]

class chatMessageBetweenViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, readOnly)
    serializer_class = chatMessageSerializer

    def get_queryset(self):
        reciepient = User.objects.get(username = self.request.GET['other'])
        qs1 = chatMessage.objects.filter(originator = self.request.user , user= reciepient)
        qs2 = chatMessage.objects.filter(user = self.request.user , originator= reciepient)
        qs = qs1 | qs2
        return qs.order_by('created')[:30]
