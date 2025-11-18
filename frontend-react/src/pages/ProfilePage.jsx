import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import CustomTextField from '../components/CustomTextField';
import { showSnackBar } from '../utils/helpers';
import { updateUserData } from '../redux/userSlice';
import ApiService from '../services/ApiService';
import '../styles/ProfilePage.css';

const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getInitialClinicTimings = (userTimings) => {
  // Ensure every day is present, default to empty array
  let timings = {};
  defaultDays.forEach(day => {
    timings[day] = Array.isArray(userTimings?.[day]) ? userTimings[day] : [];
  });
  return timings;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const reduxUser = useSelector(state => state.user);

  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const isDoctor = user?.role?.toLowerCase() === 'doctor';
  const isPatient = user?.role?.toLowerCase() === 'patient';

  const openEditModal = (section) => {
    setEditingSection(section);
    switch (section) {
      case 'basic':
        setEditData({ fullName: user?.fullName || '', email: user?.email || '' });
        break;
      case 'contact':
        setEditData({ phone: user?.phone || '', address: user?.address || '' });
        break;
      case 'health':
        setEditData({ age: user?.age || '', gender: user?.gender || 'Male' });
        break;
      case 'professional':
        setEditData({
          hospitalName: user?.hospitalName || '',
          hospitalPhone: user?.hospitalPhone || '',
          hospitalEmail: user?.hospitalEmail || '',
        });
        break;
      case 'credentials':
        setEditData({
          yearsOfExperience: user?.yearsOfExperience || '',
          highestEducation: user?.highestEducation || '',
          specialty: user?.specialty || '',
        });
        break;
      case 'timing':
        setEditData({ clinicTimings: getInitialClinicTimings(user?.clinicTimings) });
        break;
      default:
        break;
    }
  };

  const closeEditModal = () => {
    setEditingSection(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // MULTI-SLOT CLINIC TIMINGS handlers
  const addTimeSlot = (day) => {
    setEditData(prev => ({
      ...prev,
      clinicTimings: {
        ...prev.clinicTimings,
        [day]: [...(prev.clinicTimings[day] || []), { start: '', end: '' }]
      }
    }));
  };

  const removeTimeSlot = (day, idx) => {
    setEditData(prev => ({
      ...prev,
      clinicTimings: {
        ...prev.clinicTimings,
        [day]: prev.clinicTimings[day].filter((_, i) => i !== idx)
      }
    }));
  };

  const setTimeSlot = (day, idx, field, value) => {
    setEditData(prev => {
      const slots = prev.clinicTimings[day] || [];
      const updatedSlots = slots.map((slot, i) =>
        i === idx ? { ...slot, [field]: value } : slot
      );
      return {
        ...prev,
        clinicTimings: {
          ...prev.clinicTimings,
          [day]: updatedSlots
        }
      };
    });
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      const profileData = {};
      if (editData.phone !== undefined) profileData.phone = editData.phone;
      if (editData.address !== undefined) profileData.address = editData.address;
      if (editData.age !== undefined) profileData.age = editData.age;
      if (editData.gender !== undefined) profileData.gender = editData.gender;
      if (editData.hospitalName !== undefined) profileData.hospitalName = editData.hospitalName;
      if (editData.hospitalPhone !== undefined) profileData.hospitalPhone = editData.hospitalPhone;
      if (editData.hospitalEmail !== undefined) profileData.hospitalEmail = editData.hospitalEmail;
      if (editData.yearsOfExperience !== undefined) profileData.yearsOfExperience = editData.yearsOfExperience;
      if (editData.highestEducation !== undefined) profileData.highestEducation = editData.highestEducation;
      if (editData.specialty !== undefined) profileData.specialty = editData.specialty;
      if (editData.fullName !== undefined) profileData.fullName = editData.fullName;
      if (editData.email !== undefined) profileData.email = editData.email;

      // Main change for multi-slot days
      // if (editData.clinicTimings !== undefined) profileData.clinicTimings = editData.clinicTimings;
      if (editData.clinicTimings !== undefined) {
      let timings = editData.clinicTimings;
      console.log('Clinic timings before save:', timings, typeof timings);
      if (typeof timings === 'string') {
        console.log('Parsing clinic timings from string');
        try {
          timings = JSON.parse(timings);
        } catch (e) {
          showSnackBar('Clinic timings data is invalid.');
          setIsSaving(false);
          return;
        }
      }
      profileData.clinicTimings = timings;
    }
      // console.log('Profile data to save:', profileData.clinicTimings, editData.clinicTimings);
      const response = await ApiService.completeProfile(
        reduxUser?.userID || user?.id,
        user?.role,
        profileData,
        localStorage.getItem('token')
      );

      if (response.success) {
        dispatch(updateUserData(profileData));
        showSnackBar('Profile updated successfully!');
        closeEditModal();
      } else {
        showSnackBar(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      showSnackBar('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // --- MAIN RENDER ---
  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>View and manage your profile information</p>
        </div>

        <div className="profile-content">
          {/* Basic Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>👤 Basic Information</h2>
            </div>
            <div className="card-body">
              <div className="info-row"><label>Full Name</label><p>{reduxUser?.fullName || 'N/A'}</p></div>
              <div className="info-row"><label>Email</label><p>{reduxUser?.email || 'N/A'}</p></div>
              <div className="info-row"><label>Role</label>
                <p className="role-badge">{reduxUser?.role ? reduxUser.role.charAt(0).toUpperCase() + reduxUser.role.slice(1) : 'N/A'}</p>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary" onClick={() => openEditModal('basic')}>Edit Information</button>
            </div>
          </div>
          
          {/* Contact Card */}
          <div className="profile-card">
            <div className="card-header"><h2>📞 Contact Information</h2></div>
            <div className="card-body">
              <div className="info-row"><label>Phone Number</label><p>{reduxUser?.phone || 'Not provided'}</p></div>
              <div className="info-row"><label>Address</label><p>{reduxUser?.address || 'Not provided'}</p></div>
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary" onClick={() => openEditModal('contact')}>Edit Contact</button>
            </div>
          </div>

          {/* Patient Info */}
          {isPatient && (
            <div className="profile-card">
              <div className="card-header"><h2>💊 Health Information</h2></div>
              <div className="card-body">
                <div className="info-row"><label>Age</label><p>{reduxUser?.age || 'Not provided'}</p></div>
                <div className="info-row"><label>Gender</label><p>{reduxUser?.gender || 'Not provided'}</p></div>
                <div className="info-row"><label>Health Conditions</label>
                  {reduxUser?.healthConditions && reduxUser.healthConditions.length > 0 ? (
                    <div className="conditions-list">{reduxUser.healthConditions.map((condition, index) => (
                      <span key={index} className="condition-chip">{condition}</span>
                    ))}</div>
                  ) : <p>No health conditions listed</p>}
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-secondary" onClick={() => openEditModal('health')}>Edit Health Info</button>
              </div>
            </div>
          )}

          {/* Doctor Info */}
          {isDoctor && (
            <>
              <div className="profile-card">
                <div className="card-header"><h2>🏥 Professional Information</h2></div>
                <div className="card-body">
                  <div className="info-row"><label>Hospital/Clinic Name</label><p>{reduxUser?.hospitalName || 'Not provided'}</p></div>
                  <div className="info-row"><label>Hospital Phone</label><p>{reduxUser?.hospitalPhone || 'Not provided'}</p></div>
                  <div className="info-row"><label>Hospital Email</label><p>{reduxUser?.hospitalEmail || 'Not provided'}</p></div>
                </div>
                <div className="card-footer">
                  <button className="btn btn-secondary" onClick={() => openEditModal('professional')}>Edit Professional Info</button>
                </div>
              </div>
              
              <div className="profile-card">
                <div className="card-header"><h2>🎓 Credentials</h2></div>
                <div className="card-body">
                  <div className="info-row"><label>Years of Experience</label><p>{reduxUser?.yearsOfExperience || 'Not provided'} years</p></div>
                  <div className="info-row"><label>Highest Education</label><p>{reduxUser?.highestEducation || 'Not provided'}</p></div>
                  <div className="info-row"><label>Specialty</label><p>{reduxUser?.specialty || 'Not provided'}</p></div>
                </div>
                <div className="card-footer">
                  <button className="btn btn-secondary" onClick={() => openEditModal('credentials')}>Edit Credentials</button>
                </div>
              </div>

              {/* Clinic Timings */}
              <div className="profile-card">
                <div className="card-header"><h2>⏰ Clinic Timings</h2></div>
                <div className="card-body">
                  {reduxUser?.clinicTimings ? (
                    defaultDays.map(day => {
                      const slots = reduxUser.clinicTimings[day] || [];
                      return (
                        <div key={day} className="info-row">
                          <label>{day}</label>
                          <p>
                            {slots.length > 0
                              ? slots.map((slot, idx) =>
                                  slot.start && slot.end
                                    ? `${slot.start} - ${slot.end}${idx < slots.length - 1 ? ', ' : ''}`
                                    : ''
                                )
                              : 'Closed'}
                          </p>
                        </div>
                      );
                    })
                  ) : (<p>No clinic timings provided</p>)}
                </div>
                <div className="card-footer">
                  <button className="btn btn-secondary" onClick={() => openEditModal('timing')}>Edit Timings</button>
                </div>
              </div>
            </>
          )}
        </div>

        <button className="btn btn-secondary back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

        {/* Edit Modal */}
        {editingSection && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit {editingSection === 'basic' ? 'Basic Information' : 
                  editingSection === 'contact' ? 'Contact Information' :
                  editingSection === 'health' ? 'Health Information' :
                  editingSection === 'professional' ? 'Professional Information' :
                  editingSection === 'timing' ? 'Clinic Timings' :
                  'Credentials'}</h3>
                <button className="close-btn" onClick={closeEditModal}>×</button>
              </div>
              <div className="modal-body">
                {editingSection === 'basic' && (
                  <>
                    <CustomTextField hint="Full Name" value={editData.fullName}
                      onChange={value => handleEditChange('fullName', value)} type="text" />
                    <CustomTextField hint="Email" value={editData.email}
                      onChange={value => handleEditChange('email', value)} type="email" />
                  </>
                )}
                {editingSection === 'contact' && (
                  <>
                    <CustomTextField hint="Phone Number" value={editData.phone}
                      onChange={value => handleEditChange('phone', value)} type="tel" />
                    <CustomTextField hint="Address" value={editData.address}
                      onChange={value => handleEditChange('address', value)} type="text" multiline rows={3} />
                  </>
                )}
                {editingSection === 'health' && (
                  <>
                    <CustomTextField hint="Age" value={editData.age}
                      onChange={value => handleEditChange('age', value)} type="number" />
                    <div className="form-group">
                      <label>Gender:</label>
                      <div className="radio-group">
                        {['Male', 'Female', 'Other'].map(gender => (
                          <div key={gender} className="radio-option">
                            <input type="radio" id={`gender-${gender}`} value={gender}
                              checked={editData.gender === gender}
                              onChange={e => handleEditChange('gender', e.target.value)} />
                            <label htmlFor={`gender-${gender}`}>{gender}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {editingSection === 'professional' && (
                  <>
                    <CustomTextField hint="Hospital / Clinic Name" value={editData.hospitalName}
                      onChange={value => handleEditChange('hospitalName', value)} type="text" />
                    <CustomTextField hint="Hospital Phone" value={editData.hospitalPhone}
                      onChange={value => handleEditChange('hospitalPhone', value)} type="tel" />
                    <CustomTextField hint="Hospital Email" value={editData.hospitalEmail}
                      onChange={value => handleEditChange('hospitalEmail', value)} type="email" />
                  </>
                )}
                {editingSection === 'credentials' && (
                  <>
                    <CustomTextField hint="Years of Experience" value={editData.yearsOfExperience}
                      onChange={value => handleEditChange('yearsOfExperience', value)} type="number" />
                    <CustomTextField hint="Highest Education" value={editData.highestEducation}
                      onChange={value => handleEditChange('highestEducation', value)} type="text" />
                    <CustomTextField hint="Specialty" value={editData.specialty}
                      onChange={value => handleEditChange('specialty', value)} type="text" />
                  </>
                )}
                {editingSection === 'timing' && (
                  <div className="clinic-timings-edit">
                    {defaultDays.map(day => (
                      <div key={day} className="timing-row-block">
                        <label>{day}</label>
                        {(editData.clinicTimings?.[day] || []).map((slot, idx) => (
                          <div key={idx} className="timing-row">
                            <input type="time" value={slot.start}
                              onChange={e => setTimeSlot(day, idx, 'start', e.target.value)} />
                            <span>to</span>
                            <input type="time" value={slot.end}
                              onChange={e => setTimeSlot(day, idx, 'end', e.target.value)} />
                            <button type="button" onClick={() => removeTimeSlot(day, idx)}>Remove</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addTimeSlot(day)}>Add slot</button>
                      </div>
                    ))}
                    <small>Add multiple slots for any day. Remove all to mark as closed.</small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
