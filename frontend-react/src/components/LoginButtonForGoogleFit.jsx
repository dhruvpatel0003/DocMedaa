import React from "react";

const LoginButtonForGoogleFit = () => {
  const handleLogin = async () => {
    // Get the Google OAuth URL from your backend
    const res = await fetch("/api/health-tracker/auth-url");
    const data = await res.json();
    window.location.href = data.url; // Redirect to Google OAuth
  };

  return (
    <button onClick={handleLogin}>
      Connect Google Fit
    </button>
  );
};

export default LoginButtonForGoogleFit;
