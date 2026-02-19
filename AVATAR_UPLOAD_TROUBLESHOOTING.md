# Avatar Upload Troubleshooting Guide

## 🔍 Issue: Avatar Not Showing After Upload

If your avatar image uploads but doesn't appear in the profile, follow these steps:

---

## ✅ Step 1: Verify Supabase Storage Bucket Exists

The `avatars` bucket must be created in Supabase Storage.

### Check if bucket exists:

1. Go to **Supabase Dashboard** → **Storage**
2. Look for a bucket named `avatars`
3. If it doesn't exist, **run the SQL setup script**

### Create the bucket:

Run this SQL in **Supabase SQL Editor**:

```sql
-- Run the contents of AVATAR_STORAGE_SETUP.sql file
-- Or manually create bucket:

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### Create Storage Policies:

After creating the bucket, run these policies:

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## ✅ Step 2: Check Console Logs

Open your development console and look for these logs:

### Expected successful flow:

```
Avatar uploaded successfully. URL: https://[your-project].supabase.co/storage/v1/object/public/avatars/...
Updating profile with: { avatar_url: "https://...", ... }
Profile updated successfully
Profile updated with avatar URL: https://...
```

### Common errors:

- **"Bucket not found"** → Run Step 1
- **"Row level security policy violation"** → Check policies from Step 1
- **"Failed to upload"** → Check file size (max 5MB) and format (JPG, PNG, GIF)

---

## ✅ Step 3: Verify Avatar URL in Database

1. Go to **Supabase Dashboard** → **Table Editor** → **profiles** table
2. Find your user row (match your user ID)
3. Check the `avatar_url` column
4. It should contain a full URL like: `https://[project-id].supabase.co/storage/v1/object/public/avatars/[user-id]/avatar-[timestamp].jpg`

### If avatar_url is empty or null:

- The upload succeeded but database update failed
- Check console logs for "Error updating profile"
- Verify RLS policies on profiles table allow updates

---

## ✅ Step 4: Test Image URL Directly

1. Copy the `avatar_url` from your database
2. Paste it in a browser
3. The image should load
4. If it doesn't load:
   - Bucket might be set to private (should be public)
   - File doesn't exist in storage
   - Go to **Supabase Storage** → **avatars** bucket and verify the file exists

---

## ✅ Step 5: Check Image Caching

If the image was uploaded but shows old image:

1. **Force reload the profile screen:**
   - Pull down to refresh
   - Navigate away and back
   - Close and reopen the app

2. **Clear React Native cache:**

   ```bash
   npm start -- --clear
   ```

3. **Images now have cache busting:**
   - URIs include `?t=timestamp` to force refresh
   - Each navigation reloads the profile data

---

## ✅ Step 6: Test Upload Process

Try uploading with these steps to isolate the issue:

1. **Pick a small image** (< 1MB)
2. **Watch console logs** while uploading
3. **Check each step:**
   - ✓ Image picker opens
   - ✓ Image shows in preview
   - ✓ "Uploading" shows briefly
   - ✓ Success alert appears
   - ✓ Console shows upload URL
   - ✓ Console shows profile update
   - ✓ Navigate back to profile
   - ✓ Avatar loads on profile screen

---

## ✅ Step 7: Verify Permissions

### iOS/Android Camera/Gallery Permissions:

The app requests permissions automatically, but if denied:

**iOS:**

- Settings → Your App → Photos → Select "Selected Photos" or "All Photos"

**Android:**

- Settings → Apps → Your App → Permissions → Photos → Allow

---

## 🐛 Common Issues & Solutions

### Issue: "Success" message but no avatar

**Cause:** Upload succeeded but database update failed  
**Solution:**

- Check profiles table RLS policies
- Verify avatar_url column exists in profiles table
- Check console logs for database errors

### Issue: Avatar shows old image

**Cause:** Image caching  
**Solution:**

- Pull to refresh on profile screen
- Cache busting is now enabled with `?t=timestamp`
- Restart app if needed

### Issue: "Upload Error" alert

**Cause:** Storage bucket doesn't exist or no upload permissions  
**Solution:**

- Complete Step 1 above
- Verify bucket exists and is public
- Check storage policies

### Issue: Image too large

**Cause:** File exceeds 5MB limit  
**Solution:**

- Use a smaller image
- The app crops to square which may reduce size
- Try a different image format (JPG is usually smaller than PNG)

---

## 📊 Debug Checklist

- [ ] `avatars` bucket exists in Supabase Storage
- [ ] Bucket is set to **public**
- [ ] Storage policies are created (4 policies)
- [ ] `avatar_url` column exists in `profiles` table
- [ ] Profiles table RLS allows authenticated users to UPDATE
- [ ] Console shows "Avatar uploaded successfully"
- [ ] Console shows "Profile updated successfully"
- [ ] avatar_url in database contains full URL
- [ ] Image URL loads in browser
- [ ] Profile screen reloads after saving
- [ ] App has gallery/camera permissions

---

## 🔧 Quick Fix Commands

### Restart with fresh cache:

```bash
cd print-app
npm start -- --clear
```

### Check Supabase connection:

```bash
# In your app console
npm start
# Then in Metro console, check logs for "Avatar uploaded successfully"
```

---

## 📝 Still Not Working?

If you've completed all steps above and it still doesn't work:

1. **Check console logs** for specific error messages
2. **Verify Supabase project URL** in `lib/supabase.ts`
3. **Test with different image** (small JPG)
4. **Check Supabase Dashboard** → **Storage** → **avatars** folder for uploaded files
5. **Verify user authentication** (user must be signed in)

---

## ✨ Expected Behavior

When working correctly:

1. User taps "Change Photo"
2. Gallery opens with permission check
3. User selects and crops image
4. Preview shows immediately
5. User taps "Save Changes"
6. Brief "Uploading..." indicator
7. Alert: "Profile updated successfully!"
8. Navigate back
9. Profile screen reloads automatically
10. New avatar appears on all screens (Profile tab, View Profile, Edit Profile)

---

## 🎯 Success Indicators

You'll know it's working when:

- ✅ Console logs show successful upload and update
- ✅ Database avatar_url column has full URL
- ✅ Avatar appears on Profile tab
- ✅ Avatar appears on View Profile screen
- ✅ Avatar appears on Edit Profile screen
- ✅ Avatar persists after closing and reopening app
- ✅ Different users see their own unique avatars
