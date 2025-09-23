from users.models import User
from users.serializers import UserSerializer
from rest_framework import viewsets, filters
from users.permissions import IsOwnerOrReadOnly
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrReadOnly]
    fields = ['skills']
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'skills']