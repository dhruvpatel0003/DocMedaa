import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userID: '',
  fullName: '',
  role: 'Patient',
  email: '',
  phone: '',
  age: '',
  gender: 'Male',
  address: '',
  healthConditions: [],
  treatments: [],
  wearableLinkedDevices: [],
  hospitalName: '',
  hospitalPhone: '',
  hospitalEmail: '',
  yearsOfExperience: '',
  highestEducation: '',
  license: '',
  specialty: '',
  availableTreatments: [],
  clinicTimings: {},
  bookmarks: [],
  isLoggedIn: false,
  token: '',
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set basic info
    setBasicInfo: (state, action) => {
      state.fullName = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      if (action.payload.password) {
        state.password = action.payload.password;
      }
    },

    // Set profile details
    setProfileDetails: (state, action) => {
      const {
        phoneNo, ageValue, genderValue, addr, healthCond,
        hospitalNm, hospitalPhn, hospitalMail, exp, edu,
        spec, treatments, timings,
      } = action.payload;

      if (phoneNo) state.phone = phoneNo;
      if (ageValue) state.age = ageValue;
      if (genderValue) state.gender = genderValue;
      if (addr) state.address = addr;
      if (healthCond) state.healthConditions = healthCond;

      // Doctor specific
      if (hospitalNm) state.hospitalName = hospitalNm;
      if (hospitalPhn) state.hospitalPhone = hospitalPhn;
      if (hospitalMail) state.hospitalEmail = hospitalMail;
      if (exp) state.yearsOfExperience = exp;
      if (edu) state.highestEducation = edu;
      if (spec) state.specialty = spec;
      if (treatments) state.availableTreatments = treatments;
      if (timings) state.clinicTimings = timings;
    },

    // Set user ID
    setUserID: (state, action) => {
      state.userID = action.payload;
    },

    // Login success
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.userID = action.payload.id;
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.age = action.payload.age;
      state.gender = action.payload.gender;
      state.address = action.payload.address;
      state.healthConditions = action.payload.healthConditions;
      state.treatments = action.payload.treatments;
      state.wearableLinkedDevices = action.payload.wearableLinkedDevices;
      state.hospitalName = action.payload.hospitalName;
      state.hospitalPhone = action.payload.hospitalPhone;
      state.hospitalEmail = action.payload.hospitalEmail;
      state.yearsOfExperience = action.payload.yearsOfExperience;
      state.highestEducation = action.payload.highestEducation;
      state.license = action.payload.licenseNumber;
      state.specialty = action.payload.specialty;
      state.availableTreatments = action.payload.availableTreatments;
      state.clinicTimings = action.payload.clinicTimings;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },

    // Set loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Update user data (for profile edits)
    updateUserData: (state, action) => {
      const updatedData = action.payload;
      Object.keys(updatedData).forEach(key => {
        if (key in state) {
          state[key] = updatedData[key];
        }
      });
    },

    // Logout
    logout: (state) => {
      return initialState;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setBasicInfo,
  setProfileDetails,
  setUserID,
  loginSuccess,
  setLoading,
  setError,
  logout,
  clearError,
  updateUserData,
} = userSlice.actions;

export default userSlice.reducer;