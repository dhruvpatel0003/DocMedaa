const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // auth fields included for Sprint 1 approach
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  address: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  role: { type: String, default: 'Patient' },
  healthConditions: [String],
  treatments: [String],
  wearableLinkedDevices: [String],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  sharedGoogleFitWith: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" } // doctor IDs
  ],
});

patientSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Patient', patientSchema);
