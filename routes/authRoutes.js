const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/UserModel');
const ApiKey = require('../models/ApiKeyModel');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyAdmin } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const AppError = require('../utils/appError');
const {
    validateApiKeyBody,
    validateLoginBody,
    validateRegisterBody
} = require('../utils/validators');

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// POST /auth/register
router.post('/register', validateBody(validateRegisterBody), asyncHandler(async (req, res) => {
    const { firstname, lastname, email, username, password } = req.body;

    const existing = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existing) {
        throw new AppError(400, 'Email or username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        firstname,
        lastname,
        email,
        username,
        password: hashedPassword,
        role: 'user'
    });

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
}));

// POST /auth/login
router.post('/login', validateBody(validateLoginBody), asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError(401, 'Wrong password');
    }

    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        SECRET,
        { expiresIn: '1d' }
    );

    res.json({
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}));

// POST /auth/generate-key - admin only
router.post('/generate-key', verifyAdmin, validateBody(validateApiKeyBody), asyncHandler(async (req, res) => {
    const { name } = req.body;
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = await ApiKey.create({ key, name });
    res.status(201).json({ message: 'API key generated', apiKey });
}));

module.exports = router;
