import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomTextField from '../components/CustomTextField';
import { AppConstants } from '../constants/AppConstants';
import { showSnackBar } from '../utils/helpers';
import ApiService from '../services/ApiService';
import '../styles/CompleteProfilePage.css';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    // Patient specific
    healthConditions: [],
    // Doctor specific
    hospitalName: '',
    hospitalPhone: '',
    hospitalEmail: '',
    yearsOfExperience: '',
    highestEducation: '',
    specialty: '',
  });

  const [selectedRole, setSelectedRole] = useState(user?.role || 'patient');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [errors, setErrors] = useState({});

  const isDoctor = selectedRole === 'doctor';
  const isPatient = selectedRole === 'patient';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.age) {
      newErrors.age = 'Age is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (isDoctor) {
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

  const handleConditionToggle = (condition) => {
    setSelectedConditions(prev => {
      if (prev.includes(condition)) {
        return prev.filter(c => c !== condition);
      } else {
        return [...prev, condition];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackBar(AppConstants.allFieldsRequired);
      return;
    }

    try {
      const profileData = {
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        address: formData.address,
      };

      if (isPatient) {
        profileData.healthConditions = selectedConditions;
      } else if (isDoctor) {
        profileData.hospitalName = formData.hospitalName;
        profileData.hospitalPhone = formData.hospitalPhone;
        profileData.hospitalEmail = formData.hospitalEmail;
        profileData.yearsOfExperience = formData.yearsOfExperience;
        profileData.educationLevel = formData.highestEducation;
        profileData.speciality = formData.specialty;
      }

      const response = await ApiService.completeProfile(
        user.id,
        user.role,
        profileData,
        localStorage.getItem('token')
      );

      if (response.success && response.statusCode === 201) {
        showSnackBar('Profile completed successfully!');
        navigate(AppConstants.routes.login);
      } else {
        showSnackBar(response.data?.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      showSnackBar('Failed to complete profile');
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="profile-container">
        <h1>Complete Your Profile</h1>
        <p>Hi {user?.fullName}, please complete your profile information</p>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Role Selection */}
          <div className="form-section">
            <h2>Select Your Role</h2>
            <div className="form-group">
              <div className="radio-group">
                {['patient', 'doctor'].map(role => (
                  <div key={role} className="radio-option">
                    <input
                      type="radio"
                      id={`role-${role}`}
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    />
                    <label htmlFor={`role-${role}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="form-section">
            <h2>Basic Information</h2>

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

            <div className="form-group">
              <label>Gender:</label>
              <div className="radio-group">
                {['Male', 'Female', 'Other'].map(gender => (
                  <div key={gender} className="radio-option">
                    <input
                      type="radio"
                      id={gender}
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    />
                    <label htmlFor={gender}>{gender}</label>
                  </div>
                ))}
              </div>
            </div>

            <CustomTextField
              hint="Address"
              value={formData.address}
              onChange={(value) => handleChange('address', value)}
              type="text"
              error={errors.address}
              multiline
              rows={3}
              required
            />
          </div>

          {/* Patient Specific */}
          {isPatient && (
            <div className="form-section">
              <h2>Health Information</h2>

              <div className="form-group">
                <label>Health Conditions (Optional):</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConditionsModal(true)}
                >
                  Select Health Conditions ({selectedConditions.length})
                </button>

                {selectedConditions.length > 0 && (
                  <div className="selected-conditions">
                    {selectedConditions.map(condition => (
                      <span key={condition} className="condition-chip">
                        {condition}
                        <button
                          type="button"
                          className="chip-close"
                          onClick={() => handleConditionToggle(condition)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {showConditionsModal && (
                <div className="modal-overlay" onClick={() => setShowConditionsModal(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Select Health Conditions</h3>
                    <div className="conditions-list">
                      {AppConstants.availableHealthConditions.map(condition => (
                        <label key={condition} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedConditions.includes(condition)}
                            onChange={() => handleConditionToggle(condition)}
                          />
                          <span>{condition}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowConditionsModal(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Doctor Specific */}
          {isDoctor && (
            <div className="form-section">
              <h2>Professional Information</h2>

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
                hint="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={(value) => handleChange('yearsOfExperience', value)}
                type="number"
                error={errors.yearsOfExperience}
                required
              />

              <CustomTextField
                hint="Highest Level of Education"
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
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Saving Profile...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;