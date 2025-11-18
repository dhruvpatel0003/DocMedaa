import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomTextField from '../components/CustomTextField';
import Logo from '../components/Logo';
import { AppConstants } from '../constants/AppConstants';
import { showSnackBar, validateEmail, validatePassword } from '../utils/helpers';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    age: '',
    gender: 'male',
    // Doctor specific fields
    hospitalName: '',
    hospitalPhone: '',
    hospitalEmail: '',
    yearsOfExperience: '',
    highestEducation: '',
    specialty: '',
    licenseNumber: '',
    availableTreatments: [],
    clinicTimings: [],
  });
  const [errors, setErrors] = useState({});
  const [showTreatmentsDropdown, setShowTreatmentsDropdown] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = `Password must be at least ${AppConstants.passwordMinLength} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Doctor specific validation
    if (formData.role === 'doctor') {
      if (!formData.hospitalName.trim()) {
        newErrors.hospitalName = 'Hospital/Clinic name is required';
      }
      if (!formData.hospitalPhone.trim()) {
        newErrors.hospitalPhone = 'Hospital phone is required';
      }
      if (!formData.hospitalEmail.trim()) {
        newErrors.hospitalEmail = 'Hospital email is required';
      }
      if (!formData.yearsOfExperience) {
        newErrors.yearsOfExperience = 'Years of experience is required';
      }
      if (!formData.highestEducation.trim()) {
        newErrors.highestEducation = 'Education level is required';
      }
      if (!formData.specialty.trim()) {
        newErrors.specialty = 'Specialty is required';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
      if (formData.availableTreatments.length === 0) {
        newErrors.availableTreatments = 'Please select at least one treatment';
      }
      if (formData.clinicTimings.length === 0) {
        newErrors.clinicTimings = 'Please add at least one clinic timing';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTreatmentToggle = (treatment) => {
    setFormData(prev => {
      const treatments = prev.availableTreatments.includes(treatment)
        ? prev.availableTreatments.filter(t => t !== treatment)
        : [...prev.availableTreatments, treatment];
      return {
        ...prev,
        availableTreatments: treatments
      };
    });
  };

  const addClinicTiming = () => {
    setFormData(prev => ({
      ...prev,
      clinicTimings: [...prev.clinicTimings, { day: 'Monday', from: '09:00 AM', to: '06:00 PM' }]
    }));
  };

  const removeClinicTiming = (index) => {
    setFormData(prev => ({
      ...prev,
      clinicTimings: prev.clinicTimings.filter((_, i) => i !== index)
    }));
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '09:00 AM';
    const [hours, minutes] = time24.split(':');
    let hours24 = parseInt(hours, 10);
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    hours24 = hours24 % 12 || 12;
    return `${String(hours24).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const convertTo24Hour = (time12) => {
    if (!time12) return '09:00';
    const [time, meridiem] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (meridiem === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const updateClinicTiming = (index, field, value) => {
    setFormData(prev => {
      const updatedTimings = [...prev.clinicTimings];
      updatedTimings[index] = {
        ...updatedTimings[index],
        [field]: value
      };
      return {
        ...prev,
        clinicTimings: updatedTimings
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const signupData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      gender : formData.gender,
      age : formData.age,
      phone : formData.phone
    };

    // Add doctor specific fields if role is doctor
    if (formData.role === 'doctor') {
      signupData.hospitalName = formData.hospitalName;
      signupData.hospitalPhone = formData.hospitalPhone;
      signupData.hospitalEmail = formData.hospitalEmail;
      signupData.yearsOfExperience = formData.yearsOfExperience;
      signupData.educationLevel = formData.educationLevel;
      signupData.specialty = formData.specialty;
      signupData.location = formData.location;
      signupData.licenseNumber = formData.licenseNumber;
      signupData.availableTreatments = formData.availableTreatments;
      signupData.clinicTimings = formData.clinicTimings;
    }

    const result = await signup(signupData);

    if (result.success) {
      showSnackBar(AppConstants.signupSuccess);
      // If doctor, redirect to complete profile; if patient, redirect to login
      if (formData.role === 'doctor') {
        console.log("Doctor role detected");
        navigate(AppConstants.routes.completeProfile);
      } else {
        navigate(AppConstants.routes.login);
      }
    } else {
      showSnackBar(result.error || AppConstants.signupFailure);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <Logo size="medium" showText={true} />
          <h1>Create Account</h1>
          <p>Join DocMedaa today</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <CustomTextField
            hint="Full Name"
            value={formData.fullName}
            onChange={(value) => handleChange('fullName', value)}
            type="text"
            error={errors.fullName}
            required
          />

          <CustomTextField
            hint="Email Address"
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            type="email"
            error={errors.email}
            required
          />
          
          <CustomTextField
            hint="Phone Number"
            value={formData.phone}
            onChange={(value) => handleChange('phone', value)}
            type="tel"
            error={errors.phone}
            required
          />

          <CustomTextField
            hint="Age"
            value={formData.age}
            onChange={(value) => handleChange('age', value)}
            type="number"
            error={errors.age}
            required
          />

          <CustomTextField
            hint="Password"
            value={formData.password}
            onChange={(value) => handleChange('password', value)}
            type="password"
            error={errors.password}
            required
          />

          <CustomTextField
            hint="Confirm Password"
            value={formData.confirmPassword}
            onChange={(value) => handleChange('confirmPassword', value)}
            type="password"
            error={errors.confirmPassword}
            required
          />

          <div className="role-selection">
            <label>Role</label>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={formData.role === 'patient'}
                  onChange={(e) => handleChange('role', e.target.value)}
                />
                <span>Patient</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={formData.role === 'doctor'}
                  onChange={(e) => handleChange('role', e.target.value)}
                />
                <span>Doctor</span>
              </label>
            </div>
          </div>

          <div className="role-selection">
            <label>Gender</label>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                <span>Male</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          {/* Doctor Specific Fields */}
          {formData.role === 'doctor' && (
            <div className="doctor-fields">
              <h3>Professional Information</h3>
              
              <CustomTextField
                hint="Hospital / Clinic Name"
                value={formData.hospitalName}
                onChange={(value) => handleChange('hospitalName', value)}
                type="text"
                error={errors.hospitalName}
                required
              />

              <CustomTextField
                hint="Hospital Phone"
                value={formData.hospitalPhone}
                onChange={(value) => handleChange('hospitalPhone', value)}
                type="tel"
                error={errors.hospitalPhone}
                required
              />

              <CustomTextField
                hint="Hospital Email"
                value={formData.hospitalEmail}
                onChange={(value) => handleChange('hospitalEmail', value)}
                type="email"
                error={errors.hospitalEmail}
                required
              />

              <CustomTextField
                hint="License Number"
                value={formData.licenseNumber}
                onChange={(value) => handleChange('licenseNumber', value)}
                type="text"
                error={errors.licenseNumber}
                required
              />

              <CustomTextField
                hint="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={(value) => handleChange('yearsOfExperience', value)}
                type="number"
                error={errors.yearsOfExperience}
                required
              />

              <CustomTextField
                hint="Education"
                value={formData.highestEducation}
                onChange={(value) => handleChange('highestEducation', value)}
                type="text"
                error={errors.highestEducation}
                required
              />

              <CustomTextField
                hint="Specialty"
                value={formData.specialty}
                onChange={(value) => handleChange('specialty', value)}
                type="text"
                error={errors.specialty}
                required
              />

              {/* Available Treatments */}
              <div className="form-group">
                <label>Available Treatments:</label>
                <div className="treatments-dropdown-wrapper">
                  <button
                    type="button"
                    className="treatments-dropdown-btn"
                    onClick={() => setShowTreatmentsDropdown(!showTreatmentsDropdown)}
                  >
                    {formData.availableTreatments.length === 0
                      ? 'Select Treatments'
                      : `${formData.availableTreatments.length} selected`}
                    <span className="dropdown-icon">▼</span>
                  </button>

                  {showTreatmentsDropdown && (
                    <div className="treatments-dropdown-menu">
                      {AppConstants.availableTreatments.map(treatment => (
                        <label key={treatment} className="dropdown-checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.availableTreatments.includes(treatment)}
                            onChange={() => handleTreatmentToggle(treatment)}
                          />
                          <span>{treatment}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {formData.availableTreatments.length > 0 && (
                    <div className="selected-treatments">
                      {formData.availableTreatments.map(treatment => (
                        <span key={treatment} className="treatment-chip">
                          {treatment}
                          <button
                            type="button"
                            className="chip-close"
                            onClick={() => handleTreatmentToggle(treatment)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {errors.availableTreatments && (
                  <p className="error-text">{errors.availableTreatments}</p>
                )}
              </div>

              {/* Clinic Timings */}
              <div className="form-group">
                <label>Clinic Timings:</label>
                <div className="clinic-timings-container">
                  {formData.clinicTimings.map((timing, index) => (
                    <div key={index} className="timing-row">
                      <select
                        value={timing.day}
                        onChange={(e) => updateClinicTiming(index, 'day', e.target.value)}
                        className="timing-select"
                      >
                        {AppConstants.daysOfWeek.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={convertTo24Hour(timing.from)}
                        onChange={(e) => updateClinicTiming(index, 'from', convertTo12Hour(e.target.value))}
                        className="timing-input"
                      />
                      <input
                        type="time"
                        value={convertTo24Hour(timing.to)}
                        onChange={(e) => updateClinicTiming(index, 'to', convertTo12Hour(e.target.value))}
                        className="timing-input"
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => removeClinicTiming(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={addClinicTiming}
                >
                  + Add Timing
                </button>
                {errors.clinicTimings && (
                  <p className="error-text">{errors.clinicTimings}</p>
                )}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary signup-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;