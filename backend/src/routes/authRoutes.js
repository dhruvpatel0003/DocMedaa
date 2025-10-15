const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// PUT /api/auth/complete-profile/:role/:id
// role = Doctor|Patient
router.put('/complete-profile/:role/:id', authController.completeProfile);

module.exports = router;
