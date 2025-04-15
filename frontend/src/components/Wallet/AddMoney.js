import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Alert, CircularProgress, Snackbar } from '@mui/material';
import axios from 'axios';

const AddMoney = ({ onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleAddMoney = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Create order
            const orderResponse = await axios.post('/api/wallet/create-order', {
                amount: parseFloat(amount)
            });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: orderResponse.data.amount,
                currency: orderResponse.data.currency,
                name: "MNIT Laundry",
                description: "Wallet Recharge",
                order_id: orderResponse.data.orderId,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await axios.post('/api/wallet/verify-payment', {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        setSuccess('Money added successfully!');
                        setAmount('');
                        showNotification('Payment successful! Money added to your wallet.', 'success');
                        if (onSuccess) onSuccess();
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || 'Payment verification failed';
                        setError(errorMessage);
                        showNotification(errorMessage, 'error');
                    }
                },
                prefill: {
                    name: "Student",
                    email: "student@mnit.ac.in"
                },
                theme: {
                    color: "#3399cc"
                },
                modal: {
                    ondismiss: function() {
                        showNotification('Payment cancelled by user', 'info');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create payment order';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Add Money to Wallet
            </Typography>
            
            <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                margin="normal"
                InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
                error={!!error}
                helperText={error}
            />

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                </Alert>
            )}

            <Button
                fullWidth
                variant="contained"
                onClick={handleAddMoney}
                disabled={loading || !amount || amount <= 0}
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Add Money'}
            </Button>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddMoney; 