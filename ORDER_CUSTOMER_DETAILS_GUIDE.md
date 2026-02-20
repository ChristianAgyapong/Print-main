# Order Customer Details Implementation Guide

## Overview

The orders table has been enhanced to store customer details (name, email, phone) directly in each order record. This eliminates the need for additional API calls to fetch user information and improves admin panel performance.

## What Changed

### 1. Database Schema

**New columns added to `orders` table:**

- `user_name` (TEXT) - Customer's full name
- `user_email` (TEXT) - Customer's email address
- `user_phone` (TEXT) - Customer's phone number

### 2. Code Changes

#### lib/database-service.ts

**Order Interface:**

```typescript
export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: {
    email: string;
    name: string;
    phone: string | null;
  };
  // New fields:
  user_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
}
```

**ordersService.create():**

- Now accepts optional `userDetails` parameter: `{ name?: string; email?: string; phone?: string }`
- Stores customer details in order record
- Logs: "📦 Creating order with user details"

**adminService.getAllOrders():**

- Reads user details directly from order columns
- No longer calls `auth.admin.getUserById()`
- Returns user object with name, email, and phone
- Improved performance (no async user lookups)

#### app/cart.tsx

**handleCheckout():**

- Fetches user profile via `profileService.get()`
- Constructs userDetails object:
  ```typescript
  const userDetails = {
    name: profile?.full_name || user.email?.split("@")[0] || "Customer",
    email: user.email || "",
    phone: profile?.phone || null,
  };
  ```
- Passes userDetails to `ordersService.create()`
- Logs: "📦 Checkout: Creating order with user details"

#### app/admin/orders.tsx

**Order Display:**

- Shows customer name (instead of just email)
- Displays email on separate line
- Shows phone number if available
- Styles: `orderEmail` and `orderPhone` (13px, gray)

## Setup Instructions

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `ORDERS_USER_DETAILS_MIGRATION.sql`
4. Copy and paste the SQL into the editor
5. Click **Run**

The migration will:

- Add 3 new columns to orders table
- Backfill existing orders with customer data from profiles
- Create an index on user_email for faster queries
- Display sample data to verify success

### Step 2: Verify Migration

After running the migration, check:

```sql
SELECT user_name, user_email, user_phone, total_amount
FROM orders
LIMIT 5;
```

You should see customer details populated for existing orders.

### Step 3: Test Order Creation

1. Open your app
2. Add items to cart
3. Complete checkout
4. Go to admin orders page
5. Verify the new order shows customer name, email, and phone

## Benefits

### For Admins:

✅ **See customer names** - No more "Unknown" or just email addresses  
✅ **Contact information** - Email and phone displayed in order details  
✅ **Faster loading** - No additional API calls to fetch user data  
✅ **Better verification** - Easy to identify and contact customers

### For Developers:

✅ **Cleaner code** - No async user lookups in order display  
✅ **Better performance** - Eliminated auth.admin API dependency  
✅ **Richer data** - All customer info in one place  
✅ **Improved debugging** - Logging shows when user details are captured

## Data Flow

### Order Creation:

1. User clicks "Proceed to Checkout" in cart
2. App fetches user profile (name, phone)
3. Constructs userDetails object with name, email, phone
4. Creates order with items + userDetails
5. Supabase stores all fields in orders table

### Admin Orders View:

1. Admin opens orders page
2. Calls `adminService.getAllOrders()`
3. Query fetches orders with:
   - Order details (id, total, status, date)
   - Customer details (user_name, user_email, user_phone)
4. Maps to user object: `{ email, name, phone }`
5. UI displays customer information in order cards

## Troubleshooting

### Issue: New orders still showing "Unknown Customer"

**Cause:** User hasn't completed their profile  
**Solution:**

- User details fallback to email username if full_name is empty
- Encourage users to complete profile for better order records

### Issue: Phone number not showing

**Cause:** User didn't provide phone in profile  
**Solution:**

- Phone is optional
- Consider making phone required in profile edit form

### Issue: Existing orders show "N/A" for email

**Cause:** Migration didn't backfill all orders  
**Solution:**
Run backfill query manually:

```sql
UPDATE orders o
SET
  user_name = p.full_name,
  user_email = au.email,
  user_phone = p.phone
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE o.user_id = p.id
  AND o.user_email IS NULL;
```

### Issue: Old code still using auth.admin.getUserById

**Cause:** Code not updated yet  
**Solution:**

- Ensure you're using latest lib/database-service.ts
- Check that adminService.getAllOrders() reads from order columns
- Verify no `auth.admin.getUserById()` calls in orders fetching

## Console Logs

Watch for these logs during order creation and admin viewing:

**During Checkout:**

```
📦 Checkout: Creating order with user details: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+353123456789"
}
📦 Creating order with user details: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+353123456789"
}
```

**In Admin Panel:**

```
🔑 Admin check result: true
📊 Admin: Fetching all orders...
📊 Admin: Successfully fetched X orders
📊 Admin UI: Received X orders from service
```

## Future Enhancements

Consider adding:

- **Search orders by customer name/email** - Filter orders in admin panel
- **Click-to-contact** - Tap email to compose, tap phone to call
- **Shipping address** - Store delivery address in order
- **Order notes** - Let customer add special instructions
- **Customer order history** - Link to all orders by same customer

## Related Files

- `lib/database-service.ts` - Order interface and services
- `app/cart.tsx` - Checkout and order creation
- `app/admin/orders.tsx` - Admin orders display
- `ORDERS_USER_DETAILS_MIGRATION.sql` - Database migration
- `contexts/AuthContext.tsx` - User authentication
- `lib/database-service.ts` - Profile service (for fetching user data)

## Summary

This implementation provides a complete solution for storing and displaying customer information in orders. The admin panel now shows rich customer details without performance overhead, and the system gracefully handles users who haven't completed their profiles.

All new orders will automatically include customer details during checkout. Existing orders can be backfilled by running the migration SQL.
