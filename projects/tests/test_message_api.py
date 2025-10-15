from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from projects.models import Projects, TeamMembers, Messages

User = get_user_model()

class MessageTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.member = User.objects.create_user(username="member", password="pass")
        self.other = User.objects.create_user(username="other", password="pass")
        self.project = Projects.objects.create(title="Proj", description="Desc", owner=self.owner)
        TeamMembers.objects.create(project=self.project, member=self.member, status='approved')
        self.client.login(username="member", password="pass")

    def test_post_message(self):
        url = f'/projects/{self.project.id}/messages/'
        response = self.client.post(url, {'content': 'Hello'})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Messages.objects.filter(project=self.project, author=self.member).exists())

    def test_non_member_cannot_post(self):
        self.client.logout()
        self.client.login(username="other", password="pass")
        url = f'/projects/{self.project.id}/messages/'
        response = self.client.post(url, {'content': 'Hack'})
        self.assertEqual(response.status_code, 403)
