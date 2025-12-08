import React from "react";
import "../styles/aboutUs.css";
import { AppConstants } from "../constants/AppConstants";
const theme = AppConstants;
const AboutUs = () => (
  <div className="aboutus-page">
    <div className="aboutus-card">
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
      <h1>About Us</h1>
      <p>
        <strong>DocMedaa</strong> is dedicated to making healthcare management
        seamless for both patients and doctors.
        <br />
        <br />
        Our platform lets users schedule appointments, access health resources,
        and communicate with medical professionals from anywhere.
        <br />
        <br />
        We believe in empowering individuals and clinics by providing smart,
        reliable tools for modern healthcare needs.
      </p>
      <div className="aboutus-team">
        <h3>Our Team</h3>
        <ul>
          <li>Dhruv (Developer/Founder)</li>
          <li>Dr. ABC xyz (Healthcare Advisor)</li>
          <li>DocMedaa Support</li>
        </ul>
      </div>
      <p className="aboutus-contact">
        For more information, contact:{" "}
        <a href="mailto:support@docmedaa.com">support@docmedaa.com</a>
      </p>
    </div>
  </div>
);

export default AboutUs;
