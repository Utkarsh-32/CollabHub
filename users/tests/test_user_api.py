from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

class UserTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="user", password="pass")
        self.other = User.objects.create_user(username="other", password="pass")
        self.client.login(username="user", password="pass")
    
    def test_update_self(self):
        url = reverse("user-detail", kwargs={"pk": self.user.id})
        response = self.client.patch(url, {"display_name": "NewName"})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.display_name, "NewName")
    
    def test_cannot_update_other(self):
        url = reverse("user-detail", kwargs={"pk": self.other.id})
        response = self.client.patch(url, {"display_name": "Hacker"})
        self.assertEqual(response.status_code, 403)