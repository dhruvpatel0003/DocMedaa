// src/pages/GoogleFitHealthData.jsx
import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { AppConstants } from "../constants/AppConstants";

function GoogleFitHealthData() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await ApiService.request(
          "/health-tracker/status",
          "GET",
          null,
          localStorage.getItem("token")
        );
        setConnected(res.data.connected);
      } catch {
        setConnected(false);
      }
    };
    checkStatus();
  }, []);

  const handleConnect = async () => {
    if (!user?.userID) return;
    setConnecting(true);
    try {
      const res = await ApiService.request(
        "/health-tracker/auth-url",
        "POST",
        { userID: user.userID },
        localStorage.getItem("token")
      );
      const { url } = res.data;
      window.location.href = url;
    } catch (e) {
      setConnecting(false);
    }
  };

  const theme = AppConstants;

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
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: theme.borderRadiusLarge,
            border: `1px solid ${theme.borderColor}`,
            padding: theme.paddingLarge,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: theme.fontTitle + 4,
              fontWeight: theme.fontWeightBold,
              color: theme.textPrimaryColor,
            }}
          >
            Google Fit Connection
          </h2>
          <p
            style={{
              marginTop: 0,
              marginBottom: theme.paddingMedium,
              fontSize: theme.fontMedium,
              color: theme.textSecondaryColor,
            }}
          >
            Connect your Google Fit account to securely share steps, heart rate,
            sleep, and other health metrics with DocMedaa. You can choose what
            to share with your doctor.
          </p>

          {!connected ? (
            <>
              <ul
                style={{
                  margin: "0 0 16px 18px",
                  padding: 0,
                  color: theme.textSecondaryColor,
                  fontSize: theme.fontSmall,
                }}
              >
                <li>Daily steps and distance</li>
                <li>Heart rate samples</li>
                <li>Sleep duration</li>
                <li>Body weight and basic trends</li>
              </ul>

              <button
                onClick={handleConnect}
                disabled={connecting}
                style={{
                  marginTop: theme.paddingSmall,
                  padding: "10px 20px",
                  backgroundColor: connecting
                    ? theme.disabledColor
                    : theme.themeColor,
                  color: theme.bottonTextColor,
                  border: "none",
                  borderRadius: theme.borderRadiusMedium,
                  fontSize: theme.fontMedium,
                  fontWeight: theme.fontWeightBold,
                  cursor: connecting ? "default" : "pointer",
                }}
              >
                {connecting ? "Redirecting..." : "Connect to Google Fit"}
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  padding: theme.paddingMedium,
                  borderRadius: theme.borderRadiusMedium,
                  backgroundColor: "#E8F5E9",
                  border: `1px solid ${theme.successColor}`,
                  color: theme.successColor,
                  marginBottom: theme.paddingMedium,
                  fontSize: theme.fontSmall,
                }}
              >
                Google Fit is connected for your account.
              </div>
              <a
                href="/show-google-fit"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  backgroundColor: theme.themeColor,
                  color: theme.bottonTextColor,
                  borderRadius: theme.borderRadiusMedium,
                  textDecoration: "none",
                  fontSize: theme.fontMedium,
                  fontWeight: theme.fontWeightBold,
                }}
              >
                View my Google Fit data →
              </a>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default GoogleFitHealthData;
