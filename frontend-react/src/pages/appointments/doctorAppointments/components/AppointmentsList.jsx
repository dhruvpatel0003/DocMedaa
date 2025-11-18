import React from 'react';
import AppointmentCard from './AppointmentCard';

const AppointmentsList = ({ appointments, isLoading, onSelectAppointment }) => {
  if (isLoading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="appointments-section">
        <h3>Appointments</h3>
        <div className="no-appointments">
          <p>No appointments found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-section">
      <h3>Appointments ({appointments.length})</h3>
      <div className="appointments-list">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
            onClick={() => onSelectAppointment(appointment)}
          />
        ))}
      </div>
    </div>
  );
};

export default AppointmentsList;
