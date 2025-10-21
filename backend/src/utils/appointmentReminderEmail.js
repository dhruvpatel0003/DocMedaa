const cron = require("node-cron");
const Appointment = require("../models/appointment.js");
const sendEmail = require("./sendEmail.js");

const sendAppointmentReminder  = () => {
    cron.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    let hour12 = currentHours % 12 || 12;
    const period = currentHours >= 12 ? "PM" : "AM";

    const formattedCurrentTime = `${hour12}:${currentMinutes.toString().padStart(2, "0")}`;
    console.log("Current Time:", formattedCurrentTime, period);
    try {

        const appointments = await Appointment.find({
            status: "pending",//NEEDS TO UPDATE
        })
            .populate("patientId doctorId");
        console.log('appointmentsssssssssssss: ', appointments);
        for (const appt of appointments) {
            const { from, period: appointmentPeriod } = appt.date;

            // Email content for the patient
            const patientMsg = `
        <h3>Appointment Reminder</h3>
        <p>Dear ${appt.patient.fullName},</p>
        <p>This is a reminder that you have an appointment scheduled with <strong>Dr. ${appt.doctor.fullName}</strong> at <strong>${time}</strong>.</p>
        <p>Please make sure to arrive a few minutes early.</p>
        <p>— DocMedaa Team</p>
      `;

            // Email content for the doctor
            const doctorMsg = `
        <h3>Appointment Reminder</h3>
        <p>Dear Dr. ${appt.doctor.fullName},</p>
        <p>You have an appointment with <strong>${appt.patient.fullName}</strong> at <strong>${time}</strong>.</p>
        <p>Please be ready for your session.</p>
        <p>— DocMedaa Team</p>
      `;
            if (appointmentPeriod === period) {
                const [appHour, appMinute] = from.split(":").map(Number);
                const appTotalMinutes = appHour * 60 + appMinute;
                const nowTotalMinutes = hour12 * 60 + currentMinutes;

                // Send reminder if appointment starts within the next 60 minutes
                // if (appTotalMinutes - nowTotalMinutes <= 60 && appTotalMinutes - nowTotalMinutes > 0) {
                if (appt.patient?.email) await sendEmail(appt.patient.email, "Appointment Reminder", patientMsg);
                if (appt.doctor?.email) await sendEmail(appt.doctor.email, "Upcoming Appointment", doctorMsg);
                // }
            }
        }

        console.log(`Sent ${appointments.length} appointment reminder emails`);
    } catch (error) {
        console.error("Error in reminder email job:", error.message);
    }
});

}

module.exports = sendAppointmentReminder;