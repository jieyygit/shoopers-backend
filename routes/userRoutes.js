const express = require('express');
const User = require('../models/UserModel');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyAdmin } = require('../middleware/auth');
const { validateParam, validateQuery } = require('../middleware/validate');
const AppError = require('../utils/appError');
const pickAllowedFields = require('../utils/pickAllowedFields');
const {
    validateObjectId,
    validatePaginationQuery,
    validateUserUpdateBody
} = require('../utils/validators');

const router = express.Router();

// GET /users - paginated users (admin only)
router.get('/', verifyAdmin, validateQuery(validatePaginationQuery), asyncHandler(async (req, res) => {
    const { page, limit } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('-password')
        .limit(limit)
        .skip(skip);

    const total = await User.countDocuments();

    res.json({ total, page, limit, users });
}));

// GET /users/:id - single user (admin only)
router.get('/:id', verifyAdmin, validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    res.json(user);
}));

// PUT /users/:id - update user (admin only)
router.put('/:id', verifyAdmin, validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const allowedFields = pickAllowedFields(req.body, ['firstname', 'lastname', 'email', 'username', 'role']);
    const updates = validateUserUpdateBody(allowedFields);

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    res.json({ message: 'User updated', user });
}));

// DELETE /users/:id - delete user (admin only)
router.delete('/:id', verifyAdmin, validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    res.json({ message: 'User deleted' });
}));

module.exports = router;
