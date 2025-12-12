import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/DashboardPage.css";
import { showSnackBar } from "../utils/helpers";
import ApiService from "../services/ApiService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isDoctor, isPatient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await ApiService.request(
          "/appointments/all-appointments",
          "GET",
          null,
          token
        );
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    if (isPatient) fetchAppointments();
  }, [isPatient]);

  // Active (not completed/cancelled) appointments for display/UI logic
  const visibleAppointments = appointments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled"
  );

  const handleCancel = async (id, doctorId) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await ApiService.request(
        `/appointments/cancel/${id}`,
        "PUT",
        { appointment_with: doctorId },
        token
      );
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      showSnackBar("Appointment cancelled.");
    } catch {
      showSnackBar("Could not cancel appointment.");
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Welcome, {user?.fullName}! 👋</h1>
            <p className="welcome-subtitle">
              {isDoctor
                ? "Manage your patients and appointments"
                : "Book and manage your medical appointments"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="actions-section">
          <div className="actions-grid">
            {isPatient && (
              <>
                <button
                  className="action-card"
                  onClick={() => navigate("/book-appointment")}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-title">Book Appointment</span>
                  <span className="action-desc">Schedule a consultation</span>
                </button>
                <button
                  className="action-card"
                  onClick={() => navigate("/channels")}
                >
                  <span className="action-icon">💬</span>
                  <span className="action-title">Messages</span>
                  <span className="action-desc">Chat with doctors</span>
                </button>{" "}
                <button
                  className="action-card"
                  onClick={() => navigate("/care-plan")}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-title">My Care Plans</span>
                  <span className="action-desc">
                    See plans from your doctors
                  </span>
                </button>
                {/* <button className="action-card">
                  <span className="action-icon">📋</span>
                  <span className="action-title">My Records</span>
                  <span className="action-desc">View medical records</span>
                </button> */}
                <button className="action-card">
                  <span className="action-icon">📚</span>
                  <span
                    className="action-title"
                    onClick={() => navigate("/resources")}
                  >
                    Resources
                  </span>
                  <span className="action-desc">Medical resources</span>
                </button>
              </>
            )}

            {/* {isDoctor && (
              <>
                <button
                  className="action-card"
                  onClick={() => navigate("/doctor/appointments")}
                >
                  <span className="action-icon">📅</span>
                  <span className="action-title">Appointments</span>
                  <span className="action-desc">Manage appointments</span>
                </button>
                <button
                  className="action-card"
                  onClick={() => navigate("/channels")}
                >
                  <span className="action-icon">💬</span>
                  <span className="action-title">Chat with Patients</span>
                  <span className="action-desc">Patient conversations</span>
                </button>
                <button className="action-card">
                  <span className="action-icon">📱</span>
                  <span className="action-title">Devices</span>
                  <span className="action-desc">Monitor devices</span>
                </button>
                <button className="action-card">
                  <span className="action-icon">📚</span>
                  <span
                    className="action-title"
                    onClick={() => navigate("/resources")}
                  >
                    Resources
                  </span>
                  <span className="action-desc">Medical resources</span>
                </button>
                <button
                  className="action-card"
                  onClick={() => navigate("/help")}
                >
                  <span className="action-icon">❓</span>
                  <span className="action-title">Help</span>
                  <span className="action-desc">Get assistance</span>
                </button>
              </>
            )} */}
            {isDoctor && (
              <>
                <button
                  className="action-card"
                  onClick={() => navigate("/doctor/appointments")}
                >
                  <span className="action-icon">📅</span>
                  <span className="action-title">Appointments</span>
                  <span className="action-desc">Manage appointments</span>
                </button>

                <button
                  className="action-card"
                  onClick={() => navigate("/channels")}
                >
                  <span className="action-icon">💬</span>
                  <span className="action-title">Chat with Patients</span>
                  <span className="action-desc">Patient conversations</span>
                </button>

                {/* UPDATED: view patient health data instead of generic Devices */}
                <button
                  className="action-card"
                  onClick={() => navigate("/doctor/wearable-data")}
                >
                  <span className="action-icon">📊</span>
                  <span className="action-title">Patient Health Data</span>
                  <span className="action-desc">
                    View shared wearable metrics
                  </span>
                </button>

                <button className="action-card">
                  <span className="action-icon">📚</span>
                  <span
                    className="action-title"
                    onClick={() => navigate("/resources")}
                  >
                    Resources
                  </span>
                  <span className="action-desc">Medical resources</span>
                </button>

                <button
                  className="action-card"
                  onClick={() => navigate("/help")}
                >
                  <span className="action-icon">❓</span>
                  <span className="action-title">Help</span>
                  <span className="action-desc">Get assistance</span>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Recent Appointments Section */}
        {isPatient && (
          <section className="appointments-section">
            <h2>My Appointments</h2>
            {loading ? (
              <div>Loading appointments...</div>
            ) : visibleAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No appointments yet</p>
                <p className="empty-desc">
                  Book your first appointment to get started
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/book-appointment")}
                >
                  Book an Appointment
                </button>
              </div>
            ) : (
              <div className="appointments-list">
                {visibleAppointments.map((a) => (
                  <div className="appointment-card" key={a._id}>
                    <div>
                      <span className="ac-label">Doctor: </span>
                      {a.doctor?.fullName || "Unknown"}
                    </div>
                    <div>
                      <span className="ac-label">Date: </span>
                      {new Date(a.appointmentDate).toLocaleString()}
                    </div>
                    <div>
                      <span className="ac-label">Type: </span>
                      {(a.appointmentType || "").replace(/^\w/, (c) =>
                        c.toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="ac-label">Slot: </span>
                      {a.selectedTimeSlot?.from} - {a.selectedTimeSlot?.to}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleCancel(a._id, a.doctor?._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
