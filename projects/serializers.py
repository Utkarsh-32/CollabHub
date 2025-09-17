from projects.models import Projects, TeamMembers
from rest_framework import serializers

class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    approved_members = serializers.SerializerMethodField()
    class Meta:
        model = Projects
        fields = ['url', 'title', 'description','members_required', 'owner', 'approved_members']
    def get_approved_members(self, obj):
        return [tm.member.username for tm in obj.team_members.filter(status='approved')]
    

class TeamMembersSerializer(serializers.HyperlinkedModelSerializer):
    approved_members = serializers.StringRelatedField(source='member')
    owner = serializers.ReadOnlyField(source='project.owner.username')
    class Meta:
        model = TeamMembers
        fields = ['url' ,'project', 'owner', 'approved_members']

class ApplySerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMembers
        fields = ['project']
    def create(self, validated_data):
        user = self.context['request'].user
        project = validated_data['project']
        return TeamMembers.objects.create(project=project, member=user, status='pending')