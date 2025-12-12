// src/services/aiCarePlanService.js
const OpenAI = require("openai");

// Perplexity-compatible client
const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

async function generateCarePlanDraft({ patient, metrics, clinicalContext }) {
  const systemPrompt =
    "You are an assistant helping doctors draft short, patient-friendly care plans. " +
    "You MUST NOT change medications or prescribe new drugs. " +
    "Only describe lifestyle, monitoring advice, and follow-up recommendations. " +
    "Write clearly at about 8th-grade reading level.";

  const userPrompt = `
Create a concise care plan for this patient.

PATIENT:
- Name: ${patient.fullName || "N/A"}
- Age: ${patient.age || "N/A"}
- Gender: ${patient.gender || "N/A"}
- Conditions: ${(patient.conditions || []).join(", ") || "None listed"}
- Current medications: ${(patient.currentMeds || []).join(", ") || "None listed"}

RECENT METRICS (from wearables / Google Fit):
- Total steps (last 14 days): ${metrics.totalStepsLast14Days ?? "N/A"}
- Average heart rate: ${metrics.averageHeartRate ?? "N/A"}
- Latest weight: ${metrics.latestWeight ?? "N/A"} kg
- Sleep data available: ${metrics.hasSleepData ? "Yes" : "No"}
- Distance data available: ${metrics.hasDistanceData ? "Yes" : "No"}

CLINICAL CONTEXT:
- Visit reason: ${clinicalContext.visitReason || "N/A"}
- Doctor notes: ${clinicalContext.doctorNotes || "N/A"}

REQUIRED OUTPUT (JSON ONLY):
Return STRICTLY valid JSON with this structure (no extra keys, no comments):

{
  "summaryForDoctor": "1-2 sentence quick summary for the doctor to review.",
  "patientFriendlyText": "Short letter in plain language addressed to the patient, 200-300 words max.",
  "sections": {
    "keyFindings": "Main findings related to activity, weight, heart rate, sleep, etc.",
    "activityPlan": "Specific, realistic daily/weekly activity goals.",
    "weightNutrition": "Simple suggestions related to diet and weight management.",
    "monitoringAndAlerts": "What to monitor and clear 'red flag' symptoms that should trigger contacting the doctor or emergency care."
  }
}
  `.trim();

  const response = await client.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty AI response");
  }

  let json;
  try {
    json = JSON.parse(content);
  } catch (e) {
    throw new Error("AI did not return valid JSON");
  }

  return json;
}

module.exports = { generateCarePlanDraft };
