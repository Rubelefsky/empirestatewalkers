const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createPaymentIntent,
    handleWebhook,
    refundPayment,
    getPaymentStatus
} = require('../controllers/paymentController');

/**
 * Payment Intent Routes
 */

// Create a payment intent for a booking
router.post('/create-payment-intent', protect, createPaymentIntent);

// Get payment status for a booking
router.get('/status/:bookingId', protect, getPaymentStatus);

/**
 * Webhook Route (No authentication middleware - verified by Stripe signature)
 * Note: This route must use raw body, handled in server.js
 */
router.post('/webhook', handleWebhook);

/**
 * Admin Routes
 */

// Issue a refund (Admin only)
router.post('/refund/:id', protect, authorize('admin'), refundPayment);

module.exports = router;
