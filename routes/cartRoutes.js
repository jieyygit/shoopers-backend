const express = require('express');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyToken } = require('../middleware/auth');
const { validateBody, validateParam } = require('../middleware/validate');
const AppError = require('../utils/appError');
const { validateCartBody, validateObjectId } = require('../utils/validators');

const router = express.Router();

// GET /cart - fetch current user's cart
router.get('/', verifyToken, asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user.id })
        .populate('items.productId', 'name price stock isActive');

    if (!cart) {
        throw new AppError(404, 'Cart not found');
    }

    res.json(cart);
}));

// POST /cart - add item to cart
router.post('/', verifyToken, validateBody(validateCartBody), asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
        throw new AppError(404, 'Product not found or inactive');
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
        if (quantity > product.stock) {
            throw new AppError(400, 'Not enough stock available');
        }

        cart = await Cart.create({
            userId: req.user.id,
            items: [{ productId, quantity }]
        });
    } else {
        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
            const nextQuantity = cart.items[itemIndex].quantity + quantity;
            if (nextQuantity > product.stock) {
                throw new AppError(400, 'Not enough stock available');
            }
            cart.items[itemIndex].quantity = nextQuantity;
        } else {
            if (quantity > product.stock) {
                throw new AppError(400, 'Not enough stock available');
            }
            cart.items.push({ productId, quantity });
        }

        await cart.save();
    }

    const updatedCart = await Cart.findOne({ userId: req.user.id })
        .populate('items.productId', 'name price stock isActive');

    res.json({ message: 'Cart updated', cart: updatedCart });
}));

// DELETE /cart/:productId - remove item from cart
router.delete('/:productId', verifyToken, validateParam('productId', validateObjectId), asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
        throw new AppError(404, 'Cart not found');
    }

    cart.items = cart.items.filter(
        item => item.productId.toString() !== req.params.productId
    );
    await cart.save();

    res.json({ message: 'Item removed', cart });
}));

// DELETE /cart - clear entire cart
router.delete('/', verifyToken, asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: 'Cart cleared' });
}));

module.exports = router;
