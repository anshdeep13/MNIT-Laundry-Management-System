const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String,
        unique: true,
        sparse: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        enum: ['RAZORPAY', 'STRIPE'],
        required: true
    },
    refundDetails: {
        refundId: String,
        refundAmount: Number,
        refundReason: String,
        refundedAt: Date
    },
    metadata: {
        type: Map,
        of: String
    },
    errorMessage: String,
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 