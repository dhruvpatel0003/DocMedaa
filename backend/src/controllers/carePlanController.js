// src/controllers/carePlanController.js
const { generateCarePlanDraft } = require("../services/aiCarePlanService");
const CarePlan = require("../models/carePlan");

exports.createAICarePlanDraft = async (req, res) => {
  try {
    // Ensure only doctors can call this
    if (req.user.role.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Doctors only" });
    }

    const { patient, metrics, clinicalContext } = req.body;

    if (!patient || !metrics) {
      return res
        .status(400)
        .json({ error: "Missing patient or metrics data" });
    }

    const draft = await generateCarePlanDraft({
      patient,
      metrics,
      clinicalContext: clinicalContext || {},
    });

    // In future you can store draft in DB here (CarePlan model)

    res.json({ plan: draft });
  } catch (err) {
    console.error("Error generating AI care plan draft:", err);
    res.status(500).json({ error: "Failed to generate care plan draft" });
  }
};

// const CarePlan = require("../models/carePlan"); // Adjust the import path as necessary
// const axios = require("axios");

// const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
// const PERPLEXITY_MODEL = "sonar-pro"; // or the model you use

// POST /api/care-plans/ai-draft
// exports.generateAiDraft = async (req, res) => {
//   try {
//     const { patient, googleFitSummary, doctorNotes } = req.body;

//     if (!patient || !googleFitSummary) {
//       return res.status(400).json({ message: "Missing patient or googleFitSummary" });
//     }

//     const prompt = `
// You are a doctor assistant. Create a clear, friendly care plan for this patient.

// Patient:
// - Name: ${patient.fullName || "N/A"}
// - Age: ${patient.age || "N/A"}
// - Conditions: ${patient.conditions || "N/A"}
// - Medications: ${patient.medications || "N/A"}

// Doctor notes:
// ${doctorNotes || "No additional notes"}

// Google Fit Summary:
// - Steps: ${googleFitSummary.stepsText || "N/A"}
// - Heart rate: ${googleFitSummary.heartRateText || "N/A"}
// - Weight: ${googleFitSummary.weightText || "N/A"}
// - Sleep: ${googleFitSummary.sleepText || "N/A"}

// Return JSON ONLY in this shape:
// {
//   "patientFriendlyText": {
//     "overview": "short paragraph",
//     "activity": "2-4 bullet-style sentences",
//     "weight": "2-4 bullet-style sentences",
//     "sleep": "2-4 bullet-style sentences",
//     "followUp": "how and when to follow up"
//   },
//   "goals": [
//     {
//       "type": "steps",
//       "label": "Daily steps goal",
//       "currentValue": 5000,
//       "targetValue": 8000,
//       "unit": "steps",
//       "status": "behind"
//     },
//     {
//       "type": "weight",
//       "label": "Weight goal",
//       "currentValue": 80,
//       "targetValue": 75,
//       "unit": "kg",
//       "status": "on_track"
//     }
//   ]
// }
// `;

//     const perplexityResponse = await axios.post(
//       "https://api.perplexity.ai/",
//       {
//         model: PERPLEXITY_MODEL,
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a medical assistant that returns compact, safe JSON only. No markdown, no explanation, no extra text.",
//           },
//           { role: "user", content: prompt },
//         ],
//         temperature: 0.3,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 30000,
//       }
//     );

//     const raw = perplexityResponse.data?.choices?.[0]?.message?.content || "{}";
//     let parsed;

//     try {
//       parsed = JSON.parse(raw);
//     } catch (e) {
//       return res.status(500).json({
//         message: "Failed to parse AI response as JSON",
//         raw,
//       });
//     }

//     return res.json({
//       patientFriendlyText: parsed.patientFriendlyText || {},
//       goals: parsed.goals || [],
//     });
//   } catch (err) {
//     console.error("Error generating AI draft:", err.message);
//     return res.status(500).json({ message: "Failed to generate AI draft" });
//   }
// };

// backend/src/controllers/carePlanController.js
// const CarePlan = require("../models/CarePlan");
// const { generateCarePlanDraft } = require("../services/aiCarePlanService");

// // POST /api/care-plans/ai-draft
// exports.generateAiDraft = async (req, res) => {
//   try {
//     const { patient, googleFitSummary, doctorNotes } = req.body;

//     if (!patient || !googleFitSummary) {
//       return res
//         .status(400)
//         .json({ message: "Missing patient or googleFitSummary" });
//     }

//     // 1) Build the structured payload expected by aiCarePlanService
//     const metrics = {
//       totalStepsLast14Days: googleFitSummary.totalStepsLast14Days,
//       averageHeartRate: googleFitSummary.averageHeartRate,
//       latestWeight: googleFitSummary.latestWeight,
//       hasSleepData: !!googleFitSummary.sleepText,
//       hasDistanceData: !!googleFitSummary.distanceText,
//     };

//     const clinicalContext = {
//       visitReason: googleFitSummary.visitReason || "",
//       doctorNotes: doctorNotes || "",
//     };

//     const aiResult = await generateCarePlanDraft({
//       patient: {
//         fullName: patient.fullName,
//         age: patient.age,
//         gender: patient.gender,
//         conditions: patient.conditions || [],
//         currentMeds: patient.medications || [],
//       },
//       metrics,
//       clinicalContext,
//     });

//     // aiResult has:
//     // {
//     //   summaryForDoctor,
//     //   patientFriendlyText,   // long letter
//     //   sections: { keyFindings, activityPlan, weightNutrition, monitoringAndAlerts }
//     // }

//     // 2) Map aiCarePlanService output into your existing shape
//     const mappedPatientFriendlyText = {
//       overview:
//         aiResult.sections?.keyFindings ||
//         aiResult.summaryForDoctor ||
//         "",
//       activity: aiResult.sections?.activityPlan || "",
//       weight: aiResult.sections?.weightNutrition || "",
//       sleep: aiResult.sections?.monitoringAndAlerts || "",
//       // simple follow-up line derived from monitoring section
//       followUp:
//         clinicalContext.visitReason ||
//         "Please follow up with your doctor if symptoms change or you have concerns.",
//     };

//     // 3) Optionally derive simple goals from metrics
//     const goals = [];

//     if (metrics.totalStepsLast14Days) {
//       const avgSteps = Math.round(metrics.totalStepsLast14Days / 14);
//       const targetSteps = Math.max(avgSteps + 1500, 6000); // example rule
//       goals.push({
//         type: "steps",
//         label: "Daily steps goal",
//         currentValue: avgSteps,
//         targetValue: targetSteps,
//         unit: "steps",
//         status: avgSteps >= targetSteps ? "on_track" : "behind",
//       });
//     }

//     if (metrics.latestWeight) {
//       goals.push({
//         type: "weight",
//         label: "Weight target",
//         currentValue: metrics.latestWeight,
//         targetValue: metrics.latestWeight, // you can adjust logic here
//         unit: "kg",
//         status: "on_track",
//       });
//     }

//     return res.json({
//       patientFriendlyText: mappedPatientFriendlyText,
//       goals,
//     });
//   } catch (err) {
//     console.error("Error generating AI draft:", err.message);
//     return res.status(500).json({ message: "Failed to generate AI draft" });
//   }
// };

// POST /api/care-plans/send
// exports.sendCarePlan = async (req, res) => {
//   try {
//     const {
//       patientId,
//       doctorId,
//       source = "google_fit",
//       summaryContext,
//       patientFriendlyText,
//       goals,
//     } = req.body;

//     if (!patientId || !doctorId || !patientFriendlyText) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const carePlan = new CarePlan({
//       patient: patientId,
//       doctor: doctorId,
//       source,
//       summaryContext: summaryContext || {},
//       patientFriendlyText,
//       goals: goals || [],
//       status: "sent",
//     });

//     await carePlan.save();

//     return res.status(201).json({
//       message: "Care plan sent to patient",
//       carePlan,
//     });
//   } catch (err) {
//     console.error("Error sending care plan:", err.message);
//     return res.status(500).json({ message: "Failed to send care plan" });
//   }
// };

// // GET /api/care-plans/mine/latest  (for patient)
// exports.getMyLatestCarePlan = async (req, res) => {
//   try {
//     console.log("Fetching latest care plan for patient", req.user);
//     const patientId = req.user && req.user.id;

//     if (!patientId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const carePlan = await CarePlan.findOne({ patient: patientId, status: "sent" })
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!carePlan) {
//       return res.status(404).json({ message: "No care plan found" });
//     }

//     return res.json({ carePlan });
//   } catch (err) {
//     console.error("Error fetching latest care plan:", err.message);
//     return res.status(500).json({ message: "Failed to fetch care plan" });
//   }
// };
// exports.sendCarePlan = async (req, res) => {
//   try {
//     const {
//       patientId,
//       doctorId,
//       source = "google_fit",
//       summaryContext,
//       patientFriendlyText,
//       goals,
//     } = req.body;

//     console.log("Received care plan data:", { patientId, doctorId, source, summaryContext, patientFriendlyText, goals });
//     if (!patientId || !doctorId || !patientFriendlyText) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const carePlan = new CarePlan({
//       patient: patientId,
//       doctor: doctorId,
//       source,
//       summaryContext: summaryContext || {},
//       patientFriendlyText: {
//         overview: patientFriendlyText.overview || "",
//         activity: patientFriendlyText.activity || "",
//         weight: patientFriendlyText.weight || "",
//         sleep: patientFriendlyText.sleep || "",
//         followUp: patientFriendlyText.followUp || "",
//       },
//       goals: Array.isArray(goals) ? goals : [],
//       status: "sent",
//     });

//     await carePlan.save();

//     return res.status(201).json({
//       message: "Care plan sent to patient",
//       carePlan,
//     });
//   } catch (err) {
//     console.error("Error sending care plan:", err.message);
//     return res.status(500).json({ message: "Failed to send care plan" });
//   }
// };
// POST /api/care-plans/send
exports.sendCarePlan = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      source = "google_fit",
      summaryContext,
      patientFriendlyText,
      goals,
      fullLetter, // NEW
    } = req.body;

    if (!patientId || !doctorId || !patientFriendlyText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const carePlan = new CarePlan({
      patient: patientId,
      doctor: doctorId,
      source,
      summaryContext: summaryContext || {},
      fullLetter: fullLetter || "",   // save whole text
      patientFriendlyText: {
        overview: patientFriendlyText.overview || "",
        activity: patientFriendlyText.activity || "",
        weight: patientFriendlyText.weight || "",
        sleep: patientFriendlyText.sleep || "",
        followUp: patientFriendlyText.followUp || "",
      },
      goals: Array.isArray(goals) ? goals : [],
      status: "sent",
    });

    await carePlan.save();

    return res.status(201).json({
      message: "Care plan sent to patient",
      carePlan,
    });
  } catch (err) {
    console.error("Error sending care plan:", err.message);
    return res.status(500).json({ message: "Failed to send care plan" });
  }
};

// GET /api/care-plans/mine/latest  (for patient quick access)
exports.getMyLatestCarePlan = async (req, res) => {
  try {
    console.log("Fetching latest care plan for patient", req.user);
    const patientId = req.user && (req.user.id || req.user._id);

    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const carePlan = await CarePlan.findOne({
      patient: patientId,
      status: "sent",
    })
      .sort({ createdAt: -1 })
      .populate("doctor", "fullName email")
      .lean();

    if (!carePlan) {
      return res.status(404).json({ message: "No care plan found" });
    }

    return res.json({ carePlan });
  } catch (err) {
    console.error("Error fetching latest care plan:", err.message);
    return res.status(500).json({ message: "Failed to fetch care plan" });
  }
};

// GET /api/care-plans/mine  (for full list + filter by doctor)
exports.getMyCarePlans = async (req, res) => {
  try {
    const patientId = req.user && (req.user.id || req.user._id);

    console.log("Fetching care plans for patient", req.user);   
    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const plans = await CarePlan.find({
      patient: patientId,
      status: "sent",
    })
      .sort({ createdAt: -1 })
      .populate("doctor", "fullName email")
      .lean();

    return res.json({ plans });
  } catch (err) {
    console.error("Error fetching care plans:", err.message);
    return res.status(500).json({ message: "Failed to fetch care plans" });
  }
};