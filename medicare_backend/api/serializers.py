from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Appointment, PatientProfile

User = get_user_model() 

# --- 1. Patient Profile Serializer ---
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['date_of_birth', 'blood_group', 'address', 'allergies', 'medical_history']

# --- 2. User Serializer (Read-Only for displaying user info) ---
class UserSerializer(serializers.ModelSerializer):
    profile = PatientProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'specialization', 'experience', 'consultation_fee', 'rating', 
                  'is_verified', 'profile']

# --- 3. Register Serializer (For creating new users) ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role', 
                  'specialization', 'experience', 'consultation_fee']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'patient'),
            specialization=validated_data.get('specialization', ''),
            experience=validated_data.get('experience', 0),
            consultation_fee=validated_data.get('consultation_fee', 0.0)
        )
        return user

# --- 4. Appointment Serializer ---
class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'patient_details', 'doctor', 'doctor_details', 
                  'date', 'time', 'status', 'notes', 'consultation_fee', 'created_at']
        read_only_fields = ['patient', 'created_at']