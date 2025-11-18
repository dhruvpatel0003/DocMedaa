import React from 'react';

const ActionModal = ({ appointment, actionType, isOpen, isLoading, onClose, onConfirm }) => {
  if (!isOpen || !appointment) return null;

  const actionTexts = {
    'complete': {
      title: 'Complete Appointment',
      message: 'Are you sure you want to mark this appointment as completed?',
      btnText: 'Complete'
    },
    'cancel': {
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      btnText: 'Cancel'
    }
  };

  const action = actionTexts[actionType] || actionTexts['complete'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{action.title}</h2>
        </div>
        <div className="modal-body">
          <p>{action.message}</p>
          <p className="patient-name">Patient: {appointment.patient?.fullName}</p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-danger"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? 'Processing...' : action.btnText}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
