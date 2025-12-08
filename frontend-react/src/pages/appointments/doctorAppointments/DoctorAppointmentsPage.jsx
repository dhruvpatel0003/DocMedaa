import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import ApiService from "../../../services/ApiService";
import { showSnackBar } from "../../../utils/helpers";
import { useNavigate } from "react-router-dom";
import "../../../styles/DoctorAppointments.css";

const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();

  const { user, isLoading: authLoading } = useAuth();
  const userToken = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tabs: All, Completed, Cancelled, Upcoming
  const [statusTab, setStatusTab] = useState("all");

  // Filters
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Stats
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
  });

  useEffect(() => {
    if (user && user.role.toLowerCase() === "doctor") {
      fetchAllAppointments();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [appointments, filterDateFrom, filterDateTo, filterType]);

  useEffect(() => {
    calculateStats();
  }, [appointments]);

  // ========= HELPERS =========
  const sameYMD = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // ========= API =========
  const fetchAllAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.request(
        "/appointments/all-appointments",
        "GET",
        null,
        userToken
      );

      const appts = Array.isArray(res.data) ? res.data : [];

      appts.forEach((app) => {
        app.appointmentDate = new Date(app.appointmentDate);
        if (typeof app.status === "string") {
          app.status = app.status.toLowerCase(); // normalize once
        }
      });
      console.log("Fetched appointments:", appts);
      setAppointments(appts);
    } catch {
      showSnackBar("Failed to load appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete appointment
  const completeAppointment = async (appointmentId) => {
    if (!window.confirm("Mark this appointment as complete?")) return;
    setIsLoading(true);
    try {
      const res = await ApiService.request(
        `/appointments/update/${appointmentId}`,
        "PUT",
        { status: "completed" },
        userToken
      );
      if (res.success) {
        showSnackBar("Marked as complete.");
        fetchAllAppointments();
      } else {
        showSnackBar(res.data?.message || "Failed to update status.");
      }
    } catch {
      showSnackBar("Error marking as complete.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId, patientId) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setIsLoading(true);
    try {
      const res = await ApiService.request(
        `/appointments/cancel/${appointmentId}`,
        "PUT",
        { appointment_with: patientId },
        userToken
      );
      if (res.success) {
        showSnackBar("Appointment cancelled.");
        fetchAllAppointments();
      } else {
        showSnackBar(res.data?.message || "Failed to cancel appointment.");
      }
    } catch {
      showSnackBar("Error cancelling appointment.");
    } finally {
      setIsLoading(false);
    }
  };

  // =============== FILTER & STATS ==================
  const applyFilters = () => {
    let filtered = [...appointments];

    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter((apt) => apt.appointmentDate >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((apt) => apt.appointmentDate <= toDate);
    }
    if (filterType !== "all") {
      filtered = filtered.filter((apt) => apt.appointmentType === filterType);
    }

    setFilteredAppointments(filtered);
  };

  // Calculates today's stats
  const calculateStats = () => {
    const today = new Date();

    const todayAppointments = appointments.filter((apt) =>
      sameYMD(today, new Date(apt.appointmentDate))
    );

    const completed = todayAppointments.filter(
      (apt) => typeof apt.status === "string" && apt.status === "completed"
    ).length;

    const total = todayAppointments.length;
    const remaining = total - completed;

    setAppointmentStats({ total, completed, remaining });
  };

  // Tabs filter function
  const getTabAppointments = () => {
    if (statusTab === "all") return filteredAppointments;
    if (statusTab === "completed")
      return filteredAppointments.filter((a) => a.status === "completed");
    if (statusTab === "cancelled")
      return filteredAppointments.filter((a) => a.status === "cancelled");
    // Upcoming = not completed or cancelled
    if (statusTab === "upcoming")
      return filteredAppointments.filter(
        (a) => a.status !== "completed" && a.status !== "cancelled"
      );
    return filteredAppointments;
  };

  // ============= RENDER HELPERS ================
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatTimeSlot = (slot) =>
    !slot ? "N/A" : `${slot.from} - ${slot.to} ${slot.period || ""}`;

  const getStatusColor = (status) =>
    ({
      pending: "#FFA500",
      scheduled: "#007BFF",
      completed: "#28A745",
      cancelled: "#DC3545",
      rescheduled: "#6C757D",
    }[status] || "#6C757D");

  const getTypeIcon = (type) =>
    ({
      "in-person": "🏥",
      virtual: "💻",
      telehealth: "📱",
    }[type] || "📅");

  // Stats cards
  const renderStatsCards = () => (
    <div className="stats-container">
      <div className="stat-card total">
        <div className="stat-number">{appointmentStats.total}</div>
        <div className="stat-label">Total Today</div>
      </div>
      <div className="stat-card completed">
        <div className="stat-number" style={{ color: "#28A745" }}>
          {appointmentStats.completed}
        </div>
        <div className="stat-label">Completed</div>
      </div>
      <div className="stat-card remaining">
        <div className="stat-number" style={{ color: "#FFA500" }}>
          {appointmentStats.remaining}
        </div>
        <div className="stat-label">Remaining</div>
      </div>
    </div>
  );

  // Tabs for status
  const renderTabs = () => (
    <div className="status-tabs" style={{ marginBottom: 16 }}>
      {["all", "completed", "cancelled", "upcoming"].map((tab) => (
        <button
          key={tab}
          className={statusTab === tab ? "active" : ""}
          style={{
            fontWeight: statusTab === tab ? "bold" : "normal",
            marginRight: 10,
            padding: "6px 18px",
            borderRadius: "6px",
            border: statusTab === tab ? "2px solid #0052cc" : "1px solid #ddd",
            background: statusTab === tab ? "#e8f0fe" : "#fff",
          }}
          onClick={() => setStatusTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  const renderAppointmentCard = (a) => (
    <div
      className="appointment-card"
      key={a._id}
      onClick={() => {
        setSelectedAppointment(a);
        setShowDetailsModal(true);
      }}
    >
      <div className="appointment-header">
        <div className="appointment-type">
          {getTypeIcon(a.appointmentType)} <span>{a.appointmentType}</span>
        </div>
        <span
          className="appointment-status"
          style={{ backgroundColor: getStatusColor(a.status) }}
        >
          {a.status}
        </span>
      </div>
      <div className="appointment-body">
        <div className="patient-info">
          <h4>{a.patient?.fullName || "Unknown"}</h4>
          <p className="appointment-time">
            {formatDate(a.appointmentDate)} | {formatTimeSlot(a.selectedTimeSlot)}
          </p>
          <p className="appointment-contact">
            📧 {a.patient?.email || "No email"}
          </p>
        </div>
        {a.symptoms && (
          <div className="appointment-symptoms">
            <strong>Symptoms:</strong> <p>{a.symptoms}</p>
          </div>
        )}
        {a.notes && (
          <div className="appointment-notes">
            <strong>Notes:</strong> <p>{a.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="filter-section">
      <h3>Filters</h3>
      <div className="filter-controls">
        <div className="filter-group">
          <label>From Date:</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>To Date:</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Appointment Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="virtual">Virtual</option>
            <option value="telehealth">Telehealth</option>
          </select>
        </div>
        {(filterDateFrom || filterDateTo || filterType !== "all") && (
          <button
            className="btn-clear-filters"
            onClick={() => {
              setFilterDateFrom("");
              setFilterDateTo("");
              setFilterType("all");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  const renderDetailsModal = () => {
    if (!selectedAppointment) return null;
    const a = selectedAppointment;
    return (
      <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Appointment Details</h2>
            <button
              className="btn-close"
              onClick={() => setShowDetailsModal(false)}
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="detail-row">
              <span className="label">Patient Name:</span>{" "}
              <span className="value">{a.patient?.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email:</span>{" "}
              <span className="value">{a.patient?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Date:</span>{" "}
              <span className="value">{formatDate(a.appointmentDate)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Time:</span>{" "}
              <span className="value">{formatTimeSlot(a.selectedTimeSlot)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Type:</span>{" "}
              <span className="value">
                {getTypeIcon(a.appointmentType)} {a.appointmentType}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>{" "}
              <span
                className="value"
                style={{ color: getStatusColor(a.status), fontWeight: "bold" }}
              >
                {a.status}
              </span>
            </div>
            {a.symptoms && (
              <div className="detail-row">
                <span className="label">Symptoms:</span>{" "}
                <span className="value">{a.symptoms}</span>
              </div>
            )}
            {a.notes && (
              <div className="detail-row">
                <span className="label">Notes:</span>{" "}
                <span className="value">{a.notes}</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {a.status !== "completed" && a.status !== "cancelled" && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    completeAppointment(a._id);
                    setShowDetailsModal(false);
                  }}
                >
                  Mark Complete
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    cancelAppointment(a._id, a.patient._id);
                    setShowDetailsModal(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) return <div className="loading">Loading...</div>;
  if (!user || user.role.toLowerCase() !== "doctor")
    return (
      <div className="error">Access denied. Only doctors can view this page.</div>
    );

  return (
    <div className="doctor-appointments-page">
      <button
        className="back-dashboard-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>
      <div className="page-header">
        <h1>📅 Appointments</h1>
        <p>Manage your patient appointments</p>
      </div>
      {renderStatsCards()}
      {renderTabs()}
      {renderFilters()}

      <div className="appointments-section">
        <h3>
          Appointments{" "}
          {getTabAppointments().length > 0 &&
            `(${getTabAppointments().length})`}
        </h3>

        {isLoading && <div className="loading">Loading appointments...</div>}
        {!isLoading && getTabAppointments().length === 0 && (
          <div className="no-appointments">
            <p>No appointments found</p>
          </div>
        )}
        {!isLoading && getTabAppointments().length > 0 && (
          <div className="appointments-list">
            {getTabAppointments().map(renderAppointmentCard)}
          </div>
        )}
      </div>
      {showDetailsModal && renderDetailsModal()}
    </div>
  );
};

export default DoctorAppointmentsPage;
