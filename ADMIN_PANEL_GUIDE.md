# Admin Panel Documentation

## 🚨 QUICK START: If You See "0 Users" or Empty Data

**See:** [ADMIN_ZERO_USERS_FIX.md](ADMIN_ZERO_USERS_FIX.md) for immediate troubleshooting!

**Most Common Issue:** Supabase Row Level Security (RLS) policies need to be set up.

**Quick Fix:**
1. Go to your Supabase SQL Editor
2. Run the SQL from [SUPABASE_ADMIN_RLS_POLICIES.sql](SUPABASE_ADMIN_RLS_POLICIES.sql)
3. Replace email addresses with your admin email
4. Refresh the app

---

## Overview
The admin panel allows authorized administrators to manage the PrintCraft app's core operations including orders, users, and products.

## Access Requirements

### Setting Up Admin Access
1. Open `lib/database-service.ts`
2. Find the `adminService.isAdmin()` function (around line 247)
3. Add your admin email to the `adminEmails` array:
```typescript
const adminEmails = ["admin@printcraft.com", "owner@printcraft.com", "your-email@example.com"];
```

### Accessing the Admin Panel
- Sign in with an admin email
- Navigate to the **Account** tab (Profile)
- Look for the **Admin Panel** button at the top (only visible to admins)
- Tap to enter the admin dashboard

## Features

### 1. Admin Dashboard (`/admin`)
**Location:** `app/admin/index.tsx`

- Welcome screen showing admin email
- Quick access cards to:
  - Orders Management
  - Users Management  
  - Products Management
- Navigation menu to all admin sections

### 2. Orders Management (`/admin/orders`)
**Location:** `app/admin/orders.tsx`

**Features:**
- View all orders from all customers
- See order statistics (Total, Pending, Delivered)
- Search and filter orders
- Expand order details to see:
  - Customer email
  - Order items with quantities and prices
  - Order date and total amount
- **Update Order Status:** Toggle between "pending" and "delivered"
- Pull-to-refresh functionality

**Order Status Flow:**
- **Pending:** New orders waiting to be processed
- **Delivered:** Completed orders

**Actions:**
1. Tap any order to expand details
2. Tap "Update Status" button to change order status
3. Confirm the status change in the alert dialog

### 3. Users Management (`/admin/users`)
**Location:** `app/admin/users.tsx`

**Features:**
- View all registered users/customers
- See user profiles with:
  - Name and avatar
  - Company name (if provided)
  - Phone number
  - Location (city, country)
  - Join date
- Search users by name, phone, or company
- User count display
- Pull-to-refresh functionality

**Note:** This is read-only. Users cannot be edited or deleted from the admin panel.

### 4. Products Management (`/admin/products`)
**Location:** `app/admin/products.tsx`

**Features:**
- View all products in the catalog
- Add new products
- Edit existing products
- Delete products
- Product count display
- Pull-to-refresh functionality

**Adding a Product:**
1. Tap the **+** button in the header
2. Fill in the required fields:
   - **Title*** (required)
   - **Description**
   - **Price*** (required, in euros)
   - **Category*** (required - select from: Stationery, Large Format, Commercial, Digital, Packaging)
   - **Image URL** (optional)
   - **Stock Quantity** (defaults to 100)
3. Tap "Add Product"

**Editing a Product:**
1. Tap the pencil icon on any product card
2. Update the fields
3. Tap "Update Product"

**Deleting a Product:**
1. Tap the trash icon on any product card
2. Confirm deletion in the alert dialog

**Note:** Deleting a product that exists in customer carts or past orders may cause issues. Consider marking products as "out of stock" instead by setting stock quantity to 0.

## Database Services

### Admin Service Functions
**Location:** `lib/database-service.ts` (starting around line 245)

```typescript
adminService.isAdmin(email: string): boolean
// Check if user is admin

adminService.getAllOrders(): Promise<Order[]>
// Get all orders with user details

adminService.updateOrderStatus(orderId: string, status: string): Promise<boolean>
// Update order status

adminService.getAllUsers(): Promise<Profile[]>
// Get all user profiles

adminService.getUserStats(): Promise<Stats>
// Get platform statistics (users, orders, revenue, products)

adminService.addProduct(product: ProductData): Promise<Product | null>
// Add new product

adminService.updateProduct(id: string, updates: Partial<ProductData>): Promise<boolean>
// Update existing product

adminService.deleteProduct(id: string): Promise<boolean>
// Delete product
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Email-Based Authentication:** Currently, admin access is determined by email address. In production, consider:
   - Adding a dedicated `is_admin` field to the profiles table
   - Implementing role-based access control (RBAC)
   - Adding admin audit logs

2. **Supabase RLS Policies:** Ensure your Supabase database has proper Row Level Security (RLS) policies that:
   - Allow admins to read all orders
   - Allow admins to update order statuses
   - Allow admins to manage products
   - Prevent regular users from accessing admin data

3. **Data Validation:** All admin operations include validation, but consider adding server-side validation rules in Supabase.

## Recommended Supabase Setup

### Add Admin Column to Profiles Table
Run this SQL in Supabase SQL Editor:

```sql
-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Update your admin account
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = 'YOUR_USER_ID';
```

Then update `adminService.isAdmin()` to check the database:
```typescript
async isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  return data?.is_admin || false;
}
```

## Troubleshooting

### "Access Denied" Message
- Verify your email is in the `adminEmails` array
- Sign out and sign back in
- Check console logs for authentication errors

### Admin Button Not Showing
- Ensure you're signed in with an admin email
- Check that `AdminProvider` is properly wrapped in `app/_layout.tsx`
- Verify `useAdmin()` hook is imported in profile screen

### Orders Not Loading
- Check Supabase connection
- Verify RLS policies allow admin access
- Check browser/app console for errors

### Products Not Saving
- Ensure all required fields are filled
- Check that price is a valid number
- Verify image URL is valid (or leave empty)
- Check Supabase connection and permissions

## Future Enhancements

Consider adding:
- Analytics dashboard with charts
- Order filtering by date range
- Bulk order status updates
- Product categories management
- Email notifications for new orders
- Export orders to CSV
- User role management
- Admin activity logs
- Product inventory tracking
- Low stock alerts

## Support

For technical support or questions:
- Check the code comments in each admin file
- Review Supabase logs for database errors
- Contact the development team

---

**Created:** February 2026  
**Version:** 1.0  
**Last Updated:** February 19, 2026
