from rest_framework.routers import DefaultRouter

from .views import ConceptoViewSet

router = DefaultRouter()
router.register(r"", ConceptoViewSet, basename="concepto")

urlpatterns = router.urls
