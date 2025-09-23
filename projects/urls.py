from rest_framework.routers import DefaultRouter
from projects.views import ProjectViewSet, TeamMembersViewSet, ProjectRequestsViewSet
from rest_framework_nested import routers

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'team-members', TeamMembersViewSet, basename='teammembers')
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'candidates', ProjectRequestsViewSet, basename='project-requests')

urlpatterns = router.urls + projects_router.urls