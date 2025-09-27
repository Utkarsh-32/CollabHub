from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    skills = models.CharField(max_length=500, blank=True, default="")
    image = models.ImageField(default='default.jpg', upload_to='profile_pics')
    display_name = models.CharField(max_length=150, blank=True)