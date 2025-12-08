// src/pages/ShowGoogleFitData.jsx
import React, { useEffect, useState } from "react";
import ApiService from "../services/ApiService";
import DashboardLayout from "../components/DashboardLayout";
import { AppConstants } from "../constants/AppConstants";

const toDate = (ns) => {
  if (!ns) return "";
  const ms = Number(ns) / 1e6;
  return new Date(ms).toLocaleString();
};

const sumSteps = (points) =>
  (points || []).reduce((sum, p) => sum + (p.value?.[0]?.intVal || 0), 0);

const avgHeartRate = (points) => {
  const vals = (points || []).map((p) => p.value?.[0]?.fpVal).filter(Boolean);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

const lastWeight = (points) => {
  if (!points || !points.length) return null;
  const last = points[points.length - 1];
  return last.value?.[0]?.fpVal ?? null;
};

function ShowGoogleFitData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState("");
  const [shareError, setShareError] = useState("");

  const theme = AppConstants;
  const token = localStorage.getItem("token");

  // load Google Fit data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ApiService.request(
          "/health-tracker/fitness-data",
          "GET",
          null,
          token
        );
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // load doctor list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await ApiService.request(
          "/findDoctor/all/doctors",
          "GET",
          null,
          token
        );
        console.log("Doctors API response:", res.data.data);
        const list = Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setDoctors(list);
      } catch {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, [token]);

  const stepsPoints = data?.steps?.point || [];
  const hrPoints = data?.heartRate?.point || [];
  const sleepPoints = data?.sleep?.point || [];
  const distancePoints = data?.distance?.point || [];
  const weightPoints = data?.weight?.point || [];

  const totalSteps = sumSteps(stepsPoints);
  const avgHr = avgHeartRate(hrPoints);
  const latestWeight = lastWeight(weightPoints);

  const handleShare = async () => {
    setShareSuccess("");
    setShareError("");

    if (!selectedDoctorId) {
      setShareError("Please select a doctor to share with.");
      return;
    }

    try {
      setSharing(true);

      const summaryPayload = {
        totalStepsLast14Days: totalSteps,
        averageHeartRate: avgHr,
        latestWeight,
        hasSleepData: sleepPoints.length > 0,
        hasDistanceData: distancePoints.length > 0,
      };

      await ApiService.request(
        "/health-tracker/share",
        "POST",
        {
          doctorId: selectedDoctorId,
          summary: summaryPayload,
          share:true
        },
        token
      );

      setShareSuccess("Health data shared with your doctor successfully.");
    } catch (e) {
      setShareError(e.response?.data?.error || e.message);
    } finally {
      setSharing(false);
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
            href="/health-tracker"
            style={{
              color: theme.themeColor,
              textDecoration: "none",
              fontSize: theme.fontMedium,
            }}
          >
            ← Back to Google Fit connection
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
            My Google Fit Data
          </h2>
          <p
            style={{
              marginTop: 4,
              color: theme.textSecondaryColor,
              fontSize: theme.fontMedium,
            }}
          >
            View your synced health metrics. You can share a summarized view
            with your doctor to support remote monitoring and consultations.
          </p>
        </div>

        {/* share to doctor panel */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: theme.borderRadiusMedium,
            border: `1px solid ${theme.borderColor}`,
            padding: theme.paddingMedium,
            marginBottom: theme.largeSizeBoxHeight,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: theme.fontLarge,
              color: theme.textPrimaryColor,
            }}
          >
            Share with your doctor
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSmall,
              color: theme.textSecondaryColor,
            }}
          >
            Select a doctor from your DocMedaa network and share key metrics
            like steps, heart rate, and weight.
          </p>

          {(!Array.isArray(doctors) || doctors.length === 0) ? (
            <p style={{ color: theme.textSecondaryColor, marginTop: 4 }}>
              No doctors available yet. Book or add a doctor first.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: theme.borderRadiusSmall,
                  border: `1px solid ${theme.borderColor}`,
                  minWidth: 220,
                  fontSize: theme.fontSmall,
                }}
              >
                <option value="">Select doctor</option>
                {Array.isArray(doctors) &&
                  doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.fullName}{" "}
                      {doc.specialty ? `(${doc.specialty})` : ""}
                    </option>
                  ))}
              </select>

              <button
                onClick={handleShare}
                disabled={sharing || !data}
                style={{
                  padding: "8px 16px",
                  backgroundColor: theme.themeColor,
                  border: "none",
                  borderRadius: theme.borderRadiusSmall,
                  color: "#fff",
                  fontSize: theme.fontSmall,
                  cursor: sharing ? "default" : "pointer",
                  opacity: sharing ? 0.7 : 1,
                }}
              >
                {sharing ? "Sharing..." : "Share Latest Summary"}
              </button>
            </div>
          )}

          {shareSuccess && (
            <p
              style={{
                marginTop: 6,
                color: theme.successColor || "#1a7f37",
                fontSize: theme.fontSmall,
              }}
            >
              {shareSuccess}
            </p>
          )}
          {shareError && (
            <p
              style={{
                marginTop: 6,
                color: theme.errorColor,
                fontSize: theme.fontSmall,
              }}
            >
              {shareError}
            </p>
          )}
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
            Loading data from Google Fit...
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

        {data && !loading && !error && (
          <>
            {/* Summary cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: theme.paddingMedium,
                marginBottom: theme.largeSizeBoxHeight,
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: theme.borderRadiusMedium,
                  border: `1px solid ${theme.borderColor}`,
                  padding: theme.paddingMedium,
                }}
              >
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
                    fontSize: 24,
                    fontWeight: theme.fontWeightBold,
                    color: theme.themeColor,
                  }}
                >
                  {totalSteps.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: theme.borderRadiusMedium,
                  border: `1px solid ${theme.borderColor}`,
                  padding: theme.paddingMedium,
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSmall,
                    color: theme.textSecondaryColor,
                    marginBottom: 4,
                  }}
                >
                  Avg Heart Rate
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: theme.fontWeightBold,
                    color: theme.themeColor,
                  }}
                >
                  {avgHr ? `${avgHr} bpm` : "No data"}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: theme.borderRadiusMedium,
                  border: `1px solid ${theme.borderColor}`,
                  padding: theme.paddingMedium,
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSmall,
                    color: theme.textSecondaryColor,
                    marginBottom: 4,
                  }}
                >
                  Latest Weight
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: theme.fontWeightBold,
                    color: theme.themeColor,
                  }}
                >
                  {latestWeight ? `${latestWeight} kg` : "No data"}
                </div>
              </div>
            </div>

            {/* Detailed sections */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
                gap: theme.paddingMedium,
                flexWrap: "wrap",
              }}
            >
              {/* Left column: Steps + Distance */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.paddingMedium,
                }}
              >
                {/* Steps card */}
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
                      marginBottom: 8,
                      fontSize: theme.fontLarge,
                      color: theme.textPrimaryColor,
                    }}
                  >
                    Daily Steps
                  </h3>
                  {stepsPoints.length === 0 ? (
                    <p style={{ color: theme.textSecondaryColor }}>
                      No step data available.
                    </p>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: theme.fontSmall,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: theme.backgroundColor,
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: 8 }}>Day</th>
                          <th style={{ padding: 8 }}>Steps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stepsPoints.map((p, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderTop: `1px solid ${theme.borderColor}`,
                            }}
                          >
                            <td style={{ padding: 8 }}>
                              {toDate(p.startTimeNanos).split(",")[0]}
                            </td>
                            <td style={{ padding: 8 }}>
                              {p.value?.[0]?.intVal?.toLocaleString() || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Distance card */}
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
                      marginBottom: 8,
                      fontSize: theme.fontLarge,
                      color: theme.textPrimaryColor,
                    }}
                  >
                    Daily Distance
                  </h3>
                  {distancePoints.length === 0 ? (
                    <p style={{ color: theme.textSecondaryColor }}>
                      No distance data available.
                    </p>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: theme.fontSmall,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: theme.backgroundColor,
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: 8 }}>Day</th>
                          <th style={{ padding: 8 }}>Distance (m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distancePoints.map((p, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderTop: `1px solid ${theme.borderColor}`,
                            }}
                          >
                            <td style={{ padding: 8 }}>
                              {toDate(p.startTimeNanos).split(",")[0]}
                            </td>
                            <td style={{ padding: 8 }}>
                              {p.value?.[0]?.fpVal?.toFixed(0) || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right column: Heart rate, Sleep, Weight */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.paddingMedium,
                }}
              >
                {/* Heart rate */}
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
                      marginBottom: 8,
                      fontSize: theme.fontLarge,
                      color: theme.textPrimaryColor,
                    }}
                  >
                    Heart Rate Samples
                  </h3>
                  {hrPoints.length === 0 ? (
                    <p style={{ color: theme.textSecondaryColor }}>
                      No heart rate data available.
                    </p>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: theme.fontSmall,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: theme.backgroundColor,
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: 8 }}>Time</th>
                          <th style={{ padding: 8 }}>BPM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hrPoints.map((p, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderTop: `1px solid ${theme.borderColor}`,
                            }}
                          >
                            <td style={{ padding: 8 }}>
                              {toDate(p.endTimeNanos)}
                            </td>
                            <td style={{ padding: 8 }}>
                              {p.value?.[0]?.fpVal || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Sleep */}
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
                      marginBottom: 8,
                      fontSize: theme.fontLarge,
                      color: theme.textPrimaryColor,
                    }}
                  >
                    Sleep Sessions
                  </h3>
                  {sleepPoints.length === 0 ? (
                    <p style={{ color: theme.textSecondaryColor }}>
                      No sleep data available.
                    </p>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        fontSize: theme.fontSmall,
                      }}
                    >
                      {sleepPoints.map((p, idx) => {
                        const start = toDate(p.startTimeNanos);
                        const end = toDate(p.endTimeNanos);
                        return (
                          <li
                            key={idx}
                            style={{
                              padding: "6px 0",
                              borderTop:
                                idx === 0
                                  ? "none"
                                  : `1px solid ${theme.borderColor}`,
                            }}
                          >
                            {start} → {end}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Weight history */}
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
                      marginBottom: 8,
                      fontSize: theme.fontLarge,
                      color: theme.textPrimaryColor,
                    }}
                  >
                    Weight History
                  </h3>
                  {weightPoints.length === 0 ? (
                    <p style={{ color: theme.textSecondaryColor }}>
                      No weight readings available.
                    </p>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: theme.fontSmall,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: theme.backgroundColor,
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: 8 }}>Date</th>
                          <th style={{ padding: 8 }}>Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weightPoints.map((p, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderTop: `1px solid ${theme.borderColor}`,
                            }}
                          >
                            <td style={{ padding: 8 }}>
                              {toDate(p.startTimeNanos)}
                            </td>
                            <td style={{ padding: 8 }}>
                              {p.value?.[0]?.fpVal?.toFixed(1) || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ShowGoogleFitData;
