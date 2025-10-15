import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, symptoms, selectedTimeSlot, notes, appointmentType } = req.body;
        const userID = req.user.id;

        if (appointmentDate == null || selectedTimeSlot == null || appointmentType == null) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const doctor = await Doctor.findById(doctorId);
        const patient = await Patient.findById(userID);

        if (!doctor || !patient) {
            return res.status(404).json({ message: "Doctor or Patient not found" });
        }

        const appointment = await Appointment.create({
            patient: userID,
            doctor: doctorId,
            appointmentDate,
            selectedTimeSlot,
            notes,
            appointmentType,
            symptoms,
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

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { status } = req.body;
        const { id, role } = req.user;

        if (status.toLowerCase() === "complete" || status.toLowerCase() === "completed") {
            const isThisDoctor = await Doctor.findById(id);
            if (!isThisDoctor) {
                return res.status(403).json({ message: "Only doctors can mark appointments as complete" });
            }
        }

        if (!["scheduled", "reScheduled", "cancelled"].includes(status.toLowerCase())) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        const isPatient = req.user.role === 'Patient' && appointment.patient._id.toString() === req.user.id;
        const isDoctor = req.user.role === 'Doctor' && appointment.doctor._id.toString() === req.user.id;

        if (!isPatient && !isDoctor) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to view this appointment.' });
        }

        if (role === "Doctor" && appointment.doctor.toString() !== id) {
            return res.status(403).json({ message: "Not your appointment" });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: "Status updated", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;

        const appointmentValidation = await Appointment.findById(appointment_id);

        const isPatient = appointmentValidation.patient._id.toString() === req.user.id;
        const isDoctor = appointmentValidation.doctor._id.toString() === req.user.id;

        if (!isPatient && !isDoctor) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to update this appointment.' });
        }


        await Appointment.findByIdAndDelete(
            appointment_id,
        );

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
        res.status(500).json({ success: false, message: error.message });
    }
};
