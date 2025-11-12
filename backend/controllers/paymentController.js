const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const logger = require('../config/logger');

/**
 * @desc    Create a Stripe Payment Intent for a booking
 * @route   POST /api/payments/create-payment-intent
 * @access  Private
 */
exports.createPaymentIntent = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // Validate bookingId
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                error: 'Booking ID is required'
            });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Verify booking belongs to the authenticated user
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this booking'
            });
        }

        // Check if booking already has a successful payment
        if (booking.paymentStatus === 'succeeded') {
            return res.status(400).json({
                success: false,
                error: 'This booking has already been paid'
            });
        }

        // Check if booking is cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Cannot process payment for a cancelled booking'
            });
        }

        // If there's an existing payment intent, retrieve it instead of creating a new one
        if (booking.stripePaymentIntentId) {
            try {
                const existingIntent = await stripe.paymentIntents.retrieve(
                    booking.stripePaymentIntentId
                );

                // If the existing payment intent is still usable, return it
                if (existingIntent.status === 'requires_payment_method' ||
                    existingIntent.status === 'requires_confirmation') {
                    logger.info(`Reusing existing payment intent for booking ${bookingId}`);
                    return res.json({
                        success: true,
                        clientSecret: existingIntent.client_secret,
                        paymentIntentId: existingIntent.id
                    });
                }
            } catch (error) {
                logger.warn(`Failed to retrieve existing payment intent: ${error.message}`);
                // Continue to create a new payment intent
            }
        }

        // Create a new Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(booking.price * 100), // Convert dollars to cents
            currency: 'usd',
            metadata: {
                bookingId: booking._id.toString(),
                userId: req.user.id,
                service: booking.service,
                dogName: booking.dogName,
                date: booking.date.toISOString()
            },
            description: `${booking.service} for ${booking.dogName}`,
            // Enable automatic payment methods (including card, link, etc.)
            automatic_payment_methods: {
                enabled: true
            }
        });

        // Update booking with payment intent ID and set status to processing
        booking.stripePaymentIntentId = paymentIntent.id;
        booking.paymentStatus = 'processing';
        await booking.save();

        logger.info(`Payment intent created: ${paymentIntent.id} for booking ${bookingId}`);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        logger.error(`Payment intent creation error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent'
        });
    }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (but verified with Stripe signature)
 */
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        logger.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;

            case 'payment_intent.canceled':
                await handlePaymentCancellation(event.data.object);
                break;

            case 'charge.refunded':
                await handleRefund(event.data.object);
                break;

            default:
                logger.info(`Unhandled event type: ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });

    } catch (error) {
        logger.error(`Webhook handler error: ${error.message}`);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
    logger.info(`Processing successful payment: ${paymentIntent.id}`);

    const booking = await Booking.findOne({
        stripePaymentIntentId: paymentIntent.id
    });

    if (!booking) {
        logger.error(`Booking not found for payment intent: ${paymentIntent.id}`);
        return;
    }

    // Update booking with payment success details
    booking.paymentStatus = 'succeeded';
    booking.status = 'confirmed'; // Auto-confirm booking on successful payment
    booking.stripeChargeId = paymentIntent.charges?.data[0]?.id || null;
    booking.paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';
    booking.paidAt = new Date();

    await booking.save();

    logger.info(`Booking ${booking._id} confirmed with payment ${paymentIntent.id}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
    logger.info(`Processing failed payment: ${paymentIntent.id}`);

    const booking = await Booking.findOne({
        stripePaymentIntentId: paymentIntent.id
    });

    if (!booking) {
        logger.error(`Booking not found for payment intent: ${paymentIntent.id}`);
        return;
    }

    booking.paymentStatus = 'failed';
    await booking.save();

    logger.warn(`Payment failed for booking ${booking._id}`);
}

/**
 * Handle payment cancellation
 */
async function handlePaymentCancellation(paymentIntent) {
    logger.info(`Processing canceled payment: ${paymentIntent.id}`);

    const booking = await Booking.findOne({
        stripePaymentIntentId: paymentIntent.id
    });

    if (!booking) {
        logger.error(`Booking not found for payment intent: ${paymentIntent.id}`);
        return;
    }

    booking.paymentStatus = 'failed';
    await booking.save();

    logger.info(`Payment canceled for booking ${booking._id}`);
}

/**
 * Handle refund
 */
async function handleRefund(charge) {
    logger.info(`Processing refund for charge: ${charge.id}`);

    const booking = await Booking.findOne({
        stripeChargeId: charge.id
    });

    if (!booking) {
        logger.error(`Booking not found for charge: ${charge.id}`);
        return;
    }

    booking.paymentStatus = 'refunded';
    booking.refundedAt = new Date();
    booking.refundAmount = charge.amount_refunded / 100; // Convert cents to dollars
    booking.status = 'cancelled';

    await booking.save();

    logger.info(`Refund processed for booking ${booking._id}`);
}

/**
 * @desc    Issue a refund for a booking
 * @route   POST /api/payments/refund/:id
 * @access  Private/Admin
 */
exports.refundPayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Check if booking has been paid
        if (booking.paymentStatus !== 'succeeded') {
            return res.status(400).json({
                success: false,
                error: 'Cannot refund a booking that has not been paid'
            });
        }

        // Check if already refunded
        if (booking.paymentStatus === 'refunded') {
            return res.status(400).json({
                success: false,
                error: 'This booking has already been refunded'
            });
        }

        // Check if booking has a charge ID
        if (!booking.stripeChargeId) {
            return res.status(400).json({
                success: false,
                error: 'No payment charge found for this booking'
            });
        }

        // Determine refund amount (full or partial)
        const { amount } = req.body;
        const refundAmount = amount
            ? Math.round(amount * 100)
            : Math.round(booking.price * 100); // Full refund by default

        // Create refund in Stripe
        const refund = await stripe.refunds.create({
            charge: booking.stripeChargeId,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
                bookingId: booking._id.toString(),
                adminId: req.user.id
            }
        });

        // Update booking (webhook will also update, but we do it here for immediate feedback)
        booking.paymentStatus = 'refunded';
        booking.refundedAt = new Date();
        booking.refundAmount = refundAmount / 100;
        booking.status = 'cancelled';
        await booking.save();

        logger.info(`Refund issued for booking ${booking._id} by admin ${req.user.id}`);

        res.json({
            success: true,
            message: 'Refund processed successfully',
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });

    } catch (error) {
        logger.error(`Refund error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to process refund'
        });
    }
};

/**
 * @desc    Get payment status for a booking
 * @route   GET /api/payments/status/:bookingId
 * @access  Private
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Verify booking belongs to the authenticated user (or user is admin)
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this booking'
            });
        }

        res.json({
            success: true,
            payment: {
                status: booking.paymentStatus,
                amount: booking.price,
                paidAt: booking.paidAt,
                paymentMethod: booking.paymentMethod,
                refundAmount: booking.refundAmount,
                refundedAt: booking.refundedAt
            }
        });

    } catch (error) {
        logger.error(`Get payment status error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment status'
        });
    }
};
