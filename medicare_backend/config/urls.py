from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Login & Auth
    path('api/auth/login/', CustomTokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    
    # Users & Doctors (Matches 'api/users/')
    path('api/', include('accounts.urls')), 
    
    # Appointments (Matches 'api/appointments/')
    path('api/', include('api.urls')), 
]