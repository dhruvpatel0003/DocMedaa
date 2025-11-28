// ShowGoogleFitData.jsx
import React, { useEffect, useState } from "react";
import ApiService from "../services/ApiService";

function ShowGoogleFitData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ApiService.request(
          "/health-tracker/fitness-data",
          "GET",
          null,
          localStorage.getItem("token")
        );
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "32px" }}>
      <h2>My Google Fit Data</h2>
      {loading && <p>Loading data from Google Fit...</p>}
      {error && <p style={{ color: "#c00" }}>Error: {error}</p>}
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
      <div style={{ marginTop: 16 }}>
        <a href="/health-tracker">← Back to health tracker</a>
      </div>
    </div>
  );
}

export default ShowGoogleFitData;
