const express = require('express');
const { getGoogleAuthenticate, getFitnessData, handleAuthCallback, getFitStatus, setGoogleFitShare, getPatientGoogleFitData, getSharedPatients, getPatientGoogleFitSummary } = require('../controllers/healthTrackerController.js');
const authMiddleware = require('../middleware/auth.js');
const router = express.Router();

// Usually, /auth-url and /auth-callback should NOT have auth middleware
router.post('/auth-url',getGoogleAuthenticate);
router.get('/auth-callback',handleAuthCallback);
router.get("/status",authMiddleware, getFitStatus);
router.get('/fitness-data', authMiddleware, getFitnessData);
router.post('/share', authMiddleware, setGoogleFitShare); // patient
router.get("/patient-data/:patientId", authMiddleware, getPatientGoogleFitData);
router.get("/shared-patients", authMiddleware, getSharedPatients); // for self
router.get(
  "/shared/:patientId",
  authMiddleware,
  getPatientGoogleFitSummary
);

module.exports = router;
