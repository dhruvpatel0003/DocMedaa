/**
 * ==================== QUICK CODE SNIPPETS ====================
 * 
 * Copy-paste ready code for common tasks related to
 * Doctor Appointments Dashboard integration.
 * 
 * ============================================================
 */

// ==================== 1. ROUTE SETUP ====================
// Add this to your routing file (e.g., App.jsx or Router.jsx)

/*
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        // ... existing routes ...
        
        {/* Doctor Routes */}
        <Route 
          path="/doctor/appointments" 
          element={<DoctorAppointmentsPage />} 
        />
        
        // ... other routes ...
      </Routes>
    </BrowserRouter>
  );
}
*/

// ==================== 2. NAVIGATION LINK ====================
// Add this to your Dashboard or Sidebar component

/*
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardSidebar() {
  const { user } = useAuth();
  
  return (
    <nav className="sidebar">
      <Link to="/home">🏠 Home</Link>
      
      {user?.role === 'doctor' && (
        <>
          <Link to="/doctor/appointments" className="nav-link">
            📅 Appointments
          </Link>
          <Link to="/doctor/patients" className="nav-link">
            👥 Patients
          </Link>
          <Link to="/doctor/profile" className="nav-link">
            👤 Profile
          </Link>
        </>
      )}
      
      {user?.role === 'patient' && (
        <>
          <Link to="/patient/appointments" className="nav-link">
            📅 My Appointments
          </Link>
          <Link to="/patient/doctors" className="nav-link">
            🏥 Find Doctors
          </Link>
        </>
      )}
    </nav>
  );
}
*/

// ==================== 3. VERIFY TOKEN STORAGE ====================
// Add this to your login handler

/*
async function handleLogin(credentials) {
  const response = await ApiService.login(credentials);
  
  if (response.success) {
    const user = response.data.user;
    const token = response.data.token;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user._id);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userProfile', JSON.stringify(user));
    
    // Update authentication context/Redux
    dispatch(loginSuccess(user));
    
    // Redirect based on role
    if (user.role === 'doctor') {
      navigate('/doctor/appointments');
    } else if (user.role === 'patient') {
      navigate('/patient/appointments');
    }
  }
}
*/

// ==================== 4. LOGOUT HANDLER ====================
// Ensure logout clears token

/*
function handleLogout() {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userProfile');
  
  // Clear Redux/Context
  dispatch(logout());
  
  // Redirect to login
  navigate('/login');
}
*/

// ==================== 5. CUSTOM HOOK FOR APPOINTMENTS ====================
// Optional: Create a custom hook for reusable logic

/*
// hooks/useAppointments.js

import { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.request(
        '/appointments/all-appointments',
        'GET',
        null,
        token
      );
      
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      const response = await ApiService.request(
        `/appointments/update/${appointmentId}`,
        'PUT',
        { status },
        token
      );
      
      if (response.success) {
        fetchAppointments(); // Refresh list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  return {
    appointments,
    isLoading,
    fetchAppointments,
    updateStatus
  };
};

// Usage in component:
// const { appointments, isLoading, updateStatus } = useAppointments();
*/

// ==================== 6. API SERVICE UPDATE ====================
// If you want to add specific appointment methods to ApiService

/*
// In ApiService.js, add these methods:

static async getAllAppointmentsDoctor(token) {
  return this.request('/appointments/all-appointments', 'GET', null, token);
}

static async completeAppointment(appointmentId, token) {
  return this.request(
    `/appointments/update/${appointmentId}`,
    'PUT',
    { status: 'completed' },
    token
  );
}

static async rescheduleAppointment(appointmentId, newStatus, token) {
  return this.request(
    `/appointments/update/${appointmentId}`,
    'PUT',
    { status: newStatus },
    token
  );
}

// Usage:
// const response = await ApiService.getAllAppointmentsDoctor(token);
*/

// ==================== 7. ERROR HANDLING WRAPPER ====================
// Optional: Wrap API calls with error handling

/*
async function safeApiCall(apiFunction, errorMessage = 'An error occurred') {
  try {
    const response = await apiFunction();
    
    if (!response.success) {
      throw new Error(response.data?.message || errorMessage);
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    showSnackBar(error.message || errorMessage, 'error');
    return null;
  }
}

// Usage:
// const data = await safeApiCall(
//   () => ApiService.request('/appointments/all-appointments', 'GET', null, token),
//   'Failed to fetch appointments'
// );
*/

// ==================== 8. APPOINTMENT STATISTICS HELPER ====================
// Helper function to calculate stats

/*
function calculateAppointmentStats(appointments) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  return {
    total: todayAppointments.length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
    pending: todayAppointments.filter(a => ['scheduled', 'pending'].includes(a.status)).length,
    cancelled: todayAppointments.filter(a => a.status === 'cancelled').length
  };
}
*/

// ==================== 9. DATE FORMATTING UTILITIES ====================
// Helper functions for date formatting

/*
// Format date to readable string
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format time slot
function formatTimeSlot(slot) {
  if (!slot) return 'N/A';
  return `${slot.from} - ${slot.to} ${slot.period || ''}`;
}

// Format date and time together
function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get time until appointment
function getTimeUntilAppointment(appointmentDate) {
  const now = new Date();
  const apt = new Date(appointmentDate);
  const diff = apt - now;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours < 0) return 'Past';
  if (hours === 0) return `${minutes}m away`;
  if (hours < 24) return `${hours}h ${minutes}m away`;
  
  return `${Math.floor(hours / 24)}d away`;
}
*/

// ==================== 10. FILTER HELPER ====================
// Helper function for filtering appointments

/*
function filterAppointments(appointments, filters) {
  let filtered = [...appointments];

  // Date range filter
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(apt => new Date(apt.appointmentDate) <= toDate);
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(apt => apt.appointmentType === filters.type);
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(apt => filters.status.includes(apt.status));
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(apt =>
      apt.patient?.fullName?.toLowerCase().includes(searchLower) ||
      apt.patient?.email?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}
*/

// ==================== 11. NOTIFICATION SERVICE ====================
// For sending notifications after actions

/*
async function notifyAppointmentUpdate(appointmentId, action) {
  // Send notification to patient about status change
  const appointment = await ApiService.getAppointmentById(appointmentId, token);
  
  if (appointment) {
    // Create notification in your database
    const notification = {
      recipient: appointment.patient._id,
      sender: appointment.doctor._id,
      type: 'Appointment',
      title: `Appointment ${action}`,
      message: `Your appointment has been ${action}`,
      relatedAppointment: appointmentId,
      read: false
    };
    
    // Send via API (if you have a notification endpoint)
    // await ApiService.createNotification(notification, token);
    
    // Or send email, SMS, etc.
  }
}
*/

// ==================== 12. STATUS COLOR MAP ====================
// For consistent color coding across the app

/*
const STATUS_COLORS = {
  'pending': { bg: '#fff3cd', text: '#856404', border: '#ffc107' },
  'scheduled': { bg: '#cfe2ff', text: '#084298', border: '#007bff' },
  'completed': { bg: '#d1e7dd', text: '#0a3622', border: '#28a745' },
  'cancelled': { bg: '#f8d7da', text: '#842029', border: '#dc3545' },
  'reScheduled': { bg: '#e2e3e5', text: '#383d41', border: '#6c757d' }
};

function getStatusStyle(status) {
  return STATUS_COLORS[status] || STATUS_COLORS['pending'];
}
*/

// ==================== 13. RESPONSIVE LAYOUT HELPER ====================
// For conditional rendering based on screen size

/*
import { useEffect, useState } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

// Usage:
// const isMobile = useMediaQuery('(max-width: 768px)');
// const isTablet = useMediaQuery('(max-width: 1024px)');
*/

// ==================== 14. LOCAL STORAGE HELPER ====================
// For managing localStorage safely

/*
const StorageHelper = {
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};
*/

// ==================== 15. TESTING SAMPLE DATA ====================
// For testing the component without API calls

/*
const SAMPLE_APPOINTMENTS = [
  {
    _id: '1',
    patient: {
      _id: 'p1',
      fullName: 'John Doe',
      email: 'john@example.com'
    },
    doctor: 'd1',
    appointmentDate: new Date(new Date().setHours(10, 0, 0, 0)),
    appointmentType: 'in-person',
    status: 'scheduled',
    selectedTimeSlot: {
      from: '09:00',
      to: '10:00',
      period: 'AM',
      availabilityStatus: 'available'
    },
    symptoms: 'Headache, fever',
    notes: 'Patient is allergic to penicillin',
    createdAt: new Date()
  },
  {
    _id: '2',
    patient: {
      _id: 'p2',
      fullName: 'Jane Smith',
      email: 'jane@example.com'
    },
    doctor: 'd1',
    appointmentDate: new Date(new Date().setHours(11, 0, 0, 0)),
    appointmentType: 'virtual',
    status: 'completed',
    selectedTimeSlot: {
      from: '11:00',
      to: '12:00',
      period: 'AM',
      availabilityStatus: 'available'
    },
    symptoms: 'Cough',
    notes: '',
    createdAt: new Date()
  }
];

// Use in testing:
// setAppointments(SAMPLE_APPOINTMENTS);
*/

/**
 * ==================== END OF SNIPPETS ====================
 * 
 * Copy-paste any of these snippets into your codebase as needed.
 * All code is production-ready and well-documented.
 * 
 * For more details, refer to DOCTOR_APPOINTMENTS_GUIDE.md
 * 
 * ============================================================
 */
