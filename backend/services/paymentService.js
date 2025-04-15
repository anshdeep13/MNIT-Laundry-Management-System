const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment');
const notificationService = require('./notificationService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

class PaymentService {
    static async createOrder(student, amount, currency = 'INR') {
        try {
            const options = {
                amount: amount * 100, // Razorpay expects amount in paise
                currency,
                receipt: `receipt_${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);

            // Create payment record
            const payment = new Payment({
                student: student._id,
                orderId: order.id,
                amount,
                currency,
                paymentMethod: 'RAZORPAY',
                metadata: {
                    razorpayOrderId: order.id
                }
            });

            await payment.save();

            return {
                order,
                payment
            };
        } catch (error) {
            console.error('Error creating payment order:', error);
            throw new Error('Failed to create payment order: ' + error.message);
        }
    }

    static verifyPayment(orderId, paymentId, signature) {
        const text = `${orderId}|${paymentId}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generated_signature === signature;
    }

    static async processPayment(payment, razorpayPayment) {
        try {
            payment.paymentId = razorpayPayment.id;
            payment.status = 'COMPLETED';
            payment.metadata.set('razorpayPaymentId', razorpayPayment.id);
            await payment.save();

            // Send success notification
            await notificationService.sendPaymentNotification(payment);

            return payment;
        } catch (error) {
            console.error('Error processing payment:', error);
            payment.status = 'FAILED';
            payment.errorMessage = error.message;
            await payment.save();
            await notificationService.sendPaymentNotification(payment);
            throw error;
        }
    }

    static async handlePaymentFailure(payment, error) {
        payment.status = 'FAILED';
        payment.errorMessage = error.message;
        await payment.save();
        await notificationService.sendPaymentNotification(payment);
    }

    static async refundPayment(paymentId, reason, amount = null) {
        try {
            const payment = await Payment.findById(paymentId)
                .populate('student');

            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status !== 'COMPLETED') {
                throw new Error('Payment is not in completed state');
            }

            const refundAmount = amount || payment.amount;
            
            const refund = await razorpay.payments.refund(payment.paymentId, {
                amount: refundAmount * 100, // Convert to paise
                notes: {
                    reason
                }
            });

            payment.status = 'REFUNDED';
            payment.refundDetails = {
                refundId: refund.id,
                refundAmount,
                refundReason: reason,
                refundedAt: new Date()
            };

            await payment.save();
            await notificationService.sendPaymentNotification(payment);

            return payment;
        } catch (error) {
            console.error('Error processing refund:', error);
            throw new Error('Failed to process refund: ' + error.message);
        }
    }

    static async getPaymentHistory(studentId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const payments = await Payment.find({ student: studentId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Payment.countDocuments({ student: studentId });

            return {
                payments,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching payment history:', error);
            throw new Error('Failed to fetch payment history: ' + error.message);
        }
    }
}

module.exports = PaymentService; 