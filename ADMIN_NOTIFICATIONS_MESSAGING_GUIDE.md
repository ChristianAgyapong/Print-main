# Admin Notifications & Messaging System

## Overview

This implementation adds two powerful features to your print app:

1. **Real-time Order Notifications** - Admin receives instant notifications when users place orders
2. **Admin-to-User Messaging** - Admin can select any user and send them messages

## Features

### 1. Admin Order Notifications

- **Real-time alerts** when new orders are placed
- **Notification badge** on Orders card in admin dashboard
- **Auto-clear** when admin visits orders page
- Uses Supabase Realtime subscriptions

### 2. Admin Messaging System

- **View all users** with search functionality
- **Send messages** to individual users
- **Message history** tracking
- **Read/unread status** management

### 3. User Messages View

- Users can **view messages** sent by admin
- **Mark as read** automatically when opened
- **Delete messages** they no longer need
- **Unread badge** in profile menu
- **Pull to refresh** for new messages

## Implementation Details

### New Files Created:

#### 1. `ADMIN_NOTIFICATIONS_MESSAGES.sql`

Database migration file that creates:

- `messages` table with columns: id, user_id, subject, message, read, created_at, updated_at
- Row Level Security policies for messages
- Realtime subscriptions for orders and messages
- Indexes for performance

#### 2. `contexts/AdminNotificationsContext.tsx`

React Context for managing admin notifications:

- Subscribes to new order insertions via Realtime
- Maintains count of new orders
- Stores list of recent orders
- Provides `clearNotifications()` and `refreshOrders()` methods

#### 3. `app/admin/messages.tsx`

Admin interface for sending messages:

- Lists all registered users with search
- Shows user details (name, email, company, phone)
- Modal form for composing messages
- Subject and message body inputs
- Send confirmation

#### 4. `app/messages.tsx`

User interface for viewing messages:

- Displays all messages from admin
- Unread indicator (red dot)
- Expandable message cards
- Mark as read on open
- Delete message option
- Mark all as read button

### Modified Files:

#### 1. `lib/database-service.ts`

Added new types and services:

- `Message` interface
- `NewMessage` interface
- `messagesService` with methods:
  - `getUserMessages()` - Get all messages for user
  - `getUnreadCount()` - Count unread messages
  - `markAsRead()` - Mark single message as read
  - `markAllAsRead()` - Mark all messages as read
  - `deleteMessage()` - Delete a message
- `adminMessagesService` with methods:
  - `sendMessage()` - Send message to user
  - `getAllMessages()` - Get all messages (admin view)
  - `getMessageStats()` - Get message statistics
  - `deleteMessage()` - Admin delete message
- Updated `getAllUsers()` to return users with email addresses

#### 2. `app/admin/index.tsx`

Enhanced admin dashboard:

- Added AdminNotificationsContext hook
- New "Messages" menu card
- Notification badge on Orders card showing new order count
- Clears notifications when visiting orders page

#### 3. `app/_layout.tsx`

Added AdminNotificationsProvider to context chain:

```tsx
<AuthProvider>
  <AdminProvider>
    <AdminNotificationsProvider>
      <CartProvider>
        <WishlistProvider>...</WishlistProvider>
      </CartProvider>
    </AdminNotificationsProvider>
  </AdminProvider>
</AuthProvider>
```

#### 4. `app/(tabs)/profile.tsx`

Added "Messages" menu item in Account section:

- Icon: chatbubble-ellipses-outline
- Routes to `/messages`

## Setup Instructions

### Step 1: Run Database Migration

1. Open Supabase dashboard → SQL Editor
2. Copy contents of `ADMIN_NOTIFICATIONS_MESSAGES.sql`
3. **IMPORTANT**: Replace `'your-admin-email@example.com'` with your actual admin email in the RLS policies
4. Run the SQL

Example email replacement:

```sql
-- Change this:
USING (auth.jwt() ->> 'email' IN ('your-admin-email@example.com'))

-- To this:
USING (auth.jwt() ->> 'email' IN ('admin@yourcompany.com', 'owner@yourcompany.com'))
```

### Step 2: Verify Realtime is Enabled

1. In Supabase dashboard, go to Database → Replication
2. Ensure "orders" table is enabled for Realtime
3. Ensure "messages" table is enabled for Realtime

### Step 3: Test the System

1. **Test Order Notifications**:
   - Log in as a regular user
   - Add items to cart and place an order
   - Open admin panel → should see notification badge on Orders card
   - Click Orders → badge should clear

2. **Test Messaging**:
   - Open admin panel → click Messages
   - Select a user from the list
   - Enter subject and message
   - Click Send
   - Log in as that user → check Profile → Messages
   - Click on the message → should mark as read

## User Flow

### Admin Creates Order Notification

```
1. User places order
2. Supabase Realtime broadcasts insert event
3. AdminNotificationsContext receives event
4. Increments newOrdersCount
5. Adds order to recentOrders array
6. Badge appears on Orders card
7. Admin clicks Orders → notifications clear
```

### Admin Sends Message to User

```
1. Admin opens Messages from dashboard
2. Searches/selects target user
3. Clicks user card → modal opens
4. Enters subject and message
5. Clicks Send Message
6. Message stored in database
7. User sees message in Messages screen
```

### User Receives and Reads Message

```
1. User opens Profile tab
2. Clicks Messages menu item
3. Sees unread messages with red dot
4. Clicks message card → expands
5. Message auto-marks as read
6. Red dot disappears
7. User can delete message if desired
```

## Database Schema

### messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Indexes

- `idx_messages_user_id` - Fast user message queries
- `idx_messages_read` - Fast unread counts
- `idx_messages_created_at` - Ordered message lists

## Row Level Security Policies

### Messages Table Policies:

1. **Users can read own messages**
   - Users can only see messages sent to them
2. **Users can update own messages**
   - Users can mark their messages as read
3. **Admin can read all messages**
   - Admin can view all messages sent to any user
4. **Admin can insert messages**
   - Admin can create new messages for users
5. **Admin can delete messages**
   - Admin can remove messages from the system

## Console Logs

The system includes comprehensive logging for debugging:

### Order Notifications:

```
🔔 New order received: {order details}
📢 Admin notification: New order #abc12345
🔕 Clearing admin notifications
```

### Messaging (Admin):

```
📬 Admin Messages: Loaded 15 users
📤 Admin sending message: {message details}
✅ Message sent successfully
```

### Messaging (User):

```
📬 Fetching messages for user: user-id
📬 Found 3 messages for user
✅ Message marked as read: message-id
🗑️ Message deleted: message-id
```

## UI Components

### Admin Dashboard - Notification Badge

- **Position**: Top-right of Orders icon
- **Color**: Pink (#FF006E)
- **Border**: 2px white border
- **Max Display**: "99+" for counts over 99

### Admin Messages - User Cards

- **Avatar**: First letter of name, pink background
- **Info**: Name, email, company, phone
- **Icon**: Message bubble (pink)
- **Search**: Real-time filter by name, email, or company

### User Messages - Message Cards

- **Unread Indicator**: Red dot on left
- **Subject**: Bold text (unread gets extra bold)
- **Date**: Formatted timestamp
- **Expandable**: Chevron icon, shows full message
- **Actions**: Delete button in expanded view

## API Methods

### messagesService (User)

```typescript
await messagesService.getUserMessages(userId); // Get all messages
await messagesService.getUnreadCount(userId); // Count unread
await messagesService.markAsRead(messageId); // Mark one as read
await messagesService.markAllAsRead(userId); // Mark all as read
await messagesService.deleteMessage(messageId); // Delete message
```

### adminMessagesService (Admin)

```typescript
await adminMessagesService.sendMessage({
  user_id: "uuid",
  subject: "Welcome!",
  message: "Thank you for joining...",
}); // Send message

await adminMessagesService.getAllMessages(); // Get all messages
await adminMessagesService.getMessageStats(); // Get stats
await adminMessagesService.deleteMessage(messageId); // Delete
```

### useAdminNotifications Hook

```typescript
const {
  newOrdersCount, // Number of new orders
  recentOrders, // Array of recent Order objects
  clearNotifications, // Function to clear count
  refreshOrders, // Function to reload orders
} = useAdminNotifications();
```

## Troubleshooting

### Issue: No notification when order is placed

**Cause**: Realtime not enabled on orders table  
**Solution**:

1. Go to Supabase → Database → Replication
2. Enable "orders" table
3. Wait a few seconds and try again

### Issue: Admin can't send messages (error on send)

**Cause**: RLS policies not set up or admin email not in list  
**Solution**:

1. Check Supabase logs for policy errors
2. Verify admin email matches RLS policy
3. Run the SQL migration again with correct email

### Issue: User can't see messages

**Cause**: RLS policies blocking user access  
**Solution**:

1. Verify "Users can read own messages" policy exists
2. Check user is logged in correctly
3. Ensure `auth.uid()` matches `user_id` in database

### Issue: Messages table doesn't exist

**Cause**: Migration not run  
**Solution**:

1. Run `ADMIN_NOTIFICATIONS_MESSAGES.sql` in Supabase SQL Editor
2. Check for errors in SQL output
3. Verify table appears in Database → Tables

### Issue: Notification badge doesn't clear

**Cause**: clearNotifications not called  
**Solution**:

- Ensure admin dashboard calls `clearNotifications()` when navigating to orders
- Check AdminNotificationsContext is properly wrapped in \_layout.tsx

## Performance Considerations

### Realtime Subscriptions

- Only active when admin panel is open
- Automatically cleaned up on unmount
- Limits recent orders to last 10

### Message Queries

- Indexed on user_id for fast user queries
- Indexed on read status for unread counts
- Indexed on created_at for ordered lists

### Admin User Fetching

- Fetches emails in parallel using Promise.all
- May slow down with many users (100+)
- Consider pagination or caching for large user bases

## Security Notes

### Message Privacy

- Users can only see their own messages (RLS enforced)
- Admin can see all messages (for support purposes)
- Messages deleted by user are permanently removed

### Admin Authentication

- Admin status verified by AdminContext
- Email-based whitelist in database RLS policies
- Must be logged in with admin email

### Data Validation

- Subject and message required (client-side)
- User ID validated against auth.users
- Timestamps auto-generated server-side

## Future Enhancements

Consider adding:

- **Message replies** - Let users respond to admin
- **Message categories** - Order updates, promotions, support
- **Email notifications** - Send email when message received
- **Push notifications** - Mobile notifications for messages
- **Message templates** - Pre-written messages for common scenarios
- **Batch messaging** - Send to multiple users at once
- **Message attachments** - Include images or PDFs
- **Scheduled messages** - Send messages at specific times

## Summary

This implementation provides a complete notification and messaging system for your print app. Admins get instant alerts for new orders and can communicate directly with users. The system is secure, performant, and user-friendly.

**Key Benefits:**
✅ Real-time order awareness for admin  
✅ Direct communication channel with customers  
✅ Better customer support capabilities  
✅ Professional messaging interface  
✅ Secure with RLS policies  
✅ Comprehensive error logging

The system is production-ready and will help you provide excellent customer service while keeping track of new orders efficiently.
