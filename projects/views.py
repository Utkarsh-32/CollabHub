from projects.models import Projects, TeamMembers
from projects.serializers import OwnerProjectSerializer, ApplySerializer, TeamMembersSerializer, ApplicantProjectSerializer, PublicProjectSerializer
from rest_framework import viewsets, permissions, generics, filters, status
from projects.permissions import IsOwnerOrReadOnly
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['title', 'description', 'owner__username', 'roles_required__role']
    ordering_fields = ['created_at', 'updated_at']
    
    def get_queryset(self):
        return super().get_queryset().distinct()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OwnerProjectSerializer
        if self.action == 'list':
            return PublicProjectSerializer
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            user = self.request.user
            project = self.get_object()
            if user == project.owner:
                return OwnerProjectSerializer
            elif user.is_authenticated:
                return ApplicantProjectSerializer
            else:
                return PublicProjectSerializer
        else:
            return PublicProjectSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        project = self.get_object()
        member = request.user
        if member == project.owner:
            return Response({'detail': 'You are the owner of this project'}, status=status.HTTP_400_BAD_REQUEST)
        if TeamMembers.objects.filter(project=project, member=member).exists():
            return Response({'detail': 'You have already applied to this project'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ApplySerializer(data={}, context={'request':request})
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project, member=member, status='pending')
        return Response(serializer.data, status=status.HTTP_201_CREATED)   

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_projects(self, request):
        projects = Projects.objects.filter(owner=request.user)
        serializer = OwnerProjectSerializer(projects, many=True, context={'request':request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_pending_applications(self, request):
        projects = Projects.objects.filter(team_members__member=request.user, team_members__status='pending').exclude(owner=request.user)
        serializer = ApplicantProjectSerializer(projects, many=True, context={'request':request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_joined_projects(self, request):
        projects = Projects.objects.filter(team_members__member=request.user, team_members__status='approved').exclude(owner=request.user)
        serializer = ApplicantProjectSerializer(projects, many=True, context={'request':request})
        return Response(serializer.data)

class TeamMembersViewSet(viewsets.ModelViewSet):
    queryset = TeamMembers.objects.all()
    serializer_class = TeamMembersSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    def get_queryset(self):
        user = self.request.user
        owned_projects = Projects.objects.filter(owner=user)
        return TeamMembers.objects.filter(project__in=owned_projects)
    
    def update(self, request, *args, **kwargs):
        team_members_instance = self.get_object()
        project_owner = team_members_instance.project.owner
        if request.user != project_owner:
            return Response({'detail': 'You are not allowed to perform this action'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(team_members_instance, data={'status': request.data.get('status')}, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
        
