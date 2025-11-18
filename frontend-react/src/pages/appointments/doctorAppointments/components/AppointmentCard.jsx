import React from 'react';
import { formatDate, formatTimeSlot, getStatusColor, getAppointmentTypeIcon } from '../utils/helpers';

const AppointmentCard = ({ appointment, onClick }) => {
  return (
    <div className="appointment-card" onClick={onClick}>
      <div className="appointment-header">
        <div className="appointment-type">
          {getAppointmentTypeIcon(appointment.appointmentType)}
          <span>{appointment.appointmentType}</span>
        </div>
        <span
          className="appointment-status"
          style={{ backgroundColor: getStatusColor(appointment.status) }}
        >
          {appointment.status}
        </span>
      </div>

      <div className="appointment-body">
        <div className="patient-info">
          <h4>{appointment.patient?.fullName || 'Unknown Patient'}</h4>
          <p className="appointment-time">
            {formatDate(appointment.appointmentDate)} | {formatTimeSlot(appointment.selectedTimeSlot)}
          </p>
          <p className="appointment-contact">
            📧 {appointment.patient?.email || 'No email'}
          </p>
        </div>

        {appointment.symptoms && (
          <div className="appointment-symptoms">
            <strong>Symptoms:</strong>
            <p>{appointment.symptoms}</p>
          </div>
        )}

        {appointment.notes && (
          <div className="appointment-notes">
            <strong>Notes:</strong>
            <p>{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
