from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from projects.models import Projects, TeamMembers, Messages
from projects.permissions import IsOwnerOrReadOnly, IsApprovedMember, IsAuthorOrReadOnly, IsProjectOwner

User = get_user_model()

class PermissionsTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.member = User.objects.create_user(username="member", password="pass")
        self.other = User.objects.create_user(username="other", password="pass")
        self.project = Projects.objects.create(title="Test", description="desc", owner=self.owner)
        TeamMembers.objects.create(project=self.project, member=self.member, status="approved")
        self.message = Messages.objects.create(project=self.project, author=self.owner, content="Hello")
    
    def test_is_owner_or_readonly(self):
        perm = IsOwnerOrReadOnly()
        request = self.factory.put("/fake-url/", {}, format="json")
        request.user = self.owner
        self.assertTrue(perm.has_object_permission(request, APIView(), self.project))
        request.user = self.other
        self.assertFalse(perm.has_object_permission(request, APIView(), self.project))
        request = self.factory.get("/fake-url/")
        request.user = self.other
        self.assertTrue(perm.has_object_permission(request, APIView(), self.project))
    
    def test_is_approved_member(self):
        perm = IsApprovedMember()
        request = self.factory.get("/fake-url/")
        request.user = self.member
        self.assertTrue(perm.has_object_permission(request, APIView(), self.message))
        request.user = self.other
        self.assertFalse(perm.has_object_permission(request, APIView(), self.message))

    def test_is_author_or_readonly(self):
        perm = IsAuthorOrReadOnly()
        request = self.factory.put("/fake-url", {}, format="json")
        request.user = self.owner
        self.assertTrue(perm.has_object_permission(request, APIView(), self.message))
        request.user = self.member
        self.assertFalse(perm.has_object_permission(request, APIView(), self.message))