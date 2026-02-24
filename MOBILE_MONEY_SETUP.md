# 📱 Mobile Money Payment Configuration

## ✅ Payment Method: Mobile Money (MoMo) Only

Your app is now configured to **only accept Mobile Money payments** for all Ghanaian networks.

---

## 🇬🇭 Supported Mobile Money Networks

Your customers can pay using any of these Ghanaian Mobile Money services:

1. **MTN Mobile Money** - Ghana's largest mobile money network
2. **Telecel Cash** - Formerly Vodafone Cash
3. **AirtelTigo Money** - Combined Airtel and Tigo network

---

## 🔧 Configuration Details

### Files Updated:

1. **[app/\_layout.tsx](app/_layout.tsx#L218)**

   ```tsx
   <PaystackProvider
     publicKey={PAYSTACK_PUBLIC_KEY}
     currency="GHS"
     defaultChannels={['mobile_money']}
   >
   ```

   - Set `defaultChannels` to only allow `mobile_money`

2. **[app/cart.tsx](app/cart.tsx)**
   - Button text changed to: **"Pay with Mobile Money"**
   - Button icon changed to phone icon
   - Added console log for Mobile Money transactions
   - No card, bank, USSD, or QR payment options

3. **[lib/paystack.ts](lib/paystack.ts)**
   - Default channel set to `['mobile_money']`
   - Updated documentation

4. **[.env](.env)**
   ```env
   # Payment Method: Mobile Money (MoMo) only
   # Supported Networks: MTN, Telecel, AirtelTigo
   ```

---

## 💰 How It Works

### Customer Payment Flow:

1. Customer adds items to cart
2. Clicks **"Pay with Mobile Money"** button
3. Paystack payment modal opens showing **Mobile Money options only**
4. Customer selects their network:
   - MTN
   - Telecel
   - AirtelTigo
5. Customer enters their mobile money number
6. Receives prompt on their phone to approve payment
7. Enters PIN to complete transaction
8. Order is created automatically

---

## 🧪 Testing Mobile Money

### For Testing (Development):

1. Use your test key in `.env`:

   ```env
   EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here
   ```

2. **Test Mobile Money Numbers** (from Paystack):
   - Any valid Ghana mobile number format works in test mode
   - Example: `0240000000`, `0550000000`, `0260000000`
   - Transaction will be simulated and completed instantly

3. **Test the flow**:
   - Add items to cart
   - Click "Pay with Mobile Money"
   - Select a network (MTN/Telecel/AirtelTigo)
   - Enter test mobile number
   - Complete test payment
   - Verify order is created

### For Live Payments (Production):

1. Switch to live key in `.env`:

   ```env
   EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
   ```

2. Customers use their **actual mobile money accounts**
3. Real money will be deducted from their mobile money wallet
4. Funds will be transferred to your Paystack account

---

## 💡 Benefits of Mobile Money Only

### For Your Business:

- ✅ Lower transaction fees compared to cards
- ✅ No chargebacks
- ✅ Instant settlement
- ✅ Wider reach (most Ghanaians have mobile money)
- ✅ No bank account required from customers

### For Your Customers:

- ✅ No need for debit/credit cards
- ✅ No need to enter card details
- ✅ Pay directly from their mobile money wallet
- ✅ Familiar payment method
- ✅ Quick and convenient

---

## 📊 Transaction Fees

Paystack charges different fees for Mobile Money transactions:

- **Domestic Mobile Money**: 1.5% (capped at GHS 3)
- **Local cards**: 1.95%
- **International cards**: 3.95%

By accepting only Mobile Money, you benefit from the **lowest transaction fees**.

---

## 🔄 To Enable Other Payment Methods

If you want to accept other payment methods in addition to Mobile Money, update [app/\_layout.tsx](app/_layout.tsx#L218):

```tsx
<PaystackProvider
  publicKey={PAYSTACK_PUBLIC_KEY}
  currency="GHS"
  defaultChannels={['mobile_money', 'card', 'bank']}
>
```

Available channels:

- `'mobile_money'` - Mobile Money (MTN, Telecel, AirtelTigo)
- `'card'` - Debit/Credit cards
- `'bank'` - Bank transfers
- `'ussd'` - USSD payments
- `'qr'` - QR code payments

---

## 🎯 What's Active Now

✅ **Currency**: Ghanaian Cedis (₵ / GHS)  
✅ **Payment Method**: Mobile Money Only  
✅ **Networks**: MTN, Telecel, AirtelTigo  
✅ **Button Text**: "Pay with Mobile Money"  
✅ **Button Icon**: Phone icon  
✅ **Transaction Logging**: Mobile Money specific logs

---

## 🚀 Ready to Use!

Your app is now configured to accept Mobile Money payments from all major Ghanaian networks. Just restart your app:

```bash
npx expo start --clear
```

Test the payment flow to ensure everything works as expected! 🎉
