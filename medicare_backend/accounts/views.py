from rest_framework import viewsets, permissions, status # Added status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    # --- UPDATED: Methods now include 'patch' and 'put' ---
    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        user = request.user
        
        # 1. Handle GET (View Profile)
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        # 2. Handle PATCH/PUT (Save Changes)
        elif request.method in ['PATCH', 'PUT']:
            # partial=True allows us to update only the fields sent in the request
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def doctors(self, request):
        doctors = User.objects.filter(role='doctor', is_verified=True)
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        login_input = request.data.get('username')
        
        if login_input:
            user = User.objects.filter(email=login_input).first()
            if user:
                request.data['username'] = user.username
        
        return super().post(request, *args, **kwargs)