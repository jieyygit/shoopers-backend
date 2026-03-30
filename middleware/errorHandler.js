const AppError = require('../utils/appError');

const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500);
    let message = err.message || 'Internal server error';

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    if (err.code === 11000) {
        statusCode = 400;
        const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
        message = `${duplicateField} already exists`;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(', ');
    }

    res.status(statusCode).json({ message });
};

module.exports = { errorHandler, notFoundHandler };
