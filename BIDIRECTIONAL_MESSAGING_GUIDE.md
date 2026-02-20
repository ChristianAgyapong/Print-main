# Bidirectional Messaging Setup Guide

## Overview

This guide explains how to enable two-way messaging between users and admins in your Print App. After this setup:

- ✅ Admins can send messages to users
- ✅ Users can send messages to admins
- ✅ Both parties can view their conversation history
- ✅ Messages are clearly labeled as "From Admin" or "To Admin"

## Step 1: Update Database Schema

### Run the Migration SQL

1. Open your Supabase Dashboard → SQL Editor
2. Copy and run the contents of `MESSAGES_BIDIRECTIONAL_UPDATE.sql`
3. **IMPORTANT**: Replace the admin emails with your actual admin emails:
   ```sql
   auth.jwt() ->> 'email' IN (
       'your-admin@example.com',
       'another-admin@example.com'
   )
   ```
4. Click **Run** to execute

### What This Does:

- Adds `from_admin` column (BOOLEAN) - indicates message direction
- Adds `admin_sender_email` column (TEXT) - tracks which admin sent the message
- Updates RLS policies to allow users to insert messages
- Creates appropriate indexes

## Step 2: Features Added

### For Users:

1. **Compose Button**: New "compose" icon in the Messages header
2. **Message Direction Badges**:
   - Blue badge with down arrow = "From Admin" (message received)
   - Green badge with up arrow = "To Admin" (message sent)
3. **Compose Modal**: Clean interface to send messages to admin
4. **Validation**: Ensures subject and message are filled before sending

### For Admins:

- Admins continue to use the existing admin messages interface
- Admin messages are automatically tagged with `from_admin = true`
- Admin's email is stored in `admin_sender_email` for tracking

## Step 3: Testing

### Test as User:

1. Log in as a regular user
2. Go to **Messages** page
3. Click the **compose icon** (pen icon) in the top right
4. Fill in:
   - Subject: "Test message to admin"
   - Message: "This is a test message"
5. Click **Send** icon
6. You should see:
   - Success message
   - Your message appears in the list with a green "To Admin" badge

### Test as Admin:

1. Log in as admin
2. Go to **Admin Panel → Messages**
3. You should see the user in the list
4. Select the user and send a reply
5. The user will receive it with a blue "From Admin" badge

### Test Full Conversation:

1. Log in as user → Send message to admin
2. Log in as admin → Reply to the user
3. Log in as user → See the reply
4. Both messages should appear in the user's message list

## Database Structure

### Updated Messages Table

```sql
messages
├── id                  UUID (Primary Key)
├── user_id             UUID (Foreign Key → auth.users)
├── subject             TEXT
├── message             TEXT
├── read                BOOLEAN (default: false)
├── from_admin          BOOLEAN (NEW! default: true)
├── admin_sender_email  TEXT (NEW! optional)
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### How It Works:

- **from_admin = true**: Message sent by admin to user
- **from_admin = false**: Message sent by user to admin
- **user_id**: Always represents the non-admin party
- **admin_sender_email**: Tracks which admin sent the message (useful for audit trails)

## RLS Policies

### 1. Admins Can Send Messages to Users

```sql
WITH CHECK (from_admin = true AND auth.jwt() ->> 'email' IN (...admin emails...))
```

### 2. Users Can Send Messages to Admins

```sql
WITH CHECK (from_admin = false AND auth.uid() = user_id)
```

- Users can only send messages about themselves
- Prevents users from impersonating others

### 3. Users Can Read Their Messages

```sql
USING (auth.uid() = user_id)
```

- Shows both messages TO them and FROM them

### 4. Admins Can Read All Messages

```sql
USING (auth.jwt() ->> 'email' IN (...admin emails...))
```

- Admins see all messages system-wide

## API Usage

### User Sends Message to Admin

```typescript
import { messagesService } from "@/lib/database-service";

await messagesService.sendToAdmin(
  userId,
  "Subject here",
  "Message content here",
);
```

### Admin Sends Message to User (unchanged)

```typescript
import { adminMessagesService } from "@/lib/database-service";

await adminMessagesService.sendMessage({
  user_id: "user-uuid",
  subject: "Subject",
  message: "Message content",
});
```

### Get All Messages for User

```typescript
const messages = await messagesService.getUserMessages(userId);
// Returns both messages from admin and to admin
```

## UI Components Updated

### [app/messages.tsx](app/messages.tsx)

- Added compose button in header
- Added modal for composing messages to admin
- Added direction badges (From Admin / To Admin)
- Added `sendToAdmin` functionality

### Message Interface Updated

```typescript
interface Message {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  read: boolean;
  from_admin: boolean; // NEW!
  admin_sender_email?: string; // NEW!
  created_at: string;
  updated_at: string;
}
```

## Troubleshooting

### Error: "new row violates row-level security policy"

**When**: User tries to send message to admin
**Cause**: The RLS policy isn't set up correctly
**Solution**:

1. Check that you ran `MESSAGES_BIDIRECTIONAL_UPDATE.sql`
2. Verify the "Users can send messages to admins" policy exists
3. Make sure `from_admin = false` in the INSERT statement

### Message not appearing for user

**Cause**: `user_id` mismatch
**Solution**: Ensure `user_id` in the message matches the logged-in user's ID

### Admin can't see user messages

**Cause**: Missing "Admins can read all messages" policy
**Solution**: Re-run the RLS policy for admin SELECT

### Badge not showing correct direction

**Cause**: `from_admin` field not set correctly
**Solution**: Check that:

- Admin messages have `from_admin = true`
- User messages have `from_admin = false`

## Security Considerations

### ✅ Secure:

- Users can only send messages as themselves
- Users can only read their own messages
- RLS prevents users from seeing other users' messages
- Admins must be in the whitelist to send messages

### ⚠️ Consider:

- **Rate Limiting**: Add rate limiting to prevent users from spamming admins
- **Message Moderation**: Consider adding profanity filters
- **Admin Notifications**: Set up push notifications when users send messages
- **Read Receipts**: Track when admins read user messages

## Future Enhancements

### Recommended Features:

1. **Threaded Conversations**: Group messages by user for easier tracking
2. **Message Categories**: Support, Billing, General, etc.
3. **Attachments**: Allow users to attach images/documents
4. **Canned Responses**: Pre-written responses for common inquiries
5. **Auto-Responder**: Automatic acknowledgment when user sends message
6. **Email Integration**: Forward admin messages to email
7. **Search**: Full-text search across all messages
8. **Archive**: Archive old conversations

### Admin Dashboard Improvements:

1. Show inbox of all user messages
2. Mark messages as "Handled" or "Pending"
3. Assign messages to specific admins
4. Response time statistics
5. User satisfaction ratings

## Example Use Cases

### Customer Support

```typescript
// User reports an issue
await messagesService.sendToAdmin(
  userId,
  "Order #1234 not received",
  "I ordered a business card print 3 days ago but haven't received it yet.",
);

// Admin responds
await adminMessagesService.sendMessage({
  user_id: userId,
  subject: "Re: Order #1234 not received",
  message:
    "We've checked your order. It was shipped yesterday and should arrive within 2 business days.",
});
```

### Announcements

```typescript
// Admin sends announcement to all users
const users = await adminService.getAllUsers();
for (const user of users) {
  await adminMessagesService.sendMessage({
    user_id: user.id,
    subject: "New Features Available!",
    message: "We've added custom design templates. Check them out!",
  });
}
```

## Migration Notes

### For Existing Messages

- All existing messages will have `from_admin = true` by default
- This assumes all existing messages were sent by admins
- If you have messages that weren't from admins, manually update them:
  ```sql
  UPDATE messages SET from_admin = false WHERE /* your condition */;
  ```

### Backward Compatibility

- Old code will still work
- The `from_admin` field defaults to `true`
- Optional admin_sender_email can be null

## Monitoring

### Useful Queries:

**Count messages by direction:**

```sql
SELECT
    from_admin,
    COUNT(*) as count
FROM messages
GROUP BY from_admin;
```

**Most active users (sending to admin):**

```sql
SELECT
    user_id,
    COUNT(*) as message_count
FROM messages
WHERE from_admin = false
GROUP BY user_id
ORDER BY message_count DESC
LIMIT 10;
```

**Admin response time:**

```sql
SELECT
    user_id,
    AVG(EXTRACT(EPOCH FROM (admin_response.created_at - user_message.created_at))) / 3600 as avg_response_hours
FROM messages user_message
JOIN messages admin_response ON
    admin_response.user_id = user_message.user_id
    AND admin_response.from_admin = true
    AND admin_response.created_at > user_message.created_at
WHERE user_message.from_admin = false
GROUP BY user_id;
```

---

## Quick Reference

### User Actions:

- ✅ Send message to admin
- ✅ Read messages from admin
- ✅ Mark messages as read
- ✅ Delete their own messages

### Admin Actions:

- ✅ Send message to any user
- ✅ Read all messages (from/to admins)
- ✅ See which admin sent each message
- ✅ Update any message

### Message Direction:

- **Blue Badge + Down Arrow** = From Admin (you received)
- **Green Badge + Up Arrow** = To Admin (you sent)

---

**Need Help?** Check:

1. Supabase Dashboard → Database → messages table
2. Supabase Dashboard → Authentication → Policies
3. Browser/App console logs for detailed errors
