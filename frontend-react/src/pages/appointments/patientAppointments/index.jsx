import React, { useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientBookAppointmentPage from './PatientBookAppointmentPage';
import { showSnackBar } from '../../../../utils/helpers';


const PatientBookAppointment = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is a patient
    if (!authLoading) {
      if (!user) {
        showSnackBar('Please login to book an appointment', 'error');
        navigate('/login');
      } else if (user.role !== 'Patient') {
        showSnackBar('Access denied. This page is for patients only.', 'error');
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Only render the page if user is authenticated and is a patient
  if (user && user.role === 'Patient') {
    return <PatientBookAppointmentPage />;
  }

  // Return null while redirecting
  return null;
};

export default PatientBookAppointment;
