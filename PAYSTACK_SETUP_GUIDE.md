# 💳 Paystack Live Payment Integration Guide

## 🎉 What's Been Implemented

Your Print-App now has a complete **Paystack live payment integration** at checkout! When users proceed to payment, they'll see a secure Paystack payment webview where they can pay with:

- 💳 **Card payments** (Visa, Mastercard, Verve, etc.)
- 🏦 **Bank transfers**
- 📱 **USSD**
- 📲 **QR codes**
- 💰 **Mobile money**

## 📋 Implementation Overview

### Files Created/Modified:

1. **`lib/paystack.ts`** - Paystack configuration and utility functions
2. **`app/cart.tsx`** - Updated with Paystack payment integration
3. **`package.json`** - Added `react-native-paystack-webview` package

### Payment Flow:

```
User clicks "Proceed to Payment"
      ↓
System prepares payment details (cart items, total amount, customer info)
      ↓
Paystack payment modal opens with secure webview
      ↓
User completes payment (card/bank/USSD/etc.)
      ↓
On success: Order is created in database
      ↓
User redirected to orders screen with confirmation
```

## 🔧 Setup Instructions

### Step 1: Get Your Paystack API Keys

1. **Sign up/Login** to Paystack: https://dashboard.paystack.com/
2. **Verify your business** (required for live payments):
   - Go to Settings → Business
   - Submit required documents
3. **Get your API keys**:
   - Go to Settings → API Keys & Webhooks
   - Copy your **Public Key** (starts with `pk_live_...`)
   - Keep your **Secret Key** secure (starts with `sk_live_...`)

### Step 2: Add Your Paystack Public Key

Open `.env` file and set EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY:

```env
# Add your Paystack public key
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

**Replace with your actual key:**

```env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_abc123xyz456...
```

### Step 3: Test Mode (Optional)

To test without real money first, use your **test keys**:

- Test Public Key: `pk_test_...`
- Test Secret Key: `sk_test_...`

Use test cards from Paystack documentation:

- Success: `4084084084084081`
- Decline: `5060666666666666666`

Once verified, switch to live keys for production.

### Step 4: Verify Installation

Run the following command to ensure the package installed correctly:

```bash
npm list react-native-paystack-webview
```

If it's not installed, run:

```bash
npm install react-native-paystack-webview --legacy-peer-deps
```

## 🎨 Features Implemented

### ✅ Secure Payment Processing

- Opens Paystack's secure payment webview
- Supports all Paystack payment channels
- Real-time payment status updates

### ✅ Customer Information

- Auto-fills customer email, name, and phone from profile
- Includes cart details in transaction metadata
- Unique transaction reference for every payment

### ✅ Amount Calculation

- Subtotal from cart items
- Shipping fee (₵10 or FREE for orders ≥ ₵100)
- 21% tax calculation
- **All amounts automatically converted to pesewas** (Paystack requirement)

### ✅ Order Creation

- Order is created **only after successful payment**
- Cart is cleared automatically
- User redirected to orders screen
- Transaction reference saved

### ✅ Error Handling

- Payment cancellation handled gracefully
- Cart items remain if payment is cancelled
- Clear error messages for users
- Loading states during processing

## 💰 Currency Configuration

The current implementation uses **Ghanaian Cedis (₵)** as Paystack requires. If you need to change the currency symbols in your UI:

1. **Display Currency**: Update the `₵` symbol in `cart.tsx` (lines showing prices)
2. **Calculation**: Paystack amounts are in pesewas (1 GHS = 100 pesewas)

The `lib/paystack.ts` file has helper functions:

```typescript
convertToPesewas(100); // Returns 10000
convertToCedis(10000); // Returns 100
formatCurrency(100); // Returns "₵100.00"
```

## 🔒 Security Best Practices

### ⚠️ IMPORTANT SECURITY NOTES:

1. **Never expose your Secret Key** in the frontend code
2. **Verify payments on your backend** (not implemented yet)
3. **Use webhooks** for payment confirmations

### Recommended Backend Verification:

Create a backend endpoint to verify payments:

```typescript
// Backend API endpoint (Node.js example)
app.post("/api/verify-payment", async (req, res) => {
  const { reference } = req.body;

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();

  if (data.data.status === "success") {
    // Payment verified, create order
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
```

Then update `verifyPayment()` in `lib/paystack.ts` to call this endpoint.

## 🧪 Testing Your Integration

### Test Flow Checklist:

1. ✅ Add items to cart
2. ✅ Click "Proceed to Payment"
3. ✅ Verify payment modal opens
4. ✅ Check customer details are pre-filled
5. ✅ Complete payment (test card or real)
6. ✅ Verify order is created
7. ✅ Check cart is cleared
8. ✅ Confirm redirect to orders screen

### Test Different Scenarios:

- ❌ **Cancel payment** - Cart should remain intact
- ✅ **Successful payment** - Order created, cart cleared
- ⚠️ **Failed payment** - User sees error, can retry
- 📱 **Different payment methods** - Card, bank, USSD, etc.

## 🎯 Next Steps (Recommended)

### 1. Backend Payment Verification

Set up a backend service to verify payments securely using Paystack's verification API.

### 2. Webhooks Integration

Configure Paystack webhooks to receive real-time payment updates:

- Go to Settings → API Keys & Webhooks
- Add your webhook URL
- Handle events: `charge.success`, `charge.failed`, etc.

### 3. Order Status Updates

Update order status based on payment verification:

- Pending → Processing → Completed
- Send email confirmations
- SMS notifications

### 4. Payment History

Add a payment history section in user profile showing:

- Transaction references
- Payment dates
- Amounts paid
- Payment methods used

### 5. Refunds (Optional)

Implement refund functionality for cancelled orders.

## 📞 Support & Resources

### Paystack Resources:

- **Documentation**: https://paystack.com/docs
- **API Reference**: https://paystack.com/docs/api
- **Test Cards**: https://paystack.com/docs/payments/test-payments
- **Support**: support@paystack.com

### Package Documentation:

- **react-native-paystack-webview**: https://github.com/just1and0/React-Native-Paystack-WebView

## 🐛 Troubleshooting

### "Module not found: react-native-paystack-webview"

```bash
npm install react-native-paystack-webview --legacy-peer-deps
npx expo start --clear
```

### "Invalid public key"

- Ensure you're using `pk_live_...` for production
- Check for extra spaces or quotes
- Verify the key is active in your Paystack dashboard

### Payment modal not opening

- Check console for errors
- Verify PAYSTACK_PUBLIC_KEY is set correctly
- Ensure user is logged in
- Check cart has items

### Order not created after payment

- Check console logs for errors
- Verify Supabase connection
- Check order creation service
- Ensure user has profile data

## 🎊 Success!

Your app is now ready to accept real-time payments! Just add your Paystack public key and start testing. Remember to switch to live keys when going to production.

**Happy selling! 🚀**
