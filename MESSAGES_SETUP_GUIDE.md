# Admin Messages Setup Guide

## Overview

This guide will help you set up the admin messaging system that allows admins to send messages to users in your Print App.

## Problem

When trying to send a message as an admin, you get this error:

```
Error: new row violates row-level security policy for table "messages"
```

This means the messages table either doesn't exist or doesn't have the correct RLS policies.

## Solution

### Step 1: Create the Messages Table

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `MESSAGES_TABLE_SETUP.sql`
5. **IMPORTANT**: Replace the admin email addresses in the SQL file with your actual admin emails:
   ```sql
   auth.jwt() ->> 'email' IN (
       'your-admin-email@example.com',
       'another-admin@example.com'
   )
   ```
6. Click **Run** to execute the SQL

### Step 2: Verify the Setup

After running the SQL, verify that:

1. **Table Created**: Go to **Table Editor** and confirm the `messages` table exists
2. **RLS Enabled**: The messages table should have RLS enabled
3. **Policies Created**: Check the policies in the **Authentication** > **Policies** section

### Step 3: Test the Messaging System

1. **As Admin**:
   - Log in with your admin account (must match the email in the policies)
   - Navigate to Admin Panel → Messages
   - Select a user and send a test message

2. **As User**:
   - Log in as the target user
   - Go to the Messages page
   - You should see the message from the admin

## Messages Table Structure

```sql
messages
├── id              UUID (Primary Key)
├── user_id         UUID (Foreign Key → auth.users)
├── subject         TEXT
├── message         TEXT
├── read            BOOLEAN (default: false)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

## RLS Policies Explained

### 1. Admins Can Insert Messages

- **Purpose**: Allows admins to send messages to any user
- **Condition**: User's email must be in the admin list

### 2. Users Can Read Their Own Messages

- **Purpose**: Users can only see messages sent to them
- **Condition**: `auth.uid() = user_id`

### 3. Users Can Update Their Own Messages

- **Purpose**: Users can mark messages as read
- **Condition**: `auth.uid() = user_id`

### 4. Admins Can Read All Messages

- **Purpose**: Admins can view all messages in the system
- **Condition**: User's email must be in the admin list

## Adding More Admin Users

To add additional admin users:

1. Go to Supabase SQL Editor
2. Run this query for each policy that needs updating:

```sql
-- Update the INSERT policy
DROP POLICY IF EXISTS "Admins can insert messages" ON public.messages;
CREATE POLICY "Admins can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        'admin@printcraft.com',
        'owner@printcraft.com',
        'newadmin@example.com'  -- Add new admin here
    )
);

-- Update the SELECT policy for admins
DROP POLICY IF EXISTS "Admins can read all messages" ON public.messages;
CREATE POLICY "Admins can read all messages"
ON public.messages
FOR SELECT
USING (
    auth.jwt() ->> 'email' IN (
        'admin@printcraft.com',
        'owner@printcraft.com',
        'newadmin@example.com'  -- Add new admin here
    )
);
```

## Troubleshooting

### Error: "new row violates row-level security policy"

- **Cause**: The RLS policy doesn't recognize you as an admin
- **Solution**:
  1. Check that your email matches exactly in the policies
  2. Emails are case-sensitive
  3. Make sure you're logged in with the admin account

### Messages not appearing for users

- **Cause**: The SELECT policy might not be set correctly
- **Solution**: Verify the "Users can read their own messages" policy exists

### Can't mark messages as read

- **Cause**: UPDATE policy is missing or incorrect
- **Solution**: Check the "Users can update their own messages" policy

### Foreign key violation

- **Cause**: The user_id doesn't exist in auth.users
- **Solution**: Make sure you're sending messages to valid user IDs

## Features Included

✅ Admins can send messages to any user
✅ Users can only read their own messages
✅ Users can mark messages as read/unread
✅ Admins can view all messages in the system
✅ Automatic timestamps with updated_at trigger
✅ Efficient queries with proper indexes
✅ Cascade delete (messages deleted when user is deleted)

## API Usage

### Send Message (Admin Only)

```typescript
import { adminMessagesService } from "@/lib/database-service";

await adminMessagesService.sendMessage({
  user_id: "user-uuid-here",
  subject: "Welcome!",
  message: "Thanks for signing up!",
});
```

### Get User Messages

```typescript
import { messagesService } from "@/lib/database-service";

const messages = await messagesService.getUserMessages(userId);
```

### Mark Message as Read

```typescript
await messagesService.markAsRead(messageId);
```

## Security Notes

- All data is protected by Row Level Security (RLS)
- Users can NEVER see other users' messages
- Only designated admins can send messages
- Message content is stored as TEXT (consider encryption for sensitive data)
- Admin emails are stored in policies (consider using a dedicated admin_users table for production)

## Next Steps

After setup, you can enhance the system with:

- Email notifications when users receive messages
- Push notifications for mobile apps
- Message categories (announcements, promotions, support)
- Bulk messaging to multiple users
- Message templates for common communications
- File attachments support

---

**Need Help?** Check the Supabase console logs for detailed error messages.
