const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /cart - fetch current user's cart
router.get('/', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate('items.productId', 'name price stock isActive');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /cart - add item to cart
router.post('/', verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const parsedQuantity = Number(quantity ?? 1);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid productId' });
        }

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a positive integer' });
        }

        const product = await Product.findOne({ _id: productId, isActive: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found or inactive' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            if (parsedQuantity > product.stock) {
                return res.status(400).json({ message: 'Not enough stock available' });
            }

            cart = await Cart.create({
                userId: req.user.id,
                items: [{ productId, quantity: parsedQuantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                const nextQuantity = cart.items[itemIndex].quantity + parsedQuantity;
                if (nextQuantity > product.stock) {
                    return res.status(400).json({ message: 'Not enough stock available' });
                }
                cart.items[itemIndex].quantity = nextQuantity;
            } else {
                if (parsedQuantity > product.stock) {
                    return res.status(400).json({ message: 'Not enough stock available' });
                }
                cart.items.push({ productId, quantity: parsedQuantity });
            }

            await cart.save();
        }

        const updatedCart = await Cart.findOne({ userId: req.user.id })
            .populate('items.productId', 'name price stock isActive');

        res.json({ message: 'Cart updated', cart: updatedCart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /cart/:productId - remove item from cart
router.delete('/:productId', verifyToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
            return res.status(400).json({ message: 'Invalid productId' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(
            item => item.productId.toString() !== req.params.productId
        );
        await cart.save();

        res.json({ message: 'Item removed', cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /cart - clear entire cart
router.delete('/', verifyToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
