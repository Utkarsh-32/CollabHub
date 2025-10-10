from users.models import User
from users.serializers import UserDetailsSerializer
from rest_framework import viewsets, filters, status
from users.permissions import IsSelfOrReadOnly
from rest_framework.response import Response
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserDetailsSerializer
    permission_classes = [IsSelfOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'skills', 'display_name']

    def update(self, request, *args, **kwargs):
        if 'image' in request.data and request.data['image'] is None:
            user = self.get_object()
            user.image.delete(save=False)
            user.image = 'default.jpg'
            user.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return super().update(request, *args, **kwargs)