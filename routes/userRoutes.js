const express = require('express');
const User = require('../models/UserModel');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /users — lahat ng users with pagination (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .limit(limit)
            .skip(skip);

        const total = await User.countDocuments();

        res.json({ total, page, limit, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /users/:id — single user (admin only)
router.get('/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /users/:id — update user (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /users/:id — delete user (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;