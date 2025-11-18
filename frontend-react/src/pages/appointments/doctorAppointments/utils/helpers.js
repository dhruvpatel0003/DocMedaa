export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeSlot = (slot) => {
  if (!slot) return 'N/A';
  return `${slot.from} - ${slot.to} ${slot.period || ''}`;
};

export const getStatusColor = (status) => {
  const colors = {
    'pending': '#FFA500',
    'scheduled': '#007BFF',
    'completed': '#28A745',
    'cancelled': '#DC3545',
    'reScheduled': '#6C757D'
  };
  return colors[status] || '#6C757D';
};

export const getAppointmentTypeIcon = (type) => {
  const icons = {
    'in-person': '🏥',
    'virtual': '💻',
    'telehealth': '📱'
  };
  return icons[type] || '📅';
};
