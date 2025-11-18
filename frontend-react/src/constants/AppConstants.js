// App Theme Constants
export const AppConstants = {
  // Colors
  themeColor: '#0052CC', // Main blue color
  bottonTextColor: '#FFFFFF',
  backgroundColor: '#F5F5F5',
  textPrimaryColor: '#333333',
  textSecondaryColor: '#666666',
  errorColor: '#E53935',
  successColor: '#43A047',
  warningColor: '#FB8C00',
  borderColor: '#CCCCCC',
  disabledColor: '#E0E0E0',

  // Fonts
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  fontWeight: '600',
  fontWeightLight: '400',
  fontWeightBold: '700',

  // Font Sizes
  fontTitle: 18,
  fontLarge: 16,
  fontMedium: 14,
  fontSmall: 12,
  fontExtraSmall: 10,

  // Spacing
  minSizedBoxHeight: 12,
  mediumSizeBoxHeight: 20,
  largeSizeBoxHeight: 30,
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,

  // Border Radius
  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 12,
  borderRadiusXLarge: 20,

  // Messages
  allFieldsRequired: 'Please fill all required fields',
  userRegistrationFailure: 'User registration failed. Please try again.',
  userRegistrationSuccess: 'User registered successfully!',
  loginFailure: 'Login failed. Please check your credentials.',
  loginSuccess: 'Login successful!',
  
  // Health Conditions (from Flutter)
  availableHealthConditions: [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Kidney Disease',
    'Liver Disease',
    'Thyroid',
    'Arthritis',
    'Migraine',
    'Depression',
    'Anxiety',
    'Obesity',
  ],

  // Available Treatments for Doctors
  availableTreatments: [
    'General Checkup',
    'Dental Cleaning',
    'X-Ray',
    'Blood Test',
    'ECG',
    'Ultrasound',
    'CT Scan',
    'MRI Scan',
    'Vaccination',
    'Surgery',
    'Physiotherapy',
    'Counseling',
    'Prescription Medication',
    'Immunization',
    'Allergy Testing',
  ],

  // Days of Week for Clinic Timings
  daysOfWeek: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],

  // User Roles
  rolePatient: 'Patient',
  roleDoctor: 'Doctor',
  roleAdmin: 'Admin',

  // API Configuration
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://192.168.1.171:5000/api',
  apiTimeout: 30000,

  // Routes
  routes: {
    home: '/',
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    completeProfile: '/complete-profile',
    dashboard: '/dashboard',
    appointments: '/appointments',
    bookAppointment: '/book-appointment',
    profile: '/profile',
    notFound: '/404',
  },

  // Validation
  passwordMinLength: 6,
  phoneRegex: /^[0-9]{10,}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};