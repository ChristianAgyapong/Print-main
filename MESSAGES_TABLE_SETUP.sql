-- ================================================
-- MESSAGES TABLE SETUP WITH BIDIRECTIONAL SUPPORT
-- ================================================
-- This file sets up the messages table for two-way admin-user messaging
-- Run this in your Supabase SQL Editor

-- 1. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
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

-- 2. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Allow admins to send messages to users (from_admin = true)
CREATE POLICY "Admins can send messages to users"
ON public.messages
FOR INSERT
WITH CHECK (
    from_admin = true AND
    auth.jwt() ->> 'email' IN (
        'admin@printcraft.com',
        'owner@printcraft.com'
        -- ⚠️ REPLACE WITH YOUR ACTUAL ADMIN EMAILS!
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

-- Policy: Allow users to update read status of their own messages
CREATE POLICY "Users can update their messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow admins to read all messages
CREATE POLICY "Admins can read all messages"
ON public.messages
FOR SELECT
USING (
    auth.jwt() ->> 'email' IN (
        'admin@printcraft.com',
        'owner@printcraft.com'
        -- ⚠️ REPLACE WITH YOUR ACTUAL ADMIN EMAILS!
    )
);

-- Policy: Allow admins to update any message
CREATE POLICY "Admins can update any message"
ON public.messages
FOR UPDATE
USING (
    auth.jwt() ->> 'email' IN (
        'admin@printcraft.com',
        'owner@printcraft.com'
        -- ⚠️ REPLACE WITH YOUR ACTUAL ADMIN EMAILS!
    )
)
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        'admin@printcraft.com',
        'owner@printcraft.com'
    )
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_read_idx ON public.messages(read);
CREATE INDEX IF NOT EXISTS messages_from_admin_idx ON public.messages(from_admin);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- 
-- ⚠️  CRITICAL: Replace 'admin@printcraft.com' and 'owner@printcraft.com' 
--     with your actual admin email addresses in ALL policies above!
--
-- Features enabled:
-- ✅ Admins can send messages to users
-- ✅ Users can send messages to admins  
-- ✅ Both parties can read their conversation
-- ✅ Message direction tracking (from_admin field)
-- ✅ Admin email tracking for audit trail
