const express = require('express');
const Product = require('../models/ProductModel');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyAdmin } = require('../middleware/auth');
const { validateBody, validateParam } = require('../middleware/validate');
const AppError = require('../utils/appError');
const pickAllowedFields = require('../utils/pickAllowedFields');
const { validateObjectId, validateProductBody } = require('../utils/validators');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true });
    res.json(products);
}));

router.get('/:id', validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.id,
        isActive: true
    });

    if (!product) {
        throw new AppError(404, 'Product not found');
    }

    res.json(product);
}));

router.post('/', verifyAdmin, validateBody((body) => validateProductBody(body)), asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created', product });
}));

router.put('/:id', verifyAdmin, validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const allowedFields = pickAllowedFields(req.body, ['name', 'price', 'stock', 'category']);
    const updates = validateProductBody(allowedFields, { partial: true });

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new AppError(404, 'Product not found');
    }

    res.json({ message: 'Product updated', product });
}));

router.delete('/:id', verifyAdmin, validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new AppError(404, 'Product not found');
    }

    res.json({ message: 'Product archived', product });
}));

module.exports = router;
