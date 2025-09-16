from users.models import User
from users.serializers import UserSerializer
from rest_framework import viewsets, permissions
from users.permissions import IsOwnerOrReadOnly
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]