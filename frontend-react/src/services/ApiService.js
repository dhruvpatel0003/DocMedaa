// API Service for handling all backend communications
import { AppConstants } from '../constants/AppConstants';

const API_BASE_URL = AppConstants.apiBaseUrl;

class ApiService {  
  // Generic fetch method
  static async request(endpoint, method = 'GET', data = null, token = null) {
    console.log('inside the requesttttttttttttt :::::::::::::: ',data, endpoint);
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      timeout: AppConstants.apiTimeout,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      console.log("before fetching the app",API_BASE_URL,endpoint,config);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const responseData = await response.json();

      return {
        statusCode: response.status,
        success: response.ok,
        data: responseData,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        statusCode: 500,
        success: false,
        data: { message: 'Network error. Please try again.' },
        error: error.message,
      };
    }
  }

  // Auth endpoints
  static async signup(userData) {
    return this.request('/auth/signup', 'POST', userData);
  }

  static async login(credentials) {
    console.log("ApiService login called with:", credentials);
    return this.request('/auth/login', 'POST', credentials);
  }

  static async forgotPassword(email) {
    return this.request('/auth/forgot-password', 'POST', { email });
  }

  static async verifyResetToken(token) {
    return this.request(`/auth/reset-password-verify/${token}`, 'GET');
  }

  static async resetPasswordWithToken(token, newPassword) {
    return this.request(`/auth/reset-password/${token}`, 'POST', { newPassword });
  }

  static async completeProfile(userId, role, profileData, token) {
    console.log('complete profile',profileData);
    return this.request(
      `/auth/complete-profile/${role}/${userId}`,
      'PUT',
      profileData,
      token
    );
  }

  // User endpoints
  static async getUser(userId, token) {
    return this.request(`/users/${userId}`, 'GET', null, token);
  }

  static async updateProfile(userId, userData, token) {
    return this.request(`/users/${userId}`, 'PUT', userData, token);
  }

  // Appointment endpoints
  static async bookAppointment(appointmentData, token) {
    return this.request('/appointments/book', 'POST', appointmentData, token);
  }

  static async getAppointments(token) {
    return this.request('/appointments', 'GET', null, token);
  }

  static async getAppointmentById(appointmentId, token) {
    return this.request(`/appointments/${appointmentId}`, 'GET', null, token);
  }

  static async updateAppointmentStatus(appointmentId, status, token) {
    return this.request(
      `/appointments/status/${appointmentId}`,
      'PUT',
      { status },
      token
    );
  }

  static async cancelAppointment(appointmentId, token) {
    return this.request(
      `/appointments/cancel/${appointmentId}`,
      'PUT',
      {},
      token
    );
  }

  // Doctor endpoints
  static async getDoctors(token) {
    return this.request('/doctors', 'GET', null, token);
  }

  static async getDoctorById(doctorId, token) {
    return this.request(`/doctors/${doctorId}`, 'GET', null, token);
  }

  // Chat endpoints (if applicable)
  static async sendMessage(messageData, token) {
    return this.request('/chat/messages', 'POST', messageData, token);
  }

  static async getMessages(conversationId, token) {
    return this.request(`/chat/messages/${conversationId}`, 'GET', null, token);
  }
}

export default ApiService;