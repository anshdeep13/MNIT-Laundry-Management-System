import React, { useState } from 'react';
import { 
    Button, 
    TextField, 
    Box, 
    Typography, 
    Alert, 
    CircularProgress, 
    Snackbar, 
    Paper, 
    Grid,
    useTheme,
    alpha, 
    Card,
    CardContent,
    Divider,
    InputAdornment,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    CreditCard as CreditCardIcon,
    AccountBalanceWallet as WalletIcon,
    Info as InfoIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import API, { authAPI, walletAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AddMoney = ({ onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const { user, refreshUser } = useAuth();

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleAddMoney = async () => {
        if (!amount || parseFloat(amount) < 20) {
            setError('Please enter a valid amount (minimum ₹20)');
            return;
        }
        
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            console.log('Initiating payment for amount:', amount);
            
            // FALLBACK: Since backend create-order endpoint is not yet deployed, we'll create orders locally
            // This is a temporary solution until your backend is updated
            console.log('Using client-side fallback for order creation');
            
            // Generate amount in paise
            const amountInPaise = Math.round(parseFloat(amount) * 100);
            
            // Use Razorpay key from environment or fallback to the one in your .env file
            const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_bf8pLHdew65t9Y';
            
            console.log('Using Razorpay key:', razorpayKeyId);
            
            // Configure Razorpay
            const options = {
                key: razorpayKeyId,
                amount: amountInPaise,
                currency: 'INR',
                name: "MNIT Laundry System",
                description: "Wallet Recharge",
                // Note: We're not providing an order_id since we don't have a server-created one
                // Razorpay can work without an order_id in this mode
                handler: async function(response) {
                    try {
                        console.log('Payment successful:', response);
                        
                        // Since we can't verify the payment on the server yet, we'll update the wallet directly
                        console.log('Using direct wallet update as fallback');
                        
                        // Update wallet balance using the existing auth endpoint
                        const updateResponse = await authAPI.updateWallet({ 
                            amount: parseFloat(amount),
                            paymentId: response.razorpay_payment_id || 'razorpay_fallback'
                        });
                        
                        console.log('Wallet updated:', updateResponse);
                        
                        setSuccess('Payment successful! Your wallet has been updated.');
                        setAmount('');
                        showNotification('Money added to your wallet successfully!', 'success');
                        
                        // Refresh user data to get updated wallet balance
                        if (refreshUser) {
                            await refreshUser();
                        }
                        
                        if (onSuccess) onSuccess();
                    } catch (error) {
                        console.error('Wallet update error:', error);
                        const errorMessage = error.message || 'Failed to update wallet after payment';
                        setError(errorMessage);
                        showNotification(errorMessage, 'error');
                    }
                },
                prefill: {
                    name: user?.name || "Student",
                    email: user?.email || "student@mnit.ac.in",
                    contact: user?.contactNumber || ""
                },
                notes: {
                    userId: user?._id || "",
                    purpose: "wallet_recharge"
                },
                theme: {
                    color: theme.palette.primary.main,
                    backdrop_color: 'rgba(0, 0, 0, 0.8)', // Darker backdrop for better contrast
                    hide_topbar: false                    // Show the topbar for better visibility
                },
                modal: {
                    backdropclose: false,                 // Prevent closing by clicking backdrop
                    escape: true,                         // Allow ESC key to close
                    animation: true,                      // Enable animations
                    ondismiss: function() {
                        console.log('Payment cancelled by user');
                        showNotification('Payment cancelled', 'info');
                        setLoading(false);
                    }
                }
            };
            
            // Open Razorpay
            console.log('Opening Razorpay with options:', {...options, key: '******'});
            
            try {
                const razorpayInstance = new window.Razorpay(options);
                
                // Add payment failed event handler
                razorpayInstance.on('payment.failed', function(response) {
                    console.error('Payment failed:', response.error);
                    setError(`Payment failed: ${response.error.description}`);
                    showNotification(`Payment failed: ${response.error.description}`, 'error');
                    setLoading(false);
                });
                
                razorpayInstance.open();
            } catch (razorpayError) {
                console.error('Razorpay initialization error:', razorpayError);
                setError(`Could not initialize payment: ${razorpayError.message}`);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            setLoading(false);
        }
    };

    const predefinedAmounts = [50, 100, 200, 500];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        height: '100%',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <WalletIcon color="primary" sx={{ mr: 1, fontSize: '1.5rem' }} />
                        <Typography variant="h5" fontWeight={600}>
                            Add Money to Wallet
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                        Enter Amount
                    </Typography>
                    
                    <TextField
                        fullWidth
                        label="Amount (₹)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography variant="h6" color="primary" fontWeight="bold">₹</Typography>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title="Minimum amount is ₹20">
                                        <IconButton edge="end" size="small">
                                            <InfoIcon fontSize="small" color="action" />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            )
                        }}
                        error={!!error}
                        helperText={error}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                            },
                        }}
                    />
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 2 }}>
                        Quick Select Amount
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {predefinedAmounts.map((preAmount) => (
                            <Button
                                key={preAmount}
                                variant={amount === String(preAmount) ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setAmount(String(preAmount))}
                                sx={{ 
                                    borderRadius: '20px',
                                    minWidth: '70px'
                                }}
                            >
                                ₹{preAmount}
                            </Button>
                        ))}
                    </Box>

                    {success && (
                        <Alert 
                            severity="success" 
                            sx={{ 
                                mt: 2, 
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            {success}
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleAddMoney}
                        disabled={loading || !amount || parseFloat(amount) < 20}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        sx={{ 
                            mt: 3,
                            borderRadius: '10px',
                            py: 1.2,
                            fontWeight: 600,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        {loading ? 'Processing...' : 'Add Money'}
                    </Button>
                    
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mt: 2
                        }}
                    >
                        <SecurityIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                            Secure payment powered by Razorpay
                        </Typography>
                    </Box>
                </Paper>
            </Grid>
            
            <Grid item xs={12} md={5}>
                <Card 
                    sx={{ 
                        height: '100%', 
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600}>
                                Payment Information
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            How It Works
                        </Typography>
                        
                        <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: '10px', mb: 2 }}>
                            <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                                1. Enter the amount you want to add to your wallet
                            </Typography>
                            <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                                2. Click "Add Money" to proceed to the payment gateway
                            </Typography>
                            <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                                3. Complete the payment using your preferred method
                            </Typography>
                            <Typography variant="body2">
                                4. Your wallet will be updated immediately after successful payment
                            </Typography>
                        </Box>
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Accepted Payment Methods
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip label="UPI" size="small" />
                            <Chip label="Credit Card" size="small" />
                            <Chip label="Debit Card" size="small" />
                            <Chip label="Net Banking" size="small" />
                            <Chip label="Wallet" size="small" />
                        </Box>
                        
                        <Alert 
                            severity="info" 
                            variant="outlined"
                            sx={{ 
                                borderRadius: '10px',
                                '& .MuiAlert-icon': { color: theme.palette.primary.main }
                            }}
                        >
                            Minimum amount is ₹20 for wallet recharge
                        </Alert>
                    </CardContent>
                </Card>
            </Grid>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ 
                        width: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        borderRadius: '10px'
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default AddMoney; 