from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# --- 1. User Serializer (For Updates & Profile View) ---
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        # ✅ ADDED: 'address', 'phone', 'bio', 'age'
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'specialization', 'experience', 'consultation_fee', 'rating', 
                  'is_verified', 'password', 
                  'address', 'phone', 'bio', 'age'] 
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        return token

# --- 2. Register Serializer (For New Users) ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # ✅ ADDED: 'address', 'phone', 'bio', 'age' (Optional during register, but good to have)
        fields = ['email', 'password', 'first_name', 'last_name', 'role', 
                  'specialization', 'experience', 'consultation_fee',
                  'address', 'phone', 'bio', 'age']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def create(self, validated_data):
        # We use objects.create_user to handle hashing automatically
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'patient'),
            specialization=validated_data.get('specialization', ''),
            experience=validated_data.get('experience', 0),
            consultation_fee=validated_data.get('consultation_fee', 0.0),
            # Add safe getters for new fields so it doesn't crash if they are missing
            address=validated_data.get('address', ''),
            phone=validated_data.get('phone', ''),
            bio=validated_data.get('bio', ''),
            age=validated_data.get('age', None)
        )
        return user