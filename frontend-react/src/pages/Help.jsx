import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/help.css";

const faq = [
  {
    q: "How do I book an appointment?",
    a: "Go to 'Book Appointment' on your dashboard, select a doctor, choose a slot and confirm."
  },
  {
    q: "How can I contact my doctor?",
    a: "Use the 'Messages' feature to chat directly with your doctor."
  },
  {
    q: "How do I bookmark resources?",
    a: "On the resources page, click the 'Bookmark' star on any article you find useful."
  },
  {
    q: "Who can add articles?",
    a: "Doctors and admins can add and edit resource articles. Patients may view and bookmark resources."
  },
  {
    q: "Need further help?",
    a: <>
      Email us at{" "}
      <a href="mailto:support@docmedaa.com" style={{ color: '#0052CC', textDecoration: 'underline' }}>
        support@docmedaa.com
      </a>. We're here for you!
    </>
  }
];

const Help = () => {
  const navigate = useNavigate();
  return (
    <div className="help-page">
      <button
        className="back-dashboard-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>
      <div className="help-card">
        <h1>Help & FAQ</h1>
        <div>
          {faq.map(({ q, a }, idx) => (
            <div className="faq-item" key={idx}>
              <div className="faq-question">{q}</div>
              <div className="faq-answer">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
