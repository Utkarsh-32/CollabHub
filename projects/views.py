from projects.models import Projects, TeamMembers
from projects.serializers import OwnerProjectSerializer, ApplySerializer, TeamMembersSerializer, ApplicantProjectSerializer, PublicProjectSerializer, InviteSerializer
from rest_framework import viewsets, permissions, filters, status
from projects.permissions import IsOwnerOrReadOnly
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from django.contrib.auth import get_user_model
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
        if self.action == 'invite':
            return InviteSerializer
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
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly])
    def invite(self, request, pk=None):
        project = self.get_object()
        user_to_invite = request.data.get('username')
        if not user_to_invite:
            return Response({'detail': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            member_to_invite = get_user_model().objects.get(username=user_to_invite)
        except get_user_model().DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        if TeamMembers.objects.filter(project=project, member=member_to_invite).exists():
            return Response({'detail': 'This user is already part of the project or has an active application/invitation'},
                            status=status.HTTP_400_BAD_REQUEST)
        TeamMembers.objects.create(project=project, member=member_to_invite, status='invited')
        return Response({'detail': f'Invitation sent to {member_to_invite}'}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_invitations(self, request):
        project = Projects.objects.filter(team_members__member=request.user,
                                          team_members__status='invited')
        serializer = ApplicantProjectSerializer(project, many=True, context={'request':request})
        return Response(serializer.data)


class TeamMembersViewSet(viewsets.ModelViewSet):
    queryset = TeamMembers.objects.all()
    serializer_class = TeamMembersSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    http_method_names = ['get', 'patch', 'head', 'options']
    def get_queryset(self):
        user = self.request.user
        if self.action == 'list':
            owned_projects = Projects.objects.filter(owner=user)
            return TeamMembers.objects.filter(project__in=owned_projects).order_by('-id')
        return TeamMembers.objects.all().order_by('-id')
    
    def update(self, request, *args, **kwargs):
        team_members_instance = self.get_object()
        project_owner = team_members_instance.project.owner
        if request.user != project_owner:
            return Response({'detail': 'You are not allowed to perform this action'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(team_members_instance, data={'status': request.data.get('status')}, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def respond(self, request, pk=None):
        invitation = self.get_object()
        new_status = request.data.get('status')

        if request.user != invitation.member:
            return Response({'detail': 'You are not allowed to respond to this invitation'}, status=status.HTTP_403_FORBIDDEN)
        
        if invitation.status != 'invited':
            return Response({'detail': 'This invitation is no longer active'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in ['approved', 'rejected']:
            return Response({'detail': 'Invalid status provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        invitation.status = new_status
        invitation.save()
        serializer = self.get_serializer(invitation)
        return Response(serializer.data)
        
class ProjectRequestsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TeamMembersSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        project_pk = self.kwargs['project_pk']
        return TeamMembers.objects.filter(project__id=project_pk, status__in=['pending', 'invited'])