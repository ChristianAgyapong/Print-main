# 🔑 Quick Setup: Add Your Paystack API Key

## 📍 Where to Add Your Key

**File**: `.env`  
**Variable**: EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY

## 🎯 Current Code:

```env
# Add your Paystack public key
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

## ✅ Replace With Your Key:

```env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_abc123xyz789...
```

---

## 📝 How to Get Your Paystack Keys

### For Live Payments (Production):

1. Go to: https://dashboard.paystack.com/settings/developer
2. Copy your **Live Public Key** (starts with `pk_live_`)
3. Paste it in `.env` file

### For Testing (Development):

Use your **Test Public Key** for safe testing:

```env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_abc123xyz789...
```

**Test Cards**: https://paystack.com/docs/payments/test-payments

- ✅ **Success Card**: `4084084084084081` (CVV: 408, PIN: 0000)
- ❌ **Decline Card**: `5060666666666666666`

---

## ✨ What's Already Configured

Your app is fully set up for payments! Here's what's ready:

✅ **PaystackProvider** - Already wrapped in `app/_layout.tsx`  
✅ **Payment Integration** - Cart screen uses `usePaystack()` hook  
✅ **Amount Calculation** - Auto-calculates subtotal + shipping (₵10 or FREE) + tax (21%)  
✅ **Order Creation** - Happens automatically after successful payment  
✅ **Transaction Tracking** - Unique reference for every payment  
✅ **Error Handling** - Handles success, cancellation, and errors

---

## 🚀 After Adding Your Key

### Step 1: Save the File

Save `.env` file with your key

### Step 2: Restart Your App

```bash
npx expo start --clear
```

### Step 3: Test Payment Flow

1. **Add items to cart** - Browse products and add to cart
2. **Go to cart** - Click cart icon in tab bar
3. **Click "Proceed to Payment"** - Button at bottom of cart
4. **Complete payment** - Use test card or real card
5. **Verify order creation** - Check Orders tab

---

## 📋 Complete Payment Flow

```
User adds items to cart
      ↓
Clicks "Proceed to Payment" button
      ↓
Paystack secure modal opens
      ↓
User enters payment details (card/bank/USSD/QR)
      ↓
Payment processing...
      ↓
✅ Payment Success
      ↓
Order automatically created in database
      ↓
Cart cleared
      ↓
Success message shows order # and transaction reference
      ↓
User redirected to Orders screen
```

---

## 💰 Currency & Amount Handling

The integration uses **Ghanaian Cedis (GHS)** by default.

### Amount Calculation:

- **Subtotal**: Sum of all cart items
- **Shipping**: FREE for orders ≥ ₵100, otherwise ₵10
- **Tax**: 21% of subtotal
- **Total**: Subtotal + Shipping + Tax

### Important:

Paystack v5.x accepts amounts in **Cedis** (not pesewas like older versions).  
The helper functions in `lib/paystack.ts` handle this correctly.

---

## 🔒 Security Best Practices

### ✅ Safe to expose (already implemented):

- Public Key in frontend code
- Transaction references
- Customer emails

### ⚠️ Never expose:

- Secret Key (keep on backend only)
- Customer card details
- Payment credentials

### 🎯 Recommended (not yet implemented):

- Backend payment verification using Secret Key
- Webhook integration for real-time updates
- Server-side order creation after verifying payment

---

## ⚡ Quick Commands

### Check package installation:

```bash
npm list react-native-paystack-webview
```

### Install/reinstall package:

```bash
npm install react-native-paystack-webview --legacy-peer-deps
```

### Clear cache and restart:

```bash
npx expo start --clear
```

### Check for errors:

```bash
npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: react-native-paystack-webview"

**Solution:**

```bash
npm install react-native-paystack-webview --legacy-peer-deps
npx expo start --clear
```

### Issue: "Invalid public key"

**Solutions:**

- ✅ Verify key format: `pk_live_...` or `pk_test_...`
- ✅ Check for extra spaces or quotes
- ✅ Confirm key is active in Paystack dashboard
- ✅ Make sure you copied the **public** key (not secret key)

### Issue: Payment modal not opening

**Check:**

- Console for JavaScript errors
- EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY is set in `.env` file
- User is logged in (sign in required for checkout)
- Cart has items (empty cart shows different screen)
- Internet connection is active

### Issue: Order not created after successful payment

**Check:**

- Console logs for error messages
- Supabase connection is working
- User profile exists in database
- `ordersService.create()` function is working
- Database has proper RLS policies

### Issue: Test card not working

**Try:**

- Card: `4084084084084081`
- Expiry: Any future date (e.g., `12/25`)
- CVV: `408`
- OTP/PIN: `0000`

---

## 📊 Testing Checklist

Use this checklist to verify everything works:

- [ ] Public key added to `.env` file
- [ ] App restarted with cache cleared
- [ ] Can add items to cart
- [ ] Cart displays total amount correctly
- [ ] "Proceed to Payment" button appears
- [ ] Clicking button opens Paystack modal
- [ ] Test card payment completes successfully
- [ ] Success alert shows order # and transaction ref
- [ ] Order appears in Orders tab
- [ ] Cart is cleared after successful payment
- [ ] Can cancel payment (cart remains intact)
- [ ] Payment errors show appropriate message

---

## 🎊 You're All Set!

Once you add your Paystack public key, your app is ready to:

- ✅ Accept real-time payments
- ✅ Process card/bank/USSD/mobile money
- ✅ Create orders automatically
- ✅ Track transactions
- ✅ Handle errors gracefully

**Just add your key and start selling! 🚀**
