const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/complete-profile/:role/:id', authController.completeProfile);

router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password-verify/:token", authController.verifyResetToken);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
