const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["steps", "weight", "sleep", "custom"], required: true },
    label: { type: String, required: true },
    currentValue: { type: Number, required: false },
    targetValue: { type: Number, required: false },
    unit: { type: String, required: false },
    status: {
      type: String,
      enum: ["on_track", "behind", "ahead", "not_started"],
      default: "not_started",
    },
  },
  { _id: false }
);

// const CarePlanSchema = new mongoose.Schema(
//   {
//     patient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     doctor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     source: {
//       type: String,
//       enum: ["google_fit", "manual"],
//       default: "google_fit",
//     },
//     summaryContext: {
//       stepsSummary: { type: String },
//       heartRateSummary: { type: String },
//       weightSummary: { type: String },
//       sleepSummary: { type: String },
//     },
//     patientFriendlyText: {
//       overview: { type: String },
//       activity: { type: String },
//       weight: { type: String },
//       sleep: { type: String },
//       followUp: { type: String },
//     },
//     goals: [GoalSchema],
//     status: {
//       type: String,
//       enum: ["draft", "sent", "archived"],
//       default: "sent",
//     },
//   },
//   { timestamps: true }
// );
const CarePlanSchema = new mongoose.Schema(
  {
    patient: { /* same as before */ },
    doctor: { /* same as before */ },
    source: {
      type: String,
      enum: ["google_fit", "manual"],
      default: "google_fit",
    },
    summaryContext: {
      stepsSummary: { type: String },
      heartRateSummary: { type: String },
      weightSummary: { type: String },
      sleepSummary: { type: String },
    },
    // NEW: store the full letter text
    fullLetter: { type: String },   // <- add this

    patientFriendlyText: {
      overview: { type: String },
      activity: { type: String },
      weight: { type: String },
      sleep: { type: String },
      followUp: { type: String },
    },
    goals: [GoalSchema],
    status: {
      type: String,
      enum: ["draft", "sent", "archived"],
      default: "sent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarePlan", CarePlanSchema);
