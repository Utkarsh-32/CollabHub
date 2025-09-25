from rest_framework import permissions
from projects.models import Projects

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'project'):
            return obj.project.owner == request.user
            
        return False

class IsProjectOwner(permissions.BasePermission):

    def has_permission(self, request, view):
        project_pk = view.kwargs.get('project_pk')
        if not project_pk:
            return False
        try:
            project = Projects.objects.get(pk=project_pk)
            return project.owner == request.user
        except Projects.DoesNotExist:
            return False

class IsApprovedMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        project = obj.project if hasattr(obj, 'project') else obj
        return project.team_members.filter(member=request.user, status='approved').exists()
    

class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.author == request.user