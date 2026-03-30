const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const Cart = require('../models/CartModel');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

const badRequestError = (message) => {
    const err = new Error(message);
    err.status = 400;
    return err;
};

// GET /orders - all orders (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .populate('userId', 'firstname lastname email')
            .populate('items.productId', 'name price isActive')
            .limit(limit)
            .skip(skip);

        const total = await Order.countDocuments();

        res.json({ total, page, limit, orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /orders/my - logged in user's orders
router.get('/my', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.productId', 'name price isActive');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /orders/:id - single order
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'firstname lastname email')
            .populate('items.productId', 'name price isActive');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /orders - checkout from cart
router.post('/', verifyToken, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { shippingAddress } = req.body;
        const safeAddress = typeof shippingAddress === 'string' ? shippingAddress.trim() : '';

        if (!safeAddress) {
            throw badRequestError('Shipping address is required');
        }

        let createdOrder = null;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ userId: req.user.id }).session(session);
            if (!cart || cart.items.length === 0) {
                throw badRequestError('Cart is empty');
            }

            const orderItems = [];
            let totalAmount = 0;

            for (const item of cart.items) {
                const product = await Product.findOne({
                    _id: item.productId,
                    isActive: true
                }).session(session);

                if (!product) {
                    throw badRequestError('One or more products are unavailable');
                }

                if (product.stock < item.quantity) {
                    throw badRequestError(`Not enough stock for ${product.name}`);
                }

                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: product._id,
                        isActive: true,
                        stock: { $gte: item.quantity }
                    },
                    { $inc: { stock: -item.quantity } },
                    { new: true, session }
                );

                if (!updatedProduct) {
                    throw badRequestError(`Not enough stock for ${product.name}`);
                }

                orderItems.push({
                    productId: product._id,
                    productName: product.name,
                    quantity: item.quantity,
                    price: product.price
                });

                totalAmount += product.price * item.quantity;
            }

            const orders = await Order.create([{
                userId: req.user.id,
                items: orderItems,
                totalAmount,
                shippingAddress: safeAddress
            }], { session });

            createdOrder = orders[0];
            await Cart.findOneAndDelete({ userId: req.user.id }, { session });
        });

        res.status(201).json({ message: 'Order placed successfully', order: createdOrder });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    } finally {
        await session.endSession();
    }
});

// PUT /orders/:id/status - update order status (admin only)
router.put('/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order status updated', order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
