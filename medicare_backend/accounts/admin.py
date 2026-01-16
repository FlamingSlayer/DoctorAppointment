
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
