const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all wallet routes
router.use(authMiddleware);

// Get wallet details
router.get('/', WalletController.getWallet);

// Create payment order
router.post('/create-order', WalletController.createPaymentOrder);

// Verify payment and add money to wallet
router.post('/verify-payment', WalletController.verifyAndAddMoney);

// Get transaction history
router.get('/transactions', WalletController.getTransactionHistory);

// Request refund
router.post('/refund', WalletController.requestRefund);

module.exports = router; 