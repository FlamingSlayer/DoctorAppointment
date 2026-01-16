import os
import sys

print("="*60)
print("MEDICARE BACKEND SIMPLE SETUP")
print("="*60)

# Step 1: Create virtual environment
print("\n1. Creating virtual environment...")
os.system("python -m venv venv")

# Step 2: Activate and install
print("\n2. Installing packages...")
if sys.platform == "win32":
    os.system("venv\\Scripts\\pip install django djangorestframework mysqlclient django-cors-headers djangorestframework-simplejwt pillow python-decouple")
else:
    os.system("source venv/bin/activate && pip install django djangorestframework mysqlclient django-cors-headers djangorestframework-simplejwt pillow python-decouple")

# Step 3: Create project structure
print("\n3. Creating project structure...")
os.system("django-admin startproject config .")
os.system("python manage.py startapp api")
os.system("python manage.py startapp accounts")

# Create necessary files
with open('.env', 'w') as f:
    f.write("""DEBUG=True
SECRET_KEY=medicare-secret-key-123456
DB_NAME=medicare_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306
ALLOWED_HOSTS=localhost,127.0.0.1""")

# Create settings.py
settings_content = '''
import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'api',
    'accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
        'OPTIONS': {'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"},
    }
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

AUTH_USER_MODEL = 'accounts.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
'''

with open('config/settings.py', 'w') as f:
    f.write(settings_content)

# Create models
accounts_models = '''
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (('admin','Admin'),('doctor','Doctor'),('patient','Patient'))
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=15, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    experience = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bio = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    blood_group = models.CharField(max_length=5, blank=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
'''

with open('accounts/models.py', 'w') as f:
    f.write(accounts_models)

api_models = '''
from django.db import models
from django.conf import settings

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_appointments')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Appointment #{self.id}"
'''

with open('api/models.py', 'w') as f:
    f.write(api_models)

# Create serializers
accounts_serializers = '''
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','role','phone',
                 'specialization','experience','consultation_fee','bio','rating',
                 'blood_group','is_verified']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data.get('password', ''))
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token
'''

with open('accounts/serializers.py', 'w') as f:
    f.write(accounts_serializers)

# Create simple views
accounts_views = '''
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def doctors(self, request):
        doctors = User.objects.filter(role='doctor', is_verified=True)
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
'''

with open('accounts/views.py', 'w') as f:
    f.write(accounts_views)

# Create URLs
config_urls = '''
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/', include('accounts.urls')),
]
'''

with open('config/urls.py', 'w') as f:
    f.write(config_urls)

accounts_urls = '''
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
'''

with open('accounts/urls.py', 'w') as f:
    f.write(accounts_urls)

# Create admin.py
accounts_admin = '''
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username','email','first_name','last_name','role','is_verified')
    fieldsets = UserAdmin.fieldsets + (
        ('MediCare Info', {'fields': ('role','phone','specialization','experience',
                                     'consultation_fee','bio','rating','blood_group','is_verified')}),
    )

admin.site.register(User, CustomUserAdmin)
'''

with open('accounts/admin.py', 'w') as f:
    f.write(accounts_admin)

print("\n4. Setup complete! Now run these commands:")
print("\nFor Git Bash:")
print("1. source venv/Scripts/activate")
print("2. python manage.py makemigrations")
print("3. python manage.py migrate")
print("4. python manage.py createsuperuser")
print("5. python manage.py runserver")
print("\nYour API will be at: http://localhost:8000/api/")
print("="*60)