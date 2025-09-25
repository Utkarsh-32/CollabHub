from django.db import models
from django.conf import settings

# Create your models here.

class Projects(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='owned_projects', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_projects', through='TeamMembers')

class TeamMembers(models.Model):
    STATUS_CHOICES = [
        ('pending', 'PENDING'),
        ('approved', 'APPROVED'),
        ('rejected', 'REJECTED'),
        ('invited', 'INVITED')
    ]
    project = models.ForeignKey(Projects, related_name='team_members', on_delete=models.CASCADE)
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['project', 'member'], name='unique_project_member')
            ]

class RolesRequired(models.Model):
    project = models.ForeignKey(Projects, related_name='roles_required', on_delete=models.CASCADE)
    role = models.CharField(max_length=100)
    count = models.PositiveBigIntegerField(default=1)

class Messages(models.Model):
    project = models.ForeignKey(Projects, related_name='messages', on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']