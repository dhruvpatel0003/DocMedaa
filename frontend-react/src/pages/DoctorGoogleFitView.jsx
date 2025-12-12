// src/pages/DoctorGoogleFitView.jsx
import React, { useEffect, useState } from "react";
import ApiService from "../services/ApiService";
import DashboardLayout from "../components/DashboardLayout";
import { AppConstants } from "../constants/AppConstants";
import { useAuth } from "../context/AuthContext";

function DoctorGoogleFitView() {
  const theme = AppConstants;
  const token = localStorage.getItem("token");
  const user = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI care plan state
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlanError, setAiPlanError] = useState("");
  const [aiPlan, setAiPlan] = useState(null);
  const [aiPlanText, setAiPlanText] = useState("");

  const [patientFriendlyText, setPatientFriendlyText] = useState({
    overview: "",
    activity: "",
    weight: "",
    sleep: "",
    followUp: "",
  });
  const [goals, setGoals] = useState([]);
  // const [sendLoading, setSendLoading] = useState(false);
  const [sendMessage, setSendMessage] = useState("");

  // fetch list of patients who shared data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await ApiService.request(
          "/health-tracker/shared-patients",
          "GET",
          null,
          token
        );
        const list = Array.isArray(res.data) ? res.data : [];
        setPatients(list);
      } catch {
        setPatients([]);
      }
    };
    fetchPatients();
  }, [token]);

  const resetAiState = () => {
    setAiPlan(null);
    setAiPlanText("");
    setAiPlanError("");
    setPatientFriendlyText({
      overview: "",
      activity: "",
      weight: "",
      sleep: "",
      followUp: "",
    });
    setGoals([]);
    setSendMessage("");
  };

  const loadSummary = async (patientId) => {
    if (!patientId) {
      setSummary(null);
      return;
    }
    setLoading(true);
    setError("");
    resetAiState();

    try {
      const res = await ApiService.request(
        `/health-tracker/shared/${patientId}`,
        "GET",
        null,
        token
      );
      setSummary(res.data || null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    setSelectedPatient(
      id ? patients.find((p) => String(p._id) === String(id)) || null : null
    );
    resetAiState();
    if (id) {
      loadSummary(id);
    } else {
      setSummary(null);
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedPatientId || !summary) return;

    setAiPlanLoading(true);
    setAiPlanError("");
    setAiPlan(null);
    setAiPlanText("");
    setSendMessage("");

    try {
      const body = {
        patient: {
          fullName: selectedPatient?.fullName,
          age: selectedPatient?.age,
          gender: selectedPatient?.gender,
          conditions: selectedPatient?.conditions || [],
          currentMeds: selectedPatient?.currentMeds || [],
        },
        metrics: {
          totalStepsLast14Days: summary.totalStepsLast14Days,
          averageHeartRate: summary.averageHeartRate,
          latestWeight: summary.latestWeight,
          hasSleepData: summary.hasSleepData,
          hasDistanceData: summary.hasDistanceData,
        },
        clinicalContext: {
          visitReason: "Follow-up review based on wearable data",
          doctorNotes:
            "Use friendly language; this will be reviewed and edited by the doctor before sending.",
        },
      };

      const res = await ApiService.request(
        "/care-plans/ai-draft",
        "POST",
        body,
        token
      );

      const pf = res.data?.patientFriendlyText || {};
      const generatedGoals = res.data?.goals || [];
      const rawPlan = res.data?.plan || null;

      setAiPlan(rawPlan);
      setPatientFriendlyText({
        overview: pf.overview || "",
        activity: pf.activity || "",
        weight: pf.weight || "",
        sleep: pf.sleep || "",
        followUp: pf.followUp || "",
      });
      setGoals(generatedGoals);

      setAiPlanText(
        rawPlan?.patientFriendlyText ||
          rawPlan?.sections?.keyFindings ||
          pf.overview ||
          "AI draft generated."
      );
    } catch (e) {
      setAiPlanError(
        e.response?.data?.message || "Failed to generate AI care plan draft."
      );
    } finally {
      setAiPlanLoading(false);
    }
  };

  // const handleSendToPatient = async () => {
  //   if (!selectedPatientId || !summary) return;

  //   try {
  //     //setSendLoading(true);
  //     setSendMessage("");

  //     const doctorId = user.user.userID;

  //     const summaryContext = {
  //       stepsSummary: `Total steps last 14 days: ${
  //         summary.totalStepsLast14Days ?? "N/A"
  //       }`,
  //       heartRateSummary: summary.averageHeartRate
  //         ? `Average heart rate: ${summary.averageHeartRate} bpm`
  //         : "No heart rate data.",
  //       weightSummary: summary.latestWeight
  //         ? `Latest weight: ${summary.latestWeight} kg`
  //         : "No weight data.",
  //       sleepSummary: summary.hasSleepData
  //         ? "Sleep data available."
  //         : "No sleep data.",
  //     };
  //     console.log("summaryContext", doctorId, user);
  //     const body = {
  //       patientId: selectedPatientId,
  //       doctorId,
  //       source: "google_fit",
  //       summaryContext,
  //       patientFriendlyText,
  //       goals,
  //     };

  //     await ApiService.request("/care-plans/send", "POST", body, token);

  //     setSendMessage("Care plan sent to patient successfully.");
  //   } catch (e) {
  //     setSendMessage(
  //       e.response?.data?.message || "Failed to send care plan to patient."
  //     );
  //   } finally {
  //     // setSendLoading(false);
  //   }
  // };
const handleSendToPatient = async () => {
  if (!selectedPatientId || !summary) return;

  try {
    // setSendLoading(true);
    setSendMessage("");

    const doctorId = user.user.userID;

    const summaryContext = {
      stepsSummary: `Total steps last 14 days: ${
        summary.totalStepsLast14Days ?? "N/A"
      }`,
      heartRateSummary: summary.averageHeartRate
        ? `Average heart rate: ${summary.averageHeartRate} bpm`
        : "No heart rate data.",
      weightSummary: summary.latestWeight
        ? `Latest weight: ${summary.latestWeight} kg`
        : "No weight data.",
      sleepSummary: summary.hasSleepData
        ? "Sleep data available."
        : "No sleep data.",
    };

    const body = {
      patientId: selectedPatientId,
      doctorId,
      source: "google_fit",
      summaryContext,
      patientFriendlyText,
      goals,
      fullLetter: aiPlanText,  // << send the whole text here
    };

    await ApiService.request("/care-plans/send", "POST", body, token);

    setSendMessage("Care plan sent to patient successfully.");
  } catch (e) {
    setSendMessage(
      e.response?.data?.message || "Failed to send care plan to patient."
    );
  } finally {
    // setSendLoading(false);
  }
};

  return (
    <DashboardLayout>
      <div
        style={{
          padding: theme.paddingLarge,
          fontFamily: theme.fontFamily,
          backgroundColor: theme.backgroundColor,
          minHeight: "100vh",
        }}
      >
        <div style={{ marginBottom: theme.mediumSizeBoxHeight }}>
          <a
            href="/dashboard"
            style={{
              color: theme.themeColor,
              textDecoration: "none",
              fontSize: theme.fontMedium,
            }}
          >
            ← Back to Dashboard
          </a>
        </div>

        <div style={{ marginBottom: theme.mediumSizeBoxHeight }}>
          <h2
            style={{
              margin: 0,
              color: theme.textPrimaryColor,
              fontSize: theme.fontTitle + 4,
              fontWeight: theme.fontWeightBold,
            }}
          >
            Patient Wearable Data
          </h2>
          <p
            style={{
              marginTop: 4,
              color: theme.textSecondaryColor,
              fontSize: theme.fontMedium,
            }}
          >
            View Google Fit summaries shared with you by your patients and
            generate an AI-assisted care plan draft.
          </p>
        </div>

        {/* Select patient */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: theme.borderRadiusMedium,
            border: `1px solid ${theme.borderColor}`,
            padding: theme.paddingMedium,
            marginBottom: theme.largeSizeBoxHeight,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: theme.fontLarge,
              color: theme.textPrimaryColor,
            }}
          >
            Select patient
          </h3>
          <p
            style={{
              marginTop: 4,
              fontSize: theme.fontSmall,
              color: theme.textSecondaryColor,
            }}
          >
            Choose a patient to view their latest shared health summary.
          </p>

          <select
            value={selectedPatientId}
            onChange={handlePatientChange}
            style={{
              marginTop: 10,
              padding: "8px 10px",
              borderRadius: theme.borderRadiusSmall,
              border: `1px solid ${theme.borderColor}`,
              minWidth: 260,
              fontSize: theme.fontSmall,
            }}
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.fullName} {p.age ? `(${p.age} yrs)` : ""}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div
            style={{
              padding: theme.paddingMedium,
              borderRadius: theme.borderRadiusMedium,
              backgroundColor: "#fff",
              border: `1px solid ${theme.borderColor}`,
            }}
          >
            Loading shared summary...
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: theme.paddingMedium,
              borderRadius: theme.borderRadiusMedium,
              backgroundColor: "#fff5f5",
              border: `1px solid ${theme.errorColor}`,
              color: theme.errorColor,
              marginBottom: theme.mediumSizeBoxHeight,
            }}
          >
            Error: {error}
          </div>
        )}

        {summary && !loading && (
          <>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: theme.borderRadiusMedium,
                border: `1px solid ${theme.borderColor}`,
                padding: theme.paddingMedium,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: theme.fontLarge,
                  color: theme.textPrimaryColor,
                }}
              >
                Latest shared summary
              </h3>
              <p
                style={{
                  marginTop: 4,
                  fontSize: theme.fontSmall,
                  color: theme.textSecondaryColor,
                }}
              >
                Shared on {new Date(summary.sharedAt).toLocaleString()}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: theme.paddingMedium,
                  marginTop: theme.paddingMedium,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: theme.fontSmall,
                      color: theme.textSecondaryColor,
                      marginBottom: 4,
                    }}
                  >
                    Steps (last 14 days)
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: theme.fontWeightBold,
                      color: theme.themeColor,
                    }}
                  >
                    {summary.totalStepsLast14Days?.toLocaleString() || 0}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: theme.fontSmall,
                      color: theme.textSecondaryColor,
                      marginBottom: 4,
                    }}
                  >
                    Average heart rate
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: theme.fontWeightBold,
                      color: theme.themeColor,
                    }}
                  >
                    {summary.averageHeartRate
                      ? `${summary.averageHeartRate} bpm`
                      : "No data"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: theme.fontSmall,
                      color: theme.textSecondaryColor,
                      marginBottom: 4,
                    }}
                  >
                    Latest weight
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: theme.fontWeightBold,
                      color: theme.themeColor,
                    }}
                  >
                    {summary.latestWeight
                      ? `${summary.latestWeight} kg`
                      : "No data"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: theme.paddingMedium }}>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: theme.fontSmall,
                    color: theme.textSecondaryColor,
                  }}
                >
                  <li>
                    Sleep data shared:{" "}
                    <strong>{summary.hasSleepData ? "Yes" : "No"}</strong>
                  </li>
                  <li>
                    Distance data shared:{" "}
                    <strong>{summary.hasDistanceData ? "Yes" : "No"}</strong>
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: theme.paddingMedium }}>
                <button
                  onClick={handleGeneratePlan}
                  disabled={aiPlanLoading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: theme.themeColor,
                    border: "none",
                    borderRadius: theme.borderRadiusSmall,
                    color: "#fff",
                    fontSize: theme.fontSmall,
                    fontWeight: theme.fontWeightBold,
                    cursor: aiPlanLoading ? "default" : "pointer",
                    opacity: aiPlanLoading ? 0.7 : 1,
                  }}
                >
                  {aiPlanLoading
                    ? "Generating care plan..."
                    : "Generate AI care plan draft"}
                </button>
              </div>
            </div>

            {aiPlanError && (
              <div
                style={{
                  marginTop: theme.paddingMedium,
                  padding: theme.paddingMedium,
                  borderRadius: theme.borderRadiusMedium,
                  backgroundColor: "#fff5f5",
                  border: `1px solid ${theme.errorColor}`,
                  color: theme.errorColor,
                }}
              >
                {aiPlanError}
              </div>
            )}

            {aiPlan && (
              <div
                style={{
                  marginTop: theme.largeSizeBoxHeight,
                  backgroundColor: "#fff",
                  borderRadius: theme.borderRadiusMedium,
                  border: `1px solid ${theme.borderColor}`,
                  padding: theme.paddingMedium,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: theme.fontLarge,
                    color: theme.textPrimaryColor,
                  }}
                >
                  AI care plan draft (editable)
                </h3>
                <p
                  style={{
                    marginTop: 4,
                    fontSize: theme.fontSmall,
                    color: theme.textSecondaryColor,
                  }}
                >
                  Review and edit before sending to the patient. This is a
                  draft, not a final prescription.
                </p>

                <textarea
                  value={aiPlanText}
                  onChange={(e) => setAiPlanText(e.target.value)}
                  rows={10}
                  style={{
                    marginTop: theme.paddingSmall,
                    width: "100%",
                    padding: "10px",
                    borderRadius: theme.borderRadiusSmall,
                    border: `1px solid ${theme.borderColor}`,
                    fontFamily: theme.fontFamily,
                    fontSize: theme.fontSmall,
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    marginTop: theme.paddingMedium,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  {sendMessage && (
                    <span
                      style={{
                        fontSize: theme.fontSmall,
                        color: sendMessage.includes("successfully")
                          ? "#15803d"
                          : theme.errorColor,
                      }}
                    >
                      {sendMessage}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSendToPatient}
                    // disabled={
                    //   sendLoading || !patientFriendlyText.overview?.trim()
                    // }
                    style={{
                      padding: "8px 16px",
                      backgroundColor:
                      //   sendLoading || !patientFriendlyText.overview?.trim()
                          // ? 
                          "#042f7bff",
                      //     : "#16a34a",
                      border: "none",
                      borderRadius: theme.borderRadiusSmall,
                      color: "#fff",
                      fontSize: theme.fontSmall,
                      fontWeight: theme.fontWeightBold,
                      // cursor:
                      //   sendLoading || !patientFriendlyText.overview?.trim()
                      //     ? "not-allowed"
                      //     : "pointer",
                    }}
                  >
                    {"Send care plan to patient"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// export dezfault DoctorGoogleFitView;




// // src/pages/DoctorGoogleFitView.jsx
// import React, { useEffect, useState } from "react";
// import ApiService from "../services/ApiService";
// import DashboardLayout from "../components/DashboardLayout";
// import { AppConstants } from "../constants/AppConstants";

// function DoctorGoogleFitView() {
//   const theme = AppConstants;
//   const token = localStorage.getItem("token");

//   const [patients, setPatients] = useState([]);
//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [selectedPatient, setSelectedPatient] = useState(null);

//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // AI care plan state
//   const [aiPlanLoading, setAiPlanLoading] = useState(false);
//   const [aiPlanError, setAiPlanError] = useState("");
//   const [aiPlan, setAiPlan] = useState(null);
//   const [aiPlanText, setAiPlanText] = useState("");

//   const [patientFriendlyText, setPatientFriendlyText] = useState({
//     overview: "",
//     activity: "",
//     weight: "",
//     sleep: "",
//     followUp: "",
//   });
//   const [goals, setGoals] = useState([]);
//   const [sendLoading, setSendLoading] = useState(false);
//   const [sendMessage, setSendMessage] = useState("");

//   // reset when patient changes
//   setAiPlan(null);
//   setAiPlanText("");
//   setAiPlanError("");
//   setPatientFriendlyText({
//     overview: "",
//     activity: "",
//     weight: "",
//     sleep: "",
//     followUp: "",
//   });
//   setGoals([]);
//   setSendMessage("");

//   // fetch list of patients who shared data
//   useEffect(() => {
//     const fetchPatients = async () => {
//       try {
//         const res = await ApiService.request(
//           "/health-tracker/shared-patients",
//           "GET",
//           null,
//           token
//         );
//         const list = Array.isArray(res.data) ? res.data : [];
//         setPatients(list);
//       } catch {
//         setPatients([]);
//       }
//     };
//     fetchPatients();
//   }, [token]);

//   const loadSummary = async (patientId) => {
//     if (!patientId) {
//       setSummary(null);
//       return;
//     }
//     setLoading(true);
//     setError("");
//     // reset AI plan when patient changes
//     setAiPlan(null);
//     setAiPlanText("");
//     setAiPlanError("");

//     try {
//       const res = await ApiService.request(
//         `/health-tracker/shared/${patientId}`,
//         "GET",
//         null,
//         token
//       );
//       setSummary(res.data || null);
//     } catch (e) {
//       setError(e.response?.data?.error || e.message);
//       setSummary(null);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleSendToPatient = async () => {
//     if (!selectedPatientId) return;

//     try {
//       setSendLoading(true);
//       setSendMessage("");

//       const doctorId = AppConstants.currentUserId; // or from auth context

//       const summaryContext = {
//         stepsSummary: `Total steps last 14 days: ${
//           summary.totalStepsLast14Days ?? "N/A"
//         }`,
//         heartRateSummary: summary.averageHeartRate
//           ? `Average heart rate: ${summary.averageHeartRate} bpm`
//           : "No heart rate data.",
//         weightSummary: summary.latestWeight
//           ? `Latest weight: ${summary.latestWeight} kg`
//           : "No weight data.",
//         sleepSummary: summary.hasSleepData
//           ? "Sleep data available."
//           : "No sleep data.",
//       };

//       const body = {
//         patientId: selectedPatientId,
//         doctorId,
//         source: "google_fit",
//         summaryContext,
//         patientFriendlyText,
//         goals,
//       };

//       const res = await ApiService.request(
//         "/care-plans/send",
//         "POST",
//         body,
//         token
//       );

//       setSendMessage("Care plan sent to patient successfully.");
//     } catch (e) {
//       setSendMessage(
//         e.response?.data?.message || "Failed to send care plan to patient."
//       );
//     } finally {
//       setSendLoading(false);
//     }
//   };

//   const handlePatientChange = (e) => {
//     const id = e.target.value;
//     setSelectedPatientId(id);
//     setSelectedPatient(
//       id ? patients.find((p) => String(p._id) === String(id)) || null : null
//     );
//     if (id) {
//       loadSummary(id);
//     } else {
//       setSummary(null);
//       setAiPlan(null);
//       setAiPlanText("");
//       setAiPlanError("");
//     }
//   };

//   // const handleGeneratePlan = async () => {
//   //   if (!selectedPatientId || !summary) return;

//   //   setAiPlanLoading(true);
//   //   setAiPlanError("");
//   //   setAiPlan(null);
//   //   setAiPlanText("");

//   //   try {
//   //     const body = {
//   //       patient: {
//   //         fullName: selectedPatient?.fullName,
//   //         age: selectedPatient?.age,
//   //         gender: selectedPatient?.gender,
//   //         conditions: selectedPatient?.conditions || [],
//   //         currentMeds: selectedPatient?.currentMeds || [],
//   //       },
//   //       metrics: {
//   //         totalStepsLast14Days: summary.totalStepsLast14Days,
//   //         averageHeartRate: summary.averageHeartRate,
//   //         latestWeight: summary.latestWeight,
//   //         hasSleepData: summary.hasSleepData,
//   //         hasDistanceData: summary.hasDistanceData,
//   //       },
//   //       clinicalContext: {
//   //         visitReason: "Follow-up review based on wearable data",
//   //         doctorNotes:
//   //           "Use friendly language; this will be reviewed and edited by the doctor before sending.",
//   //       },
//   //     };

//   //     const res = await ApiService.request(
//   //       "/care-plans/ai-draft",
//   //       "POST",
//   //       body,
//   //       token
//   //     );

//   //     const plan = res.data?.plan || null;
//   //     setAiPlan(plan);
//   //     setAiPlanText(
//   //       plan?.patientFriendlyText ||
//   //         plan?.sections?.keyFindings ||
//   //         "AI draft could not be parsed."
//   //     );
//   //   } catch (e) {
//   //     setAiPlanError(
//   //       e.response?.data?.error || "Failed to generate AI care plan draft."
//   //     );
//   //   } finally {
//   //     setAiPlanLoading(false);
//   //   }
//   // };
//   const handleGeneratePlan = async () => {
//     if (!selectedPatientId || !summary) return;

//     setAiPlanLoading(true);
//     setAiPlanError("");
//     setAiPlan(null);
//     setAiPlanText("");
//     setSendMessage("");

//     try {
//       const body = {
//         patient: {
//           fullName: selectedPatient?.fullName,
//           age: selectedPatient?.age,
//           gender: selectedPatient?.gender,
//           conditions: selectedPatient?.conditions || [],
//           currentMeds: selectedPatient?.currentMeds || [],
//         },
//         metrics: {
//           totalStepsLast14Days: summary.totalStepsLast14Days,
//           averageHeartRate: summary.averageHeartRate,
//           latestWeight: summary.latestWeight,
//           hasSleepData: summary.hasSleepData,
//           hasDistanceData: summary.hasDistanceData,
//         },
//         clinicalContext: {
//           visitReason: "Follow-up review based on wearable data",
//           doctorNotes:
//             "Use friendly language; this will be reviewed and edited by the doctor before sending.",
//         },
//       };

//       const res = await ApiService.request(
//         "/care-plans/ai-draft",
//         "POST",
//         body,
//         token
//       );

//       // here controller should return { patientFriendlyText, goals, rawPlan? }
//       const pf = res.data?.patientFriendlyText || {};
//       const generatedGoals = res.data?.goals || [];
//       const rawPlan = res.data?.plan || null;

//       setAiPlan(rawPlan); // optional, if you still want raw AI JSON
//       setPatientFriendlyText({
//         overview: pf.overview || "",
//         activity: pf.activity || "",
//         weight: pf.weight || "",
//         sleep: pf.sleep || "",
//         followUp: pf.followUp || "",
//       });
//       setGoals(generatedGoals);

//       // keep textarea as the long “letter” if you like:
//       setAiPlanText(
//         rawPlan?.patientFriendlyText ||
//           rawPlan?.sections?.keyFindings ||
//           pf.overview ||
//           "AI draft generated."
//       );
//     } catch (e) {
//       setAiPlanError(
//         e.response?.data?.message || "Failed to generate AI care plan draft."
//       );
//     } finally {
//       setAiPlanLoading(false);
//     }
//   };
//   return (
//     <DashboardLayout>
//       <div
//         style={{
//           padding: theme.paddingLarge,
//           fontFamily: theme.fontFamily,
//           backgroundColor: theme.backgroundColor,
//           minHeight: "100vh",
//         }}
//       >
//         <div style={{ marginBottom: theme.mediumSizeBoxHeight }}>
//           <a
//             href="/dashboard"
//             style={{
//               color: theme.themeColor,
//               textDecoration: "none",
//               fontSize: theme.fontMedium,
//             }}
//           >
//             ← Back to Dashboard
//           </a>
//         </div>
//         <div style={{ marginBottom: theme.mediumSizeBoxHeight }}>
//           <h2
//             style={{
//               margin: 0,
//               color: theme.textPrimaryColor,
//               fontSize: theme.fontTitle + 4,
//               fontWeight: theme.fontWeightBold,
//             }}
//           >
//             Patient Wearable Data
//           </h2>
//           <p
//             style={{
//               marginTop: 4,
//               color: theme.textSecondaryColor,
//               fontSize: theme.fontMedium,
//             }}
//           >
//             View Google Fit summaries shared with you by your patients and
//             generate an AI-assisted care plan draft.
//           </p>
//         </div>

//         <div
//           style={{
//             backgroundColor: "#fff",
//             borderRadius: theme.borderRadiusMedium,
//             border: `1px solid ${theme.borderColor}`,
//             padding: theme.paddingMedium,
//             marginBottom: theme.largeSizeBoxHeight,
//           }}
//         >
//           <h3
//             style={{
//               margin: 0,
//               fontSize: theme.fontLarge,
//               color: theme.textPrimaryColor,
//             }}
//           >
//             Select patient
//           </h3>
//           <p
//             style={{
//               marginTop: 4,
//               fontSize: theme.fontSmall,
//               color: theme.textSecondaryColor,
//             }}
//           >
//             Choose a patient to view their latest shared health summary.
//           </p>

//           <select
//             value={selectedPatientId}
//             onChange={handlePatientChange}
//             style={{
//               marginTop: 10,
//               padding: "8px 10px",
//               borderRadius: theme.borderRadiusSmall,
//               border: `1px solid ${theme.borderColor}`,
//               minWidth: 260,
//               fontSize: theme.fontSmall,
//             }}
//           >
//             <option value="">Select patient</option>
//             {patients.map((p) => (
//               <option key={p._id} value={p._id}>
//                 {p.fullName} {p.age ? `(${p.age} yrs)` : ""}
//               </option>
//             ))}
//           </select>
//         </div>

//         {loading && (
//           <div
//             style={{
//               padding: theme.paddingMedium,
//               borderRadius: theme.borderRadiusMedium,
//               backgroundColor: "#fff",
//               border: `1px solid ${theme.borderColor}`,
//             }}
//           >
//             Loading shared summary...
//           </div>
//         )}

//         {error && !loading && (
//           <div
//             style={{
//               padding: theme.paddingMedium,
//               borderRadius: theme.borderRadiusMedium,
//               backgroundColor: "#fff5f5",
//               border: `1px solid ${theme.errorColor}`,
//               color: theme.errorColor,
//               marginBottom: theme.mediumSizeBoxHeight,
//             }}
//           >
//             Error: {error}
//           </div>
//         )}

//         {summary && !loading && (
//           <>
//             <div
//               style={{
//                 backgroundColor: "#fff",
//                 borderRadius: theme.borderRadiusMedium,
//                 border: `1px solid ${theme.borderColor}`,
//                 padding: theme.paddingMedium,
//               }}
//             >
//               <h3
//                 style={{
//                   margin: 0,
//                   fontSize: theme.fontLarge,
//                   color: theme.textPrimaryColor,
//                 }}
//               >
//                 Latest shared summary
//               </h3>
//               <p
//                 style={{
//                   marginTop: 4,
//                   fontSize: theme.fontSmall,
//                   color: theme.textSecondaryColor,
//                 }}
//               >
//                 Shared on {new Date(summary.sharedAt).toLocaleString()}
//               </p>

//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//                   gap: theme.paddingMedium,
//                   marginTop: theme.paddingMedium,
//                 }}
//               >
//                 <div>
//                   <div
//                     style={{
//                       fontSize: theme.fontSmall,
//                       color: theme.textSecondaryColor,
//                       marginBottom: 4,
//                     }}
//                   >
//                     Steps (last 14 days)
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 22,
//                       fontWeight: theme.fontWeightBold,
//                       color: theme.themeColor,
//                     }}
//                   >
//                     {summary.totalStepsLast14Days?.toLocaleString() || 0}
//                   </div>
//                 </div>

//                 <div>
//                   <div
//                     style={{
//                       fontSize: theme.fontSmall,
//                       color: theme.textSecondaryColor,
//                       marginBottom: 4,
//                     }}
//                   >
//                     Average heart rate
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 22,
//                       fontWeight: theme.fontWeightBold,
//                       color: theme.themeColor,
//                     }}
//                   >
//                     {summary.averageHeartRate
//                       ? `${summary.averageHeartRate} bpm`
//                       : "No data"}
//                   </div>
//                 </div>

//                 <div>
//                   <div
//                     style={{
//                       fontSize: theme.fontSmall,
//                       color: theme.textSecondaryColor,
//                       marginBottom: 4,
//                     }}
//                   >
//                     Latest weight
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 22,
//                       fontWeight: theme.fontWeightBold,
//                       color: theme.themeColor,
//                     }}
//                   >
//                     {summary.latestWeight
//                       ? `${summary.latestWeight} kg`
//                       : "No data"}
//                   </div>
//                 </div>
//               </div>

//               <div style={{ marginTop: theme.paddingMedium }}>
//                 <ul
//                   style={{
//                     listStyle: "none",
//                     padding: 0,
//                     margin: 0,
//                     fontSize: theme.fontSmall,
//                     color: theme.textSecondaryColor,
//                   }}
//                 >
//                   <li>
//                     Sleep data shared:{" "}
//                     <strong>{summary.hasSleepData ? "Yes" : "No"}</strong>
//                   </li>
//                   <li>
//                     Distance data shared:{" "}
//                     <strong>{summary.hasDistanceData ? "Yes" : "No"}</strong>
//                   </li>
//                 </ul>
//               </div>

//               {/* Generate AI care plan button */}
//               <div style={{ marginTop: theme.paddingMedium }}>
//                 <button
//                   onClick={handleGeneratePlan}
//                   disabled={aiPlanLoading}
//                   style={{
//                     padding: "8px 16px",
//                     backgroundColor: theme.themeColor,
//                     border: "none",
//                     borderRadius: theme.borderRadiusSmall,
//                     color: "#fff",
//                     fontSize: theme.fontSmall,
//                     fontWeight: theme.fontWeightBold,
//                     cursor: aiPlanLoading ? "default" : "pointer",
//                     opacity: aiPlanLoading ? 0.7 : 1,
//                   }}
//                 >
//                   {aiPlanLoading
//                     ? "Generating care plan..."
//                     : "Generate AI care plan draft"}
//                 </button>
//               </div>
//             </div>

//             {/* AI plan error */}
//             {aiPlanError && (
//               <div
//                 style={{
//                   marginTop: theme.paddingMedium,
//                   padding: theme.paddingMedium,
//                   borderRadius: theme.borderRadiusMedium,
//                   backgroundColor: "#fff5f5",
//                   border: `1px solid ${theme.errorColor}`,
//                   color: theme.errorColor,
//                 }}
//               >
//                 {aiPlanError}
//               </div>
//             )}

//             {/* AI care plan panel */}
//             {aiPlan && (
//               <div
//                 style={{
//                   marginTop: theme.largeSizeBoxHeight,
//                   backgroundColor: "#fff",
//                   borderRadius: theme.borderRadiusMedium,
//                   border: `1px solid ${theme.borderColor}`,
//                   padding: theme.paddingMedium,
//                 }}
//               >
//                 <h3
//                   style={{
//                     margin: 0,
//                     fontSize: theme.fontLarge,
//                     color: theme.textPrimaryColor,
//                   }}
//                 >
//                   AI care plan draft (editable)
//                 </h3>
//                 <p
//                   style={{
//                     marginTop: 4,
//                     fontSize: theme.fontSmall,
//                     color: theme.textSecondaryColor,
//                   }}
//                 >
//                   Review and edit before sending to the patient. This is a
//                   draft, not a final prescription.
//                 </p>

//                 <textarea
//                   value={aiPlanText}
//                   onChange={(e) => setAiPlanText(e.target.value)}
//                   rows={10}
//                   style={{
//                     marginTop: theme.paddingSmall,
//                     width: "100%",
//                     padding: "10px",
//                     borderRadius: theme.borderRadiusSmall,
//                     border: `1px solid ${theme.borderColor}`,
//                     fontFamily: theme.fontFamily,
//                     fontSize: theme.fontSmall,
//                     resize: "vertical",
//                   }}
//                 />

//                 {/* Placeholder for future "Send" */}
//                 {/* <div style={{ marginTop: theme.paddingMedium }}>
//                   <button
//                     type="button"
                    
//                     style={{
//                       padding: "8px 16px",
//                       backgroundColor: "#ccc",
//                       border: "none",
//                       borderRadius: theme.borderRadiusSmall,
//                       color: "#fff",
//                       fontSize: theme.fontSmall,
//                       fontWeight: theme.fontWeightBold,
//                       cursor: "not-allowed",
//                     }}
//                   >
//                     Send to patient (coming soon)
//                   </button>
//                 </div> */}

//                 <div
//                   style={{
//                     marginTop: theme.paddingMedium,
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     gap: 12,
//                   }}
//                 >
//                   {sendMessage && (
//                     <span
//                       style={{
//                         fontSize: theme.fontSmall,
//                         color: sendMessage.includes("successfully")
//                           ? "#15803d"
//                           : theme.errorColor,
//                       }}
//                     >
//                       {sendMessage}
//                     </span>
//                   )}
//                   <button
//                     type="button"
//                     onClick={handleSendToPatient}
//                     disabled={
//                       sendLoading || !patientFriendlyText.overview?.trim()
//                     }
//                     style={{
//                       padding: "8px 16px",
//                       backgroundColor:
//                         sendLoading || !patientFriendlyText.overview?.trim()
//                           ? "#9ca3af"
//                           : "#16a34a",
//                       border: "none",
//                       borderRadius: theme.borderRadiusSmall,
//                       color: "#fff",
//                       fontSize: theme.fontSmall,
//                       fontWeight: theme.fontWeightBold,
//                       cursor:
//                         sendLoading || !patientFriendlyText.overview?.trim()
//                           ? "not-allowed"
//                           : "pointer",
//                     }}
//                   >
//                     {sendLoading ? "Sending..." : "Send care plan to patient"}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }
// src/pages/DoctorGoogleFitView.jsx
// import React, { useEffect, useState } from "react";
// import ApiService from "../services/ApiService";
// import DashboardLayout from "../components/DashboardLayout";
// import { AppConstants } from "../constants/AppConstants";

// const theme = {
//   cardBg: "#ffffff",
//   cardBorder: "#e5e7eb",
//   cardShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
//   borderRadius: "12px",
//   borderRadiusSmall: "999px",
//   textMuted: "#6b7280",
//   textDark: "#111827",
//   accent: "#2563eb",
//   accentSoft: "#dbeafe",
//   danger: "#b91c1c",
//   success: "#15803d",
//   warning: "#b45309",
//   fontSmall: "0.85rem",
//   fontXs: "0.75rem",
//   fontWeightBold: 600,
// };

// function ProgressPill({ label, current, target, unit }) {
//   const safeCurrent = typeof current === "number" ? current : 0;
//   const safeTarget = typeof target === "number" && target > 0 ? target : null;
//   const pct = safeTarget
//     ? Math.min(100, Math.round((safeCurrent / safeTarget) * 100))
//     : null;

//   let statusColor = theme.textMuted;
//   if (pct !== null) {
//     if (pct < 60) statusColor = theme.danger;
//     else if (pct < 100) statusColor = theme.warning;
//     else statusColor = theme.success;
//   }

//   return (
//     <div
//       style={{
//         background: theme.accentSoft,
//         borderRadius: theme.borderRadiusSmall,
//         padding: "6px 10px",
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//       }}
//     >
//       <span
//         style={{
//           fontSize: theme.fontXs,
//           color: theme.textDark,
//           fontWeight: theme.fontWeightBold,
//         }}
//       >
//         {label}
//       </span>
//       <span style={{ fontSize: theme.fontXs, color: theme.textMuted }}>
//         {safeCurrent}
//         {unit ? ` ${unit}` : ""}{" "}
//         {safeTarget ? ` / ${safeTarget}${unit ? ` ${unit}` : ""}` : ""}
//       </span>
//       {pct !== null && (
//         <span
//           style={{
//             fontSize: theme.fontXs,
//             color: statusColor,
//             fontWeight: theme.fontWeightBold,
//           }}
//         >
//           {pct}%
//         </span>
//       )}
//     </div>
//   );
// }

// function DoctorGoogleFitView() {
//   const token = localStorage.getItem("token");

//   const [patients, setPatients] = useState([]);
//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [summary, setSummary] = useState(null);
//   const [loadingPatients, setLoadingPatients] = useState(false);
//   const [loadingSummary, setLoadingSummary] = useState(false);
//   const [error, setError] = useState("");

//   const [doctorNotes, setDoctorNotes] = useState("");
//   const [aiDraftLoading, setAiDraftLoading] = useState(false);
//   const [aiDraftError, setAiDraftError] = useState("");
//   const [patientFriendlyText, setPatientFriendlyText] = useState({
//     overview: "",
//     activity: "",
//     weight: "",
//     sleep: "",
//     followUp: "",
//   });
//   const [goals, setGoals] = useState([]);
//   const [sendLoading, setSendLoading] = useState(false);
//   const [sendMessage, setSendMessage] = useState("");

//   useEffect(() => {
//     const fetchPatients = async () => {
//       try {
//         setLoadingPatients(true);
//         setError("");
//         const res = await ApiService.request(
//           "/health-tracker/shared-patients",
//           "GET",
//           null,
//           token
//         );
//         setPatients(res.data || []);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load patients");
//       } finally {
//         setLoadingPatients(false);
//       }
//     };
//     fetchPatients();
//   }, []);

//   const handleSelectPatient = async (patientId) => {
//     setSelectedPatientId(patientId);
//     setSummary(null);
//     setDoctorNotes("");
//     setPatientFriendlyText({
//       overview: "",
//       activity: "",
//       weight: "",
//       sleep: "",
//       followUp: "",
//     });
//     setGoals([]);
//     setSendMessage("");

//     if (!patientId) return;

//     try {
//       setLoadingSummary(true);
//       setError("");
//       const res = await ApiService.get(`/health-tracker/shared/${patientId}`);
//       setSummary(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load Google Fit summary for this patient");
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

//   const handleGenerateAiDraft = async () => {
//     if (!selectedPatientId || !summary) return;

//     try {
//       setAiDraftLoading(true);
//       setAiDraftError("");
//       setSendMessage("");

//       const patient = patients.find((p) => p._id === selectedPatientId);

//       const body = {
//         patient: {
//           fullName: patient?.fullName || patient?.name || "",
//           age: patient?.age || "",
//           conditions: (patient?.conditions || []).join(", "),
//           medications: (patient?.medications || []).join(", "),
//         },
//         googleFitSummary: {
//           stepsText: summary.stepsText,
//           heartRateText: summary.heartRateText,
//           weightText: summary.weightText,
//           sleepText: summary.sleepText,
//         },
//         doctorNotes,
//       };

//       const res = await ApiService.post("/care-plans/ai-draft", body);

//       setPatientFriendlyText({
//         overview: res.data.patientFriendlyText?.overview || "",
//         activity: res.data.patientFriendlyText?.activity || "",
//         weight: res.data.patientFriendlyText?.weight || "",
//         sleep: res.data.patientFriendlyText?.sleep || "",
//         followUp: res.data.patientFriendlyText?.followUp || "",
//       });

//       setGoals(res.data.goals || []);
//     } catch (err) {
//       console.error(err);
//       setAiDraftError("Failed to generate AI draft");
//     } finally {
//       setAiDraftLoading(false);
//     }
//   };

//   const handleSendToPatient = async () => {
//     if (!selectedPatientId) return;

//     try {
//       setSendLoading(true);
//       setSendMessage("");
//       const doctorId = AppConstants.currentUserId; // or from auth context

//       const summaryContext = {
//         stepsSummary: summary?.stepsText || "",
//         heartRateSummary: summary?.heartRateText || "",
//         weightSummary: summary?.weightText || "",
//         sleepSummary: summary?.sleepText || "",
//       };

//       const body = {
//         patientId: selectedPatientId,
//         doctorId,
//         source: "google_fit",
//         summaryContext,
//         patientFriendlyText,
//         goals,
//       };

//       const res = await ApiService.post("/care-plans/send", body);
//       setSendMessage("Care plan sent to patient successfully.");
//     } catch (err) {
//       console.error(err);
//       setSendMessage("Failed to send care plan to patient.");
//     } finally {
//       setSendLoading(false);
//     }
//   };

//   const selectedPatient = patients.find((p) => p._id === selectedPatientId);

//   return (
//     <DashboardLayout>
//       <div className="page-header">
//         <h1 className="page-title">Patient Google Fit & Care Plan</h1>
//         <p className="page-subtitle">
//           Review shared Google Fit data, generate an AI care plan, and send a
//           simple visual summary to the patient.
//         </p>
//       </div>

//       {error && <div className="alert alert-error">{error}</div>}
//       {sendMessage && <div className="alert alert-info">{sendMessage}</div>}

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
//         {/* Left: patient list */}
//         <div className="lg:col-span-3">
//           <div
//             style={{
//               background: theme.cardBg,
//               borderRadius: theme.borderRadius,
//               border: `1px solid ${theme.cardBorder}`,
//               boxShadow: theme.cardShadow,
//               padding: 16,
//             }}
//           >
//             <h2 className="text-sm font-semibold mb-2">Shared patients</h2>
//             {loadingPatients ? (
//               <p className="text-sm text-gray-500">Loading patients...</p>
//             ) : patients.length === 0 ? (
//               <p className="text-sm text-gray-500">
//                 No patients have shared their Google Fit data yet.
//               </p>
//             ) : (
//               <ul className="space-y-2 max-h-[400px] overflow-y-auto">
//                 {patients.map((p) => (
//                   <li key={p._id}>
//                     <button
//                       onClick={() => handleSelectPatient(p._id)}
//                       className={`w-full text-left px-3 py-2 rounded-md text-sm ${
//                         p._id === selectedPatientId
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-50 hover:bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       <div className="font-medium">
//                         {p.fullName || p.name || "Unnamed patient"}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {p.email || p.username || ""}
//                       </div>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>

//         {/* Right: summary + AI draft */}
//         <div className="lg:col-span-9 space-y-4">
//           {!selectedPatientId && (
//             <div
//               style={{
//                 background: theme.cardBg,
//                 borderRadius: theme.borderRadius,
//                 border: `1px dashed ${theme.cardBorder}`,
//                 padding: 24,
//                 textAlign: "center",
//               }}
//             >
//               <p className="text-sm text-gray-500">
//                 Select a patient on the left to view their Google Fit summary
//                 and create a care plan.
//               </p>
//             </div>
//           )}

//           {selectedPatientId && (
//             <>
//               {/* Google Fit summary card */}
//               <div
//                 style={{
//                   background: theme.cardBg,
//                   borderRadius: theme.borderRadius,
//                   border: `1px solid ${theme.cardBorder}`,
//                   boxShadow: theme.cardShadow,
//                   padding: 16,
//                 }}
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <div>
//                     <h2 className="text-sm font-semibold">
//                       Google Fit summary –{" "}
//                       {selectedPatient?.fullName ||
//                         selectedPatient?.name ||
//                         "Patient"}
//                     </h2>
//                     <p className="text-xs text-gray-500">
//                       Latest shared health data from Google Fit.
//                     </p>
//                   </div>
//                 </div>

//                 {loadingSummary ? (
//                   <p className="text-sm text-gray-500">
//                     Loading Google Fit summary...
//                   </p>
//                 ) : !summary ? (
//                   <p className="text-sm text-gray-500">
//                     No Google Fit summary available for this patient yet.
//                   </p>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                     <div className="space-y-1">
//                       <h3 className="font-semibold text-xs uppercase text-gray-400">
//                         Activity
//                       </h3>
//                       <p className="text-gray-800">
//                         {summary.stepsText || "No steps data."}
//                       </p>
//                     </div>
//                     <div className="space-y-1">
//                       <h3 className="font-semibold text-xs uppercase text-gray-400">
//                         Heart rate
//                       </h3>
//                       <p className="text-gray-800">
//                         {summary.heartRateText || "No heart rate data."}
//                       </p>
//                     </div>
//                     <div className="space-y-1">
//                       <h3 className="font-semibold text-xs uppercase text-gray-400">
//                         Weight
//                       </h3>
//                       <p className="text-gray-800">
//                         {summary.weightText || "No weight data."}
//                       </p>
//                     </div>
//                     <div className="space-y-1">
//                       <h3 className="font-semibold text-xs uppercase text-gray-400">
//                         Sleep
//                       </h3>
//                       <p className="text-gray-800">
//                         {summary.sleepText || "No sleep data."}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Doctor notes + AI draft + visualization */}
//               <div
//                 style={{
//                   background: theme.cardBg,
//                   borderRadius: theme.borderRadius,
//                   border: `1px solid ${theme.cardBorder}`,
//                   boxShadow: theme.cardShadow,
//                   padding: 16,
//                 }}
//               >
//                 <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
//                   <div>
//                     <h2 className="text-sm font-semibold">
//                       AI care plan draft
//                     </h2>
//                     <p className="text-xs text-gray-500">
//                       Add brief notes, then generate a draft for the patient.
//                       You can edit text before sending.
//                     </p>
//                   </div>

//                   <button
//                     onClick={handleGenerateAiDraft}
//                     disabled={!summary || aiDraftLoading}
//                     className={`px-3 py-1.5 rounded-md text-xs font-medium ${
//                       !summary || aiDraftLoading
//                         ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     }`}
//                   >
//                     {aiDraftLoading
//                       ? "Generating..."
//                       : "Generate AI care plan draft"}
//                   </button>
//                 </div>

//                 {/* Doctor notes */}
//                 <div className="mb-3">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Doctor notes (optional)
//                   </label>
//                   <textarea
//                     value={doctorNotes}
//                     onChange={(e) => setDoctorNotes(e.target.value)}
//                     rows={3}
//                     className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                     placeholder="E.g. focus on weight loss and walking tolerance over next 3 months..."
//                   />
//                 </div>

//                 {aiDraftError && (
//                   <p className="text-xs text-red-600 mb-2">{aiDraftError}</p>
//                 )}

//                 {/* Visualization: goal pills */}
//                 {goals.length > 0 && (
//                   <div className="mb-3">
//                     <h3 className="text-xs font-semibold text-gray-700 mb-1">
//                       Visual summary of key goals
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                       {goals.map((g, idx) => (
//                         <ProgressPill
//                           key={idx}
//                           label={g.label || g.type}
//                           current={g.currentValue}
//                           target={g.targetValue}
//                           unit={g.unit}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Editable text sections */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
//                   <div className="space-y-2">
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 mb-1">
//                         Overview
//                       </label>
//                       <textarea
//                         value={patientFriendlyText.overview}
//                         onChange={(e) =>
//                           setPatientFriendlyText((prev) => ({
//                             ...prev,
//                             overview: e.target.value,
//                           }))
//                         }
//                         rows={3}
//                         className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 mb-1">
//                         Activity
//                       </label>
//                       <textarea
//                         value={patientFriendlyText.activity}
//                         onChange={(e) =>
//                           setPatientFriendlyText((prev) => ({
//                             ...prev,
//                             activity: e.target.value,
//                           }))
//                         }
//                         rows={3}
//                         className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 mb-1">
//                         Weight
//                       </label>
//                       <textarea
//                         value={patientFriendlyText.weight}
//                         onChange={(e) =>
//                           setPatientFriendlyText((prev) => ({
//                             ...prev,
//                             weight: e.target.value,
//                           }))
//                         }
//                         rows={3}
//                         className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 mb-1">
//                         Sleep & follow-up
//                       </label>
//                       <textarea
//                         value={`${patientFriendlyText.sleep}\n\nFollow-up:\n${patientFriendlyText.followUp}`.trim()}
//                         onChange={(e) => {
//                           // simple split; you can improve if you like
//                           const value = e.target.value;
//                           const parts = value.split("Follow-up:");
//                           const sleepText = parts[0].trim();
//                           const followUpText = parts[1] ? parts[1].trim() : "";
//                           setPatientFriendlyText((prev) => ({
//                             ...prev,
//                             sleep: sleepText,
//                             followUp: followUpText,
//                           }));
//                         }}
//                         rows={4}
//                         className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Send button */}
//                 <div className="mt-4 flex justify-end">
//                   <button
//                     onClick={handleSendToPatient}
//                     disabled={sendLoading || !patientFriendlyText.overview}
//                     className={`px-4 py-2 rounded-md text-sm font-medium ${
//                       sendLoading || !patientFriendlyText.overview
//                         ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                         : "bg-green-600 text-white hover:bg-green-700"
//                     }`}
//                   >
//                     {sendLoading ? "Sending..." : "Send care plan to patient"}
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }

export default DoctorGoogleFitView;
