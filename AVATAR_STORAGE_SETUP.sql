-- =============================================
-- AVATAR STORAGE BUCKET SETUP
-- =============================================
-- Run this in your Supabase SQL Editor to create the avatars bucket

-- Create avatars bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES FOR AVATARS
-- =============================================

-- Policy: Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =============================================
-- NOTES:
-- =============================================
-- 1. Avatars are stored in: avatars/{user_id}/avatar-{timestamp}.{ext}
-- 2. Max file size: 5MB (enforced in app)
-- 3. Allowed formats: JPG, PNG, GIF (enforced in app)
-- 4. Old avatars are automatically deleted when new ones are uploaded
-- 5. The bucket is public so avatars can be viewed without authentication
