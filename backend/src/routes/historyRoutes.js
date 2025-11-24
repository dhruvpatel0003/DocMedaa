const express = require('express');

const authMiddleware = require("../middleware/auth.js");
const { getPastAppointments, getExportPastAppointments } = require('../controllers/historyController.js'); 

const router = express.Router();

router.get('/past-appointments', authMiddleware, getPastAppointments);
router.get('/past-appointments/export', authMiddleware, getExportPastAppointments);

module.exports = router;
