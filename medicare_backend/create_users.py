import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("Creating MediCare users...")

# DOCTORS
doctors = [
    ('dr.sarah', 'sarah.johnson@medicare.com', 'Sarah', 'Johnson', 'Cardiologist', 12, 150.00),
    ('dr.michael', 'michael.chen@medicare.com', 'Michael', 'Chen', 'Dermatologist', 8, 120.00),
    ('dr.emily', 'emily.rodriguez@medicare.com', 'Emily', 'Rodriguez', 'Pediatrician', 15, 100.00),
    ('dr.james', 'james.wilson@medicare.com', 'James', 'Wilson', 'Orthopedic', 20, 200.00),
]

for username, email, first_name, last_name, specialization, experience, fee in doctors:
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(
            username=username,
            email=email,
            password='Doctor@123',
            first_name=first_name,
            last_name=last_name,
            role='doctor',
            specialization=specialization,
            experience=experience,
            consultation_fee=fee,
            rating=4.5,
            is_verified=True,
            phone='+1 234 567 8901'
        )
        print(f"DOCTOR: {email} / Doctor@123")

# PATIENTS
patients = [
    ('john.smith', 'john.smith@email.com', 'John', 'Smith', 'A+'),
    ('emma.davis', 'emma.davis@email.com', 'Emma', 'Davis', 'O+'),
    ('david.brown', 'david.brown@email.com', 'David', 'Brown', 'B-'),
    ('sophia.wilson', 'sophia.wilson@email.com', 'Sophia', 'Wilson', 'AB+'),
]

for username, email, first_name, last_name, blood_group in patients:
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(
            username=username,
            email=email,
            password='Patient@123',
            first_name=first_name,
            last_name=last_name,
            role='patient',
            blood_group=blood_group,
            is_verified=True,
            phone='+1 234 567 8910'
        )
        print(f"PATIENT: {email} / Patient@123")

print("\nUSERS CREATED!")
print("\nLogin Credentials:")
print("Admin:   admin@medicare.com / Admin@123")
print("Doctor1: sarah.johnson@medicare.com / Doctor@123")
print("Doctor2: michael.chen@medicare.com / Doctor@123")
print("Patient1: john.smith@email.com / Patient@123")
print("Patient2: emma.davis@email.com / Patient@123")
