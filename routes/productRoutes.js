const express = require('express');
const Product = require('../models/ProductModel');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { name, price, stock, category } = req.body;
        const product = await Product.create({ name, price, stock, category });
        res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated', product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product archived', product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
