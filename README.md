# MediCare – Doctor Appointment Booking System

MediCare is a web-based Doctor Appointment Booking System designed to simplify and digitalize the process of scheduling medical appointments. The platform allows patients to search for doctors, view real-time availability, and book appointments online, while doctors can efficiently manage their schedules. It reduces manual work, waiting time, and booking errors, providing a smooth and user-friendly healthcare appointment management solution.

---

## Features
- User authentication and role-based access for Patients, Doctors, and Admin
- Browse and search doctors by specialization and availability
- Real-time appointment booking with double-booking prevention
- Doctor dashboard to manage availability and view appointments
- Admin panel to manage doctors, patients, and appointments
- Secure storage of patient and appointment data

---

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Bootstrap/Tailwind CSS
- **Backend:** Django, Django REST Framework
- **Database:** SQLite (Development) / PostgreSQL or MySQL (Production)

---

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/FlamingSlayer/docapp-medicare.git
   ```

2. Navigate to the project directory:
   ```bash
   cd docapp-medicare
   ```

3. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate   # On Windows: env\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

7. Open your browser and visit:
   ```
   http://127.0.0.1:8000/
   ```

---

## Project Structure
```
docapp-medicare/
├── index.html
├── login.html
├── find-doctors.html
├── doctor-dashboard.html
├── admin-portal.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── config.js
├── backend/
│   ├── manage.py
│   ├── docapp/
│   └── appointments/
└── README.md
```

---

## License
This project is licensed under the **MIT License**.

---

## Author
GitHub: https://github.com/FlamingSlayer
