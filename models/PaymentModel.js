const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    method: {
        type: String,
        enum: ['card', 'gcash', 'bank_transfer', 'cod'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paidAt: Date
}, { timestamps: true, versionKey: false });

PaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
