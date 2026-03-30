const express = require('express');
const Order = require('../models/OrderModel');
const Payment = require('../models/PaymentModel');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const AppError = require('../utils/appError');
const { validatePaymentBody } = require('../utils/validators');

const router = express.Router();

const randomSuffix = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const makeTransactionId = () => `TXN-${Date.now()}-${randomSuffix()}`;

// GET /payments/my - logged in user's payments
router.get('/my', verifyToken, asyncHandler(async (req, res) => {
    const payments = await Payment.find({ userId: req.user.id })
        .populate('orderId', 'totalAmount status paymentStatus createdAt')
        .sort({ createdAt: -1 });

    res.json(payments);
}));

// GET /payments - all payments (admin only)
router.get('/', verifyAdmin, asyncHandler(async (req, res) => {
    const payments = await Payment.find()
        .populate('userId', 'firstname lastname email')
        .populate('orderId', 'totalAmount status paymentStatus createdAt')
        .sort({ createdAt: -1 });

    res.json(payments);
}));

// POST /payments/process - process payment for an order
router.post('/process', verifyToken, validateBody(validatePaymentBody), asyncHandler(async (req, res) => {
    const { orderId, method } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError(404, 'Order not found');
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(403, 'Not allowed to pay for this order');
    }

    if (order.paymentStatus === 'paid') {
        throw new AppError(400, 'Order is already paid');
    }

    const transactionId = makeTransactionId();
    const payment = await Payment.findOneAndUpdate(
        { orderId: order._id },
        {
            orderId: order._id,
            userId: order.userId,
            method,
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
}));

module.exports = router;
