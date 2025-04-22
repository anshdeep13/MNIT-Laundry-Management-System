const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Apply authentication middleware to all wallet routes
router.use(authMiddleware);

// Get wallet details
router.get('/', WalletController.getWallet);

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount < 20) {
      return res.status(400).json({ message: 'Please provide a valid amount. Minimum amount is ₹20.' });
    }
    
    console.log('Creating Razorpay order for amount:', amount);
    
    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${req.user._id}`,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        purpose: 'wallet_recharge'
      }
    };
    
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    
    res.json({
      orderId: order.id,
      amount: order.amount / 100, // Convert back to rupees for display
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
});

// Verify payment and update wallet
router.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Missing required payment verification parameters' });
    }
    
    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    
    const isSignatureValid = expectedSignature === signature;
    
    if (!isSignatureValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: `Payment not complete. Status: ${payment.status}` });
    }
    
    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update wallet balance
    const amount = payment.amount / 100; // Convert paise to rupees
    user.walletBalance += amount;
    
    // Add transaction record if the model supports it
    if (user.transactions) {
      user.transactions.push({
        type: 'CREDIT',
        amount,
        paymentId,
        description: 'Wallet recharge via Razorpay',
        status: 'COMPLETED',
        createdAt: new Date()
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Payment verified and wallet updated successfully',
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
});

// Get transaction history
router.get('/transactions', WalletController.getTransactionHistory);

// Request refund
router.post('/refund', WalletController.requestRefund);

module.exports = router; 