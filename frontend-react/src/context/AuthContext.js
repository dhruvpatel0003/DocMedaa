import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout as reduxLogout, setLoading, setError } from '../redux/userSlice';
import ApiService from '../services/ApiService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userProfile = localStorage.getItem('userProfile');

      if (token && userProfile) {
        try {
          dispatch(setLoading(true));
          
          // Restore user data from localStorage
          const profile = JSON.parse(userProfile);
          
          dispatch(loginSuccess({
            id: profile.id,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone || '',
            age: profile.age || '',
            gender: profile.gender || 'Male',
            address: profile.address || '',
            role: profile.role,
            token: token,
            // Patient fields
            healthConditions: profile.healthConditions || [],
            treatments: profile.treatments || [],
            wearableLinkedDevices: profile.wearableLinkedDevices || [],
            // Doctor fields
            hospitalName: profile.hospitalName || '',
            hospitalPhone: profile.hospitalPhone || '',
            hospitalEmail: profile.hospitalEmail || '',
            yearsOfExperience: profile.yearsOfExperience || '',
            highestEducation: profile.educationLevel || profile.highestEducation || '',
            specialty: profile.specialty || '',
            availableTreatments: profile.availableTreatments || [],
            clinicTimings: profile.clinicTimings || {},
            licenseNumber: profile.licenseNumber || '',
          }));
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userProfile');
          dispatch(reduxLogout());
        } finally {
          dispatch(setLoading(false));
        }
      }

      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  // Login function
  const login = async (username, password) => {
    dispatch(setLoading(true));
    try {
        console.log("Attempting login for:", username,password);
      const response = await ApiService.login({ username, password });

      if (response.success) {
        const { profile, token } = response.data;

        // Store token and complete profile in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userProfile', JSON.stringify(profile));

        // Update Redux state with full user data from login response
        dispatch(loginSuccess({
          id: profile.id,
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          age: profile.age || '',
          gender: profile.gender || 'Male',
          address: profile.address || '',
          role: profile.role,
          token: token,
          // Patient fields
          healthConditions: profile.healthConditions || [],
          treatments: profile.treatments || [],
          wearableLinkedDevices: profile.wearableLinkedDevices || [],
          // Doctor fields
          hospitalName: profile.hospitalName || '',
          hospitalPhone: profile.hospitalPhone || '',
          hospitalEmail: profile.hospitalEmail || '',
          yearsOfExperience: profile.yearsOfExperience || '',
          highestEducation: profile.educationLevel || '',
          specialty: profile.specialty || '',
          availableTreatments: profile.availableTreatments || [],
          clinicTimings: profile.clinicTimings || {},
          licenseNumber: profile.licenseNumber || '',
        }));

        return { success: true, data: response.data };
      } else {
        const error = response.data?.message || 'Login failed';
        dispatch(setError(error));
        return { success: false, error };
      }
    } catch (error) {
      dispatch(setError(error.message));
      return { success: false, error: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Signup function
  const signup = async (userData) => {
    dispatch(setLoading(true));
    try {
      const response = await ApiService.signup(userData);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const error = response.data?.message || 'Signup failed';
        dispatch(setError(error));
        return { success: false, error };
      }
    } catch (error) {
      dispatch(setError(error.message));
      return { success: false, error: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    dispatch(reduxLogout());
  };

  // Check if user is authenticated
  const isAuthenticated = user.isLoggedIn && !!user.token;

  // Check user role (handle both uppercase and lowercase)
  const isDoctor = () => user?.role?.toLowerCase() === 'doctor';
  const isPatient = () => user?.role?.toLowerCase() === 'patient';
  const isAdmin = () => user?.role?.toLowerCase() === 'admin';
  console.log("AuthContext user role:", user, user.role,isDoctor());
  const value = {
    user,
    isAuthenticated,
    isInitialized,
    isLoading: user.loading,
    error: user.error,
    isDoctor: isDoctor()  ,
    isPatient: isPatient(),
    isAdmin: isAdmin(),
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};