// import ApiService from "../services/ApiService";

// function GoogleFitHealthData() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Check if user is already connected to Google Fit
//   useEffect(() => {
//     // You may want to have an API endpoint to check connection state per user
//     setIsConnected(false); // Replace with real check if needed
//   }, []);

//   // Handler to start OAuth flow
//   const handleConnect = async () => {
//     console.log("before connecting to Google Fit...");
//     const res = await ApiService.request("/health-tracker/auth-url", "GET");
//     console.log("after connecting to Google Fit...",res.data);
//     const { url } = res.data;
//     window.location.href = url; // Redirect to Google OAuth
//   };

//   // Handler to fetch health data
//   const handleFetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await ApiService.request("/health-tracker/fitness-data", "GET");
//       setData(res.data);
//       console.log("Fetched Google Fit dataaaaaaaaaaaaaa:", res.data);
//     } catch (error) {
//       setData({ error: error.message });
//     }
//     setLoading(false);
//   };

//   // Check if we have a Google callback
//   useEffect(() => {
//     if (window.location.search.includes("code=")) {
//       // Backend should handle API token exchange & redirect to /health-data without query params after callback
//       // You may trigger fetch or auto-recognize here
//       //  ();
//       setIsConnected(true);
//     }
//   }, []);

//   return (
//     <div style={{ padding: "32px" }}>
//       <h2>Google Fit Health Data</h2>
//       <div style={{ margin: "16px 0" }}>
//         {!isConnected ? (
//           // Connect prompt
//           <button onClick={handleConnect}>Connect to Google Fit</button>
//         ) : (
//           <button onClick={handleFetchData} disabled={loading}>
//             {loading ? "Loading..." : "Refresh Data"}
//           </button>
//         )}
//       </div>
//       {data && (
//         <pre
//           style={{
//             background: "#f3f3f3",
//             border: "1px solid #ddd",
//             padding: "16px",
//             maxHeight: "400px",
//             overflow: "auto",
//           }}
//         >
//           {JSON.stringify(data, null, 2)}
//         </pre>
//       )}
//     </div>
//   );
// }

// export default GoogleFitHealthData;

// src/pages/GoogleFitHealthData.jsx
// src/pages/GoogleFitHealthData.jsx
import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";

function GoogleFitHealthData() {
  const { user } = useAuth();
  // const [isConnected, setIsConnected] = useState(false); // assume connected after OAuth
  // const [data, setData] = useState(null);
  // const [loading, setLoading] = useState(false);

  // const handleConnect = async () => {
  //   console.log("before connecting to Google Fit...");
  //   const res = await ApiService.request("/health-tracker/auth-url", "GET");
  //   console.log("after connecting to Google Fit...", res.data);
  //   setIsConnected(true);
  //   const { url } = res.data;
  //   window.location.href = url;
  // };

  // const handleFetchData = async () => {
  //    if(!isConnected){
  //     await handleConnect();
  //   }
  //   setLoading(true);
  //   try {
  //     const res = await ApiService.request(
  //       "/health-tracker/fitness-data",
  //       "GET"
  //     );
  //     setData(res.data);
  //     console.log("Fetched Google Fit data:", res.data);
  //   } catch (error) {
  //     console.error("Error fetching Google Fit data:", error);
  //     setData({ error: error.message });
  //   }
  //   setLoading(false);
  // };

  // return (
  //   <div style={{ padding: "32px" }}>
  //     <h2>Google Fit Health Data</h2>

  //     <div style={{ margin: "16px 0" }}>
  //       {!isConnected ? (
  //         <button onClick={handleConnect}>Connect to Google Fit</button>
  //       ) : (
  //         <button onClick={handleFetchData} disabled={loading}>
  //           {loading ? "Loading..." : "Refresh Data"}
  //         </button>
  //       )}
  //     </div>

  //     {data && (
  //       <pre
  //         style={{
  //           background: "#f3f3f3",
  //           border: "1px solid #ddd",
  //           padding: "16px",
  //           maxHeight: "400px",
  //           overflow: "auto",
  //         }}
  //       >
  //         {JSON.stringify(data, null, 2)}
  //       </pre>
  //     )}
  //   </div>
  // );
const [connected, setConnected] = useState(false);

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
    const res = await ApiService.request(
      "/health-tracker/auth-url",
      "POST",
      {userID : user.userID},
      localStorage.getItem("token")
    );
    const { url } = res.data;
    window.location.href = url;
  };

  return (
    <div style={{ padding: "32px" }}>
      <h2>Google Fit Connection</h2>
      {!connected ? (
        <>
          <p>Connect your Google Fit account to import your activity data.</p>
          <button onClick={handleConnect}>Connect to Google Fit</button>
        </>
      ) : (
        <>
          <p>Google Fit is connected.</p>
          <a href="/show-google-fit">View my Google Fit data →</a>
        </>
      )}
    </div>
  );
}

export default GoogleFitHealthData;

