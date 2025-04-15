const Wallet = require('../models/wallet');
const PaymentService = require('../services/paymentService');

class WalletController {
    static async getWallet(req, res) {
        try {
            const wallet = await Wallet.findOne({ student: req.user._id })
                .populate('student', 'name email');
            
            if (!wallet) {
                return res.status(404).json({ message: 'Wallet not found' });
            }

            res.json(wallet);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching wallet: ' + error.message });
        }
    }

    static async createPaymentOrder(req, res) {
        try {
            const { amount } = req.body;
            
            if (!amount || amount <= 0) {
                return res.status(400).json({ message: 'Invalid amount' });
            }

            const { order, payment } = await PaymentService.createOrder(req.user, amount);
            
            res.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                paymentId: payment._id
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating payment order: ' + error.message });
        }
    }

    static async verifyAndAddMoney(req, res) {
        try {
            const { orderId, paymentId, signature } = req.body;

            const isValid = PaymentService.verifyPayment(orderId, paymentId, signature);
            
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid payment signature' });
            }

            const razorpayPayment = await PaymentService.fetchPaymentDetails(paymentId);
            
            if (razorpayPayment.status !== 'captured') {
                return res.status(400).json({ message: 'Payment not successful' });
            }

            let wallet = await Wallet.findOne({ student: req.user._id });
            
            if (!wallet) {
                wallet = new Wallet({
                    student: req.user._id,
                    balance: 0
                });
            }

            const amount = razorpayPayment.amount / 100; // Convert from paise to rupees
            
            wallet.balance += amount;
            wallet.transactions.push({
                type: 'CREDIT',
                amount,
                description: 'Wallet recharge',
                paymentId,
                status: 'COMPLETED'
            });

            await wallet.save();

            res.json({
                message: 'Payment successful',
                wallet
            });
        } catch (error) {
            res.status(500).json({ message: 'Error processing payment: ' + error.message });
        }
    }

    static async getTransactionHistory(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            
            const result = await PaymentService.getPaymentHistory(req.user._id, parseInt(page), parseInt(limit));
            
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching transaction history: ' + error.message });
        }
    }

    static async requestRefund(req, res) {
        try {
            const { paymentId, reason, amount } = req.body;

            const refundedPayment = await PaymentService.refundPayment(paymentId, reason, amount);

            // Update wallet balance
            const wallet = await Wallet.findOne({ student: req.user._id });
            if (wallet) {
                const refundAmount = amount || refundedPayment.amount;
                wallet.balance -= refundAmount;
                wallet.transactions.push({
                    type: 'DEBIT',
                    amount: refundAmount,
                    description: `Refund: ${reason}`,
                    paymentId: refundedPayment.paymentId,
                    status: 'COMPLETED'
                });
                await wallet.save();
            }

            res.json({
                message: 'Refund processed successfully',
                payment: refundedPayment
            });
        } catch (error) {
            res.status(500).json({ message: 'Error processing refund: ' + error.message });
        }
    }
}

module.exports = WalletController; 