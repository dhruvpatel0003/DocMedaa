import React from 'react';
import { formatDate, formatTimeSlot, getStatusColor, getAppointmentTypeIcon } from '../utils/helpers';

const DetailsModal = ({ appointment, isOpen, onClose, onAction }) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Appointment Details</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="detail-row">
            <span className="label">Patient Name:</span>
            <span className="value">{appointment.patient?.fullName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{appointment.patient?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{formatDate(appointment.appointmentDate)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Time:</span>
            <span className="value">{formatTimeSlot(appointment.selectedTimeSlot)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Type:</span>
            <span className="value">
              {getAppointmentTypeIcon(appointment.appointmentType)} {appointment.appointmentType}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span
              className="value"
              style={{
                color: getStatusColor(appointment.status),
                fontWeight: 'bold'
              }}
            >
              {appointment.status}
            </span>
          </div>
          {appointment.symptoms && (
            <div className="detail-row">
              <span className="label">Symptoms:</span>
              <span className="value">{appointment.symptoms}</span>
            </div>
          )}
          {appointment.notes && (
            <div className="detail-row">
              <span className="label">Notes:</span>
              <span className="value">{appointment.notes}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <>
              <button
                className="btn btn-success"
                onClick={() => onAction('complete')}
              >
                Mark Complete
              </button>
              <button
                className="btn btn-warning"
                onClick={() => onAction('cancel')}
              >
                Cancel
              </button>
            </>
          )}
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
