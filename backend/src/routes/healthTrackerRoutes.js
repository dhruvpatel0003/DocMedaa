const express = require('express');
const { getGoogleAuthenticate, getFitnessData, handleAuthCallback } = require('../controllers/healthTrackerController.js');
const authMiddleware = require("../middleware/auth.js");
const router = express.Router();

// Usually, /auth-url and /auth-callback should NOT have auth middleware
router.get('/auth-url', getGoogleAuthenticate);
router.get('/auth-callback', handleAuthCallback);

router.get('/fitness-data', authMiddleware, getFitnessData);

module.exports = router;
