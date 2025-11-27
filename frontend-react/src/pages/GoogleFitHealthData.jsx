import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";

function GoogleFitHealthData() {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already connected to Google Fit
  useEffect(() => {
    // You may want to have an API endpoint to check connection state per user
    setIsConnected(false); // Replace with real check if needed
  }, []);

  // Handler to start OAuth flow
  const handleConnect = async () => {
    console.log("before connecting to Google Fit...");
    const res = await ApiService.request("/health-tracker/auth-url", "GET");
    console.log("after connecting to Google Fit...",res.data);
    const { url } = res.data;
    window.location.href = url; // Redirect to Google OAuth
  };

  // Handler to fetch health data
  const handleFetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService.request("/health-tracker/fitness-data", "GET");
      setData(res.data);
    } catch (error) {
      setData({ error: error.message });
    }
    setLoading(false);
  };

  // Check if we have a Google callback
  useEffect(() => {
    if (window.location.search.includes("code=")) {
      // Backend should handle API token exchange & redirect to /health-data without query params after callback
      // You may trigger fetch or auto-recognize here
      //  ();
      setIsConnected(true);
    }
  }, []);

  return (
    <div style={{ padding: "32px" }}>
      <h2>Google Fit Health Data</h2>
      <div style={{ margin: "16px 0" }}>
        {!isConnected ? (
          // Connect prompt
          <button onClick={handleConnect}>Connect to Google Fit</button>
        ) : (
          <button onClick={handleFetchData} disabled={loading}>
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        )}
      </div>
      {data && (
        <pre
          style={{
            background: "#f3f3f3",
            border: "1px solid #ddd",
            padding: "16px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default GoogleFitHealthData;
