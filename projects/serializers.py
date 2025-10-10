from projects.models import Projects, TeamMembers, RolesRequired, Messages
from rest_framework import serializers

class ProjectRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolesRequired
        fields = ['role', 'count']
    
class OwnerProjectSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.display_name')
    approved_members = serializers.SerializerMethodField()
    pending_requests = serializers.SerializerMethodField()
    roles_required = ProjectRoleSerializer(many=True)
    sent_invitations = serializers.SerializerMethodField()
    owner_image_url = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    rejected_members = serializers.SerializerMethodField()
    class Meta:
        model = Projects
        fields = ['url', 'title', 'description','roles_required', 'owner', 'owner_image_url', 'approved_members', 'pending_requests','rejected_members', 'sent_invitations', 'is_owner']
    def get_approved_members(self, obj):
        approved = obj.team_members.filter(status='approved').exclude(member=obj.owner)
        request = self.context.get('request')
        members_data = []
        for tm in approved:
            image_url = request.build_absolute_uri('/media/default.jpg')
            if tm.member.image and hasattr(tm.member.image, 'url') and 'default.jpg' not in tm.member.image.url:
                image_url = request.build_absolute_uri(tm.member.image.url)
            members_data.append({
                'id': tm.member.id,
                'display_name': tm.member.display_name,
                'image_url': image_url
            })
        return members_data
    def get_pending_requests(self, obj):
        requests = obj.team_members.filter(status='pending').exclude(member=obj.owner)
        request = self.context.get('request')
        requests_data = []
        for req in requests:
            image_url = request.build_absolute_uri('/media/default.jpg')
            if req.member.image and hasattr(req.member.image, 'url') and 'default.jpg' not in req.member.image.url:
                image_url = request.build_absolute_uri(req.member.image.url)
            requests_data.append({'id': req.id, 'member_id': req.member.id ,'display_name': req.member.display_name, 'image_url': image_url})
        return requests_data
    def get_sent_invitations(self, obj):
        invitations = obj.team_members.filter(status='invited')
        request = self.context.get('request')
        invitations_data = []
        for inv in invitations:
            image_url = request.build_absolute_uri('/media/default.jpg')
            if inv.member.image and hasattr(inv.member.image, 'url') and 'default.jpg' not in inv.member.image.url:
                image_url = request.build_absolute_uri(inv.member.image.url)
            invitations_data.append({'id': inv.id, 'member_id': inv.member.id ,'display_name': inv.member.display_name, 'image_url': image_url})
        return invitations_data
    def create(self, validated_data):
        roles_data = validated_data.pop('roles_required', [])
        project = Projects.objects.create(**validated_data)
        TeamMembers.objects.create(project=project, member=project.owner, status='approved')
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
    def get_owner_image_url(self, obj):
        request = self.context.get('request')
        if obj.owner.image and hasattr(obj.owner.image, 'url') and 'default.jpg' not in obj.owner.image.url:
            return request.build_absolute_uri(obj.owner.image.url)
        return request.build_absolute_uri('/media/default.jpg')
    def get_is_owner(self, obj):
        user = self.context['request'].user
        return obj.owner == user
    def get_rejected_members(self, obj):
        request = self.context.get('request')
        rejected = obj.team_members.filter(status='rejected')
        rejected_data = []
        for rej in rejected:
            image_url = request.build_absolute_uri('/media/default.jpg')
            if rej.member.image and hasattr(rej.member.image, 'url') and 'default.jpg' not in rej.member.image.url:
                image_url = request.build_absolute_uri(rej.member.image.url)
            rejected_data.append({'id': rej.member.id, 'display_name': rej.member.display_name, 'image_url': image_url})
        return rejected_data
    
    
class ApplicantProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.display_name')
    approved_members = serializers.SerializerMethodField()
    my_status = serializers.SerializerMethodField()
    roles_required = ProjectRoleSerializer(many=True, read_only=True)
    my_application_id = serializers.SerializerMethodField()
    owner_image_url = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    class Meta:
        model = Projects
        fields = ['url', 'title', 'description','roles_required', 'owner', 'owner_image_url', 'approved_members', 'my_status', 'my_application_id', 'is_owner']
    def get_approved_members(self, obj):
        approved = obj.team_members.filter(status='approved').exclude(member=obj.owner)
        request = self.context.get('request')
        members_data = []
        for tm in approved:
            image_url = request.build_absolute_uri('/media/default.jpg')
            if tm.member.image and hasattr(tm.member.image, 'url') and 'default.jpg' not in tm.member.image.url:
                image_url = request.build_absolute_uri(tm.member.image.url)
            members_data.append({
                'id': tm.member.id,
                'display_name': tm.member.display_name,
                'image_url': image_url
            })
        return members_data
    def get_my_status(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return None
        try:
            membership = obj.team_members.get(member=user)
            return membership.status
        except TeamMembers.DoesNotExist:
            return None
    def get_my_application_id(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return None
        try:
            membership = obj.team_members.get(member=user)
            return membership.id
        except TeamMembers.DoesNotExist:
            return None
    def get_owner_image_url(self, obj):
        request = self.context.get('request')
        if obj.owner.image and hasattr(obj.owner.image, 'url') and 'default.jpg' not in obj.owner.image.url:
            return request.build_absolute_uri(obj.owner.image.url)
        return request.build_absolute_uri('/media/default.jpg')
    def get_is_owner(self, obj):
        user = self.context['request'].user
        return obj.owner == user

class PublicProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.display_name')
    owner_image_url = serializers.SerializerMethodField()
    approved_members = serializers.SerializerMethodField()
    roles_required = ProjectRoleSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    class Meta:
        model = Projects
        fields = ['id', 'url', 'title', 'description','roles_required', 'owner','owner_image_url', 'approved_members', 'is_owner']
    def get_approved_members(self, obj):
        approved = obj.team_members.filter(status='approved').exclude(member=obj.owner)
        request = self.context.get('request')
        members_data = []
        for tm in approved:
            image_url = request.build_absolute_uri('/media/default.jpg')
            if tm.member.image and hasattr(tm.member.image, 'url') and 'default.jpg' not in tm.member.image.url:
                image_url = request.build_absolute_uri(tm.member.image.url)
            members_data.append({
                'id': tm.member.id,
                'display_name': tm.member.display_name,
                'image_url': image_url
            })
        return members_data
    def get_owner_image_url(self, obj):
        request = self.context.get('request')
        if obj.owner.image and hasattr(obj.owner.image, 'url') and 'default.jpg' not in obj.owner.image.url:
            return request.build_absolute_uri(obj.owner.image.url)
        return request.build_absolute_uri('/media/default.jpg')
    def get_is_owner(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.owner == user
        return False
    
class TeamMembersSerializer(serializers.HyperlinkedModelSerializer):
    username = serializers.SerializerMethodField()
    class Meta:
        model = TeamMembers
        fields = ['id', 'status', 'project', 'username']
    def get_username(self, obj):
        return obj.member.display_name
    
class ApplySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TeamMembers
        fields = ['url', 'project', 'member', 'status']
        read_only_fields = ['project', 'member']

class InviteSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)


class MessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.display_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    author_image_url = serializers.SerializerMethodField()
    class Meta:
        model = Messages
        fields = ['id', 'project', 'project_title', 'author_username', 'author_image_url', 'content', 'timestamp']
        read_only_fields = ['author', 'project']
    def get_author_image_url(self, obj):
        request = self.context.get('request')
        if obj.author.image and hasattr(obj.author.image, 'url') and 'default.jpg' not in obj.author.image.url:
            return request.build_absolute_uri(obj.author.image.url)
        return request.build_absolute_uri('/media/default.jpg')
    