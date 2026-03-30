const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') 
            return res.status(403).json({ message: 'Admin access only' });
        next();
    });
};

module.exports = { verifyToken, verifyAdmin };