# 🎉 Currency Changed to Cedis (GHS) & API Key Setup

## ✅ What's Been Changed

Your app has been successfully updated to use **Ghanaian Cedis (₵/GHS)** instead of Nigerian Naira!

### Files Updated:

1. **[.env](.env)** - Added Paystack API key configuration
2. **[lib/paystack.ts](lib/paystack.ts)** - Updated to:
   - Read API key from environment variable
   - Use Cedis (₵) instead of Naira (₦)
   - Use GHS instead of NGN
   - Convert to pesewas instead of kobo
   - Locale changed from en-NG to en-GH

3. **[app/\_layout.tsx](app/_layout.tsx#L217)** - Changed currency from "NGN" to "GHS"

4. **[app/cart.tsx](app/cart.tsx)** - Updated all currency symbols:
   - Product prices show ₵
   - Subtotal shows ₵
   - Shipping fee shows ₵10.00
   - Tax shows ₵
   - Total shows ₵

5. **Documentation** - Updated guides for Cedis

6. **[.env.example](.env.example)** - Created template file

---

## 🔑 How to Add Your Paystack API Key

### Step 1: Open the .env file

The `.env` file is located at the root of your project:

```
c:\Users\DELL\OneDrive\Desktop\All Project\Print-App\print-app\.env
```

### Step 2: Add Your Paystack Public Key

Open `.env` and find this line:

```env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

Replace `pk_live_your_public_key_here` with your actual Paystack public key:

```env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_abc123xyz789...
```

### Step 3: Get Your Paystack Key

1. Go to: https://dashboard.paystack.com/settings/developer
2. Copy your **Public Key**:
   - **For Live Payments**: `pk_live_...`
   - **For Testing**: `pk_test_...`

### Step 4: Restart Your App

After adding the key, restart your app with cleared cache:

```bash
npx expo start --clear
```

---

## 💰 Currency Details

### Ghanaian Cedis (GHS)

- **Symbol**: ₵
- **Smallest Unit**: Pesewas (1 Cedi = 100 Pesewas)
- **Locale**: en-GH

### Current Settings:

- **Subtotal**: Sum of all cart items in Cedis
- **Shipping**: ₵10.00 (FREE for orders ≥ ₵100)
- **Tax**: 21% of subtotal
- **Total**: Subtotal + Shipping + Tax

---

## 🧪 Testing Your Setup

### Test with Test Key (Recommended First)

1. Use your **test key** in `.env`:

   ```env
   EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_abc123xyz789...
   ```

2. Use Paystack test cards:
   - **Success**: `4084084084084081` (CVV: 408, PIN: 0000)
   - **Decline**: `5060666666666666666`

3. Test the flow:
   - Add items to cart
   - Click "Proceed to Payment"
   - Enter test card details
   - Complete payment
   - Verify order is created

### Switch to Live Key (Production)

Once testing is successful, update `.env` with your live key:

```env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_abc123xyz789...
```

---

## 📋 .env File Structure

Your `.env` file should look like this:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://ajgflwvkxevacxpdmcta.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Paystack Payment Configuration
# Get your keys from: https://dashboard.paystack.com/settings/developer
# For Live Payments use: pk_live_...
# For Testing use: pk_test_...
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_actual_key_here
```

---

## 🔒 Security Notes

### ✅ Safe (Already Implemented):

- API key in `.env` file (never committed to git if .gitignore is set up)
- `.env` is in `.gitignore` by default
- Public key can be exposed in frontend code
- `.env.example` shows structure without real keys

### ⚠️ Important:

- **Never commit your actual `.env` file** to version control
- Use `.env.example` as a template for other developers
- Keep your **Secret Key** secure (never expose it in frontend)
- Test with test keys before using live keys

---

## 📂 File Reference

### Configuration Files:

- **[.env](.env)** - Your actual API keys (not committed to git)
- **[.env.example](.env.example)** - Template for other developers
- **[lib/paystack.ts](lib/paystack.ts)** - Paystack configuration & utilities

### Implementation Files:

- **[app/\_layout.tsx](app/_layout.tsx)** - PaystackProvider with GHS currency
- **[app/cart.tsx](app/cart.tsx)** - Checkout flow with Cedis

### Documentation:

- **[PAYSTACK_SETUP_GUIDE.md](PAYSTACK_SETUP_GUIDE.md)** - Complete integration guide
- **[PAYSTACK_API_KEY_SETUP.md](PAYSTACK_API_KEY_SETUP.md)** - Quick setup instructions

---

## ✨ What Works Now

✅ All prices display in Cedis (₵)  
✅ Paystack processes payments in GHS  
✅ API key loaded from `.env` file  
✅ Secure payment flow with Paystack  
✅ Multiple payment methods (card, bank, mobile money, etc.)  
✅ Automatic order creation after successful payment  
✅ Transaction reference tracking  
✅ Error handling for cancellation and failures

---

## 🚀 Next Steps

1. **Add your API key** to the `.env` file
2. **Restart the app**: `npx expo start --clear`
3. **Test payment flow** with test card
4. **Verify order creation** in Orders tab
5. **Switch to live key** when ready for production

---

## 🐛 Troubleshooting

### "Payment not working"

- ✅ Check `.env` file has correct `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY`
- ✅ Verify key format: `pk_live_...` or `pk_test_...`
- ✅ Restart app with cleared cache: `npx expo start --clear`

### "API key not loading"

- ✅ Ensure variable name is exactly: `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY`
- ✅ No spaces before or after the `=`
- ✅ No quotes around the value in `.env` file

### "Currency showing wrong symbol"

- ✅ All code has been updated to ₵
- ✅ Clear cache and restart: `npx expo start --clear`

---

**Your app is now ready to accept payments in Ghanaian Cedis! 🇬🇭💰**

Just add your Paystack API key to the `.env` file and you're all set! 🎉
