import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";
import Notification from "../models/notification.js";

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, symptoms, selectedTimeSlot, notes, appointmentType } = req.body;
        console.log("Booking appointment with data:", req.body);
        const userID = req.user.id;
        console.log("Authenticated user ID:", userID);
        if (appointmentDate == null || selectedTimeSlot == null || appointmentType == null) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const doctor = await Doctor.findById(doctorId);
        const patient = await Patient.findById(userID);
        console.log("Found doctor:", doctor);
        console.log("Found patient:", patient);

        if (!doctor || !patient) {
            return res.status(404).json({ message: "Doctor or Patient not found" });
        }

        const appointment = await Appointment.create({
            patient: userID,
            doctor: doctorId,
            appointmentDate,
            selectedTimeSlot,
            notes,
            status : "scheduled",
            appointmentType: appointmentType.toLowerCase(),
            symptoms,
        });

        await Notification.create({
            recipient: doctorId,
            sender: userID,
            type: "Appointment",
            title: "New Appointment Booked",
            message: `You have a new appointment booked by ${patient.fullName} on ${new Date(appointmentDate).toLocaleDateString()} from ${selectedTimeSlot.from} to ${selectedTimeSlot.to} ${selectedTimeSlot.period}.`,
        });

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// export const getAppointments = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let filter = {};

//     const role = await 
//     if (role === "Doctor") filter = { doctor: id };
//     if (role === "Patient") filter = { patient: id };

//     const appointments = await Appointment.find(filter)
//       .populate("doctor", "fullName email specialty")
//       .populate("patient", "fullName email");

//     res.status(200).json(appointments);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateAppointmentStatus = async (req, res) => {
//     try {
//         const { appointment_id } = req.params;
//         const { status } = req.body;
//         const { id, role } = req.user;
//         console.log("Updating appointment status:", appointment_id, status, "by user:", id, role);
//         if (status.toLowerCase() === "complete" || status.toLowerCase() === "completed") {
//             const isThisDoctor = await Doctor.findById(id);
//             if (!isThisDoctor) {
//                 return res.status(403).json({ message: "Only doctors can mark appointments as complete" });
//             }
//         }

//         if (!["scheduled", "reScheduled", "cancelled", "complete", "completed"].includes(status.toLowerCase())) {
//             return res.status(400).json({ message: "Invalid status" });
//         }

//         const appointment = await Appointment.findById(appointment_id);
//         if (!appointment) return res.status(404).json({ message: "Appointment not found" });

//         const isPatient = req.user.role === 'Patient' && appointment.patient._id.toString() === req.user.id;
//         const isDoctor = req.user.role === 'Doctor' && appointment.doctor._id.toString() === req.user.id;

//         if (!isPatient && !isDoctor) {
//             return res.status(403).json({ message: 'Access denied. You are not authorized to view this appointment.' });
//         }

//         if (role === "Doctor" && appointment.doctor.toString() !== id) {
//             return res.status(403).json({ message: "Not your appointment" });
//         }

//         appointment.status = status;
//         await appointment.save();

//         res.status(200).json({ message: "Status updated", appointment });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.body;
    const { id, role } = req.user;

    const appointment = await Appointment.findById(appointment_id)
      .populate('doctor', 'fullName')
      .populate('patient', 'fullName');

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const isPatient = appointment.patient._id.toString() === req.user.id;
    const isDoctor = appointment.doctor._id.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    appointment.status = status;
    await appointment.save();

    // Send notification only if completed or rescheduled by doctor
    let notifyStatus = null;
    if (role === "Doctor" && (status === "completed" || status === "reScheduled")) {
      notifyStatus = status;
    }
    if (notifyStatus) {
      await Notification.create({
        recipient: appointment.patient._id,
        sender: req.user.id,
        type: "Appointment",
        title: `Appointment ${notifyStatus === "completed" ? "Completed" : "Rescheduled"}`,
        message:
          notifyStatus === "completed"
            ? `Your appointment with Dr. ${appointment.doctor.fullName} on ${appointment.appointmentDate.toLocaleDateString()} has been marked as completed.`
            : `Your appointment with Dr. ${appointment.doctor.fullName} on ${appointment.appointmentDate.toLocaleDateString()} has been rescheduled.`
      });
    }

    res.status(200).json({ message: "Status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const cancelAppointment = async (req, res) => {
//     try {
//         const { appointment_id } = req.params;
//         const { appointment_with  } = req.body; //NEED TO UPDATE LOGIC
//         const appointmentValidation = await Appointment.findById(appointment_id);

//         const isPatient = appointmentValidation.patient._id.toString() === req.user.id;
//         const isDoctor = appointmentValidation.doctor._id.toString() === req.user.id;

//         if (!isPatient && !isDoctor) {
//             return res.status(403).json({ message: 'Access denied. You are not authorized to update this appointment.' });
//         }

//         await Notification.create({
//                 recipient: appointment_with,
//                 sender: req.user.id,
//                 type: "Appointment",
//                 title: "Appointment Cancelled",
//                 message: `Appointment Cancelled by ${req.user.role}`,
//             });

//         await Appointment.findByIdAndDelete(
//             appointment_id,
//         );

//         res.status(200).json({ message: "Appointment cancelled" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const cancelAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const appointment = await Appointment.findById(appointment_id)
      .populate('doctor', 'fullName')
      .populate('patient', 'fullName');

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const isPatient = appointment.patient._id.toString() === req.user.id;
    const isDoctor = appointment.doctor._id.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Notify recipient (the other party)
    const recipient = isPatient ? appointment.doctor._id : appointment.patient._id;
    const recipientName = isPatient ? `Dr. ${appointment.doctor.fullName}` : appointment.patient.fullName;
    const who = isPatient ? "Patient" : "Doctor";
    await Notification.create({
      recipient: recipient,
      sender: req.user.id,
      type: "Appointment",
      title: "Appointment Cancelled",
      message: `Your appointment with ${recipientName} on ${appointment.appointmentDate.toLocaleDateString()} has been cancelled by the ${who}.`
    });

    await Appointment.findByIdAndDelete(appointment_id);

    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllAppointments = async (req, res) => {
    try {
        const { role, id } = req.user;
        const filter = role === "Doctor" ? { doctor: id } : { patient: id };

        const appointments = await Appointment.find(filter)
            .populate(role === "Doctor" ? "patient" : "doctor", "fullName email")
            .sort({ date: 1 });
<<<<<<< HEAD
        // console.log("Fetched appointments:", appointments);
=======
        console.log("Fetched appointments:", appointments);
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { role, id } = req.user;

        const appointment = await Appointment.findById(appointment_id)
            .populate("patient", "fullName email")
            .populate("doctor", "fullName specialty");

        if (!appointment)
            return res.status(404).json({ success: false, message: "Appointment not found" });

        if (
            role === "Patient" && appointment.patient._id.toString() !== id ||
            role === "Doctor" && appointment.doctor._id.toString() !== id
        ) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false,message: error.message });
    }
};

// GET /appointments/available-slots?doctorId=...&date=YYYY-MM-DD
export const getAvailableSlotsForDoctor = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: "doctorId and date are required" });
    }

    // Defensive: fetch doctor and check timings
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !Array.isArray(doctor.clinicTimings)) {
      return res.status(200).json([]);
    }

    // Day matching
    const dateObj = new Date(date);
    // safely get weekday in lower case ('monday', etc.)
    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    // Get all slots matching that day only!
    const slots = doctor.clinicTimings.filter(slot =>
      typeof slot.day === 'string' &&
      slot.day.toLowerCase() === dayOfWeek
    );

    // Defensive: no slots for that day
    if (!slots.length) {
      return res.status(200).json([]);
    }

    // Appointments for the doctor and exact day (midnight to next midnight, ignoring time)
    const dayStart = new Date(date);          // e.g., '2025-11-17T00:00:00.000Z'
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: dayStart, $lt: dayEnd }
    });

    // Make a set of reserved slot keys (from|to)
    const taken = new Set(
      appointments.map(app =>
        app.selectedTimeSlot ? `${app.selectedTimeSlot.from}|${app.selectedTimeSlot.to}` : ""
      )
    );

    // Mark each slot as available or not
    const response = slots.map(slot => ({
      from: slot.from,
      to: slot.to,
      availabilityStatus: !taken.has(`${slot.from}|${slot.to}`)
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getAvailableSlotsForDoctor:', error);
    res.status(500).json({ message: error.message });
  }
};
