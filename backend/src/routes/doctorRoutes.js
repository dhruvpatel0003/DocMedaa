const express = require('express');
const {
    getAllDoctors,
    getDoctorsBySpecialty,
    getDoctorsBySpecificSpecialty,
    getAllSpecialties,
    getDoctorById,
    searchDoctors
} = require('../controllers/doctorController.js');
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

router.get('/all/doctors', authMiddleware, getAllDoctors);

// Get doctors grouped by specialty
router.get('/by-specialty', authMiddleware, getDoctorsBySpecialty);

// Get doctors by specific specialty (query param)
router.get('/specialty', authMiddleware, getDoctorsBySpecificSpecialty);

// Get all unique specialties
router.get('/specialties', authMiddleware, getAllSpecialties);

// Search doctors
router.get('/search', authMiddleware, searchDoctors);

// Get doctor by ID
router.get('/:doctorId', authMiddleware, getDoctorById);

module.exports = router;
