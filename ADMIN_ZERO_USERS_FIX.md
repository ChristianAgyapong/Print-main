# 🚨 ADMIN PANEL SETUP - QUICK FIX FOR "0 USERS" ISSUE

## Problem
You're seeing **0 users** in the admin panel even though 4 users exist in your Supabase database.

## Cause
**Supabase Row Level Security (RLS)** policies are blocking your admin account from reading other users' data.

## Solution (Choose ONE)

---

### ✅ Option 1: Add RLS Policies (RECOMMENDED)

**Step 1:** Open your Supabase project dashboard
- Go to https://supabase.com/dashboard
- Select your project

**Step 2:** Open SQL Editor
- Click "SQL Editor" in the left sidebar
- Click "New query"

**Step 3:** Copy and paste this SQL:

```sql
-- REPLACE 'your-admin-email@example.com' with YOUR actual admin email!

-- Allow admin to read all profiles
CREATE POLICY "Admin can read all profiles"
ON profiles FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Allow admin to read all orders
CREATE POLICY "Admin can read all orders"
ON orders FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Allow admin to update orders
CREATE POLICY "Admin can update all orders"
ON orders FOR UPDATE
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);
```

**Step 4:** Click "Run"

**Step 5:** Refresh your app and check the admin panel again

---

### ⚡ Option 2: Temporarily Disable RLS (TESTING ONLY)

**⚠️ WARNING:** This makes ALL data publicly readable. Only use for testing!

**Step 1:** Open SQL Editor in Supabase

**Step 2:** Run this SQL:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

**Step 3:** Refresh your app - you should now see all 4 users!

**Step 4:** When done testing, RE-ENABLE RLS:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

Then add proper policies using Option 1.

---

## How to Verify It's Working

### 1. Check Console Logs
Open your browser console or React Native debugger. You should see:

```
📦 Admin: Fetching all users from backend...
✅ Admin: Fetched 4 users from backend
📊 Admin UI: Received 4 users from service
```

### 2. Check Admin Panel
- Open app
- Go to Account tab
- Tap "Admin Panel"
- Tap "Users"
- You should see all 4 users with their profile info

---

## Common Issues

### Issue: "auth.jwt() is null"
**Solution:** You're not signed in. Sign in with your admin email first.

### Issue: Still showing 0 users
**Solution:** Check that:
1. Your email in the SQL matches EXACTLY the email in `lib/database-service.ts`
2. You're signed in with that email
3. You ran the SQL in the correct Supabase project
4. You refreshed the app after running SQL

### Issue: Console shows "RLS policy violation"
**Solution:** 
1. Double-check the email spelling in the SQL
2. Make sure you clicked "Run" in Supabase SQL Editor
3. Try signing out and signing back in

---

## Your Admin Email

Check [lib/database-service.ts](lib/database-service.ts) around line 250:

```typescript
const adminEmails = ["admin@printcraft.com", "owner@printcraft.com"];
```

**Make sure:**
1. Your email is in this array
2. The same email is used in the SQL policy
3. You're signed into the app with this email

---

## Full RLS Policies File

For complete RLS policies with all tables, see:
📄 [SUPABASE_ADMIN_RLS_POLICIES.sql](SUPABASE_ADMIN_RLS_POLICIES.sql)

---

## Need More Help?

1. **Check console logs** - They now show detailed error messages
2. **Check Supabase logs** - Go to your Supabase project → Logs
3. **Verify your setup:**
   - Admin email in code matches SQL policy
   - You're signed in with admin email
   - RLS policies were created successfully

---

**Last Updated:** February 19, 2026
