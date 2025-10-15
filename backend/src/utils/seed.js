// simple seed script
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const bcrypt = require('bcryptjs');

const run = async () => {
  try {
    await connectDB(); // uses default local dummy URL
    // clear
    await Doctor.deleteMany({});
    await Patient.deleteMany({});

    const pass1 = await bcrypt.hash('DocMedaa@123', 10);
    const pass2 = await bcrypt.hash('Patient@123', 10);

    const doctors = [
      {
        fullName: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@docmedaa.com',
        password: pass1,
        phone: '+1-201-555-0189',
        age: 38,
        gender: 'Female',
        role: 'Doctor',
        hospitalName: 'New York Wellness Clinic',
        clinicTimings: [{ day: 'Mon', from: '09:00 AM', to: '05:00 PM' }],
        availableTreatments: ['Cardiac Checkup'],
        yearsOfExperience: 12,
        educationLevel: 'MD, Internal Medicine',
        licenseNumber: 'LIC-NY-203948',
        specialty: 'Cardiology'
      }
    ];

    const patients = [
      {
        fullName: 'Emma Brown',
        email: 'emma.brown@example.com',
        // secondemail : 'emma1.brown@example.com',pass : "pass22"

        password: pass2,
        phone: '+1-917-555-0478',
        age: 29,
        gender: 'Female',
        role: 'Patient',
        healthConditions: ['Asthma'],
        treatments: ['Inhaler Therapy'],
        wearableLinkedDevices: ['Google Fit']
      }
    ];

    await Doctor.insertMany(doctors);
    await Patient.insertMany(patients);

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
