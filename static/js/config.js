/**
 * MediCare - Doctor Appointment System
 * Main JavaScript Application - CONNECTED TO DJANGO
 * UPDATED to use config.js
 */

// ==========================================
// Configuration (Now from config.js)
// ==========================================
// Assume config.js is loaded before app.js
// If not, define fallback
const API_BASE_URL = API_CONFIG?.BASE_URL || 'http://localhost:8000/api';
const API_ENDPOINTS = API_CONFIG?.ENDPOINTS || {
    LOGIN: '/auth/login/',
    REGISTER: '/users/',
    DOCTORS: '/users/doctors/',
    PROFILE: '/users/profile/',
    APPOINTMENTS: '/appointments/'
};
const TOKEN_KEY = API_CONFIG?.TOKEN_KEY || 'access_token';

// ==========================================
// State Management
// ==========================================
let currentUser = null;
let blockedUsers = new Set();

// ==========================================
// Utility Functions
// ==========================================
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  // Convert 24h to 12h format if needed
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return timeStr;
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ==========================================
// API Helper Functions (Using config.js)
// ==========================================
const API = {
  getHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // GET /api/users/doctors/
  getDoctors: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOCTORS}`, {
        headers: API.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch doctors');
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showToast('Error', 'Could not load doctors. Please try again.', 'error');
      return [];
    }
  },
  
  // GET /api/users/{id}/
  getDoctor: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
        headers: API.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch doctor');
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctor:', error);
      showToast('Error', 'Could not load doctor details.', 'error');
      return null;
    }
  },
  
  // POST /api/auth/login/
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          password: password 
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store tokens
      localStorage.setItem(TOKEN_KEY, data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // POST /api/users/ (Register)
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // GET /api/users/profile/
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
        headers: API.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // GET /api/appointments/
  getAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}`, {
        headers: API.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
  
  // GET /api/appointments/my-appointments/ (for patients)
  getPatientAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/my-appointments/`, {
        headers: API.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },
  
  // POST /api/appointments/
  createAppointment: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}`, {
        method: 'POST',
        headers: API.getHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Failed to create appointment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },
  
  // PATCH /api/appointments/{id}/
  updateAppointment: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/`, {
        method: 'PATCH',
        headers: API.getHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to update appointment');
      return await response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },
  
  // DELETE /api/appointments/{id}/
  deleteAppointment: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/`, {
        method: 'DELETE',
        headers: API.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete appointment');
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // GET /api/users/ (for admin)
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
        headers: API.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // PATCH /api/users/{id}/
  updateUser: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
        method: 'PATCH',
        headers: API.getHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // DELETE /api/users/{id}/
  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
        method: 'DELETE',
        headers: API.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// ==========================================
// Authentication Functions
// ==========================================
async function login(email, password) {
  try {
    // Use Django login API
    const loginData = await API.login(email, password);
    
    // Get user profile
    const user = await API.getProfile();
    
    // Store user info
    currentUser = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      name: user.first_name + ' ' + user.last_name,
      email: user.email,
      role: user.role,
      specialization: user.specialization || '',
      consultation_fee: user.consultation_fee || 0,
      rating: user.rating || 0,
      profile: user.profile || {}
    };
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    showToast('Success', 'Login successful!', 'success');
    
    // Redirect based on role
    setTimeout(() => {
      if (user.role === 'patient') {
        window.location.href = 'find-doctors.html';
      } else if (user.role === 'doctor') {
        window.location.href = 'doctor-dashboard.html';
      } else if (user.role === 'admin') {
        window.location.href = 'admin-portal.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login Failed', error.message || 'Invalid email or password', 'error');
    return false;
  }
}

// Registration function
async function register(userData) {
  try {
    // Default role is patient
    const data = {
      ...userData,
      role: 'patient'
    };
    
    const result = await API.register(data);
    showToast('Success', 'Registration successful! Please login.', 'success');
    
    // Auto-login after registration
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Registration Failed', error.message || 'Could not create account', 'error');
    throw error;
  }
}

function logout() {
  // Clear all stored data
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  currentUser = null;
  
  // Redirect to home
  window.location.href = 'index.html';
}

function checkAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem('user');
  
  if (token && storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return true;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return false;
    }
  }
  
  return false;
}

function requireAuth(allowedRoles = []) {
  if (!checkAuth()) {
    window.location.href = 'login.html';
    return false;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    showToast('Access Denied', 'You do not have permission to access this page.', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return false;
  }
  
  return true;
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(title, message, type = 'success') {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  // Get icon based on type
  let icon = 'fas fa-check-circle';
  let bgColor = 'var(--success-light)';
  let textColor = 'var(--success)';
  let borderColor = 'rgba(16, 185, 129, 0.3)';
  
  if (type === 'error') {
    icon = 'fas fa-exclamation-circle';
    bgColor = 'var(--danger-light)';
    textColor = 'var(--danger)';
    borderColor = 'rgba(239, 68, 68, 0.3)';
  } else if (type === 'warning') {
    icon = 'fas fa-exclamation-triangle';
    bgColor = 'var(--warning-light)';
    textColor = 'var(--warning)';
    borderColor = 'rgba(245, 158, 11, 0.3)';
  } else if (type === 'info') {
    icon = 'fas fa-info-circle';
    bgColor = 'var(--info-light)';
    textColor = 'var(--info)';
    borderColor = 'rgba(59, 130, 246, 0.3)';
  }
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background: ${bgColor};
    color: ${textColor};
    border: 1px solid ${borderColor};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 3000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: toastSlideIn 0.3s ease;
    max-width: 400px;
  `;
  
  toast.innerHTML = `
    <i class="${icon}"></i>
    <div>
      <div style="font-weight: 600; font-size: 0.9rem;">${title}</div>
      <div style="font-size: 0.85rem; opacity: 0.9;">${message}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Add CSS for animation if not exists
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// UI Component Renderers
// ==========================================
function renderHeader() {
  const header = $('header.header');
  if (!header) return;
  
  const isLoggedIn = checkAuth();
  
  // Get user name for display
  let userName = 'Guest';
  let userRole = '';
  let userInitials = 'G';
  
  if (isLoggedIn && currentUser) {
    userName = currentUser.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : currentUser.email;
    userRole = currentUser.role;
    userInitials = getInitials(userName);
  }
  
  // Check if we're in admin portal or doctor dashboard (different header structure)
  const isAdminPortal = window.location.pathname.includes('admin-portal.html');
  const isDoctorDashboard = window.location.pathname.includes('doctor-dashboard.html');
  
  if (isAdminPortal || isDoctorDashboard) {
    // These pages have their own header structure, don't override
    return;
  }
  
  // Standard header for other pages
  const headerInner = $('.header-inner');
  if (!headerInner) return;
  
  let userSection = '';
  
  if (isLoggedIn && currentUser) {
    userSection = `
      <div class="header-controls">
        <button class="theme-toggle" id="themeToggle" title="Toggle theme">
          <i class="fas fa-moon"></i>
        </button>
        <button onclick="logout()" class="btn btn-danger">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    `;
  } else {
    userSection = `
      <div class="header-controls">
        <a href="login.html" class="btn btn-outline">Login</a>
        <a href="register.html" class="btn btn-primary">Get Started</a>
      </div>
    `;
  }
  
  // Only update if structure is different
  if (!headerInner.querySelector('.header-controls')) {
    headerInner.innerHTML += userSection;
  }
}

// Initialize theme toggle
function initThemeToggle() {
  const themeToggle = $('#themeToggle');
  if (!themeToggle) return;
  
  const themeIcon = themeToggle.querySelector('i');
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// Render doctor card for find-doctors.html
async function renderDoctorCard(doctor) {
  const initials = getInitials(`${doctor.first_name} ${doctor.last_name}`);
  const name = `${doctor.first_name} ${doctor.last_name}`;
  const specialization = doctor.specialization || 'General Physician';
  const experience = doctor.experience || 5;
  const rating = doctor.rating || 4.5;
  const consultationFee = doctor.consultation_fee || 100;
  const bio = doctor.bio || 'Experienced medical professional dedicated to providing quality care.';
  const isVerified = doctor.is_verified || false;
  
  return `
    <div class="doctor-card" data-doctor-id="${doctor.id}">
      <div class="doctor-header">
        <div class="doctor-avatar">${initials}</div>
        <div class="doctor-info">
          <h3>${name} ${isVerified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>' : ''}</h3>
          <p class="specialization">${specialization}</p>
          <div class="doctor-meta">
            <span class="rating">
              <i class="fas fa-star"></i> ${rating}
            </span>
            <span class="experience">
              <i class="fas fa-briefcase"></i> ${experience} yrs
            </span>
            <span class="fee">
              <i class="fas fa-dollar-sign"></i> $${consultationFee}
            </span>
          </div>
        </div>
      </div>
      <div class="doctor-body">
        <p>${bio}</p>
        <div class="doctor-actions">
          <button class="btn btn-primary" onclick="viewDoctorProfile(${doctor.id})">
            <i class="fas fa-calendar-check"></i> Book Appointment
          </button>
          <button class="btn btn-outline" onclick="viewDoctorDetails(${doctor.id})">
            <i class="fas fa-user-md"></i> View Profile
          </button>
        </div>
      </div>
    </div>
  `;
}

// Load doctors for find-doctors.html
async function loadDoctors() {
  const doctorsContainer = $('#doctors-container');
  if (!doctorsContainer) return;
  
  try {
    showToast('Loading', 'Fetching doctors...', 'info');
    const doctors = await API.getDoctors();
    
    if (doctors.length === 0) {
      doctorsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-md"></i>
          <h3>No Doctors Available</h3>
          <p>There are currently no doctors registered in the system.</p>
        </div>
      `;
      return;
    }
    
    doctorsContainer.innerHTML = '';
    
    for (const doctor of doctors) {
      const cardHtml = await renderDoctorCard(doctor);
      doctorsContainer.innerHTML += cardHtml;
    }
    
    showToast('Success', `Loaded ${doctors.length} doctors`, 'success');
  } catch (error) {
    console.error('Error loading doctors:', error);
    doctorsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to Load Doctors</h3>
        <p>Please check your internet connection and try again.</p>
        <button class="btn btn-primary" onclick="loadDoctors()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// View doctor profile (opens booking modal)
async function viewDoctorProfile(doctorId) {
  try {
    const doctor = await API.getDoctor(doctorId);
    if (!doctor) {
      showToast('Error', 'Doctor not found', 'error');
      return;
    }
    
    // Open booking modal
    openBookingModal(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    showToast('Error', 'Could not load doctor details', 'error');
  }
}

// View doctor details (opens details modal)
async function viewDoctorDetails(doctorId) {
  try {
    const doctor = await API.getDoctor(doctorId);
    if (!doctor) {
      showToast('Error', 'Doctor not found', 'error');
      return;
    }
    
    // Open details modal
    openDoctorDetailsModal(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    showToast('Error', 'Could not load doctor details', 'error');
  }
}

// Open booking modal
function openBookingModal(doctor) {
  // Create modal HTML
  const modalHTML = `
    <div class="modal-overlay" id="booking-modal">
      <div class="modal-content">
        <button class="close-btn" onclick="closeModal('booking-modal')">&times;</button>
        
        <h2>Book Appointment with Dr. ${doctor.last_name}</h2>
        
        <form id="booking-form" class="form-grid">
          <input type="hidden" id="doctor-id" value="${doctor.id}">
          
          <div class="form-group">
            <label><i class="fas fa-calendar"></i> Date</label>
            <input type="date" id="appointment-date" class="form-input" required min="${new Date().toISOString().split('T')[0]}">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-clock"></i> Time</label>
            <select id="appointment-time" class="form-input" required>
              <option value="">Select Time</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
            </select>
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-stethoscope"></i> Reason for Visit</label>
            <input type="text" id="appointment-reason" class="form-input" placeholder="e.g., Routine checkup" required>
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-file-medical"></i> Notes (Optional)</label>
            <textarea id="appointment-notes" class="form-input" rows="3" placeholder="Any additional information..."></textarea>
          </div>
          
          <div class="form-group">
            <div class="alert-box alert-info">
              <i class="fas fa-info-circle"></i> Consultation Fee: $${doctor.consultation_fee || 100}
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="button" onclick="closeModal('booking-modal')" class="btn btn-outline" style="flex: 1;">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              <i class="fas fa-calendar-check"></i> Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add to body and show
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('booking-modal').style.display = 'flex';
  
  // Handle form submission
  document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkAuth()) {
      showToast('Authentication Required', 'Please login to book an appointment', 'error');
      closeModal('booking-modal');
      window.location.href = 'login.html';
      return;
    }
    
    const formData = {
      doctor: parseInt(document.getElementById('doctor-id').value),
      date: document.getElementById('appointment-date').value,
      time: document.getElementById('appointment-time').value,
      notes: document.getElementById('appointment-notes').value || '',
      status: 'pending'
    };
    
    const reason = document.getElementById('appointment-reason').value;
    if (reason) {
      formData.notes = reason + (formData.notes ? '\n\n' + formData.notes : '');
    }
    
    try {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
      submitBtn.disabled = true;
      
      const appointment = await API.createAppointment(formData);
      
      showToast('Success', 'Appointment booked successfully!', 'success');
      closeModal('booking-modal');
      
      // Redirect to appointments page if patient
      if (currentUser.role === 'patient') {
        setTimeout(() => {
          window.location.href = 'patient-appointments.html';
        }, 1500);
      }
    } catch (error) {
      showToast('Booking Failed', error.message || 'Could not book appointment', 'error');
    }
  });
}

// Open doctor details modal
function openDoctorDetailsModal(doctor) {
  const modalHTML = `
    <div class="modal-overlay" id="doctor-details-modal">
      <div class="modal-content">
        <button class="close-btn" onclick="closeModal('doctor-details-modal')">&times;</button>
        
        <div class="profile-hero">
          <div class="avatar-large">${getInitials(`${doctor.first_name} ${doctor.last_name}`)}</div>
          <div>
            <h2>Dr. ${doctor.first_name} ${doctor.last_name}</h2>
            <span class="text-secondary">${doctor.specialization || 'General Physician'}</span>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <label><i class="fas fa-envelope"></i> Email</label>
            <div>${doctor.email}</div>
          </div>
          <div class="info-item">
            <label><i class="fas fa-briefcase"></i> Experience</label>
            <div>${doctor.experience || 5} years</div>
          </div>
          <div class="info-item">
            <label><i class="fas fa-star"></i> Rating</label>
            <div>${doctor.rating || 4.5}/5.0</div>
          </div>
          <div class="info-item">
            <label><i class="fas fa-dollar-sign"></i> Consultation Fee</label>
            <div>$${doctor.consultation_fee || 100}</div>
          </div>
        </div>
        
        <div class="info-item" style="margin-top: 20px;">
          <label><i class="fas fa-user-md"></i> About</label>
          <div class="medical-notes">
            ${doctor.bio || 'No bio available.'}
          </div>
        </div>
        
        <div style="margin-top:25px; text-align:right;">
          <button onclick="closeModal('doctor-details-modal')" class="btn btn-outline">
            <i class="fas fa-times"></i> Close
          </button>
          <button onclick="viewDoctorProfile(${doctor.id})" class="btn btn-primary">
            <i class="fas fa-calendar-check"></i> Book Appointment
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('doctor-details-modal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    setTimeout(() => modal.remove(), 300);
  }
}

// Initialize tabs
function initTabs() {
  const tabBtns = $$('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      if (!tabId) return;
      
      // Remove active class from all tabs
      tabBtns.forEach(b => b.classList.remove('active'));
      $$('.tab-content').forEach(content => content.style.display = 'none');
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show corresponding content
      const tabContent = $(`#${tabId}`);
      if (tabContent) {
        tabContent.style.display = 'block';
      }
    });
  });
}

// ==========================================
// Page Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme toggle
  initThemeToggle();
  
  // Render header (for non-dashboard pages)
  if (!window.location.pathname.includes('dashboard') && 
      !window.location.pathname.includes('admin-portal')) {
    renderHeader();
  }
  
  // Initialize tabs
  initTabs();
  
  // Load doctors on find-doctors.html page
  if (window.location.pathname.includes('find-doctors.html')) {
    if (requireAuth(['patient'])) {
      loadDoctors();
    }
  }
  
  // Set current user name in profile cards
  const docNameElement = $('#doc-name');
  const adminNameElement = $('#admin-name');
  
  if (checkAuth() && currentUser) {
    if (docNameElement) {
      docNameElement.textContent = `Dr. ${currentUser.first_name} ${currentUser.last_name}`;
    }
    if (adminNameElement) {
      adminNameElement.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    }
  }
  
  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = $$('.modal-overlay');
      modals.forEach(modal => {
        if (modal.style.display === 'flex') {
          closeModal(modal.id);
        }
      });
    }
  });
  
  // Close modals when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target.id);
    }
  });
});

// ==========================================
// Global Functions (for HTML onclick)
// ==========================================
window.login = login;
window.register = register;
window.logout = logout;
window.loadDoctors = loadDoctors;
window.viewDoctorProfile = viewDoctorProfile;
window.viewDoctorDetails = viewDoctorDetails;
window.openBookingModal = openBookingModal;
window.openDoctorDetailsModal = openDoctorDetailsModal;
window.closeModal = closeModal;
window.refreshData = function() {
  // This will be overridden by specific page functions
  location.reload();
};

// Toggle slots function (for old doctor card design)
window.toggleSlots = function(doctorId) {
  const slots = document.getElementById(`slots-${doctorId}`);
  if (slots) {
    slots.classList.toggle('hidden');
  }
};

// Select date function (for old doctor card design)
window.selectDate = function(doctorId, date) {
  // Remove active class from all date pills
  const datePills = document.querySelectorAll(`#slots-${doctorId} .date-pill`);
  datePills.forEach(pill => pill.classList.remove('active'));
  
  // Add active class to clicked pill
  event.target.classList.add('active');
  
  // Update time slots (this is a placeholder - implement real logic)
  const timeSlots = document.getElementById(`time-slots-${doctorId}`);
  if (timeSlots) {
    timeSlots.innerHTML = '<p class="text-center text-muted">Loading slots...</p>';
    // In real implementation, fetch slots for this date
  }
};