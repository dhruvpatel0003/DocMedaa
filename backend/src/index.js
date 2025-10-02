const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Body parser middleware
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
