-- ================================================
-- FIX FOR FOREIGN KEY RELATIONSHIP ERROR
-- ================================================
-- Run this in your Supabase SQL Editor to fix the error:
-- "Could not find a relationship between 'messages' and 'profiles'"

-- Step 1: Create admin_emails table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.admin_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert your admin email(s) - REPLACE WITH YOUR ACTUAL ADMIN EMAIL!
INSERT INTO public.admin_emails (email) 
VALUES ('admin@printcraft.com')
ON CONFLICT (email) DO NOTHING;

-- Add more admin emails as needed:
-- INSERT INTO public.admin_emails (email) VALUES ('your-email@example.com') ON CONFLICT DO NOTHING;

-- Step 2: Drop existing messages table (if it exists with wrong foreign key)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Step 3: Create messages table with correct foreign key to profiles
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    from_admin BOOLEAN DEFAULT true NOT NULL,
    admin_sender_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key to profiles table (not auth.users)
    CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Step 4: Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies

-- Policy: Allow admins to send messages to users (from_admin = true)
CREATE POLICY "Admins can send messages to users"
ON public.messages
FOR INSERT
WITH CHECK (
    from_admin = true AND
    auth.jwt() ->> 'email' IN (
        SELECT email FROM public.admin_emails
    )
);

-- Policy: Allow users to send messages to admins (from_admin = false)
CREATE POLICY "Users can send messages to admins"
ON public.messages
FOR INSERT
WITH CHECK (
    from_admin = false AND
    auth.uid() = user_id
);

-- Policy: Users can read their own messages (both from and to admin)
CREATE POLICY "Users can read their messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own messages (mark as read)
CREATE POLICY "Users can update their messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Admins can read all messages
CREATE POLICY "Admins can read all messages"
ON public.messages
FOR SELECT
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM public.admin_emails
    )
);

-- Policy: Admins can update all messages (mark as read, etc.)
CREATE POLICY "Admins can manage all messages"
ON public.messages
FOR UPDATE
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM public.admin_emails
    )
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_read_idx ON public.messages(read);
CREATE INDEX IF NOT EXISTS messages_from_admin_idx ON public.messages(from_admin);

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_messages_updated_at();

-- ✅ Done! The messages table is now properly set up with the correct foreign key.

-- 📝 IMPORTANT: Update your admin email in Step 1 above!
-- Replace 'admin@printcraft.com' with your actual admin email address.
-- You can add more admin emails by running:
-- INSERT INTO public.admin_emails (email) VALUES ('your-email@example.com');
