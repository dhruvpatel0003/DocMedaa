import ApiService from '../../../../../services/ApiService';

export const fetchAppointmentsService = async (token, setIsLoading) => {
  try {
    setIsLoading(true);
    const response = await ApiService.request(
      '/appointments/all-appointments',
      'GET',
      null,
      token
    );

    if (response.success && response.data) {
      const sortedAppointments = (Array.isArray(response.data) ? response.data : [])
        .map(apt => ({
          ...apt,
          appointmentDate: new Date(apt.appointmentDate)
        }))
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

      return {
        success: true,
        data: sortedAppointments,
        message: 'Appointments fetched successfully'
      };
    } else {
      return {
        success: false,
        data: [],
        message: 'Failed to fetch appointments'
      };
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return {
      success: false,
      data: [],
      message: 'Error fetching appointments'
    };
  } finally {
    setIsLoading(false);
  }
};

export const updateAppointmentService = async (appointmentId, status, token, setIsLoading) => {
  try {
    setIsLoading(true);
    const response = await ApiService.request(
      `/appointments/update/${appointmentId}`,
      'PUT',
      { status },
      token
    );

    if (response.success) {
      return {
        success: true,
        message: `Appointment ${status} successfully`
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update appointment'
      };
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    return {
      success: false,
      message: 'Error updating appointment'
    };
  } finally {
    setIsLoading(false);
  }
};

export const cancelAppointmentService = async (appointmentId, patientId, token, setIsLoading) => {
  try {
    setIsLoading(true);
    const response = await ApiService.request(
      `/appointments/cancel/${appointmentId}`,
      'PUT',
      { appointment_with: patientId },
      token
    );

    if (response.success) {
      return {
        success: true,
        message: 'Appointment cancelled successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to cancel appointment'
      };
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return {
      success: false,
      message: 'Error cancelling appointment'
    };
  } finally {
    setIsLoading(false);
  }
};
