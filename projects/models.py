from django.db import models
from django.conf import settings

# Create your models here.

class Projects(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='owned_projects', on_delete=models.CASCADE)
    members_required = models.TextField()
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_projects', through='TeamMembers')

class TeamMembers(models.Model):
    STATUS_CHOICES = [
        ('pending', 'PENDING'),
        ('approved', 'APPROVED'),
        ('rejected', 'REJECTED')
    ]
    project = models.ForeignKey(Projects, related_name='team_members', on_delete=models.CASCADE)
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        unique_together = ['project', 'member']