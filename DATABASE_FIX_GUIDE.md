# 🔧 Fix: Profile Data Not Saving to Database

## ⚠️ The Problem
When users sign up or sign in, their profile data wasn't being stored in the database because:
1. Profile records weren't being created automatically
2. Database tables might not exist or have wrong permissions

## ✅ What Was Fixed

### 1. Updated AuthContext (`contexts/AuthContext.tsx`)
- Now **automatically creates profile** when user signs up
- Creates profile for **OAuth users** (Google, Apple) on first sign-in
- Handles profile creation in `onAuthStateChange` event

### 2. Created Complete Database Setup (`COMPLETE_DATABASE_SETUP.sql`)
- All required tables with proper structure
- Row Level Security (RLS) policies
- Automatic triggers for profile creation
- Sample data for testing

## 🚀 Quick Fix Steps

### Step 1: Run Database Setup
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Copy ALL contents of `COMPLETE_DATABASE_SETUP.sql`
4. Paste and click **"Run"**
5. Wait for "✅ Database setup complete!" message

### Step 2: Test the Fix
1. **Sign Up New User:**
   ```
   - Create new account with email/password
   - Profile should auto-create in database
   - Check logs for "✅ Profile created in database"
   ```

2. **Existing Users:**
   ```
   - Sign in with existing account
   - Profile will auto-create if missing
   - Check logs for "📝 Creating profile for new user"
   ```

3. **OAuth Users:**
   ```
   - Sign in with Google
   - Profile auto-created with Google name
   - Check logs for profile creation messages
   ```

## 📋 Verify It's Working

### Check in App Logs (Metro)
Look for these messages:
```
📝 Creating profile for user: [user-id]
✅ Profile created in database
✅ Profile created successfully
```

### Check in Supabase Dashboard
1. Go to **Table Editor**
2. Open **profiles** table
3. You should see rows with user data

### Test Profile Features
1. Open **Profile tab**
2. Tap **"Personal Information"**
3. Should load without errors
4. Edit and save data
5. Refresh — data should persist

## 🎯 What Each Fix Does

### AuthContext Changes

**Before:**
```typescript
// ❌ Only stored in auth.users metadata
const { error } = await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: fullName }}
});
```

**After:**
```typescript
// ✅ Also creates in profiles table
const { data, error } = await supabase.auth.signUp({...});
if (!error && data.user) {
  await profileService.create(data.user.id, fullName);
}
```

### Automatic Profile Creation

The database trigger now also creates profiles automatically:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

This means **TWO safety nets**:
1. App creates profile (primary)
2. Database trigger creates profile (backup)

## 📊 Database Tables Created

1. **profiles** — User profile data (15 fields)
2. **products** — Items for sale
3. **orders** — User orders
4. **order_items** — Order line items
5. **uploads** — Saved design files
6. **addresses** — Delivery addresses

## 🔒 Security (RLS Policies)

All tables have proper security:
- ✅ Users can only see their own data
- ✅ Users can only edit their own data
- ✅ Products are public (everyone can view)
- ✅ Authenticated users only

## 🐛 Troubleshooting

### "Profile not found" error
**Solution:** Run the database setup SQL

### "Permission denied" error
**Solution:** Check RLS policies were created

### Profile data not persisting
**Solution:** Check Supabase logs in dashboard

### OAuth profile not created
**Solution:** Clear app cache: `npm start -- --clear`

## 🧪 Testing Checklist

- [ ] Run `COMPLETE_DATABASE_SETUP.sql` in Supabase
- [ ] Restart Expo dev server
- [ ] Sign up new user → Profile auto-created
- [ ] Sign in existing user → Profile created if missing
- [ ] Edit profile → Data saves and persists
- [ ] View profile → Shows all saved data
- [ ] Stats show real counts (orders, designs, etc.)

## 📝 For Existing Users

If you have existing users who signed up before this fix:

### Option 1: They Sign In Again
- Just have them sign in
- Profile will auto-create
- No action needed from them

### Option 2: Manual Migration (if needed)
Run this SQL to create profiles for all existing users:
```sql
INSERT INTO profiles (id, full_name, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

## ✅ Success Indicators

You'll know it's working when:
1. No errors in Metro console
2. Profile tab loads instantly
3. Edit profile saves successfully
4. Data shows in Supabase Table Editor
5. Stats (orders, designs) display correctly
6. All profile fields are editable

## 🎉 What You Get Now

- ✅ Automatic profile creation on signup
- ✅ OAuth profile creation (Google, Apple)
- ✅ Database backup with triggers
- ✅ Full CRUD for all profile fields
- ✅ Proper security with RLS
- ✅ Real data persistence
- ✅ Error logging for debugging

The profile system is now fully functional with complete database integration! 🚀
