from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Appointment, PatientProfile

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'date', 'time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('patient__username', 'doctor__username')

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'blood_group', 'date_of_birth')