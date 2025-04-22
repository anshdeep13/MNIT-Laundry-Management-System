const nodemailer = require('nodemailer');
const Payment = require('../models/payment');

class NotificationService {
    constructor() {
        // Check if SMTP environment variables are set
        if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            this.emailConfigured = true;
        } else {
            console.warn('SMTP not configured. Email notifications will be disabled.');
            this.emailConfigured = false;
        }
    }

    async sendPaymentNotification(payment) {
        try {
            // Skip sending email if not configured
            if (!this.emailConfigured) {
                console.log('Email notification skipped: SMTP not configured');
                return false;
            }
            
            const subject = this.getPaymentSubject(payment);
            const html = this.getPaymentEmailTemplate(payment);

            const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mnit-laundry.com';
            
            await this.transporter.sendMail({
                from: from,
                to: payment.student.email,
                subject,
                html
            });

            // Update notification status
            payment.notificationSent = true;
            await payment.save();

            return true;
        } catch (error) {
            console.error('Error sending payment notification:', error);
            return false;
        }
    }

    getPaymentSubject(payment) {
        switch (payment.status) {
            case 'COMPLETED':
                return 'Payment Successful - MNIT Laundry';
            case 'FAILED':
                return 'Payment Failed - MNIT Laundry';
            case 'REFUNDED':
                return 'Payment Refunded - MNIT Laundry';
            default:
                return 'Payment Update - MNIT Laundry';
        }
    }

    getPaymentEmailTemplate(payment) {
        const statusEmoji = {
            'COMPLETED': '✅',
            'FAILED': '❌',
            'REFUNDED': '↩️',
            'PENDING': '⏳'
        };

        let template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>${statusEmoji[payment.status]} Payment ${payment.status}</h2>
                <p>Dear Student,</p>
                <p>Your payment of ₹${payment.amount} has been ${payment.status.toLowerCase()}.</p>
                <p><strong>Order ID:</strong> ${payment.orderId}</p>
                <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
        `;

        if (payment.status === 'REFUNDED') {
            template += `
                <p><strong>Refund Amount:</strong> ₹${payment.refundDetails.refundAmount}</p>
                <p><strong>Refund Reason:</strong> ${payment.refundDetails.refundReason}</p>
                <p><strong>Refund Date:</strong> ${new Date(payment.refundDetails.refundedAt).toLocaleString()}</p>
            `;
        }

        if (payment.status === 'FAILED') {
            template += `
                <p><strong>Error:</strong> ${payment.errorMessage}</p>
                <p>Please try again or contact support if the issue persists.</p>
            `;
        }

        template += `
                <p>Thank you for using MNIT Laundry services!</p>
                <p>Best regards,<br>MNIT Laundry Team</p>
            </div>
        `;

        return template;
    }
}

module.exports = new NotificationService(); 