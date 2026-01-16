from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Appointment, PatientProfile
from .serializers import (
    UserSerializer, 
    AppointmentSerializer, 
    PatientProfileSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ViewSet):
    """
    Handles ONLY the specific Medical Profile actions.
    Login/Register is handled by the 'accounts' app.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'patch'])
    def profile_details(self, request):
        user = request.user
        profile, created = PatientProfile.objects.get_or_create(user=user)

        if request.method == 'GET':
            serializer = PatientProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = PatientProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return Appointment.objects.filter(doctor=user).order_by('-date')
        elif user.role == 'patient':
            return Appointment.objects.filter(patient=user).order_by('-date')
        return Appointment.objects.all().order_by('-date')

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)