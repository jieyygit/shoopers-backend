const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const Cart = require('../models/CartModel');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateBody, validateParam, validateQuery } = require('../middleware/validate');
const AppError = require('../utils/appError');
const { assertOrderAccess } = require('../utils/orderAccess');
const {
    validateCheckoutBody,
    validateObjectId,
    validateOrderStatusBody,
    validatePaginationQuery
} = require('../utils/validators');

const router = express.Router();

// GET /orders - all orders (admin only)
router.get('/', verifyAdmin, validateQuery(validatePaginationQuery), asyncHandler(async (req, res) => {
    const { page, limit } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
        .populate('userId', 'firstname lastname email')
        .populate('items.productId', 'name price isActive')
        .limit(limit)
        .skip(skip);

    const total = await Order.countDocuments();

    res.json({ total, page, limit, orders });
}));

// GET /orders/my - logged in user's orders
router.get('/my', verifyToken, asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user.id })
        .populate('items.productId', 'name price isActive');

    res.json(orders);
}));

// GET /orders/:id - single order
router.get('/:id', verifyToken, validateParam('id', validateObjectId), asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('userId', 'firstname lastname email')
        .populate('items.productId', 'name price isActive');

    assertOrderAccess(req.user, order);
    res.json(order);
}));

// POST /orders - checkout from cart
router.post('/', verifyToken, validateBody(validateCheckoutBody), asyncHandler(async (req, res) => {
    const { shippingAddress } = req.body;

    const runCheckout = async (session = null) => {
        const query = Cart.findOne({ userId: req.user.id });
        if (session) query.session(session);
        const cart = await query;

        if (!cart || cart.items.length === 0) {
            throw new AppError(400, 'Cart is empty');
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const productQuery = Product.findOne({
                _id: item.productId,
                isActive: true
            });
            if (session) productQuery.session(session);
            const product = await productQuery;

            if (!product) {
                throw new AppError(400, 'One or more products are unavailable');
            }

            if (product.stock < item.quantity) {
                throw new AppError(400, `Not enough stock for ${product.name}`);
            }

            const updateOptions = session ? { new: true, session } : { new: true };
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: product._id,
                    isActive: true,
                    stock: { $gte: item.quantity }
                },
                { $inc: { stock: -item.quantity } },
                updateOptions
            );

            if (!updatedProduct) {
                throw new AppError(400, `Not enough stock for ${product.name}`);
            }

            orderItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;
        }

        const orderPayload = {
            userId: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentStatus: 'pending'
        };

        let createdOrder;
        if (session) {
            const createdOrders = await Order.create([orderPayload], { session });
            createdOrder = createdOrders[0];
            await Cart.findOneAndDelete({ userId: req.user.id }, { session });
        } else {
            createdOrder = await Order.create(orderPayload);
            await Cart.findOneAndDelete({ userId: req.user.id });
        }

        return createdOrder;
    };

    let order;
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            order = await runCheckout(session);
        });
    } catch (txErr) {
        const unsupportedTx =
            txErr.message &&
            txErr.message.includes('Transaction numbers are only allowed on a replica set member or mongos');

        if (unsupportedTx) {
            order = await runCheckout();
        } else {
            throw txErr;
        }
    } finally {
        await session.endSession();
    }

    res.status(201).json({ message: 'Order placed successfully', order });
}));

// PUT /orders/:id/status - update order status (admin only)
router.put(
    '/:id/status',
    verifyAdmin,
    validateParam('id', validateObjectId),
    validateBody(validateOrderStatusBody),
    asyncHandler(async (req, res) => {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        res.json({ message: 'Order status updated', order });
    })
);

module.exports = router;
