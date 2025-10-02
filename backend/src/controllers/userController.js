const User = require('../models/User');

// Get all users
exports.getUsers = async (req, res) => {
    try {
        // const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            // count: users.length,
            // data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get single user
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Create user
exports.createUser = async (req, res) => {
    try {
        // const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            // data: user
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};