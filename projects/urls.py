from rest_framework.routers import DefaultRouter
from projects.views import ProjectViewSet, TeamDetailsViewSet
from rest_framework_nested import routers

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'teamdetails', TeamDetailsViewSet)

urlpatterns = router.urls