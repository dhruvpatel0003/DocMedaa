// src/pages/DoctorGoogleFitView.jsx
import React, { useEffect, useState } from "react";
import ApiService from "../services/ApiService";
import DashboardLayout from "../components/DashboardLayout";
import { AppConstants } from "../constants/AppConstants";

function DoctorGoogleFitView() {
  const theme = AppConstants;
  const token = localStorage.getItem("token");

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch list of patients who shared data (or doctor’s patients)
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await ApiService.request(
          "/health-tracker/shared-patients",
          "GET",
          null,
          token
        );
        setPatients(res.data || []);
      } catch {
        setPatients([]);
      }
    };
    fetchPatients();
  }, [token]);

  const loadSummary = async (patientId) => {
    if (!patientId) {
      setSummary(null);
      return;
    }
    setLoading(true);
    setError("");
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
    if (id) {
      loadSummary(id);
    } else {
      setSummary(null);
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
            View Google Fit summaries shared with you by your patients to
            support remote monitoring and follow-up decisions.
          </p>
        </div>

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
                {p.fullName}{" "}
                {p.age ? `(${p.age} yrs)` : ""}
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
                  <strong>
                    {summary.hasSleepData ? "Yes" : "No"}
                  </strong>
                </li>
                <li>
                  Distance data shared:{" "}
                  <strong>
                    {summary.hasDistanceData ? "Yes" : "No"}
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DoctorGoogleFitView;
