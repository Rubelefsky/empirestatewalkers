# Stripe Test Integration Setup Instructions

## Overview
This guide will help you integrate Stripe payment processing into your Empire State Walkers application for testing purposes.

## Prerequisites
- A Stripe account (free to sign up)
- Access to your backend `.env` file
- Access to your frontend `frontend-api.js` file

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" or "Start now"
3. Fill in your email, name, and password
4. Verify your email address
5. You'll be redirected to your Stripe Dashboard

## Step 2: Get Your Test API Keys

1. In your Stripe Dashboard, make sure you're in **Test Mode** (look for the toggle in the top right)
2. Navigate to: **Developers** → **API keys**
   - Direct link: [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

3. You'll see two types of keys:
   - **Publishable key**: Starts with `pk_test_` (visible by default)
   - **Secret key**: Starts with `sk_test_` (click "Reveal test key" to see it)

4. Copy both keys - you'll need them in the next steps

## Step 3: Update Backend Configuration

1. Open your backend `.env` file:
   ```
   /Users/brandonrubell/Documents/EmpireStateWalkersMain/empirestatewalkers/backend/.env
   ```

2. Find and update these lines:
   ```env
   # Replace these placeholder values with your actual keys
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   ```

3. Paste your actual keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_51ABC...xyz  # Your actual secret key
   STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...xyz  # Your actual publishable key
   ```

4. Save the file. The backend will automatically restart (if using nodemon)

## Step 4: Update Frontend Configuration

1. Open your frontend file:
   ```
   /Users/brandonrubell/Documents/EmpireStateWalkersMain/empirestatewalkers/frontend-api.js
   ```

2. Find line 27 and update the Stripe publishable key:
   ```javascript
   // BEFORE:
   const stripePublishableKey = 'pk_test_YOUR_PUBLISHABLE_KEY';

   // AFTER:
   const stripePublishableKey = 'pk_test_51ABC...xyz';  // Your actual publishable key
   ```

3. Save the file

## Step 5: Restart and Test

1. Make sure your backend server is running:
   ```bash
   cd backend
   npm run dev
   ```

2. Make sure your frontend server is running:
   ```bash
   # If using Python simple server
   python3 -m http.server 8080
   ```

3. Open your browser and navigate to: [http://localhost:8080](http://localhost:8080)

4. Test the payment flow:
   - Log in with your account
   - Create a new booking
   - Proceed to payment
   - Use Stripe's test card numbers (see below)

## Step 6: Test Card Numbers

Stripe provides test card numbers for testing different scenarios:

### Successful Payment
- **Card number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Other Test Scenarios
- **Payment declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Requires authentication**: `4000 0025 0000 3155`

Full list: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Step 7: Verify Payment in Stripe Dashboard

1. After making a test payment, go to your Stripe Dashboard
2. Navigate to: **Payments** → **All payments**
   - Link: [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
3. You should see your test payment listed there

## Troubleshooting

### Error: "Failed to create payment intent"
- **Cause**: Invalid or missing Stripe API keys
- **Solution**: Double-check that you've updated both backend `.env` and frontend `frontend-api.js` with valid keys

### Error: "Not allowed by CORS"
- **Cause**: Frontend and backend on different ports without proper CORS setup
- **Solution**: Already configured - frontend on port 8080 is allowed

### Payment Intent shows but payment fails
- **Cause**: Using wrong test card number or expired date
- **Solution**: Use test card `4242 4242 4242 4242` with future expiry date

### Backend not picking up new keys
- **Cause**: Server hasn't restarted after updating `.env`
- **Solution**: Restart the backend server:
  ```bash
  # Stop the server (Ctrl+C) then restart
  npm run dev
  ```

## Webhook Setup (Optional - For Production)

Webhooks are used to receive real-time payment status updates from Stripe. This is optional for testing but required for production.

1. Go to: **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Update your `.env` file:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

For local testing, use the Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:5001/api/payments/webhook
```

## Security Best Practices

1. **Never commit API keys to git**
   - The `.env` file should be in `.gitignore`
   - Always use environment variables

2. **Use test keys for development**
   - Test keys start with `sk_test_` and `pk_test_`
   - Live keys start with `sk_live_` and `pk_live_`

3. **Keep secret keys secret**
   - Never expose `STRIPE_SECRET_KEY` in frontend code
   - Only use `STRIPE_PUBLISHABLE_KEY` in frontend

4. **For production deployment**
   - Replace test keys with live keys
   - Set `NODE_ENV=production`
   - Enable webhook signature verification
   - Use HTTPS for all endpoints

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check backend logs for server errors
3. Verify all API keys are correct and copied completely
4. Ensure you're using test mode in Stripe Dashboard
5. Try using the test card number `4242 4242 4242 4242`

## Next Steps

Once payments are working in test mode:
1. Complete your business verification in Stripe
2. Replace test keys with live keys for production
3. Set up proper webhook endpoints
4. Configure payment receipts and notifications
5. Set up refund policies and procedures
