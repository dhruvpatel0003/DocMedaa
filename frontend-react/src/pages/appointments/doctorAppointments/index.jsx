import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import ApiService from "../../../../services/ApiService";
import { showSnackBar } from "../../../../utils/helpers";
import StatsCards from "./components/StatsCards";
import FilterSection from "./components/FilterSection";
import AppointmentsList from "./components/AppointmentsList";
import DetailsModal from "./components/DetailsModal";
import ActionModal from "./components/ActionModal";
import {
  fetchAppointmentsService,
  updateAppointmentService,
  cancelAppointmentService,
} from "./utils/appointmentService";
import "../../styles/DoctorAppointments.css";
import { useNavigate } from "react-router-dom";

const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const userToken = localStorage.getItem("token");

  // Appointments data
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");

  // Stats
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
  });

  // Fetch appointments on component mount
  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchAllAppointments();
    }
  }, [user]);

  // Apply filters and calculate stats
  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [appointments, filterDateFrom, filterDateTo, filterType]);

  // Fetch all appointments
  const fetchAllAppointments = async () => {
    const result = await fetchAppointmentsService(userToken, setIsLoading);
    if (result.success) {
      setAppointments(result.data);
    } else {
      showSnackBar(result.message, "error");
    }
  };

  // Update appointment status
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    const result = await updateAppointmentService(
      appointmentId,
      newStatus,
      userToken,
      setIsLoading
    );

    if (result.success) {
      showSnackBar(`Appointment ${newStatus} successfully`, "success");
      fetchAllAppointments();
      setShowActionModal(false);
      setSelectedAppointment(null);
    } else {
      showSnackBar(result.message, "error");
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId, patientId) => {
    const result = await cancelAppointmentService(
      appointmentId,
      patientId,
      userToken,
      setIsLoading
    );

    if (result.success) {
      showSnackBar("Appointment cancelled successfully", "success");
      fetchAllAppointments();
      setShowActionModal(false);
      setSelectedAppointment(null);
    } else {
      showSnackBar(result.message, "error");
    }
  };

  // Apply filters to appointments
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

  // Calculate appointment statistics
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });

    const completed = todayAppointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const total = todayAppointments.length;
    const remaining = total - completed;

    setAppointmentStats({ total, completed, remaining });
  };

  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user || user.role.toLowerCase() !== "doctor") {
    return (
      <div className="error">
        Access denied. Only doctors can view this page.
      </div>
    );
  }

  return (
    <div className="doctor-appointments-page">
      <div className="page-header">
        <h1>📅 Appointments</h1>
        <p>Manage your patient appointments</p>
      </div>

      <StatsCards stats={appointmentStats} />

      <FilterSection
        filterDateFrom={filterDateFrom}
        filterDateTo={filterDateTo}
        filterType={filterType}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        onTypeChange={setFilterType}
      />

      <AppointmentsList
        appointments={filteredAppointments}
        isLoading={isLoading}
        onSelectAppointment={(apt) => {
          setSelectedAppointment(apt);
          setShowDetailsModal(true);
        }}
      />

      <DetailsModal
        appointment={selectedAppointment}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onAction={(action) => {
          setActionType(action);
          setShowActionModal(true);
        }}
      />

      <ActionModal
        appointment={selectedAppointment}
        actionType={actionType}
        isOpen={showActionModal}
        isLoading={isLoading}
        onClose={() => setShowActionModal(false)}
        onConfirm={() => {
          if (actionType === "cancel") {
            handleCancelAppointment(
              selectedAppointment._id,
              selectedAppointment.patient._id
            );
          } else {
            handleUpdateAppointmentStatus(selectedAppointment._id, "completed");
          }
        }}
      />
      <button
        className="btn btn-secondary back-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default DoctorAppointmentsPage;
