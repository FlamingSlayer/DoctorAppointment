from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, UserViewSet

router = DefaultRouter()
# REMOVED: router.register(r'users', ...) <--- THIS WAS THE PROBLEM
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    # Keep this for the profile page
    path('my-medical-profile/', UserViewSet.as_view({'get': 'profile_details', 'patch': 'profile_details'}), name='my-medical-profile'),
    
    path('', include(router.urls)),
]