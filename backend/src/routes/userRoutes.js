const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// Middleware example (you would use actual auth middleware in a real application)
const { protect } = require('../middleware/auth');

// User routes
router.route('/')
    .get(getUsers)
    // .post(createUser);

router.route('/:id')
    .get(protect, getUser)
    .put(protect, updateUser)
    .delete(protect, deleteUser);

module.exports = router;