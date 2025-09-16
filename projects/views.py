from projects.models import Projects, TeamMembers
from projects.serializers import ProjectSerializer, TeamMembersSerializer
from rest_framework import viewsets, permissions
from projects.permissions import IsOwnerOrReadOnly
# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TeamDetailsViewSet(viewsets.ModelViewSet):
    serializer_class = TeamMembersSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = TeamMembers.objects.all()