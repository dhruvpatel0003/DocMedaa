
const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  bookAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlotsForDoctor,
} = require("../controllers/appointmentController.js");
router.post("/book", authMiddleware, bookAppointment);
router.get("/all-appointments", authMiddleware, getAllAppointments);
router.put("/update/:appointment_id", authMiddleware, updateAppointmentStatus);
router.put("/cancel/:appointment_id", authMiddleware, cancelAppointment);
router.get('/available-slots', authMiddleware, getAvailableSlotsForDoctor);
router.get("/:appointment_id", authMiddleware, getAppointmentById);

module.exports = router;
