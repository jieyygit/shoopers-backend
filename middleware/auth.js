const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next(new AppError(401, 'No token provided'));

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return next(new AppError(403, 'Invalid or expired token'));
        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return next(new AppError(403, 'Admin access only'));
        }
        next();
    });
};

module.exports = { verifyToken, verifyAdmin };
