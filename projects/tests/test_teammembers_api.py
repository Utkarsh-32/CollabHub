from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from projects.models import Projects, TeamMembers
from django.urls import reverse
User = get_user_model()

class TeamMembersTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.member = User.objects.create_user(username="member", password="pass")
        self.project = Projects.objects.create(title="Project", description="desc", owner=self.owner)
        self.invitation = TeamMembers.objects.create(project=self.project, member=self.member, status="invited")
        self.client.login(username="member", password="pass")

    def test_respond_invitation_approve(self):
        url = reverse("teammembers-respond", kwargs={"pk": self.invitation.pk})
        response = self.client.patch(url, {'status': 'approved'})
        self.assertTrue(response.status_code, 200)
        self.invitation.refresh_from_db()
        self.assertEqual(self.invitation.status, "approved")