import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { showSnackBar } from "../utils/helpers";
import "../styles/history.css";
// import { useNavigate } from "react-router-dom";
import { AppConstants } from "../constants/AppConstants";
const theme = AppConstants;

const HistoryTab = () => {
  // const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.request(
        "/history/past-appointments",
        "GET",
        null,
        user.token
      );
      const data = response.data?.data || [];
      console.log("Fetched appointments historyyyyyyyyyyyyyyy:", response);
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      showSnackBar("Error fetching appointment history", "error");
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await ApiService.request(
        "/history/past-appointments/export",
        "GET",
        null,
        user.token,
        "blob"
      );
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `appointment_history_${user.role}_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSnackBar("Appointment history exported successfully", "success");
    } catch (error) {
      showSnackBar("Error exporting appointment history", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "cancelled":
        return "#dc3545";
      case "no-show":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  return (
    <div className="history-tab">
      {/* Auto-deletion notice
      <div className="history-notice">
        <div className="notice-content">
          <span className="notice-icon">⚠️</span>
          <span>
            Appointments from the last 2 weeks will be deleted automatically
            after 2 weeks.
            <button className="export-btn" onClick={handleExport}>
              Download Past 2 Weeks History (Excel)
            </button>
          </span>
        </div>
      </div> */}

      {/* Appointments list */}
      <div className="appointments-container">
        {/* <button
          className="back-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button> */}
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
        <h2>
          {/* {user.role === 'doctor' ? 'Doctor' : 'Patient'}  */}
          Appointment History
        </h2>

        {loading ? (
          <div className="loading">Loading appointment history...</div>
        ) : appointments.length === 0 ? (
          <div className="no-appointments">
            No appointments found in the last 2 weeks
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <span className="appointment-date">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </span>
                  <span className="appointment-time">
                    {appointment.appointmentTime}
                  </span>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(appointment.status),
                    }}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="appointment-details">
                  {user.role.toLowerCase() === "doctor" ? (
                    <>
                      <div className="detail-row">
                        <span className="label">Patient:</span>
                        <span className="value">
                          {appointment.patient.fullName}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">
                          {appointment.patient.email}
                        </span>
                      </div>
                      {/* <div className="detail-row"> */}
                        {/* <span className="label">Contact:</span>
                        <span className="value">
                          {appointment.patient.phone || "N/A"}
                        </span> */}
                      {/* </div> */}
                      <div className="detail-row">
                        <span className="label">Symptoms:</span>
                        <span className="value">
                          {appointment.symptoms || "N/A"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-row">
                        <span className="label">Doctor:</span>
                        <span className="value">
                          {appointment.doctor.fullName}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Specialty:</span>
                        <span className="value">
                          {appointment.doctor.specialty}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">{appointment.appointmentType}</span>
                  </div>

                  {appointment.notes && (
                    <div className="detail-row">
                      <span className="label">Notes:</span>
                      <span className="value">{appointment.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;
