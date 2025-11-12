# Stripe Payment Integration Guide

## Overview

Empire State Walkers now includes full Stripe payment processing integration, allowing customers to pay for bookings securely online. This guide covers setup, testing, and deployment of the payment system.

## Architecture

The payment flow follows **Option A: Payment After Booking**:

1. User creates a booking (stored with `status: 'pending'`, `paymentStatus: 'pending'`)
2. Payment form is displayed with booking details
3. User completes payment via Stripe
4. Stripe webhook updates booking status automatically
5. Booking is confirmed (`status: 'confirmed'`, `paymentStatus: 'succeeded'`)

### Key Features

✅ Secure payment processing with Stripe Payment Element
✅ Automatic payment confirmation via webhooks
✅ Admin refund capabilities
✅ Payment status tracking
✅ Support for multiple payment methods (cards, wallets, etc.)
✅ PCI DSS compliant (no card data touches your servers)

## Setup Instructions

### 1. Get Stripe API Keys

1. Create a Stripe account at https://dashboard.stripe.com/register
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

**Security Note:** Never commit your secret keys to version control!

### 2. Configure Backend Environment

Update your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### 3. Configure Frontend

Update `frontend-api.js` line 27 with your publishable key:

```javascript
const stripePublishableKey = 'pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY';
```

**Important:** In production, load this from a configuration file or environment variable, not hardcoded.

### 4. Set Up Stripe Webhooks

Webhooks are critical for payment confirmation. Stripe sends events to your server when payments succeed/fail.

#### Local Development (Using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to your Stripe account:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) to your `.env` file

#### Production Deployment

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the webhook signing secret to your production `.env` file

## Testing

### Test Card Numbers

Stripe provides test card numbers that simulate different scenarios:

| Card Number         | Scenario               |
|---------------------|------------------------|
| 4242 4242 4242 4242 | Successful payment     |
| 4000 0000 0000 9995 | Declined payment       |
| 4000 0025 0000 3155 | 3D Secure required     |
| 4000 0000 0000 0069 | Expired card           |

**For all test cards:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Testing Workflow

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start Stripe webhook listener (separate terminal):
   ```bash
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```

3. Serve your frontend:
   ```bash
   python3 -m http.server 8080
   ```

4. Create a test booking and complete payment with test card
5. Check the Stripe CLI output to see webhook events
6. Verify booking status updates to "confirmed" in your dashboard

## Database Schema Updates

### Booking Model

New payment-related fields added:

```javascript
{
  // Existing fields...
  price: Number,

  // NEW: Payment fields
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  paymentMethod: String,
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number
}
```

## API Endpoints

### Payment Intent Creation
```
POST /api/payments/create-payment-intent
Authorization: Required (JWT)
Body: { bookingId: string }
Returns: { clientSecret: string }
```

### Webhook Handler
```
POST /api/payments/webhook
Authorization: None (verified by Stripe signature)
Body: Stripe event payload
Returns: { received: true }
```

### Refund (Admin Only)
```
POST /api/payments/refund/:bookingId
Authorization: Required (Admin JWT)
Body: { amount?: number } // Optional, defaults to full refund
Returns: { success: true, refund: {...} }
```

### Payment Status
```
GET /api/payments/status/:bookingId
Authorization: Required (JWT)
Returns: { payment: {...} }
```

## Security Considerations

### Best Practices Implemented

✅ **PCI Compliance:** Card data handled entirely by Stripe (PCI DSS Level 1)
✅ **Webhook Verification:** All webhook events verified with signatures
✅ **User Authorization:** Users can only create payments for their own bookings
✅ **HTTPS Required:** Production must use HTTPS (enforced in server.js)
✅ **CSRF Protection:** Applied to all payment endpoints
✅ **Rate Limiting:** Prevents payment abuse

### Security Checklist

- [ ] Never log or store full card numbers
- [ ] Use HTTPS in production
- [ ] Rotate webhook secrets regularly
- [ ] Monitor Stripe Dashboard for suspicious activity
- [ ] Keep Stripe SDK updated
- [ ] Use environment variables for all secrets
- [ ] Enable Stripe Radar for fraud detection (production)

## Admin Features

### Viewing Payment Status

The admin dashboard displays:
- Payment status badge (pending/succeeded/failed/refunded)
- Payment method used
- Date paid
- Refund information

### Issuing Refunds

1. Navigate to admin dashboard
2. Find the booking with "succeeded" payment status
3. Click **Issue Refund** button
4. Confirm the refund amount
5. Refund is processed immediately via Stripe API
6. Customer receives refund within 5-10 business days

**Note:** Refunds can only be issued for bookings with `paymentStatus: 'succeeded'`

## Troubleshooting

### Payment Intent Creation Fails

**Error:** "Failed to create payment intent"

**Solutions:**
- Verify `STRIPE_SECRET_KEY` is set correctly in `.env`
- Check that booking exists and belongs to authenticated user
- Ensure booking hasn't already been paid
- Check server logs for detailed error messages

### Webhook Not Receiving Events

**Error:** Payment completes but booking status doesn't update

**Solutions:**
- Verify webhook URL is accessible from the internet (use ngrok for local testing)
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook is listening to correct events
- Check server logs for webhook errors
- Test webhook endpoint: `stripe trigger payment_intent.succeeded`

### Payment Form Not Loading

**Error:** "Payment system is not available"

**Solutions:**
- Verify Stripe.js script is loaded in `index.html`
- Check `STRIPE_PUBLISHABLE_KEY` is set in `frontend-api.js`
- Open browser console for JavaScript errors
- Ensure backend is running and accessible

### Duplicate Charges

**Prevention:**
- Stripe automatically handles idempotency
- Payment intents are reused if still valid
- Users cannot create multiple payments for same booking

## Going Live

### Production Checklist

1. **Switch to Live API Keys**
   - Replace test keys (`pk_test_*`, `sk_test_*`) with live keys (`pk_live_*`, `sk_live_*`)
   - Update both backend `.env` and frontend `frontend-api.js`

2. **Configure Production Webhooks**
   - Create new webhook endpoint in Stripe Dashboard
   - Use your production domain URL
   - Update `STRIPE_WEBHOOK_SECRET` with production secret

3. **Enable Stripe Radar**
   - Automatic fraud detection
   - Configure rules in Stripe Dashboard

4. **Set Up Payment Dispute Handling**
   - Enable email notifications for disputes
   - Configure automatic evidence submission

5. **Test with Live Test Mode**
   - Use Stripe's live test cards before going fully live
   - Verify webhook delivery to production server

6. **Update Frontend Configuration**
   - Change `API_URL` to production backend URL
   - Use production Stripe publishable key

7. **Monitor First Transactions**
   - Watch Stripe Dashboard during first few live transactions
   - Monitor server logs for errors
   - Test refund process with small amount

## Payment Flow Diagram

```
User                  Frontend              Backend              Stripe
 |                       |                     |                    |
 |-- Create Booking ---->|                     |                    |
 |                       |-- POST /bookings -->|                    |
 |                       |<-- booking created -|                    |
 |                       |                     |                    |
 |                       |- POST /payments/    |                    |
 |                       |  create-payment-    |                    |
 |                       |  intent ----------->|-- Create Payment ->|
 |                       |                     |    Intent          |
 |                       |<-- clientSecret ----|<-- intent created -|
 |                       |                     |                    |
 |<-- Show Payment Form -|                     |                    |
 |                       |                     |                    |
 |-- Enter Card Info --->|                     |                    |
 |                       |                     |                    |
 |-- Submit Payment ---->|-- Confirm Payment ->|->-- Process ------>|
 |                       |                     |    Payment         |
 |                       |                     |<-- Webhook: -------|
 |                       |                     |    payment_intent  |
 |                       |                     |    .succeeded      |
 |                       |                     |                    |
 |                       |                     |- Update booking    |
 |                       |                     |  status=confirmed  |
 |                       |                     |  paymentStatus=    |
 |                       |                     |  succeeded         |
 |                       |                     |                    |
 |<-- Payment Success ---|<-- Success ---------|                    |
```

## Support and Resources

### Stripe Documentation
- Payment Intents API: https://stripe.com/docs/payments/payment-intents
- Webhooks Guide: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

### Empire State Walkers Code References
- Payment Controller: `backend/controllers/paymentController.js`
- Payment Routes: `backend/routes/paymentRoutes.js`
- Frontend Payment: `frontend-api.js` (lines 704-906)
- Booking Model: `backend/models/Booking.js`

### Need Help?
- Check Stripe Dashboard Logs for detailed error messages
- Review server logs in `backend/logs/`
- Stripe Support: https://support.stripe.com/

## Changelog

### 2025-11-12 - Initial Stripe Integration
- Added Stripe payment processing for bookings
- Implemented webhook handlers for automatic confirmation
- Added admin refund capabilities
- Updated booking model with payment fields
- Created payment UI components
- Added comprehensive documentation

---

**Last Updated:** November 12, 2025
**Version:** 1.0.0
**Maintainer:** Empire State Walkers Development Team
