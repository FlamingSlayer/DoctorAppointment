from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CustomTokenObtainPairView  # <-- IMPORT THIS

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # This connects your custom login logic to the URL
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]