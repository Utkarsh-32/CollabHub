from projects.models import Projects, TeamMembers, RolesRequired
from rest_framework import serializers

class ProjectRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolesRequired
        fields = ['role', 'count']
    
class OwnerProjectSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    approved_members = serializers.SerializerMethodField()
    pending_requests = serializers.SerializerMethodField()
    roles_required = ProjectRoleSerializer(many=True)
    sent_invitations = serializers.SerializerMethodField()
    class Meta:
        model = Projects
        fields = ['url', 'title', 'description','roles_required', 'owner', 'approved_members', 'pending_requests', 'sent_invitations']
    def get_approved_members(self, obj):
        return [tm.member.username for tm in obj.team_members.filter(status='approved')]
    def get_pending_requests(self, obj):
        requests = obj.team_members.filter(status='pending').exclude(member=obj.owner)
        return [{'id': req.id, 'username': req.member.username} for req in requests]
    def get_sent_invitations(self, obj):
        return obj.team_members.filter(status='invited').values_list('member__username', flat=True)
    def create(self, validated_data):
        roles_data = validated_data.pop('roles_required', [])
        project = Projects.objects.create(**validated_data)
        for role in roles_data:
            RolesRequired.objects.create(project=project, **role)
        return project
    def update(self, instance, validated_data):
        roles_data = validated_data.pop('roles_required', [])
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        instance.roles_required.all().delete()
        for role in roles_data:
            RolesRequired.objects.create(project=instance, **role)
        return instance
    
class ApplicantProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    approved_members = serializers.SerializerMethodField()
    my_status = serializers.SerializerMethodField()
    roles_required = ProjectRoleSerializer(many=True, read_only=True)
    class Meta:
        model = Projects
        fields = ['url', 'title', 'description','roles_required', 'owner', 'approved_members', 'my_status']
    def get_approved_members(self, obj):
        return [tm.member.username for tm in obj.team_members.filter(status='approved')]
    def get_my_status(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return None
        try:
            membership = obj.team_members.get(member=user)
            return membership.status
        except TeamMembers.DoesNotExist:
            return None


class PublicProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    approved_members = serializers.SerializerMethodField()
    roles_required = ProjectRoleSerializer(many=True, read_only=True)
    class Meta:
        model = Projects
        fields = ['url', 'title', 'description','roles_required', 'owner', 'approved_members']
    def get_approved_members(self, obj):
        return [tm.member.username for tm in obj.team_members.filter(status='approved')]
    
class TeamMembersSerializer(serializers.HyperlinkedModelSerializer):
    username = serializers.SerializerMethodField()
    class Meta:
        model = TeamMembers
        fields = ['id', 'status', 'project', 'username']
    def get_username(self, obj):
        return obj.member.username
    
class ApplySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TeamMembers
        fields = ['url', 'project', 'member', 'status']
        read_only_fields = ['project', 'member']

class InviteSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)