const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require("../middleware/auth.js");

router.get('/:id', authMiddleware, userController.getUserProfileById);
// router.get("/reset-password-verify/:token", authController.verifyResetToken);

module.exports = router;
