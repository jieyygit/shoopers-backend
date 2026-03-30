const express = require('express');
const Order = require('../models/OrderModel');
const Payment = require('../models/PaymentModel');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

const randomSuffix = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const makeTransactionId = () => `TXN-${Date.now()}-${randomSuffix()}`;

// GET /payments/my - logged in user's payments
router.get('/my', verifyToken, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id })
            .populate('orderId', 'totalAmount status paymentStatus createdAt')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /payments - all payments (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'firstname lastname email')
            .populate('orderId', 'totalAmount status paymentStatus createdAt')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /payments/process - process payment for an order
router.post('/process', verifyToken, async (req, res) => {
    try {
        const { orderId, method } = req.body;
        const normalizedMethod = typeof method === 'string' ? method.trim().toLowerCase() : '';

        if (!orderId || !normalizedMethod) {
            return res.status(400).json({ message: 'orderId and method are required' });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not allowed to pay for this order' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        const transactionId = makeTransactionId();
        const payment = await Payment.findOneAndUpdate(
            { orderId: order._id },
            {
                orderId: order._id,
                userId: order.userId,
                method: normalizedMethod,
                status: 'paid',
                amount: order.totalAmount,
                transactionId,
                paidAt: new Date()
            },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        order.paymentStatus = 'paid';
        if (order.status === 'pending') {
            order.status = 'processing';
        }
        await order.save();

        res.json({ message: 'Payment successful', payment, order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
