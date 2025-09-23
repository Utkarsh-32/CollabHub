from django.contrib import admin
from projects.models import Projects, TeamMembers, RolesRequired
# Register your models here.
admin.site.register(Projects)
admin.site.register(TeamMembers)
admin.site.register(RolesRequired)