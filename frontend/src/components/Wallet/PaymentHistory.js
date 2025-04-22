import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    useTheme,
    alpha,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Card,
    Grid
} from '@mui/material';
import {
    HistoryEdu as HistoryIcon,
    CreditCard as CreditCardIcon,
    ArrowOutward as OutgoingIcon,
    ArrowDownward as IncomingIcon,
    Refresh as RefreshIcon,
    RequestQuote as RequestRefundIcon,
    Search as SearchIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import API, { walletAPI } from '../../services/api';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPayments, setTotalPayments] = useState(0);
    const [refundDialog, setRefundDialog] = useState({ open: false, payment: null });
    const [refundReason, setRefundReason] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundError, setRefundError] = useState('');
    const [refundSuccess, setRefundSuccess] = useState('');
    const theme = useTheme();

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const response = await walletAPI.getHistory();
            setPayments(response.data);
            setTotalPayments(response.data.length);
            setError('');
        } catch (err) {
            setError('Failed to fetch payment history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRefundClick = (payment) => {
        setRefundDialog({ open: true, payment });
        setRefundReason('');
        setRefundError('');
        setRefundSuccess('');
    };

    const handleRefundClose = () => {
        setRefundDialog({ open: false, payment: null });
    };

    const handleRefundSubmit = async () => {
        try {
            setRefundLoading(true);
            setRefundError('');
            setRefundSuccess('');

            await walletAPI.requestRefund(refundDialog.payment._id, refundReason);

            setRefundSuccess('Refund request submitted successfully');
            setTimeout(() => {
                handleRefundClose();
                fetchPaymentHistory();
            }, 2000);
        } catch (error) {
            setRefundError(error.response?.data?.message || 'Failed to process refund request');
        } finally {
            setRefundLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusChip = (status) => {
        let color, variant;
        
        switch(status) {
            case 'completed':
                color = 'success';
                variant = 'outlined';
                break;
            case 'failed':
                color = 'error';
                variant = 'outlined';
                break;
            case 'pending':
                color = 'warning';
                variant = 'outlined';
                break;
            case 'refunded':
                color = 'info';
                variant = 'outlined';
                break;
            default:
                color = 'default';
                variant = 'outlined';
        }
        
        return (
            <Chip 
                label={status.charAt(0).toUpperCase() + status.slice(1)} 
                color={color} 
                variant={variant}
                size="small"
                sx={{ 
                    fontWeight: 500,
                    minWidth: '90px'
                }}
            />
        );
    };

    const getTypeIcon = (type) => {
        return type === 'credit' 
            ? <IncomingIcon fontSize="small" sx={{ color: theme.palette.success.main }} /> 
            : <OutgoingIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ 
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
            >
                {error}
            </Alert>
        );
    }

    const visibleRows = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Paper 
                elevation={0} 
                sx={{ 
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    mb: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        bgcolor: alpha(theme.palette.primary.main, 0.03)
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HistoryIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                            Payment History
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton 
                            size="small" 
                            onClick={fetchPaymentHistory}
                            sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                }
                            }}
                        >
                            <RefreshIcon fontSize="small" color="primary" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {payments.length === 0 ? (
                    <Box 
                        sx={{ 
                            p: 4, 
                            textAlign: 'center', 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ReceiptIcon 
                            sx={{ 
                                fontSize: 60, 
                                mb: 2, 
                                color: alpha(theme.palette.text.secondary, 0.2)
                            }} 
                        />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No Transaction History
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Your payment history will appear here once you make transactions
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 600 } }}>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Transaction ID</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {visibleRows.map((payment) => (
                                        <TableRow 
                                            key={payment._id}
                                            sx={{ 
                                                '&:hover': { 
                                                    bgcolor: alpha(theme.palette.primary.main, 0.03)
                                                },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2">{formatDate(payment.createdAt)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <CreditCardIcon 
                                                        fontSize="small" 
                                                        sx={{ 
                                                            color: theme.palette.primary.main,
                                                            mr: 1,
                                                            opacity: 0.7
                                                        }} 
                                                    />
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontFamily: 'monospace',
                                                            letterSpacing: '0.5px'
                                                        }}
                                                    >
                                                        {payment.transactionId}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {getTypeIcon(payment.type)}
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={600}
                                                        sx={{ 
                                                            ml: 0.5,
                                                            color: payment.type === 'credit' 
                                                                ? theme.palette.success.main 
                                                                : theme.palette.error.main
                                                        }}
                                                    >
                                                        ₹{payment.amount}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusChip(payment.status)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={payment.type === 'credit' ? 'Added' : 'Debited'} 
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: payment.type === 'credit' 
                                                            ? alpha(theme.palette.success.main, 0.1)
                                                            : alpha(theme.palette.error.main, 0.1),
                                                        color: payment.type === 'credit' 
                                                            ? theme.palette.success.main 
                                                            : theme.palette.error.main,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {payment.status === 'completed' && payment.type === 'credit' && (
                                                    <Tooltip title="Request Refund">
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<RequestRefundIcon />}
                                                            onClick={() => handleRefundClick(payment)}
                                                            sx={{ 
                                                                borderRadius: '20px',
                                                                textTransform: 'none',
                                                                fontWeight: 500,
                                                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                                                            }}
                                                        >
                                                            Refund
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={totalPayments}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25]}
                            sx={{
                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                            }}
                        />
                    </>
                )}
            </Paper>

            <Card 
                sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    borderRadius: '10px',
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <SearchIcon 
                        sx={{ 
                            color: theme.palette.info.main,
                            mr: 1,
                            mt: 0.5
                        }} 
                    />
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                            Need Help with Transactions?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            If you have any issues with your payments or refund requests, please contact our support team at <b>laundry.support@mnit.ac.in</b>
                        </Typography>
                    </Box>
                </Box>
            </Card>

            <Dialog 
                open={refundDialog.open} 
                onClose={handleRefundClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RequestRefundIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6" fontWeight={600}>
                            Request Refund
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <Divider />
                
                <DialogContent>
                    {refundDialog.payment && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Transaction Details
                            </Typography>
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                    borderRadius: '10px'
                                }}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Amount
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            ₹{refundDialog.payment.amount}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(refundDialog.payment.createdAt)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            Transaction ID
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                            {refundDialog.payment.transactionId}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    )}
                    
                    {refundError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                            {refundError}
                        </Alert>
                    )}
                    {refundSuccess && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
                            {refundSuccess}
                        </Alert>
                    )}
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Please provide a reason for your refund request
                    </Typography>
                    
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Refund Reason"
                        fullWidth
                        multiline
                        rows={4}
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        disabled={refundLoading}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            }
                        }}
                    />
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Note: Refund requests are typically processed within 5-7 business days, 
                        depending on your payment method.
                    </Typography>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={handleRefundClose} 
                        disabled={refundLoading}
                        sx={{ 
                            borderRadius: '20px',
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRefundSubmit}
                        variant="contained"
                        disabled={!refundReason || refundLoading}
                        startIcon={refundLoading ? <CircularProgress size={20} color="inherit" /> : <RequestRefundIcon />}
                        sx={{ 
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        {refundLoading ? 'Processing...' : 'Submit Refund Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentHistory; 