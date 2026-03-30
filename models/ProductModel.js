const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: String,
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, { timestamps: true, versionKey: false });

ProductSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', ProductSchema);
