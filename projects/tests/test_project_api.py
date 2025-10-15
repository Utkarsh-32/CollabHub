from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from projects.models import Projects, TeamMembers

User = get_user_model()

class ProjectAPItests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.user = User.objects.create_user(username="user", password="pass")
        self.project = Projects.objects.create(title="Test project", description="desc", owner=self.owner)
        self.client.login(username="owner", password="pass")
    
    def test_create_project(self):
        urls = reverse("projects-list")
        data = {"title": "New Project", "description": "Desc"}
        response = self.client.post(urls, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Projects.objects.count(), 2)
    
    def test_apply_project(self):
        self.client.logout()
        self.client.login(username="user", password="pass")
        url = reverse("projects-apply", kwargs={"pk": self.project.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(TeamMembers.objects.filter(project=self.project, member=self.user).exists())
    
    def test_invite_user(self):
        url = reverse("projects-invite", kwargs={"pk": self.project.id})
        response = self.client.post(url, {"username": self.user.username})
        self.assertEqual(response.status_code, 201)
        membership = TeamMembers.objects.get(project=self.project, member=self.user)
        self.assertEqual(membership.status, 'invited')