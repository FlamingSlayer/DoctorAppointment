from django.db import models
from django.conf import settings  

# If you have an Appointment model, keep it here. 
# I am including it just in case, based on our previous steps.
class Appointment(models.Model):
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments_as_patient')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments_as_doctor')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, default='pending')
    notes = models.TextField(blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor}"

# --- THIS IS THE NEW MODEL YOU ADDED ---
class PatientProfile(models.Model):
    # FIX: Use settings.AUTH_USER_MODEL instead of CustomUser
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    allergies = models.TextField(null=True, blank=True, help_text="e.g. Peanuts, Penicillin")
    medical_history = models.TextField(null=True, blank=True, help_text="Past surgeries, chronic conditions")
    
    def __str__(self):
        return f"Profile of {self.user.username}"