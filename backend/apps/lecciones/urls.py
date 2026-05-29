from rest_framework.routers import DefaultRouter

from .views import LeccionViewSet

router = DefaultRouter()
router.register(r"", LeccionViewSet, basename="leccion")

urlpatterns = router.urls
