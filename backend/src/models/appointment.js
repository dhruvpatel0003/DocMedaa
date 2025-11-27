const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  symptoms: {
    type: String,
    default: "",
  },
  status: { //NEED TO IMPLEMENT
    type: String,
    // enum: ["pending", "scheduled", "reScheduled", "cancelled"],
    default: "pending",
  },
  appointmentType: {
    type: String,
    enum: ["in-person", "virtual", "telehealth"],
    default: "in-person",
  },
  notes: {
    type: String,
  },
  selectedTimeSlot: {
    from: { type: String, required: true }, // e.g. "09:00"
    to: { type: String, required: true },   // e.g. "10:00"
    // period: { type: String, enum: ["AM", "PM"], required: true }, // "AM" or "PM"
    availabilityStatus: { type: Boolean, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
