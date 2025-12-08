import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ApiService from '../../../services/ApiService';
import { showSnackBar } from '../../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import '../../../styles/PatientBookAppointmentPage.css';

const PatientBookAppointmentPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const userToken = localStorage.getItem('token');

  // ==================== STATE MANAGEMENT ====================
  const [doctors, setDoctors] = useState([]); // always an array
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    selectedTimeSlot: null,
    appointmentType: 'VIRTUAL',
    symptoms: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'Patient') {
        showSnackBar('Access denied. Patients only.');
        navigate('/login');
        return;
      }
      fetchDoctors();
    }
    // eslint-disable-next-line
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, selectedTimeSlot: null }));
    }
    // eslint-disable-next-line
  }, [formData.doctorId, formData.appointmentDate]);

  // ==================== API CALLS ====================
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.request(
        '/findDoctor/all/doctors',
        'GET',
        null,
        userToken
      );
      // Defensive assignment for any possible backend format
      let arr = [];
      if (response.success) {
        if (Array.isArray(response.data)) {
          arr = response.data;
        } else if (Array.isArray(response.data?.doctors)) {
          arr = response.data.doctors;
        } else if (
          typeof response.data === 'object' &&
          response.data !== null
        ) {
          // flatten if "by specialty" object (values are arrays)
          arr = Object.values(response.data).flatMap(val =>
            Array.isArray(val) ? val : []
          );
        }
      }
      setDoctors(arr);
    } catch (error) {
      showSnackBar('Error loading doctors');
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setIsLoading(true);
    console.log('Fetching available slots for doctorrrrrrrrrrrrrrr:');
    try {
      const response = await ApiService.request(
        `/appointments/available-slots?doctorId=${formData.doctorId}&date=${formData.appointmentDate}`,
        'GET',
        null,
        userToken
      );
      console.log('Available slots response:', response);
      if (response.success) {
        console.log('Available slots data:', response.data);
        setAvailableSlots(response.data);
      } else {
        showSnackBar('Failed to load available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      showSnackBar('Error loading available slots');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    let errors = {};
    if (!formData.doctorId) errors.doctorId = 'Please select a doctor';
    if (!formData.appointmentDate) errors.appointmentDate = 'Please select a date';
    if (!formData.selectedTimeSlot) errors.selectedTimeSlot = 'Please select a time slot';
    if (!formData.appointmentType) errors.appointmentType = 'Please select appointment type';
    return errors;
  };

  // ==================== FORM SUBMISSION ====================
  const handleBookAppointment = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showSnackBar('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const appointmentData = {
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        selectedTimeSlot: formData.selectedTimeSlot,
        appointmentType: formData.appointmentType,
        symptoms: formData.symptoms,
        notes: formData.notes,
      };

      const response = await ApiService.request(
        '/appointments/book',
        'POST',
        appointmentData,
        userToken
      );

      if (response.success) {
        showSnackBar('Appointment booked successfully!');
        resetForm();
        navigate('/dashboard');
      } else {
        showSnackBar(response.data?.message || 'Failed to book appointment');
      }
    } catch (e) {
      showSnackBar('Error booking appointment');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== HANDLERS ====================
  const handleDoctorChange = (e) => {
    setFormData(prev => ({
      ...prev,
      doctorId: e.target.value,
      selectedTimeSlot: null
    }));
    setErrors(prev => ({ ...prev, doctorId: null }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      appointmentDate: e.target.value,
      selectedTimeSlot: null
    }));
    setErrors(prev => ({ ...prev, appointmentDate: null }));
  };

  const handleSlotSelect = (slot) => {
    if (slot.availabilityStatus) {
      setFormData(prev => ({ ...prev, selectedTimeSlot: slot }));
      setErrors(prev => ({ ...prev, selectedTimeSlot: null }));
    }
  };

  const handleAppointmentTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      appointmentType: type
    }));
    setErrors(prev => ({ ...prev, appointmentType: null }));
  };

  const handleSymptomsChange = (e) => {
    setFormData(prev => ({ ...prev, symptoms: e.target.value }));
  };

  const handleNotesChange = (e) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      doctorId: '',
      appointmentDate: '',
      selectedTimeSlot: null,
      appointmentType: 'VIRTUAL',
      symptoms: '',
      notes: ''
    });
    setErrors({});
    setAvailableSlots([]);
  };

  // ==================== HELPERS ====================
  const getSelectedDoctorName = () => {
    const arr = Array.isArray(doctors) ? doctors : [];
    const doctor = arr.find(d => d._id === formData.doctorId);
    return doctor ? `Dr. ${doctor.fullName}` : '';
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatTimeSlot = (slot) => {
    if (!slot) return '';
    return `${slot.from} - ${slot.to} ${slot.period || ''}`;
  };

  // ==================== RENDER ====================
  if (authLoading || !user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="patient-booking-page">
      <div className="booking-container">
        {/* Header */}
        <div className="booking-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <button
            className="save-button"
            onClick={handleBookAppointment}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Booking Form */}
        <div className="booking-form">

          {/* Select Doctor */}
          <div className="form-group">
            <label htmlFor="doctor">Select Doctor</label>
            <select
              id="doctor"
              value={formData.doctorId}
              onChange={handleDoctorChange}
              className={errors.doctorId ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="">Choose a doctor</option>
              {(Array.isArray(doctors) ? doctors : []).map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.fullName} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                </option>
              ))}
            </select>
            {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
          </div>

          {/* Select Date */}
          <div className="form-group">
            <label htmlFor="date">Select Date</label>
            <input
              type="date"
              id="date"
              value={formData.appointmentDate}
              onChange={handleDateChange}
              min={getTodayDate()}
              className={errors.appointmentDate ? 'error' : ''}
              disabled={!formData.doctorId}
            />
            {errors.appointmentDate && <span className="error-message">{errors.appointmentDate}</span>}
          </div>

          {/* Available Slots */}
          {formData.doctorId && formData.appointmentDate && (
            <div className="form-group">
              <label>Available Slots</label>
              {isLoading ? (
                <div className="slots-loading">Loading slots...</div>
              ) : availableSlots.length > 0 ? (
                <div className="slots-container">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`slot-item ${slot.availabilityStatus ? 'available' : 'not-available'} ${
                        formData.selectedTimeSlot?.from === slot.from &&
                        formData.selectedTimeSlot?.to === slot.to ? 'selected' : ''
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <input
                        type="radio"
                        name="slot"
                        checked={
                          formData.selectedTimeSlot?.from === slot.from &&
                          formData.selectedTimeSlot?.to === slot.to
                        }
                        onChange={() => handleSlotSelect(slot)}
                        disabled={!slot.availabilityStatus}
                      />
                      <span className="slot-time">
                        {slot.from} - {slot.to} {slot.period}
                      </span>
                      <span className={`slot-status ${slot.availabilityStatus ? 'available-tag' : 'not-available-tag'}`}>
                        {slot.availabilityStatus ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-slots">No available slots for this date</div>
              )}
              {errors.selectedTimeSlot && <span className="error-message">{errors.selectedTimeSlot}</span>}
            </div>
          )}

          {/* Appointment Type */}
          <div className="form-group">
            <label>Appointment Type</label>
            <div className="appointment-type-options">
              <div className="radio-option">
                <input
                  type="radio"
                  id="in-person"
                  name="appointmentType"
                  checked={formData.appointmentType === 'IN_PERSON'}
                  onChange={() => handleAppointmentTypeChange('IN_PERSON')}
                />
                <label htmlFor="in-person">In-Person</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="virtual"
                  name="appointmentType"
                  checked={formData.appointmentType === 'VIRTUAL'}
                  onChange={() => handleAppointmentTypeChange('VIRTUAL')}
                />
                <label htmlFor="virtual">Virtual</label>
              </div>
            </div>
            {errors.appointmentType && <span className="error-message">{errors.appointmentType}</span>}
          </div>

          {/* Symptoms */}
          <div className="form-group">
            <label htmlFor="symptoms">Symptoms (Optional)</label>
            <textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={handleSymptomsChange}
              placeholder="Describe your symptoms..."
            />
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label htmlFor="notes">Additional Notes (Optional)</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Add any additional information or concerns..."
            />
          </div>
        </div>

        {/* Summary (Optional) */}
        {formData.doctorId && formData.selectedTimeSlot && (
          <div className="appointment-summary">
            <h3>Appointment Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Doctor:</span>
              <span className="summary-value">{getSelectedDoctorName()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date:</span>
              <span className="summary-value">
                {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Time:</span>
              <span className="summary-value">{formatTimeSlot(formData.selectedTimeSlot)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Type:</span>
              <span className="summary-value">
                {formData.appointmentType === 'VIRTUAL' ? 'Virtual' : 'In-Person'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientBookAppointmentPage;
