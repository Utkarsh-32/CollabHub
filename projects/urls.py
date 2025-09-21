from rest_framework.routers import DefaultRouter
from projects.views import ProjectViewSet, TeamMembersViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'team-members', TeamMembersViewSet, basename='teammembers')

urlpatterns = router.urls