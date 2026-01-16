
# 🏥 MediCare - Doctor Appointment System

> A full-stack web application for booking doctor appointments, built with Django backend and vanilla JavaScript frontend.

![Build](https://img.shields.io/github/actions/workflow/status/FlamingSlayer/DoctorAppointment/django.yml?style=flat-square)  
![Python Version](https://img.shields.io/badge/python-3.8%2B-blue?style=flat-square)  
![GitHub last commit](https://img.shields.io/github/last-commit/FlamingSlayer/DoctorAppointment?style=flat-square)  
![GitHub issues](https://img.shields.io/github/issues/FlamingSlayer/DoctorAppointment?style=flat-square)  
![GitHub license](https://img.shields.io/github/license/FlamingSlayer/DoctorAppointment?style=flat-square)

---

## ✨ Features

### 👥 For Patients
- Secure user registration and login with JWT authentication
- Browse and filter doctors by specialization, experience, and ratings
- View detailed doctor profiles with qualifications and availability
- Book, reschedule, and cancel appointments in real-time
- Track appointment history and medical records

### 👨‍⚕️ For Doctors
- Personalized dashboard with appointment overview
- Manage daily schedule and availability
- Accept or reject appointment requests
- Access patient medical profiles and history
- View analytics and performance metrics

### 👑 For Administrators
- Comprehensive system overview dashboard
- Full user management (CRUD operations)
- Monitor and manage all appointments
- Verify and approve doctor registrations
- System configuration and settings

---

## 🏗️ System Architecture

```
Frontend (HTML/CSS/JS) <---- REST API (JWT) ----> Django Backend (DRF, Models)
│                                       │
│                                       ▼
└─────────────── Database (SQLite/PostgreSQL) ──────────────┘
```

---

## 🛠️ Tech Stack

| Layer           | Technology                          | Purpose                           |
|-----------------|------------------------------------|----------------------------------|
| **Frontend**    | HTML5, CSS3, Vanilla JavaScript    | User interface and interactions  |
| **Backend**     | Django 4.x, Django REST Framework  | API development, business logic  |
| **Database**    | SQLite (Dev), PostgreSQL (Prod)   | Data persistence and storage     |
| **Authentication** | JWT (DRF Simple JWT)            | Secure user authentication       |
| **Styling**     | Custom CSS, Font Awesome Icons     | Modern UI components             |
| **Deployment**  | Render/Railway, Gunicorn, Nginx   | Production hosting               |

---

## 📁 Project Structure

```
DoctorAppointment/
├── medicare_backend/         # Django backend application
│   ├── accounts/             # User authentication app
│   ├── api/                  # REST API endpoints
│   ├── config/               # Django settings
│   ├── manage.py             # Django CLI
│   └── requirements.txt      # Python dependencies
│
├── templates/                # HTML templates
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── doctors.html          # Doctor listings
│   ├── doctor-dashboard.html # Doctor portal
│   ├── admin-dashboard.html  # Admin portal
│   └── patient-appointments.html # Patient appointments
│
├── static/                   # Static assets
│   ├── css/                  # Stylesheets
│   │   ├── index.css
│   │   ├── login.css
│   │   └── register.css
│   └── js/                   # JavaScript files
│       ├── app.js            # Core application logic
│       └── config.js         # API configuration
│
├── .gitignore                # Git exclusion rules
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/FlamingSlayer/DoctorAppointment.git
cd DoctorAppointment
```

### 2️⃣ Set Up Backend Environment
```bash
cd medicare_backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3️⃣ Configure Environment
```bash
cp .env.example .env
# Edit .env file: Set SECRET_KEY, DEBUG, DATABASE_URL
```

### 4️⃣ Initialize Database
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5️⃣ Run Development Server
```bash
python manage.py runserver
```
- Access: [http://localhost:8000](http://localhost:8000)  
- Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint               | Description                  |
|--------|-----------------------|------------------------------|
| POST   | /api/auth/login/       | User login, returns JWT tokens |
| POST   | /api/auth/refresh/     | Refresh access token         |
| POST   | /api/users/            | Register new user            |

### Appointment Endpoints
| Method | Endpoint                     | Description        | Access        |
|--------|------------------------------|------------------|---------------|
| GET    | /api/appointments/           | List appointments | All users     |
| POST   | /api/appointments/           | Create appointment| Patients      |
| PATCH  | /api/appointments/{id}/      | Update status     | Doctors       |
| DELETE | /api/appointments/{id}/      | Cancel appointment| Patient/Doctor|

### User Management
| Method | Endpoint                 | Description            | Access         |
|--------|--------------------------|------------------------|----------------|
| GET    | /api/users/doctors/      | List all doctors       | Patients       |
| GET    | /api/users/profile/      | Get user profile       | Authenticated  |
| PATCH  | /api/users/{id}/         | Update user            | Admin/Owner    |

---

## 🧪 Testing
```bash
python manage.py test
python manage.py test accounts
python manage.py test api
```

---

## 🚢 Deployment

### Deploy to Render
1. Push code to GitHub
2. Create Web Service on Render
3. Connect GitHub repository
4. Build Command:  
```bash
cd medicare_backend && pip install -r requirements.txt
```
5. Start Command:  
```bash
cd medicare_backend && gunicorn config.wsgi:application
```

### Deploy to Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## 👥 Default Users for Testing
| Role    | Email                  | Password      | Access Level          |
|---------|-----------------------|---------------|---------------------|
| Admin   | admin@medicare.com    | Admin@123     | Full system access   |
| Doctor  | doctor@medicare.com   | Doctor@123    | Doctor dashboard     |
| Patient | patient@medicare.com  | Patient@123   | Patient features     |

---

## 🐛 Troubleshooting
| Issue                     | Solution                                  |
|----------------------------|-------------------------------------------|
| ModuleNotFoundError        | Activate virtual environment             |
| Database errors            | Run `python manage.py migrate`           |
| Port 8000 in use           | Use `python manage.py runserver 8001`    |
| Static files not loading   | Run `python manage.py collectstatic`     |
| CORS errors                | Check `CORS_ALLOWED_ORIGINS` in settings|

---

## 🤝 Contributing
1. Fork the repository
2. Create feature branch:  
```bash
git checkout -b feature/AmazingFeature
```
3. Commit changes:  
```bash
git commit -m 'Add AmazingFeature'
```
4. Push branch:  
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

**Development Guidelines**
- Follow PEP 8 for Python code
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments
- Django team for the excellent framework
- Contributors and beta testers
- Open source community for invaluable tools

---

## 📞 Support
- Report Issues: [GitHub Issues](https://github.com/FlamingSlayer/DoctorAppointment/issues)  
- Discussion: [GitHub Discussions](https://github.com/FlamingSlayer/DoctorAppointment/discussions)  
- Contact: Open an issue for direct contact

---

Built with ❤️ by **FlamingSlayer**  
If you find this project helpful, please give it a ⭐ on GitHub!
