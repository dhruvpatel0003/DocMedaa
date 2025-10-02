// Response handler
exports.successResponse = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data
    });
};

exports.errorResponse = (res, error, statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

// Async handler to remove try-catch boilerplate
exports.asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validation helper
exports.validateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

// Error class for operational errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

exports.AppError = AppError;