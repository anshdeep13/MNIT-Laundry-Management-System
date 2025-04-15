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
    CircularProgress
} from '@mui/material';
import axios from 'axios';

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

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get('/api/wallet/history');
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

            await axios.post('/api/wallet/refund', {
                paymentId: refundDialog.payment._id,
                reason: refundReason
            });

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Payment History
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No payment history available
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment._id}>
                                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                    <TableCell>{payment.transactionId}</TableCell>
                                    <TableCell>₹{payment.amount}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color={
                                                payment.status === 'completed'
                                                    ? 'success.main'
                                                    : payment.status === 'failed'
                                                    ? 'error.main'
                                                    : 'warning.main'
                                            }
                                        >
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {payment.type === 'credit' ? 'Added' : 'Debited'}
                                    </TableCell>
                                    <TableCell>
                                        {payment.status === 'completed' && (
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleRefundClick(payment)}
                                            >
                                                Request Refund
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
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
            />

            <Dialog open={refundDialog.open} onClose={handleRefundClose}>
                <DialogTitle>Request Refund</DialogTitle>
                <DialogContent>
                    {refundError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {refundError}
                        </Alert>
                    )}
                    {refundSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {refundSuccess}
                        </Alert>
                    )}
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRefundClose} disabled={refundLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRefundSubmit}
                        variant="contained"
                        disabled={!refundReason || refundLoading}
                    >
                        {refundLoading ? <CircularProgress size={24} /> : 'Submit Refund Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentHistory; 