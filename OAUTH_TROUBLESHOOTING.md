# OAuth Troubleshooting Guide 🔧

## Safari "Cannot Connect to Server" Error

This error means the redirect URL doesn't match what's configured in Supabase. Let's fix it:

## Step 1: Check the Console Logs 📝

1. Open your terminal where Expo is running
2. Click "Continue with Google" in the app
3. Look for these logs in the terminal:
   ```
   🔗 Redirect URL: printapp://auth/callback (or exp://...)
   ```

4. **Copy this exact URL** - you'll need it for Step 2

## Step 2: Add Redirect URL to Supabase ✅

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Scroll to **Redirect URLs** section
5. Add these URLs (click "+ Add URL" for each):

   ```
   printapp://auth/callback
   exp://localhost:8081/--/auth/callback
   exp://localhost:8081
   ```

   **Plus the URL you copied from Step 1 if it's different!**

6. Click **Save**

## Step 3: Verify Google OAuth Configuration 🔐

1. Still in Supabase Dashboard
2. Go to **Authentication** → **Providers**
3. Find **Google** in the list
4. Make sure:
   - ✅ Google is **Enabled**
   - ✅ **Client ID** is filled in
   - ✅ **Client Secret** is filled in

## Step 4: Test Again 🧪

1. In your app, click "Continue with Google" again
2. Google sign-in page should open in Safari
3. After signing in with Google, you should be redirected back to the app
4. Check the console logs to see what happened

## Common Issues & Solutions 🛠️

### Issue: "Invalid redirect URL"
**Solution**: The redirect URL in Supabase doesn't match what the app is using.
- Check console logs for the actual redirect URL
- Add it exactly to Supabase (no extra spaces or characters)

### Issue: "Google OAuth not configured"
**Solution**: Google provider not set up in Supabase
- Follow [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) to configure Google OAuth

### Issue: Browser opens but immediately closes
**Solution**: Session not being captured properly
- Make sure you're using the latest code with proper token extraction
- Check if tokens are being found in console logs: `🔑 Tokens found: true/false`

### Issue: Gets stuck at "Loading..."
**Solution**: Error occurred but wasn't displayed
- Check console logs for errors (look for ❌ symbols)
- The error message will tell you what went wrong

## Console Log Legend 📊

- 🔗 **Redirect URL**: The URL the app expects to receive after OAuth
- 🌐 **Opening OAuth URL**: Browser is being opened for Google sign-in
- 📱 **Browser result**: What happened when browser was opened
  - `success`: User completed sign-in
  - `cancel`: User closed browser
  - `dismiss`: User dismissed the browser
- 🔑 **Tokens found**: Whether auth tokens were extracted from redirect
- ✅ **Session set successfully**: User is now signed in!
- ❌ **Error**: Something went wrong (read the error message)

## Still Not Working? 🤔

1. Make sure your `.env` file has correct Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

2. Restart Expo dev server:
   ```bash
   npx expo start --clear
   ```

3. Check Supabase logs:
   - Go to Supabase Dashboard → **Logs**
   - Filter by **Auth Logs**
   - Look for failed authentication attempts

4. Share the console logs and we can debug further!

## Need More Help? 💬

Share a screenshot of:
1. Your terminal console logs (with the 🔗 and ❌ emoji logs)
2. Your Supabase Redirect URLs configuration
3. Any error messages you see

This will help diagnose the exact issue!
