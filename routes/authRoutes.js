const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const verifyApiKey = require('../middleware/apiKey');
const User = require('../models/UserModel');
const ApiKey = require('../models/ApiKeyModel');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, username, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            firstname, lastname, email, username, 
            password: hashedPassword, role
        });

        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /auth/generate-key — admin only
router.post('/generate-key', verifyApiKey, verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const key = crypto.randomBytes(32).toString('hex');
        const apiKey = await ApiKey.create({ key, name });
        res.status(201).json({ message: 'API key generated', apiKey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;