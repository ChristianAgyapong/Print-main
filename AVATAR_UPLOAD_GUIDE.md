# Profile Avatar Upload Feature 🖼️

## Overview

Users can now upload and update their profile pictures, which are stored securely in Supabase Storage.

## Features Implemented

### 1. **Avatar Upload**

- Users can select images from their device gallery
- Images are cropped to 1:1 aspect ratio (square)
- Image quality is optimized to 80% to reduce file size
- Maximum file size: 5MB

### 2. **Storage Integration**

- Images stored in Supabase Storage bucket: `avatars`
- Organized by user: `avatars/{user_id}/avatar-{timestamp}.{extension}`
- Old avatars automatically deleted when uploading new ones
- Public bucket for easy access

### 3. **Avatar Display**

- Profile Tab: Shows avatar with edit button overlay
- Edit Profile: Shows current avatar with "Change Photo" button
- View Profile: Displays avatar in header section
- Falls back to default icon if no avatar

## Setup Instructions

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Run the SQL in `AVATAR_STORAGE_SETUP.sql` in the SQL Editor
4. This creates:
   - `avatars` bucket (public)
   - Storage policies for upload/update/delete/view

### Step 2: Test the Feature

1. Sign in to the app
2. Go to Profile tab
3. Tap the camera icon or tap your avatar
4. Select "Edit Profile"
5. Tap "Change Photo"
6. Select an image from your gallery
7. Tap "Save Changes"

## Technical Details

### Files Modified

#### 1. `lib/storage-service.ts`

```typescript
- Added AVATARS_BUCKET constant
- Added MAX_AVATAR_SIZE (5MB) limit
- Added uploadAvatar() function
- Added deleteAvatar() function
```

#### 2. `app/edit-profile.tsx`

```typescript
- Added expo-image-picker integration
- Added avatarUri state
- Added pickImage() function
- Added uploading state indicator
- Added avatar upload on save
- Updated UI to show current avatar
```

#### 3. `app/view-profile.tsx`

```typescript
- Added Image component import
- Updated avatar section to display image
- Falls back to icon if no avatar
```

#### 4. `app/(tabs)/profile.tsx`

```typescript
- Added Image component import
- Updated avatar section to display image
- Falls back to icon if no avatar
```

### API Functions

#### `storageService.uploadAvatar()`

```typescript
async uploadAvatar(
  imageUri: string,      // Local image URI from picker
  userId: string,        // User ID for folder organization
  oldAvatarUrl?: string  // Optional: URL of old avatar to delete
): Promise<string | null>
```

**Returns:** Public URL of uploaded avatar or null on error

**Features:**

- Validates file size (max 5MB)
- Validates file type (images only)
- Deletes old avatar if provided
- Generates unique filename with timestamp
- Returns public URL for immediate use

#### `storageService.deleteAvatar()`

```typescript
async deleteAvatar(
  avatarUrl: string,  // Full URL of avatar to delete
  userId: string      // User ID for security
): Promise<boolean>
```

**Returns:** `true` if deleted successfully, `false` otherwise

### Database Schema

The `profiles` table already includes:

```sql
avatar_url TEXT -- Stores the public URL of the user's avatar
```

### Storage Structure

```
avatars/
└── {user_id}/
    └── avatar-1708257893456.jpg
    └── avatar-1708257899123.png
```

### Permissions

```sql
- authenticated users can INSERT to their folder
- authenticated users can UPDATE their folder
- authenticated users can DELETE from their folder
- public can SELECT (view) all avatars
```

## User Flow

1. **First Time Upload:**

   ```
   User taps "Change Photo"
   → Permission request (if needed)
   → Image picker opens
   → User selects & crops image
   → Preview shows in UI
   → User taps "Save Changes"
   → Image uploads to Supabase
   → Profile updated with avatar URL
   → Success message
   → Navigate back
   ```

2. **Updating Avatar:**

   ```
   Current avatar displayed
   → User taps "Change Photo"
   → Selects new image
   → Preview updates
   → User taps "Save Changes"
   → Old avatar deleted
   → New avatar uploads
   → Profile updated
   → Success message
   ```

3. **Loading States:**
   - Upload in progress: Shows loading spinner
   - Avatar loading: Shows placeholder icon
   - Error: Shows error message, keeps old avatar

## Error Handling

### File Size Exceeded

```
"Image size exceeds 5MB limit"
```

### Invalid File Type

```
"Please select a valid image file"
```

### Upload Failed

```
"Profile saved but avatar upload failed. Please try again."
```

Note: Profile data still saves, only avatar fails

### Permission Denied

```
"Please allow access to your photos to change your profile picture."
```

## Best Practices

### For Users:

- Use square images for best results
- Keep file size under 5MB
- Use JPG/PNG format
- Good lighting recommended

### For Developers:

- Always validate file size before upload
- Delete old avatars to save storage space
- Handle errors gracefully (partial success)
- Show loading indicators during upload
- Cache images for better performance

## Troubleshooting

### Avatar Not Showing

1. Check if `avatar_url` is saved in profiles table
2. Verify storage bucket is public
3. Check storage policies are correct
4. Ensure URL is accessible in browser

### Upload Fails

1. Check Supabase storage quota
2. Verify bucket exists and is configured
3. Check storage policies
4. Ensure user is authenticated
5. Check file size and type

### Permission Denied

1. User needs to grant media library access
2. Check app permissions in device settings
3. Request permission before opening picker

## Future Enhancements

### Potential Features:

- [ ] Image cropping in-app
- [ ] Multiple image filters
- [ ] Avatar templates/stickers
- [ ] Default avatar selection
- [ ] Avatar history (undo)
- [ ] GIF/animated avatar support
- [ ] Camera capture option
- [ ] Image compression optimization
- [ ] CDN integration for faster loading

## Security Considerations

✅ **Implemented:**

- User-based folder structure
- Authenticated upload only
- File size validation
- File type validation
- Automatic old file cleanup
- RLS policies on storage

⚠️ **Recommendations:**

- Consider adding content moderation
- Implement rate limiting for uploads
- Add EXIF data stripping for privacy
- Monitor storage usage per user
- Consider paid CDN for heavy usage

## Performance Notes

- Images are optimized to 80% quality
- Square crop reduces file size
- Local preview before upload
- Async upload (non-blocking UI)
- Old avatars deleted automatically
- No image duplication

## Support

If you encounter issues:

1. Check Supabase Dashboard → Storage → avatars bucket
2. Verify SQL policies in Storage → Policies
3. Check app logs for error messages
4. Ensure internet connection is stable
5. Clear app cache if images don't load

---

**Status:** ✅ Fully Implemented and Tested
**Version:** 1.0
**Last Updated:** February 18, 2026
