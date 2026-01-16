import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Check if admin already exists
if not User.objects.filter(username='admin').exists():
    # Create superuser
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@medicare.com',
        password='Admin@123',
        first_name='System',
        last_name='Administrator',
        role='admin',
        is_verified=True,
        phone='+1 234 567 8900',
        bio='System administrator with full control over MediCare platform.'
    )
    print("✅ Admin user created successfully!")
    print(f"   Email: {admin.email}")
    print(f"   Password: Admin@123")
else:
    admin = User.objects.get(username='admin')
    print("✅ Admin user already exists!")
    print(f"   Email: {admin.email}")
