const mongoose = require('mongoose');

const clinicTimingSchema = new mongoose.Schema({
  day: String,
  from: String,
  to: String,
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  fullName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  address: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  role: { type: String, default: 'Doctor' }, // string type already
  hospitalName: { type: String },
  hospitalPhone: { type: String },
  hospitalEmail: { type: String },
  clinicTimings: [clinicTimingSchema],
  availableTreatments: [String],
  yearsOfExperience: Number,
  educationLevel: String,
  licenseNumber: String,
  specialty: String,
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
});

// ensure email index
doctorSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Doctor', doctorSchema);
