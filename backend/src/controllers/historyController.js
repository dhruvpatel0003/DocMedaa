import Appointment from "../models/appointment.js";
import XLSX from "xlsx";

export const getPastAppointments = async (req, res) => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    let appointments;
    const user = req.user;
    console.log("userrrrrrrrrrr", user);

    if (user.role.toLowerCase() === "doctor") {
      console.log("inside doctorrrrrrrrrrr");
      appointments = await Appointment.find({
        doctor: user.id,
        appointmentDate: { $gte: twoWeeksAgo },
      })
        .populate("patient", "fullName email phone")
        .sort({ appointmentDate: -1 });
    } else {
      appointments = await Appointment.find({
        patient: user.id,
        appointmentDate: { $gte: twoWeeksAgo },
      })
        .populate("doctor", "fullName hospitalName hospitalPhone specialty")
        .sort({ appointmentDate: -1 });
    }

    res.json({
      success: true,
      data: appointments,
      message:
        "Appointments from last 2 weeks will be deleted automatically after 2 weeks. Download your history now.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExportPastAppointments = async (req, res) => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    let appointments;
    const user = req.user;

    if (user.role.toLowerCase() === "doctor") {
      appointments = await Appointment.find({
        doctor: user.id,
        appointmentDate: { $gte: twoWeeksAgo },
      })
        .populate("patient", "fullName email")
        .sort({ appointmentDate: -1 });
    } else {
      appointments = await Appointment.find({
        patient: user.id,
        appointmentDate: { $gte: twoWeeksAgo },
      })
        .populate("doctor", "fullName specialty address")
        .sort({ appointmentDate: -1 });
    }
    console.log("inside export appointmentsssssssssss", appointments,user);
    // Format data for Excel
    const excelData = appointments.map((appointment) => {
      const baseData = {
        "Appointment ID": appointment._id.toString(),
        Date: new Date(appointment.appointmentDate).toLocaleDateString(),
        Status: appointment.status,
        Type: appointment.appointmentType,
      };

      if (user.role.toLowerCase() === "doctor") {
        return {
          ...baseData,
          "Patient Name": `${appointment.patient.fullName}`,
          "Patient Email": appointment.patient.email,
          Notes: appointment.notes || "",
        };
      } else {
        return {
          ...baseData,
          "Doctor Name": `${appointment.doctor.fullName}`,
          Specialty: appointment.doctor.specialty,
          Location: appointment.doctor.address || "",
        };
      }
    });

    console.log("Excel Data:", excelData);

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

    // Set column widths
    const wscols = [
      { wch: 15 }, // Appointment ID
      { wch: 12 }, // Date
      { wch: 10 }, // Status
      { wch: 12 }, // Type
      { wch: 20 }, // Name/Email/Specialty
      { wch: 25 }, // Notes/Location
    ];
    worksheet["!cols"] = wscols;

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set headers for download
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // res.setHeader('Content-Disposition', `attachment; filename=appointment_history_${user.role}_${new Date().toISOString().slice(0,10)}.xlsx`);

    // res.send(excelBuffer);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=appointment_history_${user.role}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
    res.send(excelBuffer);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
